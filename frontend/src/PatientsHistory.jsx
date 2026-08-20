import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Users, Search, Trash2, Brain, RefreshCw, ShieldAlert } from "lucide-react";

const API = "http://localhost:8000";

export default function PatientsHistory() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch]     = useState("");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API}/api/patients`);
      setPatients(res.data);
    } catch {
      setError("Cannot reach the backend API.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient record?")) return;
    try {
      await axios.delete(`${API}/api/patients/${id}`);
      setPatients(prev => prev.filter(p => p.id !== id));
    } catch {
      alert("Failed to delete patient.");
    }
  };

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    String(p.id)?.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users size={22} className="text-blue-600"/>
            </div>
            <div>
              <h2 className="font-extrabold text-gray-900">Patient History</h2>
              <p className="text-xs text-gray-400">{patients.length} total records stored</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchPatients} className="flex items-center gap-2 text-xs font-bold text-gray-500 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50">
              <RefreshCw size={13}/> Refresh
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15}/>
              <input
                type="text" placeholder="Search name or ID..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
              />
            </div>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="py-20 text-center">
            <Brain size={40} className="mx-auto mb-3 text-blue-200 animate-pulse"/>
            <p className="text-gray-500 font-semibold">Loading patients...</p>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <ShieldAlert size={40} className="mx-auto mb-3 text-red-300"/>
            <p className="text-red-600 font-bold mb-2">Connection Error</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <button onClick={fetchPatients} className="mx-auto flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-bold">
              <RefreshCw size={13}/> Retry
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-400 font-semibold">
                <tr>
                  {["ID","Name","Age","Gender","Hypertension","Heart Disease","Glucose","BMI","Smoking","Work","Residence","Risk %","Level","Date",""].map(h => (
                    <th key={h} className="px-4 py-3 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {filtered.length > 0 ? filtered.map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50/70 transition-colors">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">#{p.id}</td>
                    <td className="px-4 py-3 font-bold text-gray-900 whitespace-nowrap">{p.name}</td>
                    <td className="px-4 py-3 text-gray-600">{p.age}</td>
                    <td className="px-4 py-3 text-gray-600">{p.gender}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${p.hypertension === "Yes" ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-500"}`}>{p.hypertension}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${p.heart_disease === "Yes" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"}`}>{p.heart_disease}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{p.glucose}</td>
                    <td className="px-4 py-3 text-gray-600">{p.bmi}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.smoking}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.work_type}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{p.residence}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width:`${p.risk_score}%`, backgroundColor: p.risk_score > 50 ? "#ef4444" : "#10b981" }}/>
                        </div>
                        <span className={`text-xs font-black ${p.risk_score > 50 ? "text-red-600" : "text-green-600"}`}>{p.risk_score}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-black ${p.risk_level === "High" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{p.date_added}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => deletePatient(Number(p.id))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="15" className="py-16 text-center">
                      <Brain size={40} className="mx-auto mb-3 text-gray-200"/>
                      <p className="font-semibold text-gray-500">
                        {search ? `No patients matching "${search}"` : "No patient records yet."}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Assess a patient first to store records here.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
