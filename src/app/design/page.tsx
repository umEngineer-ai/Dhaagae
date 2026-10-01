import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bespoke Design Studio',
  description:
    'Design your dream frock with the DHAAGAÉ AI Design Studio. Choose fabric, embroidery, colors, and customizations. Every stitch is made by hand.',
};

export default function DesignPage() {
  return (
    <main className="container section">
      <div className="text-center mb-10">
        <p className="text-brand mb-2">Bespoke Atelier</p>
        <h1 className="display-lg text-plum">Design Your Dream</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">
          Tell us your vision — our master artisans and AI design assistant will craft a unique piece
          tailored to your child&apos;s measurements, occasion, and personal style.
        </p>
      </div>

      <div className="card card-xl p-8 text-center">
        <div className="empty-state">
          <div className="empty-state-icon">
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42" />
            </svg>
          </div>
          <h2 className="empty-state-title">AI Design Studio</h2>
          <p className="empty-state-description">
            The full design studio with AI-powered customization will be available in Phase 4.
          </p>
          <a href="/ai-assistant" className="btn btn-primary btn-lg mt-4">
            Talk to Style Assistant
          </a>
        </div>
      </div>
    </main>
  );
}
