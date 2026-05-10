import { motion } from 'framer-motion';
import { GraduationCap, Code, Shield } from 'lucide-react';
import { FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa';

const FEATURES = [
  { icon: '📊', title: 'Real-time CGPA', desc: 'Instant calculation as you enter grades and credits.' },
  { icon: '🔮', title: 'Prediction Engine', desc: 'Simulate what-if scenarios and forecast your future CGPA.' },
  { icon: '🤖', title: 'AI Insights', desc: 'Powered by academic intelligence engine for smart analysis.' },
  { icon: '📈', title: 'Improvement Exam', desc: 'NU-based improvement calculator with grade cap enforcement.' },
  { icon: '📤', title: 'PDF Export', desc: 'Professional academic reports with charts and insights.' },
  { icon: '💾', title: 'Auto Save', desc: 'All data persists automatically via local storage.' },
];

export default function AboutPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
          About GradePilot
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--gp-text-muted)' }}>
          A premium academic intelligence dashboard for students.
        </p>
      </motion.div>

      {/* Mission */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="gp-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #818cf8)', color: 'white' }}>
            <GraduationCap size={20} />
          </div>
          <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>Our Mission</h2>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--gp-text-muted)' }}>
          GradePilot is designed to help university students — especially those at National University — take full control of their academic journey. 
          By combining real-time CGPA calculation, predictive analytics, and AI-powered insights, we empower students to make 
          informed decisions about their studies, identify weaknesses early, and plan for academic success.
        </p>
      </motion.div>

      {/* Features */}
      <div>
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--gp-text)' }}>Key Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, desc }, i) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="gp-card p-4">
              <span className="text-2xl mb-3 block">{icon}</span>
              <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--gp-text)' }}>{title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--gp-text-muted)' }}>{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Developer */}
      <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.3 }}
  className="gp-card p-5 sm:p-6"
>
  <h2
    className="font-bold text-base mb-5"
    style={{ color: 'var(--gp-text)' }}
  >
    Developer
  </h2>

  {/* MAIN WRAPPER */}
  <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">

    {/* AVATAR */}
    <div
      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-xl sm:text-2xl shrink-0"
      style={{
        background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
      }}
    >
      👨‍💻
    </div>

    {/* CONTENT */}
    <div className="flex-1">

      {/* NAME */}
      <h3
        className="font-bold text-lg sm:text-xl"
        style={{
          fontFamily: 'var(--font-display)',
          color: 'var(--gp-text)',
        }}
      >
        Jonaed Joshim
      </h3>

      {/* TAGS */}
      <div className="flex flex-wrap gap-2 mt-2 mb-3">

        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{
            background: 'var(--gp-primary-bg)',
            color: '#4f46e5',
          }}
        >
          <Code size={12} />
          MERN Stack Developer
        </div>

        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
          style={{
            background: '#fef2f2',
            color: '#991b1b',
          }}
        >
          <Shield size={12} />
          Cybersecurity Enthusiast
        </div>
      </div>

      {/* DESCRIPTION */}
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: 'var(--gp-text-muted)' }}
      >
        Passionate full-stack developer with expertise in React,
        Node.js, Express, and MongoDB. Building GradePilot to make
        academic tracking smarter and more accessible for students.
      </p>

      {/* BUTTONS */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">

        <a
          href="https://github.com/jonaedjoshim"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition hover:scale-[1.02]"
          style={{
            background: 'var(--gp-surface-2)',
            color: 'var(--gp-text)',
            border: '1px solid var(--gp-border)',
          }}
        >
          <FaGithub size={16} /> GitHub
        </a>

        <a
          href="https://www.linkedin.com/in/jonaed-joshim"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition hover:scale-[1.02]"
          style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            border: '1px solid #bfdbfe',
          }}
        >
          <FaLinkedin size={16} /> LinkedIn
        </a>

        <a
          href="https://wa.me/8801316323104"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition hover:scale-[1.02]"
          style={{
            background: '#f0fdf4',
            color: '#15803d',
            border: '1px solid #bbf7d0',
          }}
        >
          <FaWhatsapp size={16} /> WhatsApp
        </a>

      </div>
    </div>
  </div>
</motion.div>

      {/* Tech Stack */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="gp-card p-6">
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--gp-text)' }}>Built With</h2>
        <div className="flex flex-wrap gap-2">
          {['React 19', 'Vite', 'Tailwind CSS', 'DaisyUI', 'Framer Motion', 'Recharts', 'React Router', 'jsPDF', 'Lottie', 'React Hot Toast', 'SweetAlert2'].map(tech => (
            <span key={tech} className="px-3 py-1 rounded-xl text-xs font-medium"
              style={{ background: 'var(--gp-surface-2)', color: 'var(--gp-text)', border: '1px solid var(--gp-border)' }}>
              {tech}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
