import type { Metadata } from 'next';
import StyleAssistantClient from '@/components/StyleAssistantClient';

export const metadata: Metadata = {
  title: 'Your DHAAGAÉ Style Assistant',
  description: 'A private DHAAGAÉ styling consultation grounded in the current collection.',
};

export default function AiAssistantPage() {
  return <StyleAssistantClient />;
}
