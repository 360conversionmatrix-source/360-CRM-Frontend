import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import darkImg from "../../public/final.png";    // Logo for Dark Theme
import lightImg from "../../public/Tab_logo.png"; // Logo for Light Theme
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, Cell, PieChart, Pie 
} from "recharts";
import { 
  FiLock, FiUser, FiBarChart2, FiUsers, FiLayers, 
  FiChevronDown, FiChevronUp, FiLogOut, FiTrendingUp, FiSearch, FiRefreshCw, FiCalendar, FiSun, FiMoon 
} from "react-icons/fi";

const apiUrl = "https://sales-crm-8og5.onrender.com";

function Admin() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totals, setTotals] = useState({ totalShiftSales: 0, totalMonthSales: 0 });
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchNumber, setSearchNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [openSection, setOpenSection] = useState("summary");

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const DAILY_GOAL = 50; 
  const MONTHLY_GOAL = 1000;

  // --- Theme Logic ---
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

  const activeLogo = isDark ? darkImg : lightImg;
  const bgColor = isDark ? "bg-[#020617]" : "bg-slate-50";
  const textColor = isDark ? "text-slate-300" : "text-slate-600";
  const cardClass = isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200 shadow-sm";
  const chartGridColor = isDark ? "#1e293b" : "#e2e8f0";
  const chartLabelColor = isDark ? "#94a3b8" : "#64748b";

  // --- Memoized Data ---
  const campaignChartData = useMemo(() => 
    [...stats]
      .sort((a, b) => (Number(b.monthlySales) || 0) - (Number(a.monthlySales) || 0))
      .slice(0, 8)
      .map(item => ({ name: item.campaign, sales: Number(item.monthlySales) || 0 })), 
  [stats]);

  const filteredAgents = useMemo(() => {
    return agents.filter(a => (Number(a.monthSales) || 0) > 0)
      .sort((a, b) => (Number(b.todaySales) || 0) - (Number(a.todaySales) || 0));
  }, [agents]);

  const agentChartData = useMemo(() => 
    filteredAgents
      .slice(0, 10)
      .map(item => ({ name: item.agent?.split(' ')[0], sales: Number(item.todaySales) || 0 })), 
  [filteredAgents]);

  // --- API Calls ---
  const fetchDashboardData = () => {
    setLoading(true);
    const params = { month: selectedMonth, year: selectedYear };

    Promise.all([
      axios.get(`${apiUrl}/Agent-data`, { params }),
      axios.get(`${apiUrl}/campaign-data`, { params }),
      axios.get(`${apiUrl}/admin-data`, { headers: { "x-admin-password": password }, params })
    ]).then(([agentRes, campaignRes, adminRes]) => {
      if (agentRes.data.agents) setAgents(agentRes.data.agents);
      if (agentRes.data.totals) setTotals(agentRes.data.totals);
      setStats(campaignRes.data.stats || []);
      if (Array.isArray(adminRes.data)) setData(adminRes.data);
      setLastUpdated(new Date());
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => { if (authenticated) fetchDashboardData(); }, [authenticated, selectedMonth, selectedYear]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin-data`, {
        headers: { "x-admin-password": password },
      });
      if (response.status === 403) { setError("Invalid password."); return; }
      const result = await response.json();
      setData(result);
      setAuthenticated(true);
    } catch (err) { setError("Server error."); }
  };

  const handleSearchLead = async () => {
    if (!searchNumber) { setSearchResult(null); return; }
    try {
      const response = await fetch(`${apiUrl}/admin-data?number=${searchNumber}`, {
        headers: { "x-admin-password": password },
      });
      if (response.status === 404) { setSearchResult(null); return; }
      const lead = await response.json();
      setSearchResult(lead);
    } catch (err) { setError("Search failed."); }
  };

  if (!authenticated) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center p-6`}>
        <div className={`max-w-md w-full border rounded-3xl p-8 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xl'}`}>
          <div className="text-center mb-8">
            <FiLock className="mx-auto text-blue-500 text-4xl mb-4" />
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin Login</h1>
          </div>
          <input
            type="password"
            placeholder="Password"
            className={`w-full px-4 py-3 rounded-xl border outline-none mb-4 ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200'}`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">Sign In</button>
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex transition-colors duration-500 relative`}>
      
      {/* Theme Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`fixed top-6 right-6 z-50 w-12 h-12 rounded-2xl flex items-center justify-center transition-all border ${
          isDark ? "bg-slate-900 border-slate-800 text-yellow-400" : "bg-white border-slate-200 text-slate-700 shadow-lg"
        }`}
      >
        {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={`w-64 border-r hidden md:flex flex-col sticky top-0 h-screen ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
        <div className={`p-6 text-xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <img src={activeLogo} alt="Logo" className="w-10 h-10 rounded-lg shadow-lg" />
          360-CRM
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <NavItem isDark={isDark} icon={<FiBarChart2 />} label="Overview" active={openSection === 'summary'} onClick={() => setOpenSection('summary')} />
          <NavItem isDark={isDark} icon={<FiLayers />} label="Campaigns" active={openSection === 'campaigns'} onClick={() => setOpenSection('campaigns')} />
          <NavItem isDark={isDark} icon={<FiUsers />} label="Agents" active={openSection === 'agents'} onClick={() => setOpenSection('agents')} />
          <NavItem isDark={isDark} icon={<FiUser />} label="Client Data" active={openSection === 'clients'} onClick={() => setOpenSection('clients')} />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className={`backdrop-blur-md border-b px-8 py-5 sticky top-0 z-10 flex justify-between items-center ${isDark ? 'bg-slate-950/50 border-slate-800' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Dashboard Overview</h2>
            <span className="text-xs text-slate-500 font-mono uppercase">Sync: {lastUpdated.toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-4 mr-16">
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase">Live</span>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Filters */}
          <div className={`${cardClass} p-4 rounded-2xl flex flex-wrap items-center gap-6 shadow-xl transition-all`}>
            <div className="flex items-center gap-3">
              <FiCalendar className="text-blue-500" />
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className={`border rounded-xl px-4 py-2 text-sm outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, idx) => <option key={m} value={idx}>{m}</option>)}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className={`border rounded-xl px-4 py-2 text-sm outline-none ${isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button onClick={fetchDashboardData} className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className={`h-32 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div><div className={`h-32 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div></div>
              <div className={`h-96 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div>
            </div>
          ) : (
            <>
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatCard isDark={isDark} label="Shift Sales" value={totals.totalShiftSales} target={DAILY_GOAL} icon={<FiTrendingUp />} color="#3b82f6" />
                <StatCard isDark={isDark} label="Monthly Sales" value={totals.totalMonthSales} target={MONTHLY_GOAL} icon={<FiBarChart2 />} color="#10b981" />
              </div>

              {/* Sections Container */}
              <div className="space-y-6">
                <CollapsibleSection isDark={isDark} title="Campaign Performance" isOpen={openSection === "campaigns"} onToggle={() => setOpenSection(openSection === "campaigns" ? null : "campaigns")}>
                  <div className="p-6 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart layout="vertical" data={campaignChartData}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartGridColor} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" tick={{fill: chartLabelColor, fontSize: 10}} width={80} />
                        <Tooltip cursor={{fill: isDark ? '#1e293b' : '#f1f5f9'}} contentStyle={{backgroundColor: isDark ? '#0f172a' : '#fff', border: 'none', borderRadius: '12px'}} />
                        <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CollapsibleSection>

                {/* --- AGENT SALES REPORT (RE-ADDED FULLY) --- */}
                <CollapsibleSection isDark={isDark} title="Agent Sales Report" isOpen={openSection === "agents"} onToggle={() => setOpenSection(openSection === "agents" ? null : "agents")}>
                  <div className="p-6 h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={agentChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridColor} />
                        <XAxis dataKey="name" tick={{fill: chartLabelColor, fontSize: 10}} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{backgroundColor: isDark ? '#0f172a' : '#fff', border: `1px solid ${chartGridColor}`, borderRadius: '8px'}} />
                        <Area type="monotone" dataKey="sales" fill="url(#colorSalesAdmin)" stroke="#10b981" strokeWidth={2} />
                        <defs>
                          <linearGradient id="colorSalesAdmin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={`overflow-x-auto border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <table className="w-full text-left text-sm">
                      <thead className={`${isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'} uppercase text-[10px] font-black`}>
                        <tr><th className="px-6 py-4">Rank & Agent Name</th><th className="px-6 py-4 text-center">Today</th><th className="px-6 py-4 text-right">This Month</th></tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                        {filteredAgents.map((a, idx) => (
                          <tr key={idx} className={`transition group ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-blue-50/50'} ${a.agent?.toUpperCase() === 'CM360' ? 'bg-blue-500/5' : ''}`}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                  {a.agent ? a.agent.charAt(0) : "?"}
                                </div>
                                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                  {a.agent} {a.agent?.toUpperCase() === 'CM360' && <span className="text-[10px] bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded ml-1 font-bold">SYSTEM</span>}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center font-mono font-bold text-emerald-500">{a.todaySales}</td>
                            <td className="px-6 py-4 text-right text-slate-400 font-mono">{a.monthSales}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CollapsibleSection>

                <CollapsibleSection isDark={isDark} title="Detailed Client Data" isOpen={openSection === "clients"} onToggle={() => setOpenSection(openSection === "clients" ? null : "clients")}>
                  <div className={`p-4 border-b flex gap-3 ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <input type="text" placeholder="Search number..." className={`flex-1 px-4 py-2 rounded-xl border outline-none ${isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200'}`} value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} />
                    <button onClick={handleSearchLead} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">Search</button>
                  </div>
                  <div className="overflow-x-auto min-h-[200px]">
                    {searchResult ? (
                      <table className="w-full text-left">
                        <thead className={`text-xs uppercase font-semibold ${isDark ? 'bg-slate-900/50 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                          <tr>{Object.keys(searchResult).map((key) => (<th key={key} className="px-6 py-4 whitespace-nowrap">{key}</th>))}</tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                          <tr className="bg-blue-500/5">{Object.values(searchResult).map((val, i) => (<td key={i} className={`px-6 py-4 text-sm whitespace-nowrap ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{val}</td>))}</tr>
                        </tbody>
                      </table>
                    ) : (
                      <table className="w-full text-left text-sm">
                        <thead className={`${isDark ? 'bg-slate-900 text-slate-500' : 'bg-slate-100 text-slate-400'} uppercase text-[10px] font-black`}>
                          <tr><th className="px-6 py-4 text-left">Agent</th><th className="px-6 py-4 text-center">Campaign</th><th className="px-6 py-4 text-right">Number</th></tr>
                        </thead>
                        <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                          {data.slice(0, 15).map((row, i) => (
                            <tr key={i} className="hover:bg-blue-500/5 transition-colors">
                              <td className="px-6 py-4 font-bold">{row.Agent}</td>
                              <td className="px-6 py-4 text-center">{row.Campaign}</td>
                              <td className="px-6 py-4 text-right font-mono text-blue-500 font-bold">{row.Number}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </CollapsibleSection>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// --- Sub-Components ---
const NavItem = ({ icon, label, active, onClick, isDark }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : isDark ? "text-slate-500 hover:bg-slate-900 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"}`}>
    <span className="text-lg">{icon}</span> <span className="text-sm">{label}</span>
  </button>
);

const StatCard = ({ label, value, target, icon, color, isDark }) => {
  const percentage = Math.min((Number(value) / target) * 100, 100);
  return (
    <div className={`p-6 rounded-3xl border flex items-center justify-between transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
      <div>
        <div className="flex items-center gap-2 mb-1"><div className="p-1.5 bg-blue-500/10 rounded-lg text-xs">{icon}</div><p className="text-[10px] text-slate-400 uppercase font-black">{label}</p></div>
        <h3 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      </div>
      <div className="relative w-20 h-20">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={[{v: percentage}, {v: 100-percentage}]} cx="50%" cy="50%" innerRadius={25} outerRadius={35} startAngle={90} endAngle={-270} dataKey="v" stroke="none">
              <Cell fill={color} /><Cell fill={isDark ? "#1e293b" : "#f1f5f9"} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center font-black text-[10px]">{Math.round(percentage)}%</div>
      </div>
    </div>
  );
};

const CollapsibleSection = ({ title, children, isOpen, onToggle, isDark }) => (
  <div className={`rounded-3xl border overflow-hidden transition-all duration-500 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xl'}`}>
    <button onClick={onToggle} className={`w-full px-6 py-5 flex justify-between items-center transition-all ${isDark ? 'hover:bg-slate-800 text-white' : 'hover:bg-slate-50 text-slate-900'}`}>
      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>{title}</h3>
      {isOpen ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
    </button>
    {isOpen && <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>{children}</div>}
  </div>
);

export default Admin;