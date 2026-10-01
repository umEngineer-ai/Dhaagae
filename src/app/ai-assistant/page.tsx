import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Style Assistant',
  description:
    'Chat with the DHAAGAÉ AI Style Assistant — get personalized outfit recommendations, size guidance, and styling tips for your little one.',
};

export default function AiAssistantPage() {
  return (
    <main className="container section">
      <div className="mb-8">
        <p className="text-brand mb-2">Powered by AI</p>
        <h1 className="display-lg text-plum">Style Assistant</h1>
        <p className="text-muted mt-3 max-w-xl">
          Ask about frocks, sizes, occasions, fabrics, or customizations. Our AI knows every stitch
          of our collection.
        </p>
      </div>

      {/* AI chat interface will be implemented in Phase 4 */}
      <div className="card card-xl" style={{ minHeight: '500px' }}>
        <div className="empty-state" style={{ minHeight: '500px' }}>
          <div className="empty-state-icon">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
            </svg>
          </div>
          <h2 className="empty-state-title">Coming in Phase 4</h2>
          <p className="empty-state-description">
            The full AI chat interface will be implemented in the next phase.
          </p>
        </div>
      </div>
    </main>
  );
}
