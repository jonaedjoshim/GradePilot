import { motion } from 'framer-motion';

export default function StatCard({
  icon, label, value = 0, suffix = '',
  decimals = 0, color = '#4f46e5', bg = '#eef2ff', delay = 0,
}) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatted = decimals > 0 ? safeValue.toFixed(decimals) : Math.round(safeValue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="gp-card p-5 flex items-center gap-4"
    >
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: bg, color }}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--gp-text-muted)' }}>{label}</p>
        <p className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
          {formatted}{suffix}
        </p>
      </div>
    </motion.div>
  );
}
