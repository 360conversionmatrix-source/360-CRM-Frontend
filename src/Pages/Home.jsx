import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUser, FiShield, FiArrowRight, FiActivity, FiSun, FiMoon } from "react-icons/fi";

// Import both logos
import darkLogo from "../../public/final.png";
import lightLogo from "../../public/Tab_logo.png";

function Home() {
  // Check local storage so it remembers your choice
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    localStorage.setItem("theme", isDark ? "dark" : "light");
    // Optional: Sync with document class for global Tailwind dark mode support
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Define dynamic background, text, and IMAGE based on state
  const bgColor = isDark ? "bg-[#020617]" : "bg-slate-50";
  const textColor = isDark ? "text-slate-300" : "text-slate-600";
  const headingColor = isDark ? "text-white" : "text-slate-900";
  const activeLogo = isDark ? darkLogo : lightLogo;

  return (
    <div className={`min-h-screen w-full ${bgColor} ${textColor} flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors duration-500`}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`absolute top-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border ${
          isDark ? "bg-slate-900 border-slate-800 text-yellow-400" : "bg-white border-slate-200 text-slate-700 shadow-lg"
        }`}
      >
        {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
      </button>

      {/* Background Neon Glows - Only visible in Dark Mode */}
      {isDark && (
        <>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] opacity-40"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        </>
      )}

      {/* Header Section */}
      <div className="text-center z-10 mb-16 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
            isDark ? "bg-slate-900 border-slate-800 shadow-blue-900/20" : "bg-white border-slate-200 shadow-lg"
          }`}>
            {/* DYNAMIC LOGO TOGGLE */}
            <img 
                src={activeLogo} 
                alt="360-CRM Logo" 
                className={`w-20 h-20 object-contain transition-opacity duration-500 ${isDark ? "brightness-110" : ""}`} 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-blue-500/50"></div>
            <span className="text-xl font-black tracking-[0.2em] text-blue-500 dark:text-blue-400 uppercase">360-CRM System</span>
            <div className="h-[1px] w-8 bg-blue-500/50"></div>
          </div>
        </div>
        
        <h1 className={`text-5xl md:text-6xl font-black ${headingColor} tracking-tighter mb-4`}>
          Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Dashboard</span>
        </h1>
        <p className={`${isDark ? "text-slate-500" : "text-slate-500"} mt-4 text-lg max-w-md mx-auto leading-relaxed font-medium`}>
          Select your secure portal to manage sales, track agent performance, and oversee global operations.
        </p>
      </div>

      {/* Portal Cards Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center z-10 w-full max-w-5xl px-4">  
        <PortalCard 
          isDark={isDark}
          to="/agents"
          title="Agent Portal"
          description="Access your personal sales reports, track daily targets, and analyze performance metrics in real-time."
          icon={<FiUser className="text-blue-400" />}
          color="blue"
          tag="Field Access"
        />

        <PortalCard 
          isDark={isDark}
          to="/admin"
          title="Admin Control"
          description="High-level oversight of sensitive client data, campaign statistics, and administrative configurations."
          icon={<FiShield className="text-emerald-400" />}
          color="emerald"
          tag="Restricted"
        />
      </div>

      {/* Footer Info */}
      <div className="mt-24 flex flex-col items-center gap-4 z-10">
        <div className={`flex items-center gap-6 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
            <FiActivity className="animate-pulse" />
            <div className={`h-4 w-[1px] ${isDark ? "bg-slate-800" : "bg-slate-200"}`}></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">System Status: Optimal</span>
        </div>
        <div className={`${isDark ? "text-slate-500" : "text-slate-400"} text-[10px] font-black uppercase tracking-[0.2em] opacity-50`}>
          &copy; 2026 360-CRM Solutions • Secure Internal Infrastructure
        </div>
      </div>
    </div>
  );
}

function PortalCard({ to, title, description, icon, color, tag, isDark }) {
  return (
    <Link to={to} className="group w-full md:w-1/2">
      <div className={`h-full border p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-3 flex flex-col gap-8 relative overflow-hidden ${
        isDark 
          ? "bg-slate-900/40 backdrop-blur-xl border-slate-800 shadow-2xl hover:border-blue-500/50" 
          : "bg-white border-slate-200 shadow-xl hover:border-blue-400"
      }`}>
        
        <div className="flex justify-between items-start">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 group-hover:scale-110 ${
            isDark ? "bg-slate-800 border-slate-700/50" : "bg-slate-50 border-slate-100"
          }`}>
            {icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${
            isDark ? "bg-slate-800 text-blue-400 border-slate-700" : "bg-blue-50 text-blue-600 border-blue-100"
          }`}>
            {tag}
          </span>
        </div>
        
        <div>
          <h3 className={`text-2xl font-black mb-3 transition-all duration-500 ${isDark ? "text-white" : "text-slate-900"}`}>
            {title}
          </h3>
          <p className={`${isDark ? "text-slate-400" : "text-slate-500"} leading-relaxed text-sm font-medium`}>
            {description}
          </p>
        </div>

        <div className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest mt-auto ${isDark ? "text-blue-400" : "text-blue-600"}`}>
          Initialize Session <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-2" />
        </div>
      </div>
    </Link>
  );
}

export default Home;