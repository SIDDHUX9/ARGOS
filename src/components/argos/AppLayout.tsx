import { useState, type ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { LayoutDashboard, Rss, Layers, Terminal, Shield, FileText, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WalletConnect } from './WalletConnect';
import { useAccount } from 'wagmi';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { path: '/intelligence', label: 'intelligence', icon: Rss },
  { path: '/indices', label: 'indices', icon: Layers },
  { path: '/execution', label: 'execution', icon: Terminal },
  { path: '/risk', label: 'risk', icon: Shield },
  { path: '/audit', label: 'audit', icon: FileText },
];

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-xs tabular-nums" style={{ color: '#6b7280' }}>
      {time.toUTCString().slice(17, 25)} UTC
    </span>
  );
}

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected } = useAccount();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      navigate('/');
    }
  }, [isConnected, navigate]);

  if (!isConnected) return null;

  const breadcrumb = NAV_ITEMS.find(n => n.path === location.pathname)?.label ?? 'dashboard';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050507' }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 48 : 200 }}
        transition={{ duration: 0.15, ease: 'easeInOut' }}
        className={`
          fixed lg:relative z-50 h-full flex-shrink-0 flex flex-col overflow-hidden
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
        style={{ background: '#0a0a10', borderRight: '1px solid #1e1e2e' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 py-3 overflow-hidden" style={{ borderBottom: '1px solid #1e1e2e', minHeight: 48 }}>
          <img src="/assets/argos.png" alt="ARGOS" className="w-6 h-6 flex-shrink-0 object-contain" />
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="font-mono font-bold text-xs tracking-widest whitespace-nowrap" style={{ color: '#00f0ff' }}>ARGOS</p>
              <p className="font-mono text-[10px] whitespace-nowrap" style={{ color: '#6b7280' }}>reality engine</p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 transition-colors relative"
                style={{
                  color: active ? '#00f0ff' : '#6b7280',
                  background: active ? 'rgba(0,240,255,0.05)' : 'transparent',
                  borderLeft: active ? '2px solid #00f0ff' : '2px solid transparent',
                }}
              >
                <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                {!collapsed && (
                  <span className="font-mono text-xs whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-2" style={{ borderTop: '1px solid #1e1e2e' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-1.5 rounded transition-colors"
            style={{ color: '#6b7280' }}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>
      </motion.aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 flex-shrink-0" style={{ height: 48, background: '#0a0a10', borderBottom: '1px solid #1e1e2e' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1 rounded transition-colors"
              style={{ color: '#6b7280' }}
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <span className="font-mono text-xs" style={{ color: '#6b7280' }}>
              ARGOS <span style={{ color: '#1e1e2e' }}>/</span> <span style={{ color: '#e8e8ed' }}>{breadcrumb}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full pulse-live" style={{ background: '#30d158' }} />
              <span className="font-mono text-xs" style={{ color: '#30d158' }}>ONLINE</span>
            </div>
            <Clock />
            <WalletConnect />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}