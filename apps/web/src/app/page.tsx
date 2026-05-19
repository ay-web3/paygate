import React from 'react';

export default function Home() {
  return (
    <main>
      <div className="container">
        <nav>
          <div className="logo">Pay<span>Gate</span></div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#docs">Documentation</a>
            <a href="https://github.com/ay/paygate" target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </nav>

        <section className="hero">
          <div className="hero-pill">✨ The new standard for the Agent Economy</div>
          <h1>Turn your API into a<br /><span>Storefront for Agents</span></h1>
          <p>
            Monetize your AI APIs instantly with zero-code Gateway integration. Accept USDC nanopayments via x402, automatically issue 402 Payment Required responses, and track your revenue in real-time.
          </p>
          
          <div className="hero-cta">
            <a href="#get-started" className="btn-primary">Get Started</a>
            <a href="#docs" className="btn-secondary">Read Docs</a>
          </div>

          <div className="code-showcase">
            <div className="code-header">
              <div className="dot red"></div>
              <div className="dot yellow"></div>
              <div className="dot green"></div>
            </div>
            <pre style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', overflowX: 'auto' }}>
              <code style={{ fontFamily: 'monospace' }}>
<span style={{ color: '#a78bfa' }}>import</span> {`{ paygate }`} <span style={{ color: '#a78bfa' }}>from</span> <span style={{ color: '#38bdf8' }}>'@emmanue5002k/paygate-express'</span>;<br /><br />
<span style={{ color: '#94a3b8' }}>// Just drop the middleware into your app</span><br />
app.<span style={{ color: '#34d399' }}>use</span>(paygate());<br /><br />
<span style={{ color: '#94a3b8' }}>// Your routes are now automatically protected, priced, and monetized!</span><br />
app.<span style={{ color: '#34d399' }}>get</span>(<span style={{ color: '#38bdf8' }}>'/api/premium-data'</span>, (req, res) {`=>`} {`{`}<br />
&nbsp;&nbsp;res.<span style={{ color: '#34d399' }}>json</span>({`{ data: 'This costs $0.01 USDC!' }`});<br />
{`}`});
              </code>
            </pre>
          </div>
        </section>

        <section id="features" className="features">
          <div className="glass-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3>USDC Nanopayments</h3>
            <p>Built directly on top of Circle's Gateway infrastructure to process sub-cent transactions instantly via x402.</p>
          </div>
          
          <div className="glass-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <h3>Config-Driven</h3>
            <p>Stop writing billing code. Configure your endpoints, prices, and environments using a simple paygate.yaml file.</p>
          </div>
          
          <div className="glass-card">
            <div className="card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            </div>
            <h3>Analytics Dashboard</h3>
            <p>Run the built-in CLI command to spin up a beautiful Next.js dashboard to track revenue and agent activity in real-time.</p>
          </div>
        </section>

      </div>
    </main>
  );
}
