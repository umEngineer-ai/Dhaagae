import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const body = await req.json();
    if (!body.title || typeof body.title !== 'string') return NextResponse.json({ error: 'A design name is required' }, { status: 400 });
    const existing = await prisma.aIDesign.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    const design = await prisma.aIDesign.update({ where: { id }, data: { title: body.title.trim().slice(0, 120) } });
    return NextResponse.json({ design });
  } catch { return NextResponse.json({ error: 'Unable to update design' }, { status: 403 }); }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    const { id } = await params;
    const existing = await prisma.aIDesign.findFirst({ where: { id, userId: user.id } });
    if (!existing) return NextResponse.json({ error: 'Design not found' }, { status: 404 });
    await prisma.aIDesign.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Unable to delete design' }, { status: 403 }); }
}
