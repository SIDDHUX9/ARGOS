export default function Download() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050507',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
      }}
    >
      <div
        style={{
          border: '1px solid #1e1e2e',
          background: '#0a0a10',
          padding: '40px 48px',
          maxWidth: 480,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <img src="/assets/argos.png" alt="ARGOS" style={{ width: 56, height: 56, objectFit: 'contain', margin: '0 auto 20px' }} />
        <p style={{ color: '#00f0ff', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 8 }}>
          ARGOS // Source Export
        </p>
        <h1 style={{ color: '#e8e8ed', fontSize: 22, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.02em' }}>
          Download Project Source
        </h1>
        <p style={{ color: '#6b7280', fontSize: 12, lineHeight: 1.6, marginBottom: 32 }}>
          Complete source code archive including all pages, components, data layer, and configuration files.
          Node modules and git history are excluded.
        </p>

        <a
          href="/argos-project.tar.gz"
          download="argos-project.tar.gz"
          style={{
            display: 'inline-block',
            padding: '10px 28px',
            border: '1px solid #00f0ff',
            color: '#00f0ff',
            fontSize: 12,
            textDecoration: 'none',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,240,255,0.08)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          ↓ argos-project.tar.gz (~1.3 MB)
        </a>

        <div style={{ marginTop: 32, borderTop: '1px solid #1e1e2e', paddingTop: 20 }}>
          <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 12 }}>Archive contents</p>
          <div style={{ textAlign: 'left', fontSize: 11, color: '#6b7280', lineHeight: 2 }}>
            {[
              'src/pages/  — 9 pages (Landing, Dashboard, Intelligence, Indices, Execution, Risk, Audit…)',
              'src/components/  — AppLayout, WalletConnect, shadcn/ui library',
              'src/lib/  — price-engine, argos-mock, argos-types, sosovalue-api, wagmi-config',
              'src/convex/  — schema, auth, users, http',
              'public/assets/  — argos.png logo',
              'index.html, vite.config.ts, tsconfig*.json, package.json',
            ].map(line => (
              <div key={line} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#1e1e2e' }}>▸</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ color: '#1e1e2e', fontSize: 10, marginTop: 24 }}>
          Generated {new Date().toUTCString()}
        </p>
      </div>
    </div>
  );
}
