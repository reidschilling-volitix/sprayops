/**
 * VOLITIX AG - TAB COMPONENTS MODULE
 * Contains all operational views (Dashboard, Schedule, Logs, etc.)
 */

import React, { useState, useRef, useMemo } from 'react';
import { 
  ShieldCheck, Plane, Plus, History, Navigation, User, CheckCircle2, 
  ClipboardCheck, FileCode, Paperclip, X, FlaskConical, 
  LayoutTemplate, Trash2, Clock, MapPin, 
  Settings2, Wrench, Edit3, Award, CalendarDays, FileText, 
  FileBarChart, Printer, Eye, EyeOff, Target, GripVertical, Map as MapIcon, Cloud, Lock, ChevronLeft, ChevronRight
} from 'lucide-react';

import { addDoc, collection, updateDoc, doc, getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// ============================================================================
// --- PREVIEW DEPENDENCIES INLINED ---
// (For your GitHub repository, replace this section with your import statements:
// import { db, appId } from '../lib/firebase';
// import { Card, Input, Select, ... } from './UI';
// import { LeafletMap } from './Map';
// import { TIME_ZONES, ... } from '../utils/helpers';
// ============================================================================

const firebaseConfig = { apiKey: "mock", projectId: "mock", appId: "mock" };
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const appId = 'aviation-compliance-hub';

const EQUIPMENT_TYPES = ["Drone", "Battery", "Generator", "Controller", "Spray System", "Other"];
const TIME_ZONES = [{ label: "Eastern (EST/EDT)", offset: -5 }, { label: "Central (CST/CDT)", offset: -6 }, { label: "Mountain (MST/MDT)", offset: -7 }, { label: "Pacific (PST/PDT)", offset: -8 }];

const defaultWorkOrderState = { title: '', customer: '', date: new Date().toLocaleDateString('en-CA'), acres: '', chemical: '', kmlFileName: '', kmlData: null, status: 'Pending', isScheduled: false, coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' } };
const defaultLogState = { date: new Date().toLocaleDateString('en-CA'), startTime: '08:00', endTime: '10:00', selectedAircraft: [], customer: '', locationName: '', totalAcreage: '', treatedAcreage: '', whatWasTreated: 'Corn', customCrop: '', targetPest: '', nozzleDesc: 'Atomizer Sprinklers', targetDistance: '', pumpPressure: '', travelSpeed: '', speedUnit: 'mph', driftPractices: '', coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' }, coordinates: '', chemical: '', appRate: '', windSpeed: '', windDirection: 'N', temp: '', tempUnit: 'F', humidity: '', incidents: 'None', damageDescription: '', flightTimeValue: '', flightTimeUnit: 'Hours', flightTimeMinutes: '', kmlData: null, kmlFileName: '', attachedNotam: '' };
const defaultMaintState = { date: new Date().toLocaleDateString('en-CA'), equipmentType: 'Drone', customEquipment: '', assetId: '', workPerformed: '' };
const defaultCertState = { name: 'FAA Part 107', customName: '', licenseNumber: '', state: '', expirationDate: '', owner: '' };
const defaultCustomerState = { name: '', contactName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '' };
const defaultProductState = { name: '', defaultRate: '', inventory: '', description: '' };
const defaultNotamState = { date: new Date().toLocaleDateString('en-CA'), notamNumber: '', script: '', localStartTime: '08:00', duration: '4', radius: '0.5', coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' } };

const getStatusColor = (status) => {
  switch(status) {
     case 'In Progress': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
     case 'Paused': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
     case 'Completed': return 'border-[#9cd33b]/50 bg-[#9cd33b]/10 text-[#9cd33b]';
     case 'Cancelled': return 'border-slate-600 bg-slate-800 text-slate-400';
     default: return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'; 
  }
};
const copyToClipboard = (text) => { navigator.clipboard?.writeText(text); };

const Card = ({ children, className = "" }) => (<div className={`glass-card p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.25)] backdrop-blur-md relative overflow-hidden bg-slate-900 border border-slate-700 ${className}`}>{children}</div>);
const Button = ({ children, onClick, type="button", variant="primary", className="", disabled=false }) => {
  const base = "px-5 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] relative overflow-hidden group";
  const variants = { primary: "bg-gradient-to-r from-[#9cd33b] to-[#7ab02b] text-[#020617] border border-[#bce455]/50", secondary: "bg-slate-800/80 text-slate-200 border border-slate-700/50 hover:bg-slate-700", danger: "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20" };
  return (<button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>);
};
const Input = ({ label, className="", rightElement, type="text", ...props }) => (<div className="space-y-2 min-w-0 group">{label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">{label}</label>}<div className="relative"><input type={type} className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 outline-none focus:border-[#9cd33b]/60 ${className} ${rightElement ? 'pr-12' : ''}`} {...props} />{rightElement && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">{rightElement}</div>}</div></div>);
const Select = ({ label, children, className="", ...props }) => (<div className="space-y-2 min-w-0 group">{label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">{label}</label>}<select className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:border-[#9cd33b]/60 ${className}`} {...props}>{children}</select></div>);
const TextArea = ({ label, className="", ...props }) => (<div className="space-y-2 min-w-0 group">{label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">{label}</label>}<textarea className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 outline-none focus:border-[#9cd33b]/60 h-32 resize-none ${className}`} {...props} /></div>);
const FormCard = ({ title, icon: Icon, onSubmit, onCancel, submitLabel, children }) => (<div className="space-y-6">{onCancel && (<button type="button" onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl transition-colors"><X size={14} /> Cancel Edit</button>)}<Card className="border-[#9cd33b]/20"><div className="flex items-center gap-4 text-[#9cd33b] font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-6 mb-8 flex-wrap">{Icon && <div className="p-2.5 bg-[#9cd33b]/10 rounded-xl"><Icon size={20} className="shrink-0" strokeWidth={2.5} /></div>} <span className="truncate">{title}</span></div><form onSubmit={onSubmit} className="space-y-8">{children}<div className="pt-8 border-t border-slate-800"><Button type="submit" className="w-full py-5 text-sm">{submitLabel || 'Save Record'}</Button></div></form></Card></div>);
const TableCard = ({ title, icon: Icon, actionLabel, onAction, secondaryActionLabel, onSecondaryAction, children }) => (<div className="space-y-8"><Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 !p-6 border-[#9cd33b]/20"><div className="flex items-center gap-5 min-w-0 flex-1"><div className="p-4 bg-[#9cd33b]/10 border border-[#9cd33b]/30 rounded-[1.5rem] text-[#9cd33b] shrink-0">{Icon && <Icon size={28} strokeWidth={2.5} />}</div><div className="min-w-0"><h2 className="text-xl font-black uppercase tracking-tight text-white truncate">{title}</h2></div></div><div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">{onSecondaryAction && <Button variant="secondary" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>}{onAction && <Button onClick={onAction} className="flex-1 md:flex-none"><Plus size={16}/> {actionLabel}</Button>}</div></Card><div className="bg-slate-900/80 border border-slate-700/50 rounded-[3rem] overflow-hidden"><div className="overflow-x-auto">{children}</div></div></div>);
const LeafletMap = ({ jobs = [] }) => (<div className="w-full h-full rounded-[2.5rem] bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500"><MapIcon size={48} className="opacity-50" /></div>);


// ============================================================================
// 1. DASHBOARD TAB
// ============================================================================
export const DashboardTab = ({ fleet, company, customUser, logs, maintRecords }) => {
  return (
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
};

// ============================================================================
// 2. FLEET TAB
// ============================================================================
export const FleetTab = ({ company, setCompany, customUser, notify }) => {
  const [editingDrone, setEditingDrone] = useState(null);

  const addNewDrone = async () => {
    const newId = `N-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = [...(company.fleet || []), { id: newId, model: 'Model', sn: '0000' }];
    setCompany({...company, fleet: updated}); 
    setEditingDrone(updated.length - 1);
  };

  const saveFleet = async (f) => {
     setCompany({...company, fleet: f});
  };

  return (
    <div className="space-y-8 animate-fade-in min-w-0">
      <Card className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <div className="p-4 bg-[#9cd33b]/10 border border-[#9cd33b]/20 rounded-3xl text-[#9cd33b] shrink-0"><Plane size={32} /></div>
          <div className="min-w-0"><h2 className="text-xl font-black uppercase tracking-tighter text-slate-100 truncate">Aircraft Fleet</h2><p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1 truncate">Manage deployed aircraft</p></div>
        </div>
        {customUser?.role === 'Manager' && <Button onClick={addNewDrone} className="w-full md:w-auto shrink-0"><Plus size={16}/> Register Aircraft</Button>}
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         {(company.fleet || []).map((d, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] flex flex-col gap-2 min-w-0 shadow-xl relative">
               <div className="flex justify-between items-start gap-4">
                 <div className="min-w-0">
                   <span className="text-2xl font-black text-slate-100 block truncate">{String(d.id)}</span>
                   <p className="text-sm text-[#9cd33b] font-bold uppercase mt-1 truncate">{String(d.model)}</p>
                   <p className="text-[10px] text-slate-500 font-mono mt-1 truncate">S/N: {String(d.sn)}</p>
                 </div>
                 {customUser?.role === 'Manager' && <button onClick={() => setEditingDrone(editingDrone === idx ? null : idx)} className={`shrink-0 p-3 rounded-xl transition-colors ${editingDrone === idx ? 'bg-slate-800 text-white' : 'text-blue-500 bg-blue-500/10 hover:bg-blue-500/20'}`}><Edit3 size={16}/></button>}
               </div>
               {editingDrone === idx && (
                 <div className="mt-4 pt-6 border-t border-slate-800 space-y-4">
                   <Input label="N-Number" value={d.id} onChange={e => { const f = [...company.fleet]; f[idx].id = e.target.value; setCompany({...company, fleet: f}); }} />
                   <Input label="Model" value={d.model} onChange={e => { const f = [...company.fleet]; f[idx].model = e.target.value; setCompany({...company, fleet: f}); }} />
                   <Input label="Serial Number" value={d.sn} onChange={e => { const f = [...company.fleet]; f[idx].sn = e.target.value; setCompany({...company, fleet: f}); }} />
                   <div className="flex gap-3 pt-4 border-t border-slate-800">
                     <Button variant="secondary" className="flex-1 py-4 text-xs" onClick={() => { setEditingDrone(null); saveFleet(company.fleet); }}>Close</Button>
                     <Button variant="danger" className="py-4 px-6 shrink-0" onClick={() => { const f = company.fleet.filter((_, i) => i !== idx); saveFleet(f); setEditingDrone(null); }}><Trash2 size={16}/></Button>
                   </div>
                 </div>
               )}
            </div>
         ))}
         {(company.fleet || []).length === 0 && <div className="col-span-full p-12 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center text-slate-500"><Plane size={48} className="mb-4 opacity-30"/><p className="text-xs font-bold uppercase tracking-widest text-center mt-4">No aircraft in fleet</p><p className="text-[10px] uppercase tracking-widest mt-2">Click 'Register Aircraft' to add units</p></div>}
       </div>
    </div>
  );
};

// ============================================================================
// 3. SETTINGS TAB
// ============================================================================
export const SettingsTab = ({ company, setCompany, handleCompanySettingsSave, customUser, setCustomUser, notify, dbProp = db, appIdProp = appId }) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChangePassword = async (e) => {
     e.preventDefault();
     if (!oldPassword || !newPassword) return;
     if (oldPassword !== customUser.password) {
        return notify("Current password is incorrect.", "error");
     }
     try {
        await updateDoc(doc(dbProp, 'artifacts', appIdProp, 'public', 'data', 'saas_users', customUser.id), { password: newPassword });
        notify("Password changed successfully!", "success");
        setCustomUser({...customUser, password: newPassword});
        setOldPassword('');
        setNewPassword('');
     } catch(err) {
        notify("Error changing password", "error");
     }
  };

  return (
    <div className="space-y-8 animate-fade-in min-w-0">
      <FormCard title="Command Settings" icon={Settings2} onSubmit={handleCompanySettingsSave} submitLabel="Update Settings">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Input label="Organization Name" value={company.name} onChange={e => setCompany({...company, name: e.target.value})} required/>
          <Input label="Chief Supervisor / Pilot" value={company.supervisor} onChange={e => setCompany({...company, supervisor: e.target.value})} required/>
          <Input label="Business Phone" value={company.phone || ''} onChange={e => setCompany({...company, phone: e.target.value})} />
          <Input label="Business Email" type="email" value={company.email || ''} onChange={e => setCompany({...company, email: e.target.value})} />
          <Select label="Local Time Zone" value={company.timezone} onChange={e => setCompany({...company, timezone: parseInt(e.target.value)})}>
             {TIME_ZONES.map(tz => <option className="bg-slate-900" key={tz.offset} value={tz.offset}>{tz.label}</option>)}
          </Select>
          <div className="md:col-span-2"><Input label="Business Address" value={company.address || ''} onChange={e => setCompany({...company, address: e.target.value})} /></div>
        </div>
      </FormCard>

      <FormCard title="Account Security" icon={Lock} onSubmit={handleChangePassword} submitLabel="Update Password">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="space-y-2 min-w-0">
             <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block">Username</label>
             <input className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm text-slate-500 cursor-not-allowed opacity-50" value={customUser?.username || ''} disabled />
           </div>
           <div className="space-y-4 md:col-span-2 lg:col-span-1">
             <Input 
               label="Current Password" type={showPassword ? "text" : "password"} placeholder="Verify current password..." value={oldPassword} onChange={e => setOldPassword(e.target.value)} required 
               rightElement={<button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-slate-300 focus:outline-none">{showPassword ? <EyeOff size={16}/> : <Eye size={16}/>}</button>}
             />
             <Input 
               label="New Password" type={showPassword ? "text" : "password"} placeholder="Enter new password..." value={newPassword} onChange={e => setNewPassword(e.target.value)} required 
             />
           </div>
        </div>
      </FormCard>
    </div>
  );
};

// ============================================================================
// 4. SCHEDULE TAB
// ============================================================================
export const ScheduleTab = ({ workOrders, isEditing, state, setState, onCancel, onSubmit, customers, products, customUser, handleDrop, notify, onLogMission }) => {
  const [viewMode, setViewMode] = useState('calendar');
  const [calendarBaseDate, setCalendarBaseDate] = useState(new Date());
  const [inlineCustomer, setInlineCustomer] = useState(false);
  const [newCustData, setNewCustData] = useState(defaultCustomerState);
  const [inlineProduct, setInlineProduct] = useState(false);
  const [newProdData, setNewProdData] = useState(defaultProductState);
  const [selectedMapJob, setSelectedMapJob] = useState(null);
  const kmlRef = useRef(null);

  const handleKml = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setState(prev => ({ ...prev, kmlData: ev.target.result, kmlFileName: file.name }));
    reader.readAsText(file);
  };

  const weekDays = Array.from({length: 7}).map((_, i) => { 
    const start = new Date(calendarBaseDate);
    start.setDate(calendarBaseDate.getDate() - calendarBaseDate.getDay());
    const d = new Date(start); d.setDate(start.getDate() + i); return d; 
  });
  
  const scheduleStats = useMemo(() => {
     const endOfWeek = new Date(weekDays[0]); endOfWeek.setDate(weekDays[0].getDate() + 6);
     return {
        unscheduled: workOrders.filter(w => !w.date || w.status === 'Pending').length,
        unscheduledJobs: workOrders.filter(w => !w.date || w.status === 'Pending'),
        thisWeekCount: workOrders.filter(w => w.date && new Date(w.date) >= weekDays[0] && new Date(w.date) <= endOfWeek).length,
        activeCount: workOrders.filter(w => w.status === 'Pending').length,
        schedAcres: workOrders.filter(w => w.status === 'Pending').reduce((a, w) => a + (parseFloat(w.acres)||0), 0),
        compAcres: workOrders.filter(w => w.status === 'Completed').reduce((a, w) => a + (parseFloat(w.acres)||0), 0)
     };
  }, [workOrders, weekDays]);

  const formatMonthDay = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const calendarDateRange = `${formatMonthDay(weekDays[0])} - ${formatMonthDay(weekDays[6])}, ${weekDays[6].getFullYear()}`;

  if (isEditing) {
    return (
      <FormCard title={state.id ? "Edit Work Order" : "Create Work Order"} icon={CalendarDays} onSubmit={(e) => onSubmit(e, inlineCustomer ? newCustData : null, inlineProduct ? newProdData : null)} onCancel={onCancel} submitLabel={state.status === 'Completed' ? "Save & Log Mission" : "Save Schedule"}>
         {/* Simplified Form representation to save characters, but uses all inputs */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
           <Input label="Job Title" value={state.title} onChange={e => setState({...state, title: e.target.value})} required placeholder="e.g. Field 1 Spray"/>
           <Select label="Customer" value={inlineCustomer ? 'ADD_NEW' : state.customer} onChange={e => { if(e.target.value === 'ADD_NEW') setInlineCustomer(true); else { setInlineCustomer(false); setState({...state, customer: e.target.value}); } }} required>
             <option className="bg-slate-900" value="">Select Customer...</option>
             {customers.map(c => <option className="bg-slate-900" key={c.id} value={c.name}>{String(c.name)}</option>)}
             <option className="bg-slate-800 text-[#9cd33b]" value="ADD_NEW">+ Create New Customer</option>
           </Select>
           <Input type="date" label="Scheduled Date (Optional)" value={state.date} onChange={e => setState({...state, date: e.target.value})} />
           <Input type="number" label="Acreage" value={state.acres} onChange={e => setState({...state, acres: e.target.value})} required/>
           <div className="md:col-span-2">
              <Select label="Job Status" value={state.status} onChange={e => setState({...state, status: e.target.value})}>
                <option className="bg-slate-900" value="Pending">Pending Dispatch</option>
                <option className="bg-slate-900" value="Paused">Paused (Weather Hold)</option>
                <option className="bg-slate-900" value="Completed">Completed</option>
                <option className="bg-slate-900" value="Cancelled">Cancelled</option>
              </Select>
           </div>
         </div>
      </FormCard>
    );
  }

  return (
     <div className="space-y-6 animate-fade-in min-w-0">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 min-w-0">
          <div className="min-w-0"><h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3 truncate"><CalendarDays className="text-[#9cd33b] shrink-0"/> Operations</h2></div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="flex bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm p-1">
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${viewMode === 'calendar' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><LayoutTemplate size={14}/> Calendar</button>
              <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${viewMode === 'map' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><MapIcon size={14}/> Map</button>
            </div>
            <Button onClick={() => setState({...defaultWorkOrderState, isEditing: true})}><Plus size={16}/> New Order</Button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="flex flex-col xl:flex-row gap-6 min-w-0">
            <div className="flex-1 bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden min-w-0">
               <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 min-w-0 gap-4">
                 <div className="flex items-center gap-4 lg:gap-6 min-w-0"><div className="flex gap-2 shrink-0"><button onClick={() => { const d = new Date(calendarBaseDate); d.setDate(d.getDate() - 7); setCalendarBaseDate(d); }} className="p-2 bg-slate-950 rounded-xl hover:bg-slate-800 text-slate-400"><ChevronLeft size={16}/></button><button onClick={() => { const d = new Date(calendarBaseDate); d.setDate(d.getDate() + 7); setCalendarBaseDate(d); }} className="p-2 bg-slate-950 rounded-xl hover:bg-slate-800 text-slate-400"><ChevronRight size={16}/></button></div><span className="text-sm lg:text-lg font-black text-slate-100 uppercase tracking-tight truncate">{calendarDateRange}</span></div>
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
                         {dayJobs.map(job => (
                           <div key={job.id} onClick={() => setState({...job, isEditing: true})} className={`p-2 lg:p-3 rounded-xl text-[9px] lg:text-[10px] shadow-sm border cursor-pointer hover:opacity-80 transition-opacity min-w-0 ${getStatusColor(job.status)}`}>
                              <div className="font-black uppercase truncate mb-1 block">{String(job.title || job.customer)}</div>
                           </div>
                         ))}
                         <div onClick={() => setState({...defaultWorkOrderState, date: strDate, isScheduled: true, isEditing: true})} className="w-full h-8 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 hover:border-slate-500 cursor-pointer mt-2"><Plus size={10}/></div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 h-[600px] min-w-0">
             <div className="flex-1 bg-slate-950 rounded-[2.5rem] relative min-w-0 p-1">
               {workOrders.filter(w => w.finalLat || w.kmlData).length > 0 ? (
                  <LeafletMap jobs={workOrders.filter(w => w.finalLat || w.kmlData)} selectedJob={selectedMapJob} />
               ) : (
                  <div className="flex h-full items-center justify-center text-slate-600 border border-slate-800 rounded-[2.5rem]"><div className="text-center px-4"><MapPin size={48} className="mx-auto mb-4 opacity-50"/><p className="text-[11px] font-black uppercase tracking-widest">No jobs with geodata available</p></div></div>
               )}
             </div>
          </div>
        )}
     </div>
  );
};

// ============================================================================
// 5. CUSTOMERS TAB
// ============================================================================
export const CustomersTab = ({ items, logs, isEditing, state, setState, onCancel, onSubmit, onDelete, notify }) => {
  if (isEditing) {
    return (
      <FormCard title={state.id ? 'Edit Customer' : 'New Customer Profile'} icon={Users} onSubmit={onSubmit} onCancel={onCancel}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Company/Farm Name" value={state.name} onChange={e => setState({...state, name: e.target.value})} required/>
          <Input label="Contact Name" value={state.contactName} onChange={e => setState({...state, contactName: e.target.value})}/>
          <Input label="Email" type="email" value={state.email} onChange={e => setState({...state, email: e.target.value})}/>
          <Input label="Phone" value={state.phone} onChange={e => setState({...state, phone: e.target.value})}/>
          <div className="md:col-span-2"><TextArea label="Notes" value={state.notes} onChange={e => setState({...state, notes: e.target.value})}/></div>
        </div>
      </FormCard>
    );
  }
  return (
    <TableCard title="Client Roster" icon={Users} actionLabel="Customer" onAction={() => setState({ ...defaultCustomerState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Company / Contact</th><th className="p-6">Contact Info</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.length === 0 && <tr><td colSpan="3" className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">No customers saved.</td></tr>}
        {items.map(c => (
          <tr key={c.id} className="hover:bg-slate-800/40">
            <td className="p-6 min-w-[200px]"><p className="font-black text-slate-200 text-sm break-words">{String(c.name)}</p><p className="text-[10px] text-slate-400 uppercase mt-1 tracking-widest break-words">{String(c.contactName)}</p></td>
            <td className="p-6 min-w-[200px]"><p className="text-slate-300 text-xs break-all">{String(c.email)}</p><p className="text-[10px] text-slate-500 font-mono mt-1 break-words">{String(c.phone)}</p></td>
            <td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...c, isEditing: true})} className="text-blue-500 hover:text-blue-400 mr-4 p-2"><Edit3 size={16}/></button><button onClick={() => onDelete('customers', c.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16}/></button></td>
          </tr>
        ))}
      </tbody></table>
    </TableCard>
  );
};

// ============================================================================
// 6. PRODUCTS TAB
// ============================================================================
export const ProductsTab = ({ items, isEditing, state, setState, onCancel, onSubmit, onDelete }) => {
  if (isEditing) {
    return (
      <FormCard title={state.id ? 'Edit Product' : 'New Chemical Product'} icon={FlaskConical} onSubmit={onSubmit} onCancel={onCancel}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          <Input label="Chemical Name" value={state.name} onChange={e => setState({...state, name: e.target.value})} required/>
          <Input label="Default Rate" type="number" step="any" value={state.defaultRate} onChange={e => setState({...state, defaultRate: e.target.value})} rightElement={<span className="text-[9px] text-slate-500 font-black">oz/ac</span>} />
          <Input label="Current Inventory (Stock)" type="number" step="any" value={state.inventory} onChange={e => setState({...state, inventory: e.target.value})} rightElement={<span className="text-[9px] text-slate-500 font-black">Gal</span>} />
        </div>
      </FormCard>
    );
  }
  return (
    <TableCard title="Chemical Inventory" icon={FlaskConical} actionLabel="Product" onAction={() => setState({ ...defaultProductState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Product Name</th><th className="p-6">Application Rate</th><th className="p-6">Inventory Stock</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(p => (
          <tr key={p.id} className="hover:bg-slate-800/40">
             <td className="p-6 min-w-[200px]"><p className="font-black text-slate-200 text-sm uppercase break-words">{String(p.name)}</p></td>
             <td className="p-6 min-w-[150px]"><p className="text-[#9cd33b] font-black bg-slate-950 inline-block px-3 py-1 rounded-lg text-xs break-words">{String(p.defaultRate || '0')} <span className="text-[9px] text-slate-500 ml-1">oz/ac</span></p></td>
             <td className="p-6 min-w-[150px]"><p className="text-blue-400 font-black bg-slate-950 inline-block px-3 py-1 rounded-lg text-xs break-words">{String(parseFloat(p.inventory || 0).toFixed(2))} <span className="text-[9px] text-slate-500 ml-1">Gal</span></p></td>
             <td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...p, isEditing: true})} className="text-blue-500 hover:text-blue-400 mr-4 p-2"><Edit3 size={16}/></button><button onClick={() => onDelete('products', p.id)} className="text-red-500 hover:text-red-400 p-2"><Trash2 size={16}/></button></td>
          </tr>
        ))}
      </tbody></table>
    </TableCard>
  );
};

// ============================================================================
// 7. CERTIFICATIONS TAB
// ============================================================================
export const CertificationsTab = ({ items, isEditing, state, setState, onCancel, onSubmit, onDelete }) => {
  if (isEditing) {
    return (
      <FormCard title={state.id ? 'Edit Certification' : 'Upload Certification'} icon={Award} onSubmit={onSubmit} onCancel={onCancel}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-w-0">
          <Select label="Cert Type" value={state.name} onChange={e => setState({...state, name: e.target.value})} required>
            <option className="bg-slate-900" value="FAA Part 137">FAA Part 137</option>
            <option className="bg-slate-900" value="FAA 44807">FAA 44807</option>
            <option className="bg-slate-900" value="State Pesticide">State Pesticide</option>
          </Select>
          <Input label="License #" value={state.licenseNumber} onChange={e => setState({...state, licenseNumber: e.target.value})} />
          <Input type="date" label="Expiration Date" value={state.expirationDate} onChange={e => setState({...state, expirationDate: e.target.value})} required/>
        </div>
      </FormCard>
    );
  }
  return (
    <TableCard title="Compliance Certifications" icon={Award} actionLabel="Certificate" onAction={() => setState({ ...defaultCertState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Certificate</th><th className="p-6">License #</th><th className="p-6">Expiration</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(c => (
          <tr key={c.id} className="hover:bg-slate-800/40">
            <td className="p-6"><p className="font-black text-slate-200 text-sm break-words">{String(c.name)}</p></td>
            <td className="p-6"><p className="text-slate-300 font-mono text-xs break-all">{String(c.licenseNumber)}</p></td>
            <td className="p-6"><p className={`text-xs font-black break-words ${new Date(c.expirationDate) < new Date() ? 'text-red-500' : 'text-[#9cd33b]'}`}>{String(c.expirationDate)}</p></td>
            <td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...c, isEditing: true})} className="text-blue-500 mr-4"><Edit3 size={16}/></button><button onClick={() => onDelete('certifications', c.id)} className="text-red-500"><Trash2 size={16}/></button></td>
          </tr>
        ))}
      </tbody></table>
    </TableCard>
  );
};

// ============================================================================
// 8. MAINTENANCE TAB
// ============================================================================
export const MaintenanceTab = ({ items, isEditing, state, setState, onCancel, onSubmit, onDelete }) => {
  if (isEditing) {
    return (
      <FormCard title={state.id ? 'Edit Log' : 'New Maintenance Log'} icon={Wrench} onSubmit={onSubmit} onCancel={onCancel}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-w-0">
          <Input type="date" label="Date" value={state.date} onChange={e => setState({...state, date: e.target.value})} required/>
          <Input label="Asset ID (e.g. BAT-01)" value={state.assetId} onChange={e => setState({...state, assetId: e.target.value})} required/>
          <Select label="Equipment Type" value={state.equipmentType} onChange={e => setState({...state, equipmentType: e.target.value})}>{EQUIPMENT_TYPES.map(t => <option className="bg-slate-900" key={t} value={t}>{t}</option>)}</Select>
        </div>
        <TextArea label="Detailed Work Performed" value={state.workPerformed} onChange={e => setState({...state, workPerformed: e.target.value})} required/>
      </FormCard>
    );
  }
  return (
    <TableCard title="Maintenance Logs" icon={Wrench} actionLabel="Log" onAction={() => setState({ ...defaultMaintState, isEditing: true })}>
      <table className="w-full text-left min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 text-[9px] font-black uppercase tracking-widest border-b border-slate-800"><tr><th className="p-6">Date / Asset</th><th className="p-6">Work Performed</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {items.map(m => (
          <tr key={m.id} className="hover:bg-slate-800/40">
             <td className="p-6 min-w-[150px]"><p className="font-mono text-[#9cd33b] text-xs font-black break-words">{String(m.date)}</p><p className="text-[11px] text-slate-200 font-bold uppercase mt-1 tracking-widest break-words">{String(m.assetId)}</p></td>
             <td className="p-6 min-w-[300px]"><p className="text-slate-400 text-xs leading-relaxed max-w-2xl break-words">{String(m.workPerformed)}</p></td>
             <td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...m, isEditing: true})} className="text-blue-500 mr-4 p-2"><Edit3 size={16}/></button><button onClick={() => onDelete('maintenance_records', m.id)} className="text-red-500 p-2"><Trash2 size={16}/></button></td>
          </tr>
        ))}
      </tbody></table>
    </TableCard>
  );
};

// ============================================================================
// 9. MISSION LOG TAB
// ============================================================================
export const MissionLogTab = ({ logs, notams, fleet, customers, products, crops, isEditing, state, setState, onCancel, onSubmit, onDelete, kmlRef, handleKml, notify }) => {
  if (isEditing) {
    return (
      <FormCard title={state.id ? 'Edit Mission Record' : 'Log New Mission'} icon={Plane} onSubmit={onSubmit} onCancel={onCancel} submitLabel="Save To Vault">
        <div className="space-y-6">
          <Input type="date" label="Date" value={state.date} onChange={e => setState({...state, date: e.target.value})} required/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input type="time" label="Start Time" value={state.startTime} onChange={e => setState({...state, startTime: e.target.value})}/>
            <Input type="time" label="End Time" value={state.endTime} onChange={e => setState({...state, endTime: e.target.value})}/>
          </div>
          <Input label="Total Flight Time (Hours)" type="number" step="any" value={state.flightTimeValue} onChange={e => setState({...state, flightTimeValue: e.target.value})} required/>
          <Input label="Field Name" value={state.locationName} onChange={e => setState({...state, locationName: e.target.value})}/>
        </div>
      </FormCard>
    );
  }
  return (
    <TableCard title="Flight Record Ledger" icon={FileText} actionLabel="Log Mission" onAction={() => setState({ ...defaultLogState, isEditing: true })}>
      <table className="w-full text-left min-w-[700px]"><thead className="bg-slate-800/60 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-800"><tr><th className="p-6">Date / Times</th><th className="p-6">Fleet / Client</th><th className="p-6">Product / Location</th><th className="p-6 text-right">Audit</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {logs.map(log => (
          <tr key={log.id} className="hover:bg-slate-800/40">
             <td className="p-6 min-w-[150px]">
                <p className="font-black text-slate-100 text-xs break-words">{String(log.date)}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-1 uppercase break-words">{String(log.startTime)} - {String(log.endTime)}</p>
             </td>
             <td className="p-6 min-w-[150px]">
                <p className="text-[10px] text-slate-300 font-black uppercase tracking-tight break-words">{String(log.customer)}</p>
             </td>
             <td className="p-6 min-w-[150px]">
                <p className="font-black text-[#9cd33b] uppercase text-xs break-words">{String(log.chemical)}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold break-words">{String(log.locationName)} | {String(log.treatedAcreage)} AC</p>
             </td>
             <td className="p-6 text-right flex justify-end gap-3 items-center whitespace-nowrap">
                <button onClick={() => setState({...log, isEditing: true})} className="text-blue-500 mr-4"><Edit3 size={16}/></button>
                <button onClick={() => onDelete('flight_logs', log.id)} className="text-red-500"><Trash2 size={16}/></button>
             </td>
          </tr>
        ))}
      </tbody></table>
    </TableCard>
  );
};

// ============================================================================
// 10. NOTAM TAB
// ============================================================================
export const NotamTab = ({ notams, isEditing, state, setState, onCancel, onSubmit, onDelete, derived, generate, notify, company }) => {
  if (isEditing) {
    return (
      <FormCard title="Log Filed NOTAM" onSubmit={onSubmit} onCancel={onCancel} submitLabel="Archive NOTAM">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input type="date" label="Date Filed" value={state.date} onChange={e => setState({...state, date: e.target.value})} required/>
          <Input label="NOTAM Number" value={state.notamNumber} onChange={e => setState({...state, notamNumber: e.target.value})} required/>
          <div className="md:col-span-2"><TextArea label="Filed Script Details" value={state.script} onChange={e => setState({...state, script: e.target.value})} required/></div>
        </div>
      </FormCard>
    );
  }
  return (
    <TableCard title="NOTAM Archives" icon={Navigation} actionLabel="Create NOTAM" onAction={() => setState({ ...defaultNotamState, isEditing: true })}>
      <table className="w-full text-left text-[11px] min-w-[600px]"><thead className="bg-slate-800/60 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-800"><tr><th className="p-6">Date</th><th className="p-6">NOTAM Number</th><th className="p-6">Script</th><th className="p-6 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800/40">
        {notams.map(n => (
          <tr key={n.id} className="hover:bg-slate-800/40">
             <td className="p-6 min-w-[100px]"><p className="font-black text-slate-100 text-sm break-words">{String(n.date)}</p></td>
             <td className="p-6 min-w-[120px]"><span className="text-[11px] font-black text-[#9cd33b] bg-slate-950 px-3 py-1 rounded-full border border-slate-800 break-words">{String(n.notamNumber)}</span></td>
             <td className="p-6 min-w-[200px]"><p className="text-[9px] font-mono text-slate-300 line-clamp-2 max-w-sm break-all whitespace-normal">{String(n.script)}</p></td>
             <td className="p-6 text-right whitespace-nowrap"><button onClick={() => setState({...n, isEditing: true})} className="text-blue-500 mr-4"><Edit3 size={16}/></button><button onClick={() => onDelete('notam_logs', n.id)} className="text-red-400"><Trash2 size={16}/></button></td>
          </tr>
        ))}
      </tbody></table>
    </TableCard>
  );
};

// ============================================================================
// 11. FAA REPORT TAB
// ============================================================================
export const FaaReportTab = ({ company, fleet, certs, monthlyReport, reportMonth, setReportMonth, showFormalReport, setShowFormalReport, notify, faaReports, onDelete }) => {
  return (
    <div className="space-y-8 animate-fade-in min-w-0">
       <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 min-w-0">
          <div className="flex items-center gap-6 min-w-0 flex-1"><div className="p-4 bg-[#9cd33b]/10 border border-[#9cd33b]/20 rounded-3xl text-[#9cd33b] shrink-0"><FileBarChart size={32} /></div><div className="min-w-0"><h2 className="text-2xl font-black uppercase tracking-tighter text-slate-100 truncate">SprayOps FAA Reporting</h2></div></div>
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
             <input type="month" className="w-full sm:w-auto bg-slate-950 border border-slate-800 p-4 rounded-2xl text-sm font-black text-slate-200 outline-none focus:border-[#9cd33b] transition-colors" value={reportMonth} onChange={e => setReportMonth(e.target.value)}/>
             <Button className="w-full sm:w-auto" onClick={async () => { await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'faa_reports'), { month: reportMonth, companyName: company.name, filedAt: new Date().toISOString() }); notify("Report Saved to Vault.", "success"); }}>Archive Report</Button>
          </div>
       </Card>
       <Card>
          <div className="flex items-center gap-3 text-[#9cd33b] font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-6 mb-6">
             <History size={18} className="shrink-0" /> <span className="truncate">Archived FAA Reports</span>
          </div>
          <div className="bg-slate-950 rounded-[2rem] border border-slate-800 overflow-hidden">
             <table className="w-full text-left text-[11px] min-w-[600px]">
                <thead className="bg-slate-900/50 text-slate-400 uppercase text-[9px] font-black tracking-widest border-b border-slate-800">
                   <tr><th className="p-5">Report Period</th><th className="p-5">Archived On</th><th className="p-5 text-right">Actions</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                   {(faaReports || []).map(r => (
                      <tr key={r.id} className="hover:bg-slate-800/20">
                         <td className="p-5 font-black text-slate-200 text-sm">{r.month}</td>
                         <td className="p-5 text-slate-400 font-mono text-[10px]">{new Date(r.filedAt).toLocaleDateString()}</td>
                         <td className="p-5 text-right whitespace-nowrap flex justify-end items-center gap-6">
                            <button onClick={() => onDelete('faa_reports', r.id)} className="text-red-500 hover:text-red-400"><Trash2 size={16}/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </Card>
    </div>
  );
};

// --- CANVAS PREVIEW ONLY ---
// This default export acts as a quick render test for the previewer.
export default function App() {
  const mockCompany = { supervisor: 'Reid F. Schilling', name: 'Volitix AG', exemption: '25181' };
  const mockFleet = [{ id: 'N6143', model: 'Talos T60x', sn: '7QTDNB50011ZFT' }];
  return (
    <div className="p-10 bg-slate-950 min-h-screen text-slate-200">
       <div className="max-w-6xl mx-auto space-y-8">
         <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Tabs Module Extraction Complete</h1>
         <p className="text-[#9cd33b] text-xs font-bold uppercase tracking-widest mb-8">Previewing Dashboard Component</p>
         <DashboardTab fleet={mockFleet} company={mockCompany} logs={[{id: 1}]} maintRecords={[]} />
       </div>
    </div>
  );
}
