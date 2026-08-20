import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, ShieldAlert, Activity, FileCheck, TrendingUp, Brain, RefreshCw } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid
} from "recharts";

const API = "http://localhost:8000";

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, patientsRes] = await Promise.all([
        axios.get(`${API}/api/stats`),
        axios.get(`${API}/api/patients`),
      ]);
      setStats(statsRes.data);
      setPatients(patientsRes.data);
    } catch (e) {
      setError("Cannot connect to the backend API. Make sure the Python server is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const cards = stats ? [
    { label: "Total Records", value: stats.total_assessments.toLocaleString(), icon: <Users size={20}/>, color: "blue", sub: "Dataset + New" },
    { label: "High Risk Cases", value: stats.high_risk_cases.toLocaleString(), icon: <ShieldAlert size={20}/>, color: "red", sub: "Combined" },
    { label: "Average Age", value: `${stats.average_age} yrs`, icon: <Activity size={20}/>, color: "amber", sub: "Historical" },
    { label: "New AI Reports", value: stats.reports_generated.toLocaleString(), icon: <FileCheck size={20}/>, color: "emerald", sub: "Via This App" },
  ] : [];

  const colorMap = {
    blue:    { bg: "bg-blue-50",    text: "text-blue-600",    border: "border-blue-100" },
    red:     { bg: "bg-red-50",     text: "text-red-500",     border: "border-red-100" },
    amber:   { bg: "bg-amber-50",   text: "text-amber-500",   border: "border-amber-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
  };

  const ageGroups = [
    { group: "0-30",  count: 420 },
    { group: "31-45", count: 680 },
    { group: "46-60", count: 1240 },
    { group: "61-75", count: 1820 },
    { group: "75+",   count: 950 },
  ];

  const highCount = patients.filter(p => p.risk_level === "High").length;
  const lowCount  = patients.filter(p => p.risk_level === "Low").length;
  const pie = [
    { name: "High Risk", value: highCount, color: "#ef4444" },
    { name: "Low Risk",  value: lowCount,  color: "#10b981" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center">
        <Brain size={48} className="mx-auto mb-3 text-blue-200 animate-pulse"/>
        <p className="font-semibold">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
      <ShieldAlert size={40} className="mx-auto mb-3 text-red-400"/>
      <p className="font-bold text-red-700 mb-2">Connection Error</p>
      <p className="text-sm text-red-600 mb-4">{error}</p>
      <button onClick={fetchData} className="flex items-center gap-2 mx-auto bg-red-600 text-white px-5 py-2 rounded-xl font-bold text-sm hover:bg-red-700">
        <RefreshCw size={15}/> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-5">
        {cards.map((c, i) => {
          const col = colorMap[c.color];
          return (
            <div key={i} className={`bg-white rounded-2xl p-5 border ${col.border} shadow-sm hover:shadow-md transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <div className={`w-11 h-11 rounded-xl ${col.bg} ${col.text} flex items-center justify-center`}>{c.icon}</div>
                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-lg">{c.sub}</span>
              </div>
              <p className="text-3xl font-black text-gray-800 tracking-tight">{c.value}</p>
              <p className="text-sm font-semibold text-gray-500 mt-1">{c.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-5">
        {/* Age Bar Chart */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-extrabold text-gray-800 mb-1">Age Distribution (Dataset)</h3>
          <p className="text-xs text-gray-400 mb-5">Patient count across age groups in training data</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageGroups} barSize={34}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6"/>
                <XAxis dataKey="group" axisLine={false} tickLine={false} tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}/>
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9ca3af", fontSize: 11 }}/>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}/>
                <Bar dataKey="count" name="Patients" radius={[8,8,0,0]}>
                  {ageGroups.map((_, i) => <Cell key={i} fill={["#3b82f6","#6366f1","#8b5cf6","#a855f7","#d946ef"][i]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-extrabold text-gray-800 mb-1">New Assessments</h3>
          <p className="text-xs text-gray-400 mb-4">Risk split from AI predictions</p>
          {highCount === 0 && lowCount === 0 ? (
            <div className="h-44 flex flex-col items-center justify-center text-gray-400">
              <Brain size={36} className="text-gray-200 mb-2"/>
              <p className="text-sm font-semibold text-gray-500">No new patients yet</p>
              <p className="text-xs text-gray-400 mt-1">Go to Patient Assessment!</p>
            </div>
          ) : (
            <>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pie} cx="50%" cy="50%" innerRadius={38} outerRadius={58} paddingAngle={4} dataKey="value">
                      {pie.map((e, i) => <Cell key={i} fill={e.color}/>)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-3">
                {pie.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }}/>
                      <span className="font-medium text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-black text-gray-800">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-extrabold text-gray-800">Recent AI Assessments</h3>
            <p className="text-xs text-gray-400 mt-0.5">Patients assessed through this application</p>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 text-xs font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
            <RefreshCw size={13}/> Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-semibold">
              <tr>
                {["ID","Name","Age","Gender","Glucose","BMI","Risk Score","Level","Date"].map(h => (
                  <th key={h} className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.length > 0 ? patients.slice(0, 6).map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/70 transition-colors text-sm">
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">#{p.id}</td>
                  <td className="px-5 py-4 font-bold text-gray-900">{p.name}</td>
                  <td className="px-5 py-4 text-gray-600">{p.age}</td>
                  <td className="px-5 py-4 text-gray-600">{p.gender}</td>
                  <td className="px-5 py-4 text-gray-600">{p.glucose}</td>
                  <td className="px-5 py-4 text-gray-600">{p.bmi}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${p.risk_score}%`, backgroundColor: p.risk_score > 50 ? "#ef4444" : "#10b981" }}/>
                      </div>
                      <span className={`text-xs font-black ${p.risk_score > 50 ? "text-red-600" : "text-green-600"}`}>{p.risk_score}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${p.risk_level === "High" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                      {p.risk_level}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-400">{p.date_added}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="9" className="py-16 text-center">
                    <Brain size={40} className="mx-auto mb-3 text-gray-200"/>
                    <p className="font-semibold text-gray-500">No assessments recorded yet.</p>
                    <p className="text-xs text-gray-400 mt-1">Run a Patient Assessment to see data here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
