import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import img from "../../public/final.png";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, ComposedChart, PieChart, Pie, Cell 
} from "recharts";
import { 
  FiLock, FiUser, FiBarChart2, FiUsers, FiLayers, 
  FiChevronDown, FiChevronUp, FiLogOut, FiTrendingUp, FiSearch, FiX, FiRefreshCw 
} from "react-icons/fi";

const apiUrl = import.meta.env.API_URL || "http://localhost:8080";

function Admin() {
  const [password, setPassword] = useState("");
  const [data, setData] = useState([]);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [totals, setTotals] = useState({ totalShiftSales: 0, totalMonthSales: 0 });
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  
  const [searchNumber, setSearchNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [openSection, setOpenSection] = useState("summary");

  // Goals for the Circular Graphs (Adjust these as needed)
  const DAILY_GOAL = 50; 
  const MONTHLY_GOAL = 1000;

  // Memoized Chart Data for Campaign & Agents
  const campaignChartData = useMemo(() => 
    [...stats]
      .sort((a, b) => (Number(b.monthlySales) || 0) - (Number(a.monthlySales) || 0))
      .slice(0, 8)
      .map(item => ({ name: item.campaign, sales: Number(item.monthlySales) || 0 })), 
  [stats]);

  const agentChartData = useMemo(() => 
    [...agents]
      .sort((a, b) => (Number(b.todaySales) || 0) - (Number(a.todaySales) || 0))
      .slice(0, 10)
      .map(item => ({ name: item.agent?.split(' ')[0], sales: Number(item.todaySales) || 0 })), 
  [agents]);

  const fetchDashboardData = () => {
    fetch(`${apiUrl}/Agent-data`)
      .then(res => res.json())
      .then(data => {
        if (data.agents && data.totals) {
          setAgents(data.agents);
          setTotals(data.totals);
        }
        setLastUpdated(new Date());
      })
      .catch(err => console.error("Update error:", err));

    axios.get(`${apiUrl}/campaign-data`).then(res => {
      setStats(res.data.stats || []);
    });
  };

  useEffect(() => {
    let interval;
    if (authenticated) {
      fetchDashboardData();
      interval = setInterval(fetchDashboardData, 60000);
    }
    return () => clearInterval(interval);
  }, [authenticated]);

  const handleLogin = async () => {
    try {
      const response = await fetch(`${apiUrl}/admin-data`, {
        headers: { "x-admin-password": password },
      });
      if (response.status === 403) {
        setError("Invalid password. Access denied.");
        return;
      }
      const result = await response.json();
      setData(result);
      setAuthenticated(true);
      setError("");
    } catch (err) {
      setError("Server connection failed.");
    }
  };

  const handleSearchLead = async () => {
    if (!searchNumber) { setSearchResult(null); return; }
    try {
      const response = await fetch(`${apiUrl}/admin-data?number=${searchNumber}`, {
        headers: { "x-admin-password": password },
      });
      if (response.status === 404) {
        setError("Lead not found.");
        setSearchResult(null);
        return;
      }
      const lead = await response.json();
      setSearchResult(lead);
      setError("");
    } catch (err) { setError("Search failed."); }
  };

  const toggleSection = (section) => {
    setOpenSection(openSection === section ? null : section);
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="bg-blue-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
              <FiLock className="text-blue-500 text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-500 text-sm">Please enter your credentials to continue</p>
          </div>
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 bg-slate-950 rounded-xl border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          <button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20">
            Sign In
          </button>
          {error && <p className="text-red-500 text-sm mt-4 text-center font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col">
        <div className="p-6 text-xl font-bold flex items-center gap-2 text-white">
          <img src={img} alt="CRM Logo" className="w-15 h-15 rounded-lg shadow-lg" />
          CRM Admin
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <NavItem icon={<FiBarChart2 />} label="Overview" active={openSection === 'summary'} onClick={() => setOpenSection('summary')} />
          <NavItem icon={<FiLayers />} label="Campaigns" active={openSection === 'campaigns'} onClick={() => setOpenSection('campaigns')} />
          <NavItem icon={<FiUsers />} label="Agents" active={openSection === 'agents'} onClick={() => setOpenSection('agents')} />
          <NavItem icon={<FiUser />} label="Client Data" active={openSection === 'clients'} onClick={() => setOpenSection('clients')} />
        </nav>
        <div className="p-6 border-t border-slate-900">
          <button onClick={() => window.location.reload()} className="flex items-center gap-2 text-slate-500 hover:text-white transition w-full font-medium">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-slate-950/50 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-1 sm:hidden"  >
          <img src={img} alt="CRM Logo" className="w-15 h-15 rounded-lg shadow-lg" />
          <span>CRM</span>
        </div>
          <div className="flex flex-col">
            <h2 className="hidden sm:text-2xl sm:block font-semibold text-white">Dashboard Overview</h2>
            <span className="hidden  text-[13px] text-slate-500 sm:flex items-center gap-1 uppercase tracking-wider">
              <FiRefreshCw className="animate-spin" /> Last sync: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-tighter">System Live</span>
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold border border-blue-400/20 shadow-lg shadow-blue-900/20">A</div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          {/* Stat Cards with 360 Rotater Circle Graphs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              label="Today's Total Sales" 
              value={totals.totalShiftSales} 
              target={DAILY_GOAL}
              icon={<FiTrendingUp className="text-blue-400" />} 
              color="#3b82f6" 
            />
            <StatCard 
              label="This Month's Sales" 
              value={totals.totalMonthSales} 
              target={MONTHLY_GOAL}
              icon={<FiBarChart2 className="text-emerald-400" />} 
              color="#10b981" 
            />
          </div>

          <div className="space-y-6">
            {/* Campaign Performance */}
            <CollapsibleSection title={
    <span className="text-base font-semibold">
      Campaign Performance (Ranked by Monthly)
    </span>
  }
 isOpen={openSection === "campaigns"} onToggle={() => toggleSection("campaigns")}>
              <div className=" p-2 font-semibold h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={campaignChartData} margin={{ left: 40, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" tick={{fill: '#94a3b8', fontSize: 10}} width={80} />
                    <Tooltip cursor={{fill: '#1e293b'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px'}} />
                    <Bar dataKey="sales" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto border-t border-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Rank & Campaign Name</th>
                      <th className="px-6 py-4 text-center">Shift Sales</th>
                      <th className="px-6 py-4 text-center">Monthly Sales</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[...stats].sort((a, b) => (Number(b.monthlySales) || 0) - (Number(a.monthlySales) || 0)).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700 w-4">{idx + 1}</span>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-800 text-slate-400'}`}>
                              <FiLayers size={14} />
                            </div>
                            <span className="font-medium text-slate-200">{row.campaign}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center text-slate-400 font-mono">{row.shiftSales}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-3 py-1 rounded-lg font-mono font-bold ${idx === 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-300'}`}>{row.monthlySales}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>

            {/* Agent Sales Report */}
            <CollapsibleSection title={
    <span className="text-base font-semibold">
      Agent Sales Report (Ranked by Today's)
    </span>
  } isOpen={openSection === "agents"} onToggle={() => toggleSection("agents")}>
              <div className="p-6 h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={agentChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 10}} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px'}} />
                    <Area type="monotone" dataKey="sales" fill="url(#colorSales)" stroke="#10b981" strokeWidth={2} />
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="overflow-x-auto border-t border-slate-800">
                <table className="w-full text-left">
                  <thead className="bg-slate-900/50 text-slate-500 text-[10px] uppercase font-bold tracking-widest">
                    <tr>
                      <th className="px-6 py-4">Rank & Agent Name</th>
                      <th className="px-6 py-4 text-center">Today</th>
                      <th className="px-6 py-4 text-center">This Month</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {[...agents].sort((a, b) => (Number(b.todaySales) || 0) - (Number(a.todaySales) || 0)).map((a, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-slate-700 w-4">{idx + 1}</span>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-slate-800 text-slate-400'}`}>{a.agent ? a.agent.charAt(0) : "?"}</div>
                            <span className="font-medium text-slate-200">{a.agent}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-mono font-bold text-emerald-400">{a.todaySales}</td>
                        <td className="px-6 py-4 text-center text-slate-400 font-mono">{a.monthSales}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>

            {/* Client Data Section */}
            <CollapsibleSection title={
    <span className="text-base font-semibold">
      Detailed Client Data
    </span>
  } isOpen={openSection === "clients"} onToggle={() => toggleSection("clients")}>
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" placeholder="Search by Number (e.g. 9512923154)" className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={searchNumber} onChange={(e) => setSearchNumber(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchLead()} />
                </div>
                <button onClick={handleSearchLead} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-500 transition">Find Lead</button>
                {searchResult && (
                  <button onClick={() => { setSearchResult(null); setSearchNumber(""); }} className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg hover:bg-red-500/20 hover:text-red-400 transition flex items-center gap-2"><FiX /> Clear Filter</button>
                )}
              </div>
              <div className="overflow-x-auto">
                {searchResult ? (
                  <table className="w-full text-left"><thead className="bg-slate-900/50 text-slate-500 text-xs uppercase font-semibold"><tr>{Object.keys(searchResult).map((key) => (<th key={key} className="px-6 py-4 whitespace-nowrap border-b border-slate-800">{key}</th>))}</tr></thead><tbody className="divide-y divide-slate-800"><tr className="bg-blue-500/5 transition">{Object.values(searchResult).map((val, i) => (<td key={i} className="px-6 py-4 text-sm text-slate-300 whitespace-nowrap">{val}</td>))}</tr></tbody></table>
                ) : (
                  <div className="p-16 text-center text-slate-600"><FiUser className="mx-auto text-4xl mb-2 opacity-20" /><p>No lead selected. Please search for a number to view details.</p></div>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-500 hover:bg-slate-900 hover:text-white"}`}>
    {icon} <span className="text-sm font-medium">{label}</span>
  </button>
);

const StatCard = ({ label, value, target, icon, color }) => {
  // Logic for the circular graph percentage
  const numValue = Number(value) || 0;
  const percentage = Math.min((numValue / target) * 100, 100);
  const chartData = [
    { name: "Progress", value: percentage },
    { name: "Remainder", value: 100 - percentage }
  ];

  return (
    <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center justify-between group hover:border-slate-700 transition-colors">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-slate-800 rounded-lg text-xs">{icon}</div>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{label}</p>
        </div>
        <h3 className="text-4xl font-black text-white">{value}</h3>
        <p className="text-[10px] text-slate-600 mt-1 uppercase font-bold tracking-tighter">Goal: {target}</p>
      </div>

      {/* 360 Rotater Circle Graph */}
      <div className="relative w-24 h-24">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              startAngle={90}
              endAngle={-270}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              animationDuration={1500}
            >
              <Cell fill={color} />
              <Cell fill="#1e293b" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-white">{Math.round(percentage)}%</span>
        </div>
      </div>
    </div>
  );
};

const CollapsibleSection = ({ title, children, isOpen, onToggle }) => (
  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
    <button onClick={onToggle} className="w-full px-6 py-5 flex justify-between items-center hover:bg-slate-800 transition text-white">
      <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
        {title}
      </h3>
      {isOpen ? <FiChevronUp className="text-slate-500" /> : <FiChevronDown className="text-slate-500" />}
    </button>
    {isOpen && <div className="border-t border-slate-800 animate-in slide-in-from-top-2 duration-300">{children}</div>}
  </div>
);

export default Admin;