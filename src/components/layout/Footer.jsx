import { GraduationCap } from 'lucide-react';
import { FaGithub, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router';

export default function Footer() {
  const links = [
    ['/', 'Dashboard'],
    ['/calculator', 'Calculator'],
    ['/prediction', 'Prediction'],
    ['/improvement', 'Improvement'],
    ['/insights', 'Insights'],
    ['/about', 'About'],
  ];

  return (
    <footer className="border-t mt-auto" style={{ background: 'var(--gp-surface)', borderColor: 'var(--gp-border)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* BUG FIX: footer grid was using md:grid-cols-3 which made columns too narrow on tablet */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 items-start">

          {/* LEFT - BRAND */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <GraduationCap size={26} className="text-indigo-600 transition-transform group-hover:scale-110" />
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: 'var(--font-display)', color: 'var(--gp-text)' }}>
                GradePilot
              </span>
            </Link>
            <p className="text-sm leading-relaxed opacity-80" style={{ color: 'var(--gp-text-muted)' }}>
              Academic Intelligence Dashboard for CGPA tracking, prediction & improvement.
            </p>
          </div>

          {/* MIDDLE - LINKS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
            {links.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                className="text-sm font-medium relative w-fit group overflow-hidden pb-1"
                style={{ color: 'var(--gp-text-muted)' }}
              >
                <span className="transition-colors duration-300 group-hover:text-indigo-600">{label}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-indigo-500 transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover:scale-x-100" />
              </Link>
            ))}
          </div>

          {/* RIGHT - DEV INFO */}
          <div className="flex flex-col items-center sm:items-start lg:items-end gap-4">
            <div className="lg:text-right">
              <p className="text-sm font-bold" style={{ color: 'var(--gp-text)' }}>Md Jonaed Joshim</p>
              <p className="text-xs font-medium mt-1 text-indigo-600">MERN Stack Developer</p>
              <p className="text-[11px] opacity-70" style={{ color: 'var(--gp-text-muted)' }}>Cybersecurity Enthusiast</p>
            </div>
            <div className="flex gap-5">
              <a href="https://github.com/jonaedjoshim" target="_blank" rel="noreferrer"
                className="text-gray-500 hover:text-black transition-all duration-300 hover:-translate-y-1">
                <FaGithub size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                className="text-gray-500 hover:text-[#0077b5] transition-all duration-300 hover:-translate-y-1">
                <FaLinkedin size={20} />
              </a>
              <a href="https://wa.me/8801316323104" target="_blank" rel="noreferrer"
                className="text-gray-500 hover:text-[#25d366] transition-all duration-300 hover:-translate-y-1">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
