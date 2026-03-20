import { Link } from "react-router-dom";
import { FiUser, FiShield, FiArrowRight, FiActivity, FiLayers } from "react-icons/fi";
import img from "../../public/final.png";

function Home() {
  return (
    <div className="min-h-screen w-full bg-[#020617] flex flex-col items-center justify-center p-6 relative overflow-hidden text-slate-300">
      
      {/* Background Decorative Elements - Neon Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-900/20 rounded-full blur-[120px] opacity-40"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>

      {/* Header Section */}
      <div className="text-center z-10 mb-16 animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-blue-900/20 group hover:border-blue-500/50 transition-colors duration-500">
            <img src={img} alt="360-CRM Logo" className="w-23 h-23 object-contain filter brightness-110" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-[1px] w-8 bg-blue-500/50"></div>
            <span className="text-xl font-black tracking-[0.2em] text-blue-400 uppercase">360-CRM System</span>
            <div className="h-[1px] w-8 bg-blue-500/50"></div>
          </div>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
          Enterprise <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">Dashboard</span>
        </h1>
        <p className="text-slate-500 mt-4 text-lg max-w-md mx-auto leading-relaxed font-medium">
          Select your secure portal to manage sales, track agent performance, and oversee global operations.
        </p>
      </div>

      {/* Portal Cards Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center z-10 w-full max-w-5xl px-4">  
        
        <PortalCard 
          to="/agents"
          title="Agent Portal"
          description="Access your personal sales reports, track daily targets, and analyze performance metrics in real-time."
          icon={<FiUser className="text-blue-400" />}
          color="blue"
          tag="Field Access"
        />

        <PortalCard 
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
        <div className="flex items-center gap-6 text-slate-600">
            <FiActivity className="animate-pulse" />
            <div className="h-4 w-[1px] bg-slate-800"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest">System Status: Optimal</span>
        </div>
        <div className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] opacity-50">
          &copy; 2026 360-CRM Solutions • Secure Internal Infrastructure
        </div>
      </div>
    </div>
  );
}

// Reusable Portal Card Component
function PortalCard({ to, title, description, icon, color, tag }) {
  const accentBorder = color === 'blue' ? 'hover:border-blue-500/50' : 'hover:border-emerald-500/50';
  const glowShadow = color === 'blue' ? 'hover:shadow-blue-900/20' : 'hover:shadow-emerald-900/20';
  const iconBg = color === 'blue' ? 'bg-blue-500/10' : 'bg-emerald-500/10';
  const tagBg = color === 'blue' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400';

  return (
    <Link to={to} className="group w-full md:w-1/2">
      <div className={`h-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-[2rem] transition-all duration-500 hover:-translate-y-3 shadow-2xl ${accentBorder} ${glowShadow} flex flex-col gap-8 relative overflow-hidden`}>
        
        {/* Decorative corner glow */}
        <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${color === 'blue' ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>

        <div className="flex justify-between items-start">
          <div className={`w-16 h-16 ${iconBg} border border-slate-700/50 rounded-2xl flex items-center justify-center text-3xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            {icon}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-slate-800 ${tagBg}`}>
            {tag}
          </span>
        </div>
        
        <div>
          <h3 className="text-2xl font-black text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all duration-500">
            {title}
          </h3>
          <p className="text-slate-400 leading-relaxed text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
            {description}
          </p>
        </div>

        <div className={`flex items-center gap-3 font-black text-xs uppercase tracking-widest mt-auto transition-all duration-300 ${color === 'blue' ? 'text-blue-400' : 'text-emerald-400'}`}>
          Initialize Session <FiArrowRight className="text-lg transition-transform duration-300 group-hover:translate-x-2" />
        </div>
      </div>
    </Link>
  );
}

export default Home;