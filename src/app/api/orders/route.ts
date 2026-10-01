import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sendOrderConfirmationEmail } from '@/lib/email';

type VerifiedOrderItem = {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  total: number;
  customization: {
    color: string | null;
    fabric: string | null;
    sleeve: string | null;
    neck: string | null;
    length: string | null;
    embroidery: string | null;
    decorativeElements: string | null;
    notes: string | null;
    customPrice: number;
  } | null;
};

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();

    const {
      items,
      shippingAddress,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod = 'COD',
      couponCode,
      notes,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Order must contain at least one item' }, { status: 400 });
    }

    if (!shippingAddress || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json({ error: 'Customer information and shipping address are required' }, { status: 400 });
    }

    // SERVER-SIDE SECURITY & PRICING VERIFICATION
    let serverSubtotal = 0;
    const verifiedOrderItems: VerifiedOrderItem[] = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.name || item.productId}` }, { status: 404 });
      }

      // Check stock
      if (product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}` },
          { status: 400 }
        );
      }

      const itemUnitPrice = product.discountPrice ?? product.price;
      const customFee = item.customization ? (item.customization.customizationFee || 0) : 0;
      const itemTotal = (itemUnitPrice + customFee) * item.quantity;

      serverSubtotal += itemTotal;

      let primaryImage = '';
      try {
        const parsed = JSON.parse(product.images);
        primaryImage = Array.isArray(parsed) ? parsed[0] : product.images;
      } catch {
        primaryImage = product.images;
      }

      verifiedOrderItems.push({
        productId: product.id,
        productName: product.name,
        productImage: primaryImage,
        price: itemUnitPrice,
        quantity: item.quantity,
        size: item.size || '3-4Y',
        color: item.customization?.color || product.colors.split(',')[0].trim(),
        total: itemTotal,
        customization: item.customization
          ? {
              color: item.customization.color || null,
              fabric: item.customization.fabric || null,
              sleeve: item.customization.sleeve || null,
              neck: item.customization.neck || null,
              length: item.customization.length || null,
              embroidery: item.customization.embroidery || null,
              decorativeElements: item.customization.decorativeElements || null,
              notes: item.customization.notes || null,
              customPrice: customFee,
            }
          : null,
      });
    }

    // Server-side discount calculation
    let serverDiscount = 0;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase().trim() },
      });
      if (coupon && coupon.isActive) {
        if (!coupon.expiresAt || new Date() <= coupon.expiresAt) {
          if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
            serverDiscount = coupon.discountAmount
              ? coupon.discountAmount
              : Math.round((serverSubtotal * (coupon.discountPercent || 0)) / 100);
            
            // Increment coupon usage
            await prisma.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            });
          }
        }
      }
    }

    // Shipping calculation: Free over 5000 PKR, else 250 PKR
    const shippingFee = serverSubtotal - serverDiscount >= 5000 ? 0 : 250;
    const finalTotal = Math.max(0, serverSubtotal - serverDiscount + shippingFee);

    // Unique Order Number
    const timestamp = Date.now().toString().slice(-6);
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `DHG-${timestamp}-${randomHex}`;

    // Format full shipping address string
    const shippingAddrFormatted = typeof shippingAddress === 'string'
      ? shippingAddress
      : `${shippingAddress.addressLine1}, ${shippingAddress.city}, ${shippingAddress.province || 'Pakistan'}`;

    // Create Order with Items, Customizations, and Payment in transaction
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        guestEmail: user ? null : customerEmail,
        guestPhone: user ? null : customerPhone,
        status: verifiedOrderItems.some((i) => i.customization) ? 'CUSTOMIZATION_IN_PROGRESS' : 'CONFIRMED',
        subtotal: serverSubtotal,
        discount: serverDiscount,
        shippingFee,
        total: finalTotal,
        currency: 'PKR',
        paymentMethod,
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        shippingAddressJson: JSON.stringify(shippingAddress),
        notes: notes || null,
        orderItems: {
          create: verifiedOrderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            total: item.total,
            ...(item.customization
              ? {
                  orderCustomization: {
                    create: item.customization,
                  },
                }
              : {}),
          })),
        },
        payments: {
          create: {
            amount: finalTotal,
            currency: 'PKR',
            method: paymentMethod,
            status: paymentMethod === 'COD' ? 'PENDING' : 'COMPLETED',
            transactionRef: `TXN-${orderNumber}`,
          },
        },
      },
      include: {
        orderItems: {
          include: {
            orderCustomization: true,
          },
        },
        payments: true,
      },
    });

    // Deduct inventory
    for (const item of verifiedOrderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: {
            decrement: item.quantity,
          },
        },
      });
    }

    // Create notification if user is logged in
    if (user) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Order Placed: #${orderNumber}`,
          message: `Your handcrafted order #${orderNumber} for PKR ${finalTotal.toLocaleString()} has been placed and is being prepared by our artisans.`,
          type: 'ORDER_UPDATE',
          linkUrl: `/account/orders/${orderNumber}`,
        },
      });
    }

    // Send confirmation email asynchronously
    sendOrderConfirmationEmail({
      orderNumber,
      customerName,
      customerEmail,
      total: finalTotal,
      items: verifiedOrderItems.map((i) => ({
        name: i.productName,
        quantity: i.quantity,
        price: i.total,
        size: i.size,
      })),
      shippingAddress: shippingAddrFormatted,
    }).catch((err) => console.error('Email error:', err));

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: order.total,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt,
      },
      message: 'Order created successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};

    // Customer only sees their own orders; Admin sees all
    if (user.role !== 'ADMIN') {
      where.userId = user.id;
    } else {
      if (status && status !== 'ALL') {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { orderNumber: { contains: search } },
          { guestEmail: { contains: search } },
          { guestPhone: { contains: search } },
        ];
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        orderItems: {
          include: {
            orderCustomization: true,
          },
        },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}
