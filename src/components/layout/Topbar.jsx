import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router';
import { Sun, Moon, Menu, X, GraduationCap, LayoutDashboard, Calculator, TrendingUp, Lightbulb, BarChart2, Info } from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/prediction', icon: TrendingUp, label: 'Prediction' },
  { to: '/improvement', icon: Lightbulb, label: 'Improvement' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/about', icon: Info, label: 'About' },
];

export default function Topbar() {
  const { state, dispatch } = useAcademic();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ background: 'var(--gp-surface)', borderBottom: '1px solid var(--gp-border)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
            <GraduationCap size={16} color="white" />
          </div>
          <span className="font-bold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
            GradePilot
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
            className="p-2 rounded-lg transition-colors"
            style={{ color: 'var(--gp-text-muted)' }}
          >
            {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg"
            style={{ color: 'var(--gp-text)' }}
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Desktop theme toggle in topbar area */}
      <div className="hidden lg:flex items-center justify-end px-6 py-3 sticky top-0 z-30"
        style={{ background: 'var(--gp-bg)', borderBottom: '1px solid var(--gp-border)' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => dispatch({ type: 'TOGGLE_THEME' })}
          className="p-2 rounded-xl transition-colors"
          style={{ background: 'var(--gp-surface)', border: '1px solid var(--gp-border)', color: 'var(--gp-text-muted)' }}
        >
          {state.theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </motion.button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-50"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col"
              style={{ background: 'var(--gp-surface)', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--gp-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}>
                    <GraduationCap size={16} color="white" />
                  </div>
                  <span className="font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>GradePilot</span>
                </div>
                <button onClick={() => setMobileOpen(false)} style={{ color: 'var(--gp-text-muted)' }}>
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {NAV_ITEMS.map(({ to, icon: Icon, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <NavLink to={to} end={to === '/'} onClick={() => setMobileOpen(false)}>
                      {({ isActive }) => (
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'text-white' : ''}`}
                          style={isActive
                            ? { background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }
                            : { color: 'var(--gp-text-muted)' }}>
                          <Icon size={20} />
                          <span className="font-medium text-sm">{label}</span>
                        </div>
                      )}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
