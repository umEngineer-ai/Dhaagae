import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      customersCount,
      productsCount,
      allOrders,
      lowStockProducts,
      recentOrders,
      aiConversationsCount,
      aiDesignsCount,
      recommendationsCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'PROCESSING', 'CUSTOMIZATION_IN_PROGRESS'] } } }),
      prisma.order.count({ where: { status: { in: ['DELIVERED', 'READY'] } } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.order.findMany({
        where: { paymentStatus: 'PAID' },
        select: { total: true },
      }),
      prisma.product.findMany({
        where: { stockQuantity: { lte: 5 } },
        select: { id: true, name: true, sku: true, stockQuantity: true, price: true },
        take: 10,
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          orderItems: true,
        },
      }),
      prisma.aIConversation.count(),
      prisma.aIDesign.count(),
      prisma.recommendation.count(),
    ]);

    const totalSales = allOrders.reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      stats: {
        totalSales,
        totalOrders,
        pendingOrders,
        completedOrders,
        customersCount,
        productsCount,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      aiMetrics: {
        conversations: aiConversationsCount,
        customDesigns: aiDesignsCount,
        recommendations: recommendationsCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unauthorized';
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
