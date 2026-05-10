import { motion, AnimatePresence } from 'framer-motion';
import { Link, NavLink } from 'react-router';
import {
  LayoutDashboard, Calculator, TrendingUp, Lightbulb,
  BarChart2, Info, ChevronLeft, GraduationCap
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calculator', icon: Calculator, label: 'Calculator' },
  { to: '/prediction', icon: TrendingUp, label: 'Prediction' },
  { to: '/improvement', icon: Lightbulb, label: 'Improvement' },
  { to: '/insights', icon: BarChart2, label: 'Insights' },
  { to: '/about', icon: Info, label: 'About' },
];

export default function Sidebar() {
  const { state, dispatch } = useAcademic();
  const { sidebarCollapsed } = state;

  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="hidden lg:flex flex-col sticky top-0 overflow-hidden cursor-pointer select-none"
      style={{
        background: 'var(--gp-surface)',
        borderRight: '1px solid var(--gp-border)',
        flexShrink: 0,
        height: '100vh',
      }}
      onClick={toggleSidebar}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 min-h-18">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)' }}
        >
          <GraduationCap size={24} color="white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-bold text-xl whitespace-nowrap"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}
            >
              GradePilot
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={(e) => e.stopPropagation()} // don't toggle sidebar on nav click
          >
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200',
                  isActive ? 'text-white shadow-md' : 'hover:bg-opacity-60'
                )}
                style={isActive
                  ? { background: 'linear-gradient(135deg, #4f46e5, #6366f1)', cursor: 'pointer' }
                  : { color: 'var(--gp-text-muted)', cursor: 'pointer' }
                }
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--gp-surface-2)'; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={20} className="shrink-0" />
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse indicator at bottom */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--gp-border)' }}>
        <div
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm transition-colors"
          style={{ color: 'var(--gp-text-muted)' }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gp-surface-2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft size={16} />
          </motion.div>
          <AnimatePresence>
            {!sidebarCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Collapse
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  );
}
