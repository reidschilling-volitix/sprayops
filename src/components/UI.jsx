/**
 * VOLITIX AG - REUSABLE UI COMPONENTS
 * Standardized interface elements for the Compliance Hub.
 */

import React from 'react';
import { AlertTriangle, ShieldCheck, Plus, X } from 'lucide-react';

export const GlobalStylesComp = () => (
  <style>{`
    /* Global utility classes injected here */
  `}</style>
);

export const Toast = ({ notification }) => {
  if (!notification.show) return null;
  return (
    <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[250] px-6 py-3.5 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.5)] font-black uppercase tracking-widest text-[11px] flex items-center gap-3 animate-fade-in border ${
      notification.type === 'error' ? 'bg-red-950/90 border-red-500/50 text-red-400 backdrop-blur-md' : 
      notification.type === 'success' ? 'bg-[#9cd33b]/10 border-[#9cd33b]/50 text-[#9cd33b] backdrop-blur-md' : 
      'bg-blue-950/90 border-blue-500/50 text-blue-400 backdrop-blur-md'
    }`}>
      {notification.type === 'error' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
      {String(notification.message)}
    </div>
  );
};

export const Card = ({ children, className = "" }) => (
  <div className={`glass-card p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.25)] backdrop-blur-md relative overflow-hidden ${className}`}>
    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>
    {children}
  </div>
);

export const Button = ({ children, onClick, type="button", variant="primary", className="", disabled=false }) => {
  const base = "px-5 py-3.5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.96] relative overflow-hidden group";
  const variants = { 
    primary: "bg-gradient-to-r from-[#9cd33b] to-[#7ab02b] text-[#020617] shadow-[0_0_15px_rgba(156,211,59,0.2)] hover:shadow-[0_0_25px_rgba(156,211,59,0.4)] border border-[#bce455]/50", 
    secondary: "bg-slate-800/80 backdrop-blur-md text-slate-200 hover:bg-slate-700 hover:shadow-lg border border-slate-700/50 hover:border-slate-600", 
    danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>
       <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500 ease-in-out"></div>
       <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
};

export const Input = ({ label, className="", rightElement, type="text", ...props }) => (
  <div className="space-y-2 min-w-0 group">
    {label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block group-focus-within:text-[#9cd33b] transition-colors">{label}</label>}
    <div className="relative">
      <input 
        type={type} 
        className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 outline-none focus:border-[#9cd33b]/60 focus:ring-4 focus:ring-[#9cd33b]/10 focus:bg-slate-900 transition-all duration-300 min-w-0 shadow-inner ${className} ${rightElement ? 'pr-12' : ''}`} 
        {...props} 
      />
      {rightElement && <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">{rightElement}</div>}
    </div>
  </div>
);

