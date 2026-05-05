import { useEffect, useState, useMemo } from "react";
import { FiUsers, FiAward, FiSearch, FiRefreshCw, FiZap, FiSun, FiMoon } from "react-icons/fi";
import { 
  CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";

const apiUrl = "https://sales-crm-8og5.onrender.com";

function Agents() {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // --- Theme State Logic ---
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Dynamic Styles
  const bgColor = isDark ? "bg-[#020617]" : "bg-slate-50";
  const textColor = isDark ? "text-slate-300" : "text-slate-600";
  const cardClass = isDark ? "bg-slate-900/40 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const chartGridColor = isDark ? "#1e293b" : "#e2e8f0";
  const chartLabelColor = isDark ? "#94a3b8" : "#64748b";

  useEffect(() => {
    const fetchAgentData = () => {
      setLoading(true);
      fetch(`${apiUrl}/Agent-data`)
        .then((res) => res.json())
        .then((data) => {
          const rawData = Array.isArray(data) ? data : (data.agents || []);
          setAgents(rawData);
          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching data:", err);
          setLoading(false);
        });
    };

    fetchAgentData();
    const interval = setInterval(fetchAgentData, 60000);
    return () => clearInterval(interval);
  }, []);

  const displayAgents = useMemo(() => {
    return agents
      .filter((a) => {
        const name = a.agent || "";
        const mSales = Number(a.monthSales) || 0;
        const isNotCM360 = name.toUpperCase() !== "CM360";
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
        const hasMonthlySales = mSales > 0;
        return isNotCM360 && matchesSearch && hasMonthlySales;
      })
      .sort((a, b) => (Number(b.todaySales) || 0) - (Number(a.todaySales) || 0));
  }, [agents, searchTerm]);

  const stats = useMemo(() => {
    const chartData = displayAgents.slice(0, 6).map(a => ({
      name: (a.agent || "").split(' ')[0],
      sales: Number(a.todaySales) || 0
    }));
    const topPerformer = displayAgents.length > 0 ? displayAgents[0].agent : "N/A";
    return { topPerformer, chartData };
  }, [displayAgents]);

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} p-4 md:p-10 font-sans transition-colors duration-500 relative`}>
      
      {/* Theme Toggle Button - Fixed to Right */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 border ${
          isDark 
            ? "bg-slate-900 border-slate-800 text-yellow-400 shadow-2xl shadow-blue-900/20" 
            : "bg-white border-slate-200 text-slate-700 shadow-lg"
        }`}
      >
        {isDark ? <FiSun className="text-xl" /> : <FiMoon className="text-xl" />}
      </button>

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiZap className="text-blue-500" />
              </div>
              <span className="text-blue-500 font-bold tracking-widest text-xs uppercase">Intelligence Dashboard</span>
            </div>
            <h2 className={`text-4xl font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>Agent Performance</h2>
          </div>
          
          <div className="flex items-center gap-4 md:mr-16"> {/* Margin to avoid overlap with toggle on small screens */}
            <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search Active Agents..." 
                className={`pl-12 pr-6 py-3 border rounded-2xl outline-none w-full md:w-80 transition-all backdrop-blur-sm ${
                  isDark ? "bg-slate-900/50 border-slate-800 text-white focus:ring-blue-500/50" : "bg-white border-slate-200 text-slate-900 shadow-sm focus:ring-blue-200"
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button 
              onClick={() => window.location.reload()} 
              className={`p-3 border rounded-xl transition-all ${
                isDark ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800" : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm"
              }`}
            >
              <FiRefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatCard isDark={isDark} label="Active Agents" value={displayAgents.length} icon={<FiUsers />} color="from-blue-600 to-cyan-500" />
          <StatCard isDark={isDark} label="Today MVP" value={stats.topPerformer} icon={<FiAward />} color="from-violet-600 to-fuchsia-500" />
        </div>

        {/* Graph Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className={`${cardClass} p-6 rounded-3xl backdrop-blur-xl lg:col-span-2`}>
            <h3 className={`text-lg font-semibold mb-6 flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Performance Leaders (Top 6)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartLabelColor, fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: chartLabelColor, fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: isDark ? '#1e293b' : '#f1f5f9'}} 
                    contentStyle={{
                      backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, 
                      borderRadius: '12px',
                      color: isDark ? '#fff' : '#000'
                    }}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : (isDark ? '#6366f1' : '#818cf8')} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Sidebar */}
          <div className={`${cardClass} p-6 rounded-3xl backdrop-blur-xl flex flex-col`}>
            <h3 className={`text-lg font-semibold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Real-time Ranking</h3>
            <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
              {displayAgents.map((a, idx) => (
                <div key={a.agent} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isDark ? "bg-slate-800/30 border-slate-800/50" : "bg-slate-50 border-slate-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black ${idx < 3 ? 'text-blue-500' : 'text-slate-400'}`}>0{idx + 1}</span>
                    <p className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>{a.agent}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-1 rounded-lg">+{a.todaySales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className={`${cardClass} rounded-3xl overflow-hidden backdrop-blur-xl`}>
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${isDark ? "border-slate-800" : "border-slate-100"}`}>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Agents</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-center text-slate-500">Today Sales</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-center text-slate-500">Monthly Sales</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-right text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-slate-800/50" : "divide-slate-100"}`}>
              {displayAgents.map((a, idx) => (
                <tr key={a.agent + idx} className="hover:bg-blue-500/[0.02] transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-sm transition-transform group-hover:scale-110 ${
                        idx === 0 ? 'bg-blue-500 border-blue-400 text-white' : (isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500')
                      }`}>
                        {a.agent?.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{a.agent}</p>
                        {idx === 0 && <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Prime Performer</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="text-emerald-500 font-mono font-bold">{a.todaySales}</span>
                  </td>
                  <td className="px-8 py-4 text-center text-slate-500 font-mono">{a.monthSales}</td>
                  <td className="px-8 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <footer className="mt-8 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em]">
                Last Synchronized: {lastUpdated.toLocaleTimeString()}
            </span>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, isDark }) {
  return (
    <div className={`relative group overflow-hidden border p-6 rounded-3xl transition-all hover:-translate-y-1 ${
      isDark ? "bg-slate-900 border-slate-800 hover:border-slate-700" : "bg-white border-slate-200 shadow-sm hover:border-blue-200"
    }`}>
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity`}></div>
      <div className="flex items-center gap-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <h3 className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

export default Agents;