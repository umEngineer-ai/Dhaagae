import type { Metadata } from 'next';
import DesignStudioClient from '@/components/DesignStudioClient';

export const metadata: Metadata = {
  title: 'Design Your Dream Frock',
  description: 'Create a structured AI design concept for a bespoke DHAAGAÉ frock.',
};

export default function DesignPage() {
  return <DesignStudioClient />;
}
