import type { Metadata } from 'next';
import Link from 'next/link';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import prisma from '@/lib/db';
import SavedDesignsClient from '@/components/SavedDesignsClient';

export const metadata: Metadata = { title: 'My Designs', description: 'Your custom AI-designed DHAAGAÉ pieces.' };

export default async function AccountDesignsPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/designs');
  const designs = await prisma.aIDesign.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, occasion: true, fabric: true, estimatedPrice: true, generatedImageUrl: true, mainColor: true, dressType: true, sleeveStyle: true, neckStyle: true, length: true, embroidery: true } });
  return <main className="container section"><div className="mb-8"><Link href="/account" className="text-muted text-sm">← Back to Account</Link><h1 className="display-md text-plum mt-2">My Designs</h1><p className="text-muted text-sm mt-2">Rename, reuse, or remove your saved AI design concepts.</p></div>{designs.length === 0 ? <div className="card card-xl"><div className="empty-state"><h2 className="empty-state-title">No designs yet</h2><p className="empty-state-description">Use our AI Design Studio to create your first bespoke piece.</p><Link href="/design" className="btn btn-primary mt-4">Open Design Studio</Link></div></div> : <SavedDesignsClient initialDesigns={designs} />}</main>;
}