export const Select = ({ label, children, className="", ...props }) => (
  <div className="space-y-2 min-w-0 group">
    {label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block group-focus-within:text-[#9cd33b] transition-colors">{label}</label>}
    <select 
      className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm font-bold text-slate-200 outline-none focus:border-[#9cd33b]/60 focus:ring-4 focus:ring-[#9cd33b]/10 focus:bg-slate-900 transition-all duration-300 min-w-0 shadow-inner ${className}`} 
      {...props}
    >
      {children}
    </select>
  </div>
);

export const TextArea = ({ label, className="", ...props }) => (
  <div className="space-y-2 min-w-0 group">
    {label && <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1 truncate block group-focus-within:text-[#9cd33b] transition-colors">{label}</label>}
    <textarea 
      className={`w-full bg-slate-950/50 border border-slate-800 p-4 rounded-2xl text-sm text-slate-200 outline-none focus:border-[#9cd33b]/60 focus:ring-4 focus:ring-[#9cd33b]/10 focus:bg-slate-900 transition-all duration-300 h-32 resize-none min-w-0 shadow-inner ${className}`} 
      {...props} 
    />
  </div>
);

export const FormCard = ({ title, icon: Icon, onSubmit, onCancel, submitLabel, children }) => (
  <div className="space-y-6 animate-fade-in">
    {onCancel && (
      <div className="flex">
        <button type="button" onClick={onCancel} className="flex items-center gap-2 text-slate-400 hover:text-white font-black text-[10px] uppercase tracking-widest bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl transition-colors hover:bg-slate-800">
          <X size={14} /> Cancel Edit
        </button>
      </div>
    )}
    <Card className="border-[#9cd33b]/20">
      <div className="flex items-center gap-4 text-[#9cd33b] font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-6 mb-8 flex-wrap">
        {Icon && <div className="p-2.5 bg-[#9cd33b]/10 rounded-xl shadow-[0_0_15px_rgba(156,211,59,0.15)]"><Icon size={20} className="shrink-0" strokeWidth={2.5} /></div>} 
        <span className="truncate">{title}</span>
      </div>
      <form onSubmit={onSubmit} className="space-y-8">
        {children}
        <div className="pt-8 border-t border-slate-800">
          <Button type="submit" className="w-full py-5 text-sm">{submitLabel || 'Save Record'}</Button>
        </div>
      </form>
    </Card>
  </div>
);

export const TableCard = ({ title, icon: Icon, actionLabel, onAction, secondaryActionLabel, onSecondaryAction, children }) => (
  <div className="space-y-8 animate-fade-in">
    <Card className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 !p-6 border-[#9cd33b]/20">
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div className="p-4 bg-gradient-to-br from-[#9cd33b]/20 to-[#9cd33b]/5 border border-[#9cd33b]/30 rounded-[1.5rem] text-[#9cd33b] shrink-0 shadow-[0_0_15px_rgba(156,211,59,0.15)]">
          {Icon && <Icon size={28} strokeWidth={2.5} />}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 to-slate-400 truncate">{title}</h2>
          <p className="text-[10px] text-[#9cd33b] font-black uppercase tracking-widest mt-1 truncate">Manage Database Records</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 w-full md:w-auto shrink-0">
        {onSecondaryAction && <Button variant="secondary" onClick={onSecondaryAction}>{secondaryActionLabel}</Button>}
        {onAction && <Button onClick={onAction} className="flex-1 md:flex-none"><Plus size={16}/> {actionLabel}</Button>}
      </div>
    </Card>
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-[3rem] overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">{children}</div>
    </div>
  </div>
);

// --- CANVAS PREVIEW ONLY ---
// The preview environment requires a default export named "App" to render successfully. 
// This acts as a testing gallery for your UI components. You do not need to include this default export in your final GitHub repository.
export default function App() {
  const [showToast, setShowToast] = React.useState(false);
  
  // Auto-hide toast after 3 seconds for the preview demo
  React.useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  return (
    <div className="p-6 md:p-10 bg-slate-950 min-h-screen text-slate-200 font-sans">
      <GlobalStylesComp />
      <Toast notification={{ show: showToast, message: 'Action Completed Successfully', type: 'success' }} />
      
      <div className="max-w-4xl mx-auto space-y-12 pb-24">
        <div>
           <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">UI Component Library</h1>
           <p className="text-[#9cd33b] text-[10px] font-black uppercase tracking-widest">Previewing extracted modular components</p>
        </div>

        <Card className="border-[#9cd33b]/20">
          <h2 className="text-[#9cd33b] font-black uppercase text-xs tracking-widest border-b border-slate-800 pb-4 mb-6">Buttons & Interactions</h2>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setShowToast(true)}>Test Toast Notification</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="danger">Danger Button</Button>
          </div>
        </Card>

        <FormCard title="Form Card Example" icon={ShieldCheck} submitLabel="Save Settings" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Standard Input" placeholder="Type here..." />
            <Input label="Input with Unit" placeholder="0.00" rightElement={<span className="text-[9px] text-slate-500 font-black">ACRES</span>} />
            <Select label="Dropdown Select">
              <option className="bg-slate-900">Option A</option>
              <option className="bg-slate-900">Option B</option>
            </Select>
            <div className="md:col-span-2">
              <TextArea label="Text Area Notes" placeholder="Enter multi-line text here..." />
            </div>
          </div>
        </FormCard>
      </div>
    </div>
  );
}
