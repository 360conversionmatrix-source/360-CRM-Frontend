import { useEffect, useState, useMemo, useRef } from "react";
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
  
  // Track separate totals for full month context and custom selected context
  const [totals, setTotals] = useState({ totalShiftSales: 0, totalMonthSales: 0, totalRangeSales: 0 });
  const [agents, setAgents] = useState([]);
  const [stats, setStats] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [searchNumber, setSearchNumber] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [openSection, setOpenSection] = useState("summary");

  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const [dateRange, setDateRange] = useState({
    startDate: yesterday,
    endDate: now
  });

  const DAILY_GOAL = 50; 
  const MONTHLY_GOAL = 1000;
  const RANGE_GOAL = 500;

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
    
    // Extrapolate targeted static parameters alongside active date strings
    const startStr = dateRange.startDate.toISOString().split('T')[0];
    const endStr = dateRange.endDate.toISOString().split('T')[0];
    
    const params = { 
      startDate: startStr, 
      endDate: endStr,
      month: dateRange.startDate.getMonth(), // Pass current starting month context to sync structural counters
      year: dateRange.startDate.getFullYear()
    };

    Promise.all([
      axios.get(`${apiUrl}/Agent-data`, { params }),
      axios.get(`${apiUrl}/campaign-data`, { params }),
      axios.get(`${apiUrl}/admin-data`, { headers: { "x-admin-password": password }, params })
    ]).then(([agentRes, campaignRes, adminRes]) => {
      if (agentRes.data.agents) setAgents(agentRes.data.agents);
      
      if (agentRes.data.totals) {
        setTotals({
          totalShiftSales: agentRes.data.totals.totalShiftSales || 0,
          totalMonthSales: agentRes.data.totals.totalMonthSales || 0, // Traditional baseline full monthly calculation
          totalRangeSales: agentRes.data.totals.totalRangeSales || agentRes.data.totals.totalShiftSales || 0 // Custom parsed calculation
        });
      }
      setStats(campaignRes.data.stats || []);
      if (Array.isArray(adminRes.data)) setData(adminRes.data);
      setLastUpdated(new Date());
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => { if (authenticated) fetchDashboardData(); }, [authenticated, dateRange]);

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
          {/* Date Filter Panel */}
          <div className={`${cardClass} p-4 rounded-2xl flex flex-wrap items-center justify-between gap-6 shadow-xl transition-all`}>
            <CustomDateRangePicker value={dateRange} onChange={setDateRange} isDark={isDark} />
            <button onClick={fetchDashboardData} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-blue-900/20">
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className={`h-32 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div><div className={`h-32 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div><div className={`h-32 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div></div>
              <div className={`h-96 rounded-3xl ${isDark ? 'bg-slate-900' : 'bg-gray-200'}`}></div>
            </div>
          ) : (
            <>
              {/* Stats Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard isDark={isDark} label="Shift Sales" value={totals.totalShiftSales} target={DAILY_GOAL} icon={<FiTrendingUp />} color="#3b82f6" />
                <StatCard isDark={isDark} label="Monthly Sales" value={totals.totalMonthSales} target={MONTHLY_GOAL} icon={<FiBarChart2 />} color="#10b981" />
                <StatCard isDark={isDark} label="Range Sales" value={totals.totalRangeSales} target={RANGE_GOAL} icon={<FiCalendar />} color="#8b5cf6" />
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

                {/* --- AGENT SALES REPORT --- */}
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
                        <tr><th className="px-6 py-4">Rank & Agent Name</th><th className="px-6 py-4 text-center">Today</th><th className="px-6 py-4 text-right">Selected Month</th></tr>
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

// --- Custom Calendar Dropdown Sub-Component ---
const CustomDateRangePicker = ({ value, onChange, isDark }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const [baseDate, setBaseDate] = useState(new Date(2026, 4, 1)); 
  
  // High-fidelity local states for parsing comprehensive parameters (Time & Year)
  const [tempRange, setTempRange] = useState({ start: value.startDate, end: value.endDate });
  const [startTime, setStartTime] = useState("12:00 AM");
  const [endTime, setEndTime] = useState("11:59 PM");

  useEffect(() => {
    setTempRange({ start: value.startDate, end: value.endDate });
  }, [value]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const formatDateLabel = (d) => {
    if (!d) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const changeBaseMonth = (amount) => {
    const newBase = new Date(baseDate);
    newBase.setMonth(newBase.getMonth() + amount);
    setBaseDate(newBase);
  };

  const handleYearChange = (yearValue) => {
    const newBase = new Date(baseDate);
    newBase.setFullYear(yearValue);
    setBaseDate(newBase);
  };

  const getDaysArray = (year, month) => {
    const date = new Date(year, month, 1);
    const days = [];
    
    const firstDayIdx = date.getDay();
    const prevMonthDaysCount = new Date(year, month, 0).getDate();
    for (let i = firstDayIdx - 1; i >= 0; i--) {
      days.push({ dayNum: prevMonthDaysCount - i, currentMonth: false, dateObj: new Date(year, month - 1, prevMonthDaysCount - i) });
    }

    const totalDays = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= totalDays; i++) {
      days.push({ dayNum: i, currentMonth: true, dateObj: new Date(year, month, i) });
    }

    const remainingCells = 42 - days.length; 
    for (let i = 1; i <= remainingCells; i++) {
      days.push({ dayNum: i, currentMonth: false, dateObj: new Date(year, month + 1, i) });
    }
    return days;
  };

  const handleDaySelection = (dateObj) => {
    if (!tempRange.start || (tempRange.start && tempRange.end)) {
      setTempRange({ start: dateObj, end: null });
    } else if (tempRange.start && !tempRange.end) {
      if (dateObj < tempRange.start) {
        setTempRange({ start: dateObj, end: tempRange.start });
      } else {
        setTempRange({ ...tempRange, end: dateObj });
      }
    }
  };

  const isSelectedOrInRange = (dateObj) => {
    const { start, end } = tempRange;
    const startZero = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime() : null;
    const endZero = end ? new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime() : null;
    const currentZero = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()).getTime();

    if (startZero && currentZero === startZero) return "bg-blue-600 text-white rounded-full font-bold";
    if (endZero && currentZero === endZero) return "bg-blue-600 text-white rounded-full font-bold";
    if (startZero && endZero && currentZero > startZero && currentZero < endZero) {
      return "bg-slate-800/60 text-blue-400";
    }
    return "";
  };

  const parseTimeIntoDate = (baseDateObj, timeString) => {
    if (!baseDateObj) return null;
    const finalDate = new Date(baseDateObj);
    const [time, modifier] = timeString.split(" ");
    let [hours, minutes] = time.split(":");
    
    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);
    
    if (hours === 12) hours = 0;
    if (modifier === "PM") hours += 12;

    finalDate.setHours(hours, minutes, 0, 0);
    return finalDate;
  };

  const renderCalendarPanel = (year, month, label) => {
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const cells = getDaysArray(year, month);

    return (
      <div className="w-64">
        <div className="text-center font-bold text-sm text-slate-100 mb-4">{label}</div>
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-slate-400 mb-2">
          {weekdays.map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 text-center gap-y-1 text-xs">
          {cells.map((cell, idx) => {
            const rangeClass = isSelectedOrInRange(cell.dateObj);
            const isToday = new Date().toDateString() === cell.dateObj.toDateString();
            
            return (
              <button 
                key={idx} 
                onClick={() => handleDaySelection(cell.dateObj)}
                className={`py-1.5 w-full flex items-center justify-center transition-all ${
                  cell.currentMonth ? "text-slate-200" : "text-slate-600"
                } ${rangeClass} ${isToday && !rangeClass ? "border border-blue-500/40 text-blue-400 rounded-full" : ""}`}
              >
                {cell.dayNum}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const leftYear = baseDate.getFullYear();
  const leftMonth = baseDate.getMonth();
  
  const rightDate = new Date(baseDate);
  rightDate.setMonth(rightDate.getMonth() + 1);
  const rightYear = rightDate.getFullYear();
  const rightMonth = rightDate.getMonth();

  const monthStrings = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Custom static generation block for 12-hour time dropdown matrices
  const hourOptions = useMemo(() => {
    const options = [];
    const modifiers = ["AM", "PM"];
    modifiers.forEach(mod => {
      for (let h = 1; h <= 12; h++) {
        options.push(`${h}:00 ${mod}`);
        options.push(`${h}:30 ${mod}`);
      }
    });
    // Ensure accurate layout parsing for edge configuration values natively
    if (!options.includes("11:59 PM")) options.push("11:59 PM");
    return options;
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
          isDark ? 'bg-slate-950 border-slate-800 text-white hover:border-slate-700' : 'bg-slate-50 border-slate-200 text-slate-900 hover:bg-slate-100'
        }`}
      >
        <FiCalendar className="text-blue-500 text-base" />
        <span className="font-mono">{formatDateLabel(value.startDate)} {startTime}</span>
        <span className="text-slate-500">&gt;</span>
        <span className="font-mono">{formatDateLabel(value.endDate)} {endTime}</span>
        <FiChevronDown className={`ml-2 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-3 z-50 bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col gap-6 w-[580px]">
          {/* Header Controls with Integrated Year Selector Dropdown */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-1">
              <button onClick={() => changeBaseMonth(-1)} className="text-slate-400 hover:text-white px-2 py-1 text-xs font-bold transition">&lt; Prev</button>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Year:</span>
              <select 
                value={leftYear} 
                onChange={(e) => handleYearChange(parseInt(e.target.value, 10))}
                className="bg-slate-900 border border-slate-800 text-slate-100 rounded-lg px-2 py-1 text-xs outline-none font-mono font-bold"
              >
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => changeBaseMonth(1)} className="text-slate-400 hover:text-white px-2 py-1 text-xs font-bold transition">Next &gt;</button>
            </div>
          </div>

          {/* Calendars View Matrix Panel */}
          <div className="flex gap-6 justify-between">
            {renderCalendarPanel(leftYear, leftMonth, `${monthStrings[leftMonth]} ${leftYear}`)}
            {renderCalendarPanel(rightYear, rightMonth, `${monthStrings[rightMonth]} ${rightYear}`)}
          </div>

          {/* Dynamic Interactive Time Config Layer Segment */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/50 border border-slate-800/80 p-3 rounded-xl">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">Start Boundary Time</label>
              <select 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-blue-500 transition"
              >
                {hourOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black tracking-wider text-slate-400">End Boundary Time</label>
              <select 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs font-mono outline-none focus:border-blue-500 transition"
              >
                {hourOptions.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Action Footer Button Triggers */}
          <div className="flex justify-end gap-3 border-t border-slate-800 pt-4 text-xs font-bold">
            <button onClick={() => setTempRange({ start: null, end: null })} className="text-slate-400 hover:text-white px-4 py-2 transition">Clear</button>
            <button 
              onClick={() => {
                if (tempRange.start && tempRange.end) {
                  const calculatedStart = parseTimeIntoDate(tempRange.start, startTime);
                  const calculatedEnd = parseTimeIntoDate(tempRange.end, endTime);
                  onChange({ startDate: calculatedStart, endDate: calculatedEnd });
                  setIsOpen(false);
                }
              }}
              disabled={!tempRange.start || !tempRange.end}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-5 py-2 rounded-xl transition"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Static Sub-Components ---
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