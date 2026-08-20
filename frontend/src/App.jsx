import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, UserPlus, Users, Brain, Bell, ChevronDown } from "lucide-react";
import Dashboard from "./Dashboard";
import PatientAssessment from "./PatientAssessment";
import PatientsHistory from "./PatientsHistory";
import ModelInsights from "./ModelInsights";

const navItems = [
  { name: "Dashboard",          path: "/",           icon: LayoutDashboard },
  { name: "Patient Assessment", path: "/assessment",  icon: UserPlus },
  { name: "Patient History",    path: "/patients",    icon: Users },
  { name: "Model Insights",     path: "/insights",    icon: Brain },
];

function Sidebar() {
  const { pathname } = useLocation();
  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col shadow-sm z-30">
      {/* Logo */}
      <div className="px-6 py-5 flex items-center gap-3 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-sm shadow-md">SG</div>
        <div>
          <p className="font-extrabold text-gray-900 text-sm leading-tight">StrokeGuard AI</p>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Risk Assessment</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Menu</p>
        {navItems.map(({ name, path, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150
                ${active ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}>
              <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
              {name}
            </Link>
          );
        })}
      </nav>

      {/* Disclaimer */}
      <div className="mx-4 mb-5 p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
        <p className="text-[11px] font-bold text-blue-800 mb-1 flex items-center gap-1"><Brain size={12}/> Clinical Disclaimer</p>
        <p className="text-[10px] text-blue-700 leading-relaxed">StrokeGuard AI supports healthcare professionals. It does not replace clinical judgment.</p>
      </div>
    </aside>
  );
}

function Header({ title }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0 z-20">
      <div>
        <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{title}</h1>
        <p className="text-xs text-gray-400">Home / {title}</p>
      </div>
      <div className="flex items-center gap-4">
        <Link to="/assessment"
          className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors shadow-sm">
          <UserPlus size={15}/> New Assessment
        </Link>
        <div className="relative w-9 h-9 flex items-center justify-center bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100">
          <Bell size={16} className="text-gray-600"/>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"/>
        </div>
        <div className="flex items-center gap-2 pl-3 border-l border-gray-200 cursor-pointer">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">DS</div>
          <div>
            <p className="text-xs font-bold text-gray-800">Dr. Smith</p>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Administrator</p>
          </div>
          <ChevronDown size={14} className="text-gray-400"/>
        </div>
      </div>
    </header>
  );
}

const TITLES = { "/": "Dashboard", "/assessment": "Patient Assessment", "/patients": "Patient History", "/insights": "Model Insights" };

export default function App() {
  return (
    <Router>
      <div className="flex h-screen overflow-hidden bg-gray-50 font-sans">
        <Sidebar/>
        <div className="flex flex-col flex-1 overflow-hidden">
          <Routes>
            {[
              { path: "/",           C: Dashboard },
              { path: "/assessment", C: PatientAssessment },
              { path: "/patients",   C: PatientsHistory },
              { path: "/insights",   C: ModelInsights },
            ].map(({ path, C }) => (
              <Route key={path} path={path} element={
                <>
                  <Header title={TITLES[path]}/>
                  <main className="flex-1 overflow-auto p-8"><C/></main>
                </>
              }/>
            ))}
          </Routes>
        </div>
      </div>
    </Router>
  );
}
