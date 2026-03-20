import { useEffect, useState, useMemo } from "react";
import { FiUsers, FiTrendingUp, FiAward, FiSearch, FiRefreshCw, FiZap } from "react-icons/fi";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";

const apiUrl = import.meta.env.API_URL;

function Agents() {
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const fetchAgentData = () => {
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

  // Data processing
  const displayAgents = useMemo(() => {
    return agents
      .filter((a) => a.agent.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => (Number(b.todaySales) || 0) - (Number(a.todaySales) || 0));
  }, [agents, searchTerm]);

  const stats = useMemo(() => {
    const totalToday = agents.reduce((sum, a) => sum + (Number(a.todaySales) || 0), 0);
    const topPerformer = displayAgents.length > 0 ? displayAgents[0].agent : "N/A";
    // Chart data: Top 5 agents for the bar graph
    const chartData = displayAgents.slice(0, 6).map(a => ({
      name: a.agent.split(' ')[0],
      sales: Number(a.todaySales) || 0
    }));
    return { totalToday, topPerformer, chartData };
  }, [agents, displayAgents]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <FiZap className="text-blue-400" />
              </div>
              <span className="text-blue-400 font-bold tracking-widest text-xs uppercase">Intelligence Dashboard</span>
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight">Agent Performance</h2>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="relative group">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Agent..." 
                className="pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500/50 outline-none w-full md:w-80 transition-all text-white backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
              <FiRefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard label="Active Agents" value={agents.length} icon={<FiUsers />} color="from-blue-600 to-cyan-500" />
          <StatCard label="Today's Sales" value={stats.totalToday} icon={<FiTrendingUp />} color="from-emerald-600 to-teal-500" />
          <StatCard label="Today MVP" value={stats.topPerformer} icon={<FiAward />} color="from-violet-600 to-fuchsia-500" />
        </div>

        {/* Performance Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
              Performance Leaders
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '12px'}}
                  />
                  <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
                    {stats.chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking Sidebar */}
          <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl backdrop-blur-xl flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-6">Real-time Ranking</h3>
            <div className="space-y-4 overflow-y-auto max-h-[300px] custom-scrollbar pr-2">
              {displayAgents.map((a, idx) => (
                <div key={a.agent} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/30 border border-slate-800/50 hover:border-blue-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-black ${idx < 3 ? 'text-blue-400' : 'text-slate-600'}`}>0{idx + 1}</span>
                    <p className="text-sm font-medium text-slate-300">{a.agent}</p>
                  </div>
                  <span className="text-xs font-bold text-white bg-blue-500/20 px-2 py-1 rounded-lg">+{a.todaySales}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl overflow-hidden backdrop-blur-xl">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Agents</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-center text-slate-500">Today Sales</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-center text-slate-500">Monthly Sales</th>
                <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-right text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {displayAgents.map((a, idx) => (
                <tr key={a.agent + idx} className="hover:bg-blue-500/[0.02] transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border shadow-lg transition-transform group-hover:scale-110 ${
                        idx === 0 ? 'bg-blue-500 border-blue-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {a.agent?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{a.agent}</p>
                        {idx === 0 && <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter">Prime Performer</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 text-center">
                    <span className="text-emerald-400 font-mono font-bold">{a.todaySales}</span>
                  </td>
                  <td className="px-8 py-4 text-center text-slate-400 font-mono">{a.monthSales}</td>
                  <td className="px-8 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <footer className="mt-8 text-center">
            <span className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
                Last Synchronized: {lastUpdated.toLocaleTimeString()}
            </span>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className="relative group overflow-hidden bg-slate-900 border border-slate-800 p-6 rounded-3xl transition-all hover:-translate-y-1 hover:border-slate-700">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-[0.03] blur-3xl group-hover:opacity-10 transition-opacity`}></div>
      <div className="flex items-center gap-5 relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
          <h3 className="text-2xl font-black text-white">{value}</h3>
        </div>
      </div>
    </div>
  );
}

export default Agents;