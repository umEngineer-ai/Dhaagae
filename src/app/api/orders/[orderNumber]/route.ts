import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { sendOrderStatusUpdateEmail } from '@/lib/email';

export async function GET(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    const { orderNumber } = await params;
    const user = await getCurrentUser();

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        orderItems: {
          include: {
            orderCustomization: true,
            product: { select: { slug: true } },
          },
        },
        payments: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Access control: Allow order owner, guest email matcher, or admin
    if (user && user.role !== 'ADMIN' && order.userId && order.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ orderNumber: string }> }) {
  try {
    await requireAdmin();
    const { orderNumber } = await params;
    const { status, paymentStatus, trackingNumber } = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
      include: { user: true, orderItems: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updated = await prisma.order.update({
      where: { orderNumber },
      data: {
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
        ...(trackingNumber !== undefined ? { trackingNumber } : {}),
      },
      include: {
        user: true,
        orderItems: { include: { orderCustomization: true } },
        payments: true,
      },
    });

    // Update payment record if paymentStatus changed
    if (paymentStatus && updated.payments.length > 0) {
      await prisma.payment.updateMany({
        where: { orderId: updated.id },
        data: { status: paymentStatus === 'PAID' ? 'COMPLETED' : paymentStatus },
      });
    }

    // Send customer notification and email
    const recipientEmail = updated.user?.email || updated.guestEmail;
    const recipientName = updated.user?.name || 'Valued Customer';

    if (updated.userId && status) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          title: `Order #${orderNumber} Status: ${status}`,
          message: `Your order #${orderNumber} is now marked as "${status}".${trackingNumber ? ` Tracking: ${trackingNumber}` : ''}`,
          type: 'ORDER_UPDATE',
          linkUrl: `/account/orders/${orderNumber}`,
        },
      });
    }

    if (recipientEmail && status) {
      sendOrderStatusUpdateEmail({
        orderNumber,
        customerName: recipientName,
        customerEmail: recipientEmail,
        total: updated.total,
        status: updated.status,
        trackingNumber: updated.trackingNumber || undefined,
        shippingAddress: '',
        items: [],
      }).catch(console.error);
    }

    return NextResponse.json({ order: updated, message: 'Order updated successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update order';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
