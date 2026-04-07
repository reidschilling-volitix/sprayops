/**
 * VOLITIX AG - CORE APPLICATION ROUTER (PREVIEW VERSION)
 * * ============================================================================
 * IMPORTANT NOTE FOR GITHUB DEPLOYMENT:
 * To make this preview work, all components have been temporarily inlined. 
 * For your actual GitHub `src/App.jsx`, REMOVE everything above the 
 * "MAIN APPLICATION ROUTER" section below and restore your import statements:
 * * import { auth, db, appId } from './lib/firebase';
 * import { GlobalStylesComp, Toast, Card, Button, Input, Select } from './components/UI';
 * import { DashboardTab, FleetTab, ... } from './components/Tabs';
 * import { defaultWorkOrderState, ... } from './utils/helpers';
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, Plane, Plus, History, Navigation, User, CheckCircle2, 
  ClipboardCheck, FileCode, Paperclip, X, FlaskConical, 
  LayoutTemplate, Trash2, Clock, MapPin, 
  Settings2, Wrench, Edit3, Award, CalendarDays, FileText, 
  FileBarChart, Printer, Eye, EyeOff, Target, GripVertical, Map as MapIcon, Cloud, 
  Lock, ChevronLeft, ChevronRight, Activity, AlertTriangle, LogOut, Users, ArrowRight
} from 'lucide-react';

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, deleteDoc, doc, setDoc, getDocs, getDoc, updateDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';

// --- INLINED FIREBASE CONFIG ---
const fallbackConfig = {
  apiKey: "AIzaSyBiW4z1vIMlznLsHs-Xhz44chOYkiYVBKI",
  authDomain: "spray-drone-compliance-hub.firebaseapp.com",
  projectId: "spray-drone-compliance-hub",
  storageBucket: "spray-drone-compliance-hub.firebasestorage.app",
  messagingSenderId: "565689528030",
  appId: "1:565689528030:web:3e405f9d0ff30b02061c4f",
};
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : fallbackConfig;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Sanitize appId to ensure proper Firestore collection paths (prevents odd-segment path errors)
const appId = typeof __app_id !== 'undefined' ? String(__app_id).replace(/[^a-zA-Z0-9_-]/g, '_') : 'aviation-compliance-hub';

// --- INLINED HELPERS ---
const EQUIPMENT_TYPES = ["Drone", "Battery", "Generator", "Controller", "Spray System", "Other"];
const TIME_ZONES = [{ label: "Eastern (EST/EDT)", offset: -5 }, { label: "Central (CST/CDT)", offset: -6 }, { label: "Mountain (MST/MDT)", offset: -7 }, { label: "Pacific (PST/PDT)", offset: -8 }];

const defaultWorkOrderState = { title: '', customer: '', date: new Date().toLocaleDateString('en-CA'), acres: '', chemical: '', kmlFileName: '', kmlData: null, status: 'Pending', isScheduled: false, coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' } };
const defaultLogState = { date: new Date().toLocaleDateString('en-CA'), startTime: '08:00', endTime: '10:00', selectedAircraft: [], customer: '', locationName: '', totalAcreage: '', treatedAcreage: '', whatWasTreated: 'Corn', customCrop: '', targetPest: '', nozzleDesc: 'Atomizer Sprinklers', targetDistance: '', pumpPressure: '', travelSpeed: '', speedUnit: 'mph', driftPractices: '', coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' }, coordinates: '', chemical: '', appRate: '', windSpeed: '', windDirection: 'N', temp: '', tempUnit: 'F', humidity: '', incidents: 'None', damageDescription: '', flightTimeValue: '', flightTimeUnit: 'Hours', flightTimeMinutes: '', kmlData: null, kmlFileName: '', attachedNotam: '' };
const defaultMaintState = { date: new Date().toLocaleDateString('en-CA'), equipmentType: 'Drone', customEquipment: '', assetId: '', workPerformed: '' };
const defaultCertState = { name: 'FAA Part 107', customName: '', licenseNumber: '', state: '', expirationDate: '', owner: '' };
const defaultCustomerState = { name: '', contactName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '' };
const defaultProductState = { name: '', defaultRate: '', inventory: '', description: '' };
const defaultNotamState = { date: new Date().toLocaleDateString('en-CA'), notamNumber: '', script: '', localStartTime: '08:00', duration: '4', radius: '0.5', coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' } };

const formatToNotamDMS = (input, isLon = false) => {
  if (!input) return "000000";
  const parts = input.toString().trim().split(/\s+/);
  let decimal = parts.length >= 2 ? Math.abs(parseFloat(parts[0]) || 0) + ((parseFloat(parts[1]) || 0) / 60) + ((parseFloat(parts[2]) || 0) / 3600) : Math.abs(parseFloat(input));
  if (isNaN(decimal)) return "000000";
  const degrees = Math.floor(decimal), minutes = Math.floor((decimal - degrees) * 60), seconds = Math.round((decimal - degrees - (minutes / 60)) * 3600);
  return `${degrees.toString().padStart(isLon ? 3 : 2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
};

const getStatusColor = (status) => {
  switch(status) {
     case 'In Progress': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
     case 'Paused': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
     case 'Completed': return 'border-[#9cd33b]/50 bg-[#9cd33b]/10 text-[#9cd33b]';
     case 'Cancelled': return 'border-slate-600 bg-slate-800 text-slate-400';
     default: return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'; 
  }
};

const copyToClipboard = (text) => { navigator.clipboard?.writeText(text).catch(() => {}); };

// --- INLINED UI COMPONENTS ---
const GlobalStylesComp = () => <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Orbitron:wght@700;900&display=swap'); .glass-card { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.05); } @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .animate-fade-in { animation: fadeIn 0.4s ease-out; } body { font-family: 'Inter', sans-serif; }`}</style>;

const Toast = ({ notification }) => {
  if (!notification.show) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[250] px-6 py-3.5 rounded-full shadow-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-3 animate-fade-in border ${notification.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-400' : notification.type === 'success' ? 'bg-[#9cd33b]/10 border-[#9cd33b]/50 text-[#9cd33b]' : 'bg-blue-950/90 border-blue-500/50 text-blue-400'}`}>
      {notification.type === 'error' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />} {String(notification.message)}
    </div>
  );
};

const Card = ({ children, className = "" }) => (<div className={`glass-card p-8 rounded-[2rem] shadow-2xl bg-slate-900 border border-slate-800 relative overflow-hidden ${className}`}>{children}</div>);

const Button = ({ children, onClick, type="button", variant="primary", className="", disabled=false }) => {
  const base = "px-5 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.96] relative overflow-hidden group";
  const variants = { primary: "bg-gradient-to-r from-[#9cd33b] to-[#7ab02b] text-[#020617] border border-[#bce455]/50", secondary: "bg-slate-800/80 text-slate-200 border border-slate-700/50 hover:bg-slate-700", danger: "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20" };
  return (<button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>);
};

const Input = ({ label, className="", rightElement, type="text", ...props }) => (<div className="space-y-2 min-w-0 group">{label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">{label}</label>}<div className="relative"><input type={type} className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 outline-none focus:border-[#9cd33b]/60 ${className} ${rightElement ? 'pr-12' : ''}`} {...props} />{rightElement && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">{rightElement}</div>}</div></div>);

const Select = ({ label, children, className="", ...props }) => (<div className="space-y-2 min-w-0 group">{label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">{label}</label>}<select className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:border-[#9cd33b]/60 ${className}`} {...props}>{children}</select></div>);

const TextArea = ({ label, className="", ...props }) => (<div className="space-y-2 min-w-0 group">{label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">{label}</label>}<textarea className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 outline-none focus:border-[#9cd33b]/60 h-32 resize-none ${className}`} {...props} /></div>);

const FormCard = ({ title, icon: Icon, onSubmit, onCancel, submitLabel, children }) => (<div className="space-y-6">{onCancel && (<button type="button" onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl transition-colors"><X size={14} /> Cancel Edit</button>)}<Card className="border-[#9cd33b]/20"><div className="flex items-center gap-4 text-[#9cd33b] font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-6 mb-8 flex-wrap">{Icon && <div className="p-2.5 bg-[#9cd33b]/10 rounded-xl"><Icon size={20} className="shrink-0" strokeWidth={2.5} /></div>} <span className="truncate">{title}</span></div><form onSubmit={onSubmit} className="space-y-8">{children}<div className="pt-8 border-t border-slate-800"><Button type="submit" className="w-full py-5 text-sm">{submitLabel || 'Save Record'}</Button></div></form></Card></div>);

const TableCard = ({ title, icon: Icon, actionLabel, onAction, secondaryActionLabel, onSecondaryAction, children }) => (<div className="space-y-8"><Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 !p-6 border-[#9cd33b]/20"><div className="flex items-center gap-5 min-w-0 flex-1"><div className="p-4 bg-[#9cd33b]/10 border border-[#9cd33b]/30 rounded-[1.5rem] text-[#9cd33b] shrink-0">{Icon && <Icon size={28} strokeWidth={2.5} />}</div><div className="min-w-0"><h2 className="text-xl font-black uppercase tracking-tight text-white truncate">{title}</h2></div></div><div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">{onSecondaryAction && <Button variant="secondary" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>}{onAction && <Button onClick={onAction} className="flex-1 md:flex-none"><Plus size={16}/> {actionLabel}</Button>}</div></Card><div className="bg-slate-900/80 border border-slate-700/50 rounded-[3rem] overflow-hidden"><div className="overflow-x-auto">{children}</div></div></div>);

// --- INLINED LEAFLET MAP ---
const LeafletMap = ({ lat, lon, kmlData, jobs = [], selectedJob = null }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const featureGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (!mapInstanceRef.current) {
        if (!window.L) return;
       mapInstanceRef.current = window.L.map(mapContainerRef.current, { zoomControl: false }).setView([lat || 38.3364, lon || -90.1498], lat ? 15 : 4);
       window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { attribution: 'Tiles &copy; Esri', className: 'map-tiles' }).addTo(mapInstanceRef.current);
       featureGroupRef.current = window.L.featureGroup().addTo(mapInstanceRef.current);
    }
    const map = mapInstanceRef.current;
    const fg = featureGroupRef.current;
    fg.clearLayers();
    let hasLayers = false;
    const itemsToPlot = jobs.length > 0 ? jobs : [];
    if (jobs.length === 0 && (lat || kmlData)) itemsToPlot.push({ finalLat: lat, finalLon: lon, kmlData, id: 'single' });
    itemsToPlot.forEach(job => {
       const isSelected = selectedJob ? selectedJob.id === job.id : true;
       const color = isSelected ? '#9cd33b' : '#3b82f6'; 
       if (job.finalLat && job.finalLon && !isNaN(job.finalLat) && !isNaN(job.finalLon)) {
           const marker = window.L.marker([job.finalLat, job.finalLon]);
           if (job.title || job.customer) marker.bindPopup(`<b>${job.title || job.customer}</b>`);
           fg.addLayer(marker);
           hasLayers = true;
       }
    });
    if (hasLayers) setTimeout(() => { if (fg.getBounds().isValid()) map.fitBounds(fg.getBounds(), { padding: [20, 20], maxZoom: 16 }); }, 100);
  }, [lat, lon, kmlData, jobs, selectedJob]);

  return <div ref={mapContainerRef} className="w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 font-bold text-xs tracking-widest uppercase" style={{minHeight: '300px', zIndex: 1}}>{!window.L ? "Map Preview Unavailable (Requires Leaflet.js)" : ""}</div>;
};

// --- INLINED TABS ---
const DashboardTab = ({ fleet, company, customUser, logs, maintRecords }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
    <Card className="relative group">
      <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Plane size={14} className="text-[#9cd33b]" /> Active Fleet</p>
      </div>
      {fleet.map((d, idx) => (
        <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl mb-3 flex flex-col gap-2 min-w-0 shadow-sm">
          <div className="flex justify-between items-start gap-4">
            <div className="min-w-0"><span className="text-sm font-black text-slate-100 block truncate">{String(d.id)}</span><p className="text-[9px] text-slate-500 font-bold uppercase mt-1 truncate">{String(d.model)} | S/N: {String(d.sn)}</p></div>
          </div>
        </div>
      ))}
      {fleet.length === 0 && <p className="text-[10px] text-slate-500 font-bold uppercase text-center py-4">No aircraft in fleet</p>}
    </Card>
    <Card className="min-w-0">
      <p className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest flex items-center gap-2"><User size={14} className="text-[#9cd33b]" /> PIC In-Charge</p>
      <p className="text-xl font-black text-slate-100 uppercase tracking-tight truncate">{String(company.supervisor)}</p>
      <p className="text-xs text-[#9cd33b] font-black mt-2 uppercase tracking-widest truncate">{String(company.name)}</p>
      <p className="text-[10px] text-slate-500 font-mono mt-4 uppercase tracking-widest p-4 bg-slate-950 rounded-xl border border-slate-800 truncate">FAA Exemption: <span className="text-slate-300">{String(company.exemption || 'N/A')}</span></p>
    </Card>
    <Card>
      <p className="text-[10px] font-black text-slate-500 uppercase mb-6 tracking-widest flex items-center gap-2"><History size={14} className="text-[#9cd33b]" /> Database Metrics</p>
      <div className="flex items-baseline gap-4 mb-4"><span className="text-5xl font-black text-[#9cd33b] truncate">{logs.length}</span><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">Missions Logged</span></div>
      <div className="flex items-baseline gap-4"><span className="text-3xl font-black text-slate-300 truncate">{maintRecords.length}</span><span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">Maintenance Records</span></div>
    </Card>
  </div>
);

const FleetTab = ({ company, setCompany, customUser, notify }) => {
  const [editingDrone, setEditingDrone] = useState(null);
  const addNewDrone = () => { const newId = `N-${Math.floor(1000 + Math.random() * 9000)}`; const updated = [...(company.fleet || []), { id: newId, model: 'Model', sn: '0000' }]; setCompany({...company, fleet: updated}); setEditingDrone(updated.length - 1); };
  const saveFleet = (f) => setCompany({...company, fleet: f});
  return (
    <div className="space-y-8 animate-fade-in min-w-0">
      <Card className="flex flex-col md:flex-row justify-between items-center gap-6"><div className="flex items-center gap-4 min-w-0 flex-1"><div className="p-4 bg-[#9cd33b]/10 border border-[#9cd33b]/20 rounded-3xl text-[#9cd33b] shrink-0"><Plane size={32} /></div><div className="min-w-0"><h2 className="text-xl font-black uppercase tracking-tighter text-slate-100 truncate">Aircraft Fleet</h2></div></div>{customUser?.role === 'Manager' && <Button onClick={addNewDrone} className="w-full md:w-auto shrink-0"><Plus size={16}/> Register Aircraft</Button>}</Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {(company.fleet || []).map((d, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-2 min-w-0 shadow-xl relative">
               <div className="flex justify-between items-start gap-4"><div className="min-w-0"><span className="text-2xl font-black text-slate-100 block truncate">{String(d.id)}</span><p className="text-sm text-[#9cd33b] font-bold uppercase mt-1 truncate">{String(d.model)}</p></div>{customUser?.role === 'Manager' && <button onClick={() => setEditingDrone(editingDrone === idx ? null : idx)} className={`shrink-0 p-3 rounded-xl transition-colors ${editingDrone === idx ? 'bg-slate-800 text-white' : 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20'}`}><Edit3 size={16}/></button>}</div>
               {editingDrone === idx && (
                 <div className="mt-4 pt-6 border-t border-slate-800 space-y-4"><Input label="N-Number" value={d.id} onChange={e => { const f = [...company.fleet]; f[idx].id = e.target.value; setCompany({...company, fleet: f}); }} /><div className="flex gap-3 pt-4 border-t border-slate-800"><Button variant="secondary" className="flex-1 py-4 text-xs" onClick={() => { setEditingDrone(null); saveFleet(company.fleet); }}>Close</Button><Button variant="danger" className="py-4 px-6 shrink-0" onClick={() => { const f = company.fleet.filter((_, i) => i !== idx); saveFleet(f); setEditingDrone(null); }}><Trash2 size={16}/></Button></div></div>
               )}
            </div>
         ))}
       </div>
    </div>
  );
};

const SettingsTab = ({ company, setCompany, handleCompanySettingsSave, customUser, setCustomUser, notify, dbProp = db, appIdProp = appId }) => {
  const [oldPassword, setOldPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [showPassword, setShowPassword] = useState(false);
  const handleChangePassword = async (e) => { e.preventDefault(); if (!oldPassword || !newPassword) return; if (oldPassword !== customUser.password) return notify("Current password is incorrect.", "error"); try { await updateDoc(doc(dbProp, 'artifacts', appIdProp, 'public', 'data', 'saas_users', customUser.id), { password: newPassword }); notify("Password changed successfully!", "success"); setCustomUser({...customUser, password: newPassword}); setOldPassword(''); setNewPassword(''); } catch(err) { notify("Error changing password", "error"); } };
  return (
    <div className="space-y-8 animate-fade-in min-w-0">
      <FormCard title="Command Settings" icon={Settings2} onSubmit={handleCompanySettingsSave} submitLabel="Update Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><Input label="Organization Name" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} required/><Input label="Chief Supervisor / Pilot" value={company.supervisor} onChange={e => setCompany({...company, supervisor: e.target.value})} required/></div>
      </FormCard>
      <FormCard title="Account Security" icon={Lock} onSubmit={handleChangePassword} submitLabel="Update Password">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-2 min-w-0"><label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">Username</label><input className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-slate-500 cursor-not-allowed opacity-50" value={customUser?.username || ''} disabled /></div><div className="space-y-4 md:col-span-2 lg:col-span-1"><Input label="Current Password" type={showPassword ? "text" : "password"} value={oldPassword} onChange={e => setOldPassword(e.target.value)} required rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300 focus:outline-none">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>} /><Input label="New Password" type={showPassword ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></div></div>
      </FormCard>
    </div>
  );
};

const ScheduleTab = ({ workOrders, isEditing, state, setState, onCancel, onSubmit, customers, products, customUser, handleDrop, notify, onLogMission }) => {
  const [viewMode, setViewMode] = useState('calendar'); const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  const weekDays = Array.from({length: 7}).map((_, i) => { const start = new Date(calendarBaseDate); start.setDate(calendarBaseDate.getDate() - calendarBaseDate.getDay()); const d = new Date(start); d.setDate(start.getDate() + i); return d; });
  if (isEditing) {
    return (
      <FormCard title={state.id ? "Edit Work Order" : "Create Work Order"} icon={CalendarDays} onSubmit={(e) => onSubmit(e, null, null)} onCancel={onCancel} submitLabel={state.status === 'Completed' ? "Save & Log Mission" : "Save Schedule"}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
           <Input label="Job Title" value={state.title} onChange={e => setState({...state, title: e.target.value})} required placeholder="e.g. Field 1 Spray"/>
           <Select label="Customer" value={state.customer} onChange={e => { setState({...state, customer: e.target.value}); }} required><option className="bg-slate-900" value="">Select Customer...</option>{customers.map(c => <option className="bg-slate-900" key={c.id} value={c.name}>{String(c.name)}</option>)}</Select>
           <Input type="date" label="Scheduled Date (Optional)" value={state.date} onChange={e => setState({...state, date: e.target.value})} />
           <Input type="number" label="Acreage" value={state.acres} onChange={e => setState({...state, acres: e.target.value})} required/>
           <div className="md:col-span-2"><Select label="Job Status" value={state.status} onChange={e => setState({...state, status: e.target.value})}><option className="bg-slate-900" value="Pending">Pending Dispatch</option><option className="bg-slate-900" value="Paused">Paused (Weather Hold)</option><option className="bg-slate-900" value="Completed">Completed</option><option className="bg-slate-900" value="Cancelled">Cancelled</option></Select></div>
         </div>
      </FormCard>
    );
  }
  return (
     <div className="space-y-6 animate-fade-in min-w-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 min-w-0">
          <div className="min-w-0"><h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3 truncate"><CalendarDays className="text-[#9cd33b] shrink-0"/> Operations</h2></div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="flex bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm p-1"><button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${viewMode === 'calendar' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutTemplate size={14}/> Calendar</button><button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${viewMode === 'map' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><MapIcon size={14}/> Map</button></div>
            <Button onClick={() => setState({...defaultWorkOrderState, isEditing: true})}><Plus size={16}/> New Order</Button>
          </div>
        </div>
        {viewMode === 'calendar' ? (
          <div className="flex flex-col xl:flex-row gap-6 min-w-0">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden min-w-0">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 min-w-0 gap-4">
                 <div className="flex items-center gap-4 lg:gap-6 min-w-0"><div className="flex gap-2 shrink-0"><button onClick={() => { const d = new Date(calendarBaseDate); d.setDate(d.getDate() - 7); setCalendarBaseDate(d); }} className="p-2 bg-slate-950 rounded-xl hover:bg-slate-800 text-slate-400"><ChevronLeft size={16}/></button><button onClick={() => { const d = new Date(calendarBaseDate); d.setDate(d.getDate() + 7); setCalendarBaseDate(d); }} className="p-2 bg-slate-950 rounded-xl hover:bg-slate-800 text-slate-400"><ChevronRight size={16}/></button></div></div>
               </div>
               <div className="flex-1 grid grid-cols-7 divide-x divide-slate-800 min-h-[500px] overflow-x-auto min-w-[600px]">
                 {weekDays.map((date, idx) => {
                   const isToday = date.toDateString() === new Date().toDateString();
                   const strDate = date.toLocaleDateString('en-CA');
                   const dayJobs = workOrders.filter(w => w.isScheduled && w.date === strDate);
                   return (
                     <div key={idx} className={`flex flex-col min-w-[85px] ${isToday ? 'bg-[#9cd33b]/5' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, date)}>
                       <div className={`p-2 lg:p-4 text-center border-b border-slate-800 ${isToday ? 'bg-[#9cd33b] text-[#020617]' : 'text-slate-400'}`}><p className="text-[9px] font-black uppercase tracking-widest mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</p><p className="text-xl font-black">{date.getDate()}</p></div>
                       <div className="flex-1 p-2 space-y-2 overflow-y-auto">
                         {dayJobs.map(job => (<div key={job.id} onClick={() => setState({...job, isEditing: true})} className={`p-2 lg:p-3 rounded-xl text-[9px] lg:text-[10px] shadow-sm border cursor-pointer hover:opacity-80 transition-opacity min-w-0 ${getStatusColor(job.status)}`}><div className="font-black uppercase truncate mb-1 block">{String(job.title || job.customer)}</div></div>))}
                         <div onClick={() => setState({...defaultWorkOrderState, date: strDate, isScheduled: true, isEditing: true})} className="w-full h-8 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 hover:border-slate-500 cursor-pointer mt-2"><Plus size={10}/></div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 h-[600px] min-w-0"><div className="flex-1 bg-slate-950 rounded-[2.5rem] relative min-w-0 p-1"><LeafletMap jobs={workOrders.filter(w => w.finalLat || w.kmlData)} /></div></div>
        )}
     </div>
  );
};

const CustomersTab = ({ items, logs, isEditing, state, setState, onCancel, onSubmit, onDelete, notify }) => {
  if (isEditing) return (<FormCard title={state.id ? 'Edit Customer' : 'New Customer Profile'} icon={Users} onSubmit={onSubmit} onCancel={onCancel}><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Input label="Company/Farm Name" value={state.name} onChange={e => setState({...state, name: e.target.value})} required/><Input label="Email" type="email" value={state.email} onChange={e => setState({...state, email: e.target.value})}/></div></FormCard>);
  return (
    <TableCard title="Client Roster" icon={Users} actionLabel="Customer" onAction={() => setState({ ...defaultCustomerState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Company / Contact</th><th className="p-6">Contact Info</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(c => (<tr key={c.id} className="hover:bg-slate-800/40"><td className="p-6 min-w-[200px]"><p className="font-black text-slate-200 text-sm break-words">{String(c.name)}</p></td><td className="p-6 min-w-[200px]"><p className="text-slate-300 text-xs break-all">{String(c.email)}</p></td><td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...c, isEditing: true})} className="text-blue-500 hover:text-blue-400 mr-4 p-2"><Edit3 size={16}/></button><button onClick={() => onDelete('customers', c.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16}/></button></td></tr>))}
      </tbody></table>
    </TableCard>
  );
};

const ProductsTab = ({ items, isEditing, state, setState, onCancel, onSubmit, onDelete }) => {
  if (isEditing) return (<FormCard title={state.id ? 'Edit Product' : 'New Chemical Product'} icon={FlaskConical} onSubmit={onSubmit} onCancel={onCancel}><div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0"><Input label="Chemical Name" value={state.name} onChange={e => setState({...state, name: e.target.value})} required/><Input label="Default Rate" type="number" step="any" value={state.defaultRate} onChange={e => setState({...state, defaultRate: e.target.value})} rightElement={<span className="text-[9px] text-slate-500 font-black">oz/ac</span>} /></div></FormCard>);
  return (
    <TableCard title="Chemical Inventory" icon={FlaskConical} actionLabel="Product" onAction={() => setState({ ...defaultProductState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Product Name</th><th className="p-6">Application Rate</th><th className="p-6">Inventory Stock</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(p => (<tr key={p.id} className="hover:bg-slate-800/40"><td className="p-6 min-w-[200px]"><p className="font-black text-slate-200 text-sm uppercase break-words">{String(p.name)}</p></td><td className="p-6 min-w-[150px]"><p className="text-[#9cd33b] font-black bg-slate-950 inline-block px-3 py-1 rounded-lg text-xs break-words">{String(p.defaultRate || '0')} <span className="text-[9px] text-slate-500 ml-1">oz/ac</span></p></td><td className="p-6 min-w-[150px]"><p className="text-blue-400 font-black bg-slate-950 inline-block px-3 py-1 rounded-lg text-xs break-words">{String(parseFloat(p.inventory || 0).toFixed(2))} <span className="text-[9px] text-slate-500 ml-1">Gal</span></p></td><td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...p, isEditing: true})} className="text-blue-500 hover:text-blue-400 mr-4 p-2"><Edit3 size={16}/></button><button onClick={() => onDelete('products', p.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16}/></button></td></tr>))}
      </tbody></table>
    </TableCard>
  );
};

const CertificationsTab = ({ items, isEditing, state, setState, onCancel, onSubmit, onDelete }) => {
  if (isEditing) return (<FormCard title={state.id ? 'Edit Certification' : 'Upload Certification'} icon={Award} onSubmit={onSubmit} onCancel={onCancel}><div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0"><Select label="Cert Type" value={state.name} onChange={e => setState({...state, name: e.target.value})} required><option className="bg-slate-900" value="FAA Part 137">FAA Part 137</option><option className="bg-slate-900" value="FAA 44807">FAA 44807</option><option className="bg-slate-900" value="State Pesticide">State Pesticide</option></Select><Input label="License #" value={state.licenseNumber} onChange={e => setState({...state, licenseNumber: e.target.value})} /><Input type="date" label="Expiration Date" value={state.expirationDate} onChange={e => setState({...state, expirationDate: e.target.value})} required/></div></FormCard>);
  return (
    <TableCard title="Compliance Certifications" icon={Award} actionLabel="Certificate" onAction={() => setState({ ...defaultCertState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Certificate</th><th className="p-6">License #</th><th className="p-6">Expiration</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(c => (<tr key={c.id} className="hover:bg-slate-800/40"><td className="p-6"><p className="font-black text-slate-200 text-sm break-words">{String(c.name)}</p></td><td className="p-6"><p className="text-slate-300 font-mono text-xs break-all">{String(c.licenseNumber)}</p></td><td className="p-6"><p className={`text-xs font-black break-words ${new Date(c.expirationDate) < new Date() ? 'text-red-500' : 'text-[#9cd33b]'}`}>{String(c.expirationDate)}</p></td><td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...c, isEditing: true})} className="text-blue-500 mr-4"><Edit3 size={16}/></button><button onClick={() => onDelete('certifications', c.id)} className="text-red-500"><Trash2 size={16}/></button></td></tr>))}
      </tbody></table>
    </TableCard>
  );
};

const MaintenanceTab = ({ items, isEditing, state, setState, onCancel, onSubmit, onDelete }) => {
  if (isEditing) return (<FormCard title={state.id ? 'Edit Log' : 'New Maintenance Log'} icon={Wrench} onSubmit={onSubmit} onCancel={onCancel}><div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0"><Input type="date" label="Date" value={state.date} onChange={e => setState({...state, date: e.target.value})} required/><Input label="Asset ID (e.g. BAT-01)" value={state.assetId} onChange={e => setState({...state, assetId: e.target.value})} required/><Select label="Equipment Type" value={state.equipmentType} onChange={e => setState({...state, equipmentType: e.target.value})}>{EQUIPMENT_TYPES.map(t => <option className="bg-slate-900" key={t} value={t}>{t}</option>)}</Select></div><TextArea label="Detailed Work Performed" value={state.workPerformed} onChange={e => setState({...state, workPerformed: e.target.value})} required/></FormCard>);
  return (
    <TableCard title="Maintenance Logs" icon={Wrench} actionLabel="Log" onAction={() => setState({ ...defaultMaintState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Date / Asset</th><th className="p-6">Work Performed</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(m => (<tr key={m.id} className="hover:bg-slate-800/40"><td className="p-6 min-w-[150px]"><p className="font-mono text-[#9cd33b] text-xs font-black break-words">{String(m.date)}</p><p className="text-[11px] text-slate-200 font-bold uppercase mt-1 tracking-widest break-words">{String(m.assetId)}</p></td><td className="p-6 min-w-[300px]"><p className="text-slate-400 text-xs leading-relaxed max-w-2xl break-words">{String(m.workPerformed)}</p></td><td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...m, isEditing: true})} className="text-blue-500 mr-4 p-2"><Edit3 size={16}/></button><button onClick={() => onDelete('maintenance_records', m.id)} className="text-red-500 p-2"><Trash2 size={16}/></button></td></tr>))}
      </tbody></table>
    </TableCard>
  );
};

const MissionLogTab = ({ logs, notams, fleet, customers, products, crops, isEditing, state, setState, onCancel, onSubmit, onDelete, kmlRef, handleKml, notify }) => {
  if (isEditing) return (<FormCard title={state.id ? 'Edit Mission Record' : 'Log New Mission'} icon={Plane} onSubmit={onSubmit} onCancel={onCancel} submitLabel="Save To Vault"><div className="space-y-6"><Input type="date" label="Date" value={state.date} onChange={e => setState({...state, date: e.target.value})} required/><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Input type="time" label="Start Time" value={state.startTime} onChange={e => setState({...state, startTime: e.target.value})}/><Input type="time" label="End Time" value={state.endTime} onChange={e => setState({...state, endTime: e.target.value})}/></div><Input label="Total Flight Time (Hours)" type="number" step="any" value={state.flightTimeValue} onChange={e => setState({...state, flightTimeValue: e.target.value})} required/><Input label="Field Name" value={state.locationName} onChange={e => setState({...state, locationName: e.target.value})}/></div></FormCard>);
  return (
    <TableCard title="Flight Record Ledger" icon={FileText} actionLabel="Log Mission" onAction={() => setState({ ...defaultLogState, isEditing: true })}>
      <table className="w-full text-left min-w-[700px]"><thead className="bg-slate-800/60 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-800"><tr><th className="p-6">Date / Times</th><th className="p-6">Fleet / Client</th><th className="p-6">Product / Location</th><th className="p-6 text-right">Audit</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {logs.map(log => (<tr key={log.id} className="hover:bg-slate-800/40"><td className="p-6 min-w-[150px]"><p className="font-black text-slate-100 text-xs break-words">{String(log.date)}</p><p className="text-[10px] text-slate-400 font-mono mt-1 uppercase break-words">{String(log.startTime)} - {String(log.endTime)}</p></td><td className="p-6 min-w-[150px]"><p className="text-[10px] text-slate-300 font-black uppercase tracking-tight break-words">{String(log.customer)}</p></td><td className="p-6 min-w-[150px]"><p className="font-black text-[#9cd33b] uppercase text-xs break-words">{String(log.chemical)}</p><p className="text-[10px] text-slate-400 uppercase font-bold break-words">{String(log.locationName)} | {String(log.treatedAcreage)} AC</p></td><td className="p-6 text-right flex justify-end gap-3 items-center whitespace-nowrap"><button onClick={() => setState({...log, isEditing: true})} className="text-blue-500 mr-4"><Edit3 size={16}/></button><button onClick={() => onDelete('flight_logs', log.id)} className="text-red-500"><Trash2 size={16}/></button></td></tr>))}
      </tbody></table>
    </TableCard>
  );
};

const NotamTab = ({ notams, isEditing, state, setState, onCancel, onSubmit, onDelete, derived, generate, notify, company }) => {
  if (isEditing) return (<FormCard title="Log Filed NOTAM" onSubmit={onSubmit} onCancel={onCancel} submitLabel="Archive NOTAM"><div className="grid grid-cols-1 md:grid-cols-2 gap-6"><Input type="date" label="Date Filed" value={state.date} onChange={e => setState({...state, date: e.target.value})} required/><Input label="NOTAM Number" value={state.notamNumber} onChange={e => setState({...state, notamNumber: e.target.value})} required/><div className="md:col-span-2"><TextArea label="Filed Script Details" value={state.script} onChange={e => setState({...state, script: e.target.value})} required/></div></div></FormCard>);
  return (
    <TableCard title="NOTAM Archives" icon={Navigation} actionLabel="Create NOTAM" onAction={() => setState({ ...defaultNotamState, isEditing: true })}>
      <table className="w-full text-left text-[11px] min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-800"><tr><th className="p-6">Date</th><th className="p-6">NOTAM Number</th><th className="p-6">Script</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {notams.map(n => (<tr key={n.id} className="hover:bg-slate-800/40"><td className="p-6 min-w-[100px]"><p className="font-black text-slate-100 text-sm break-words">{String(n.date)}</p></td><td className="p-6 min-w-[120px]"><span className="text-[11px] font-black text-[#9cd33b] bg-slate-950 px-3 py-1 rounded-full border border-slate-800 break-words">{String(n.notamNumber)}</span></td><td className="p-6 min-w-[200px]"><p className="text-[9px] font-mono text-slate-300 line-clamp-2 max-w-sm break-all whitespace-normal">{String(n.script)}</p></td><td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...n, isEditing: true})} className="text-blue-500 mr-4"><Edit3 size={16}/></button><button onClick={() => onDelete('notam_logs', n.id)} className="text-red-400"><Trash2 size={16}/></button></td></tr>))}
      </tbody></table>
    </TableCard>
  );
};

const FaaReportTab = ({ company, fleet, certs, monthlyReport, reportMonth, setReportMonth, showFormalReport, setShowFormalReport, notify, faaReports, onDelete }) => {
  return (
    <div className="space-y-8 animate-fade-in min-w-0">
       <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 min-w-0"><div className="flex items-center gap-6 min-w-0 flex-1"><div className="p-4 bg-[#9cd33b]/10 border border-[#9cd33b]/20 rounded-3xl text-[#9cd33b] shrink-0"><FileBarChart size={32} /></div><div className="min-w-0"><h2 className="text-2xl font-black uppercase tracking-tighter text-slate-100 truncate">SprayOps FAA Reporting</h2></div></div><div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0"><input type="month" className="w-full sm:w-auto bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-black text-slate-200 outline-none focus:border-[#9cd33b] transition-colors" value={reportMonth} onChange={e => setReportMonth(e.target.value)}/><Button className="w-full sm:w-auto" onClick={async () => { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'faa_reports'), { month: reportMonth, companyName: company.name, filedAt: new Date().toISOString() }); notify("Report Saved to Vault.", "success"); }}>Archive Report</Button></div></Card>
       <Card>
          <div className="flex items-center gap-3 text-[#9cd33b] font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-6 mb-6"><History size={18} className="shrink-0" /> <span className="truncate">Archived FAA Reports</span></div>
          <div className="bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden"><table className="w-full text-left text-[11px] min-w-[600px]"><thead className="bg-slate-900/50 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-800"><tr><th className="p-5">Report Period</th><th className="p-5">Archived On</th><th className="p-5 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/50">{(faaReports || []).map(r => (<tr key={r.id} className="hover:bg-slate-800/20"><td className="p-5 font-black text-slate-200 text-sm">{String(r.month)}</td><td className="p-5 text-slate-400 font-mono text-[10px]">{new Date(r.filedAt).toLocaleDateString()}</td><td className="p-5 text-right whitespace-nowrap flex justify-end items-center gap-6"><button onClick={() => onDelete('faa_reports', r.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div>
       </Card>
    </div>
  );
};


// ============================================================================
// MAIN APPLICATION ROUTER
// ============================================================================

export default function App() {
  // --- Secure Access State ---
  const [user, setUser] = useState(null); 
  const [customUser, setCustomUser] = useState(null); 
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ companyName: '', username: '', email: '', password: '', role: 'Pilot' });
  const [showPassword, setShowPassword] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [resetUserDoc, setResetUserDoc] = useState(null);

  // --- UI & Routing State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showFormalReport, setShowFormalReport] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // --- Database Caching State ---
  const [allLogs, setAllLogs] = useState([]);
  const [allCerts, setAllCerts] = useState([]);
  const [allMaintRecords, setAllMaintRecords] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [allNotams, setAllNotams] = useState([]);
  const [allWorkOrders, setAllWorkOrders] = useState([]);
  const [allCrops, setAllCrops] = useState([]);
  const [allFaaReports, setAllFaaReports] = useState([]);
  
  // --- Active Form States ---
  const [company, setCompany] = useState({ name: 'SprayOps', supervisor: 'Lead Pilot', email: '', phone: '', address: '', certNo: '', exemption: '25181', timezone: -6, fleet: [] });
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7));
  const [notamState, setNotamState] = useState({ ...defaultNotamState, isEditing: false });
  const [maintState, setMaintState] = useState({ ...defaultMaintState, isEditing: false });
  const [certState, setCertState] = useState({ ...defaultCertState, isEditing: false });
  const [customerState, setCustomerState] = useState({ ...defaultCustomerState, isEditing: false });
  const [productState, setProductState] = useState({ ...defaultProductState, isEditing: false });
  const [logState, setLogState] = useState({ ...defaultLogState, isEditing: false });
  const [workOrderState, setWorkOrderState] = useState({ ...defaultWorkOrderState, isEditing: false });

  const kmlInputRef = useRef(null);

  const notify = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  // --- Initialization & Connectivity ---
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
       window.removeEventListener('online', handleOnline);
       window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try { 
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) { 
            await signInWithCustomToken(auth, __initial_auth_token); 
        } else { 
            await signInAnonymously(auth); 
        } 
      } catch (err) { 
        console.error(err); 
      }
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); if (!u) setLoading(false); });
  }, []);

  // --- Real-time Vault Sync ---
  useEffect(() => {
    if (!user) return;
    
    // Extracted robust subscriber with explicit error callback to prevent crashes on permission-denied
    const sub = (colName, setFn) => onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', colName), 
        s => setFn(s.docs.map(d => ({id: d.id, ...d.data()}))),
        e => console.warn(`Error syncing ${colName}:`, e.message)
    );
    
    const unsubscribers = [
        sub('flight_logs', setAllLogs), sub('work_orders', setAllWorkOrders), sub('certifications', setAllCerts),
        sub('maintenance_records', setAllMaintRecords), sub('customers', setAllCustomers), sub('products', setAllProducts),
        sub('notam_logs', setAllNotams), sub('crops', setAllCrops), sub('faa_reports', setAllFaaReports)
    ];
    setLoading(false);
    return () => unsubscribers.forEach(unsub => unsub && unsub());
  }, [user]);

  useEffect(() => {
     if (!customUser) return;
     const compDocId = customUser.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
     return onSnapshot(
        doc(db, 'artifacts', appId, 'public', 'data', 'saas_companies', compDocId), 
        (snap) => { if (snap.exists()) setCompany(snap.data()); },
        (e) => console.warn("Company sync error:", e.message)
     );
  }, [customUser]);

  // --- Data Memoization & Filtering ---
  const logs = useMemo(() => allLogs.filter(l => l.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>new Date(b.date)-new Date(a.date)), [allLogs, customUser]);
  const workOrders = useMemo(() => allWorkOrders.filter(w => w.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()), [allWorkOrders, customUser]);
  const customers = useMemo(() => allCustomers.filter(c => c.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>a.name.localeCompare(b.name)), [allCustomers, customUser]);
  const products = useMemo(() => allProducts.filter(p => p.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>a.name.localeCompare(b.name)), [allProducts, customUser]);
  const certs = useMemo(() => allCerts.filter(c => c.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()), [allCerts, customUser]);
  const maintRecords = useMemo(() => allMaintRecords.filter(m => m.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>new Date(b.date)-new Date(a.date)), [allMaintRecords, customUser]);
  const notamLogs = useMemo(() => allNotams.filter(n => n.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>new Date(b.date)-new Date(a.date)), [allNotams, customUser]);
  const crops = useMemo(() => allCrops.filter(c => c.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>a.name.localeCompare(b.name)), [allCrops, customUser]);
  const faaReports = useMemo(() => allFaaReports.filter(r => r.companyName?.toLowerCase() === customUser?.companyName.toLowerCase()).sort((a,b)=>b.month.localeCompare(a.month)), [allFaaReports, customUser]);

  const faaReportData = useMemo(() => {
    const currentLogs = logs.filter(l => l.date && l.date.startsWith(reportMonth));
    const tHours = (currentLogs.reduce((a, l) => a + (parseFloat(l.flightTimeMinutes)||0), 0) / 60).toFixed(2);
    return { logs: currentLogs, totalHours: tHours, flightCount: currentLogs.length };
  }, [logs, reportMonth]);

  // --- Core CRUD Operations ---
  const genericSubmit = async (e, col, stateObj, setFn, defaultState, msg) => {
    e.preventDefault(); if (!customUser) return;
    const finalData = { ...stateObj, companyName: customUser.companyName, timestamp: stateObj.timestamp || new Date().toISOString() };
    delete finalData.isEditing;
    try {
      if (stateObj.id) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', col, stateObj.id), finalData);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', col), finalData);
      setFn({...defaultState, isEditing: false}); notify(msg, "success");
    } catch (err) { notify("Error saving.", "error"); }
  };

  const deleteItem = (col, id) => { setDeleteConfirm({ col, id }); };

  const executeDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', deleteConfirm.col, deleteConfirm.id));
      notify("Record Deleted", "info");
    } catch (err) { notify("Error deleting record.", "error"); }
    setDeleteConfirm(null);
  };

  // --- Authentication Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    let currentUser = user;
    if (!currentUser) {
       try { const cred = await signInAnonymously(auth); currentUser = cred.user; setUser(cred.user); } 
       catch(err) { return notify(`Connection Blocked: ${err.message}`, "error"); }
    }
    const cName = authForm.companyName?.trim().toLowerCase();
    const uName = authForm.username?.trim().toLowerCase();
    try {
       const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'saas_users'));
       const found = snap.docs.map(d => ({id: d.id, ...d.data()})).find(u => u.companyName?.toLowerCase() === cName && u.username?.toLowerCase() === uName && u.password === authForm.password);
       if (found) { setCustomUser(found); setActiveTab(found.role === 'Dispatcher' ? 'schedule' : 'dashboard'); notify("Welcome back", 'success'); } 
       else notify("Invalid credentials.", "error");
    } catch(err) { notify(`Database Error: ${err.message}`, "error"); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    let currentUser = user;
    if (!currentUser) {
       try { const cred = await signInAnonymously(auth); currentUser = cred.user; setUser(cred.user); } 
       catch(err) { return notify(`Connection Blocked: ${err.message}`, "error"); }
    }
    try {
       const cName = authForm.companyName?.trim();
       const uName = authForm.username?.trim();
       const snap = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'saas_users'));
       if (snap.docs.map(d=>d.data()).find(u => u.companyName?.toLowerCase() === cName.toLowerCase() && u.username?.toLowerCase() === uName.toLowerCase())) return notify("Username exists.", "error");
       
       const newUser = { companyName: cName, username: uName, email: authForm.email?.trim() || '', password: authForm.password, role: authForm.role };
       const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'saas_users'), newUser);
       
       if (authForm.role === 'Manager') {
          const cId = cName.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const cDoc = doc(db, 'artifacts', appId, 'public', 'data', 'saas_companies', cId);
          const cDocSnap = await getDoc(cDoc);
          if (!cDocSnap.exists()) await setDoc(cDoc, { name: cName, supervisor: uName, email: '', phone: '', address: '', certNo: '', exemption: '25181', timezone: -6, fleet: [] });
       }
       setCustomUser({ id: docRef.id, ...newUser }); setActiveTab(newUser.role === 'Dispatcher' ? 'schedule' : 'dashboard'); notify("User created.", "success");
    } catch (err) { notify(`Database Error: ${err.message}`, "error"); }
  };

  // --- Initial Loading State ---
  if (loading) return <div className="flex h-screen items-center justify-center bg-[#020617] text-[#9cd33b] font-black uppercase tracking-widest"><GlobalStylesComp/>Initializing Terminal...</div>;

  // --- Authentication Screen ---
  if (!customUser) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-[#020617] relative overflow-y-auto">
        <GlobalStylesComp /><Toast notification={notification} />
        
        <div className="w-full max-w-lg animate-fade-in relative z-10 my-8 border-x border-[#a3e635]/10 bg-[#020617]/40">
           <div className="text-center flex flex-col items-center justify-center px-8 pt-12 pb-8 w-full">
              <div className="w-[64px] h-[64px] rounded-full flex items-center justify-center mb-6 border border-[#a3e635]/50 bg-transparent" style={{ boxShadow: '0 0 15px rgba(163,230,53,0.1), inset 0 0 15px rgba(163,230,53,0.05)' }}>
                 <Lock className="text-[#a3e635]" size={28} strokeWidth={1.5} />
              </div>
              
              <h1 
                 className="text-5xl md:text-[3.5rem] font-black uppercase whitespace-nowrap text-[#cbf464] mb-4 flex justify-center w-full"
                 style={{ fontFamily: '"Orbitron", sans-serif', textShadow: '0 0 15px rgba(163,230,53,0.6), 0 0 30px rgba(163,230,53,0.3)' }}
              >
                 Spray Ops
              </h1>
              
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em] mb-8 text-center w-full">
                 Flight Command Center
              </p>
              
              <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-[#a3e635]/60 to-transparent mb-8"></div>
              
              <p className="text-[#a3e635] text-[11px] font-bold uppercase tracking-widest mb-4 drop-shadow-[0_0_5px_rgba(163,230,53,0.5)]">
                 {authMode === 'login' ? 'Secure Login' : 
                  authMode === 'register' ? 'Register Access' : 
                  authMode === 'forgot' ? 'Account Recovery' : 
                  'Reset Password'}
              </p>
           </div>

           {/* Rendering Auth Forms based on authMode */}
           <div className="px-8 pb-12">
             {authMode === 'login' && (
               <form onSubmit={handleLogin} className="space-y-4">
                  <Input label="Company Code" value={authForm.companyName} onChange={e => setAuthForm({...authForm, companyName: e.target.value})} required/>
                  <Input label="Username" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required/>
                  <Input label="Password" type={showPassword ? "text" : "password"} value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-[#a3e635] focus:outline-none">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>} />
                  <Button type="submit" className="w-full py-4 mt-8 !bg-gradient-to-r !from-[#a3e635] !to-[#84cc16] !text-[#020617] !border-[#a3e635]">Login <ArrowRight size={16}/></Button>
               </form>
             )}
             {authMode === 'register' && (
               <form onSubmit={handleRegister} className="space-y-4">
                  <Input label="Company Code" value={authForm.companyName} onChange={e => setAuthForm({...authForm, companyName: e.target.value})} required/>
                  <Input label="Username" value={authForm.username} onChange={e => setAuthForm({...authForm, username: e.target.value})} required/>
                  <Input label="Email Address" type="email" value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} required/>
                  <Input label="Password" type={showPassword ? "text" : "password"} value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} required rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-[#a3e635] focus:outline-none">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>} />
                  <Select label="Role" value={authForm.role} onChange={e => setAuthForm({...authForm, role: e.target.value})}><option value="Pilot">Pilot</option><option value="Manager">Manager</option><option value="Dispatcher">Dispatcher</option></Select>
                  <Button type="submit" className="w-full py-4 mt-8 !bg-gradient-to-r !from-[#a3e635] !to-[#84cc16] !text-[#020617] !border-[#a3e635]">Create Key <ArrowRight size={16}/></Button>
               </form>
             )}
             <div className="flex flex-col gap-4 text-center pt-8 border-t border-slate-800/50 mt-8">
                <button type="button" onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[10px] text-slate-400 hover:text-slate-200 uppercase font-black tracking-widest transition-colors">
                    {authMode === 'login' ? 'Need Account? Register New User' : 'Already have access? Login Here'}
                </button>
             </div>
           </div>
        </div>
      </div>
    );
  }

  // --- Main Application Layout ---
  const tabsConfig = [
    ...(customUser.role !== 'Dispatcher' ? [{ id: 'dashboard', icon: ShieldCheck, label: 'Dashboard' }] : []),
    { id: 'schedule', icon: CalendarDays, label: 'Schedule' },
    { id: 'customers', icon: Users, label: 'Customers' },
    { id: 'products', icon: FlaskConical, label: 'Products' },
    ...(customUser.role !== 'Dispatcher' ? [
       { id: 'fleet', icon: Plane, label: 'Aircraft Fleet' },
       { id: 'certifications', icon: Award, label: 'Certifications' }, 
       { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
       { id: 'log', icon: FileText, label: 'Mission Log' }, 
       { id: 'notam', icon: Navigation, label: 'NOTAM Tool' },
       { id: 'faa-report', icon: FileBarChart, label: 'FAA Report' }
    ] : []),
    ...(customUser.role === 'Manager' ? [{ id: 'settings', icon: Settings2, label: 'Settings' }] : [])
  ];

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden font-sans selection:bg-[#9cd33b] selection:text-[#020617] relative">
      <GlobalStylesComp /><Toast notification={notification} />
      
      {/* Sidebar Navigation */}
      <div className="w-20 lg:w-64 bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800 flex flex-col shrink-0 z-30 relative">
        <div className="p-4 lg:p-6 border-b border-slate-800/50 min-w-0 flex flex-col items-center text-center relative z-10">
          <div className="hidden lg:flex flex-col items-center w-full">
            <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase tracking-tighter w-full truncate">{company.name || 'Organization'}</h1>
            <span className="text-[10px] text-[#9cd33b] font-black uppercase tracking-[0.3em] mt-1.5" style={{ fontFamily: '"Orbitron", sans-serif' }}>Spray Ops</span>
          </div>
          <ShieldCheck className="lg:hidden mx-auto text-[#9cd33b] shrink-0" size={24} strokeWidth={2.5}/>
        </div>
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto relative z-10">
          {tabsConfig.map(t => {
            const Icon = t.icon;
            return (
              <button key={t.id} onClick={() => {setActiveTab(t.id); setShowFormalReport(false);}} className={`w-full flex items-center justify-center lg:justify-start p-3.5 rounded-2xl transition-all duration-300 min-w-0 group ${activeTab === t.id ? 'bg-gradient-to-r from-[#9cd33b] to-[#8ac22a] text-[#020617] shadow-[0_0_20px_rgba(156,211,59,0.3)] font-black' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'}`}>
                 <Icon size={18} className={`shrink-0 transition-transform duration-300 ${activeTab === t.id ? 'scale-110' : 'group-hover:scale-110'}`}/>
                 <span className={`hidden lg:inline text-[11px] uppercase tracking-widest ml-4 truncate ${activeTab === t.id ? 'font-black' : 'font-bold'}`}>{t.label}</span>
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800/50 space-y-2 min-w-0 relative z-10">
           <button onClick={() => {setCustomUser(null); setAuthForm({...authForm, password: ''});}} className="w-full p-3 flex items-center justify-center lg:justify-start rounded-xl text-red-500/80 hover:text-red-400 hover:bg-red-500/10 transition-all min-w-0 group">
              <LogOut size={16} className="shrink-0 group-hover:scale-110 transition-transform"/>
              <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest ml-3 truncate">Sign Out</span>
           </button>
        </div>
      </div>

      {/* Main Tab Rendering Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative z-20 min-w-0">
        {activeTab === 'dashboard' && <DashboardTab fleet={company.fleet || []} company={company} customUser={customUser} logs={logs} maintRecords={maintRecords} />}
        {activeTab === 'fleet' && <FleetTab company={company} setCompany={setCompany} customUser={customUser} notify={notify} />}
        {activeTab === 'settings' && <SettingsTab company={company} setCompany={setCompany} handleCompanySettingsSave={async e => { e.preventDefault(); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'saas_companies', customUser.companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')), company); notify("Settings Saved", "success"); }} customUser={customUser} setCustomUser={setCustomUser} notify={notify} />}
        {activeTab === 'customers' && <CustomersTab items={customers} logs={logs} isEditing={customerState.isEditing} state={customerState} setState={setCustomerState} onSubmit={e => genericSubmit(e, 'customers', customerState, setCustomerState, defaultCustomerState, "Customer Saved")} onCancel={() => setCustomerState({...defaultCustomerState, isEditing: false})} onDelete={deleteItem} notify={notify} />}
        {activeTab === 'products' && <ProductsTab items={products} isEditing={productState.isEditing} state={productState} setState={setProductState} onSubmit={e => genericSubmit(e, 'products', productState, setProductState, defaultProductState, "Product Saved")} onCancel={() => setProductState({...defaultProductState, isEditing: false})} onDelete={deleteItem} />}
        {activeTab === 'maintenance' && <MaintenanceTab items={maintRecords} isEditing={maintState.isEditing} state={maintState} setState={setMaintState} onSubmit={e => genericSubmit(e, 'maintenance_records', {...maintState, picUsername: customUser.username}, setMaintState, defaultMaintState, "Log Saved")} onCancel={() => setMaintState({...defaultMaintState, isEditing: false})} onDelete={deleteItem} />}
        {activeTab === 'certifications' && <CertificationsTab items={certs} company={company} isEditing={certState.isEditing} state={certState} setState={setCertState} onSubmit={e => genericSubmit(e, 'certifications', {...certState, picUsername: customUser.username}, setCertState, defaultCertState, "Cert Saved")} onCancel={() => setCertState({...defaultCertState, isEditing: false})} onDelete={deleteItem} />}
        {activeTab === 'schedule' && <ScheduleTab workOrders={workOrders} isEditing={workOrderState.isEditing} state={workOrderState} setState={setWorkOrderState} onSubmit={(e) => genericSubmit(e, 'work_orders', workOrderState, setWorkOrderState, defaultWorkOrderState, "Order Saved")} onCancel={() => setWorkOrderState({...defaultWorkOrderState, isEditing: false})} customers={customers} products={products} customUser={customUser} notify={notify} />}
        {activeTab === 'log' && <MissionLogTab logs={logs} notams={notamLogs} fleet={company.fleet || []} customers={customers} products={products} crops={crops} isEditing={logState.isEditing} state={logState} setState={setLogState} onSubmit={(e) => genericSubmit(e, 'flight_logs', logState, setLogState, defaultLogState, "Mission Logged")} onCancel={() => setLogState({...defaultLogState, isEditing: false})} onDelete={deleteItem} notify={notify} />}
        {activeTab === 'notam' && <NotamTab notams={notamLogs} isEditing={notamState.isEditing} state={notamState} setState={setNotamState} onSubmit={(e) => genericSubmit(e, 'notam_logs', notamState, setNotamState, defaultNotamState, "NOTAM Archived")} onCancel={() => setNotamState({...defaultNotamState, isEditing: false})} onDelete={deleteItem} notify={notify} />}
        {activeTab === 'faa-report' && <FaaReportTab company={company} fleet={company.fleet || []} certs={certs} monthlyReport={faaReportData} reportMonth={reportMonth} setReportMonth={setReportMonth} showFormalReport={showFormalReport} setShowFormalReport={setShowFormalReport} notify={notify} faaReports={faaReports} onDelete={deleteItem} />}
      </main>
    </div>
  );
}
