/**
 * VOLITIX AG - CONSTANTS & HELPERS
 * Preserved exactly from the Flight Command Center build.
 */

export const EQUIPMENT_TYPES = ["Drone", "Battery", "Generator", "Controller", "Spray System", "Other"];

export const TIME_ZONES = [
  { label: "Eastern (EST/EDT)", offset: -5 }, 
  { label: "Central (CST/CDT)", offset: -6 },
  { label: "Mountain (MST/MDT)", offset: -7 }, 
  { label: "Pacific (PST/PDT)", offset: -8 }
];

// --- Default States ---

export const defaultWorkOrderState = { 
  title: '', customer: '', date: new Date().toLocaleDateString('en-CA'), acres: '', chemical: '', 
  kmlFileName: '', kmlData: null, status: 'Pending', isScheduled: false, coordType: 'Decimal', 
  latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', 
  latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' } 
};

export const defaultLogState = { 
  date: new Date().toLocaleDateString('en-CA'), startTime: '08:00', endTime: '10:00', selectedAircraft: [], customer: '', locationName: '', 
  totalAcreage: '', treatedAcreage: '', whatWasTreated: 'Corn', customCrop: '', targetPest: '', nozzleDesc: 'Atomizer Sprinklers', targetDistance: '', 
  pumpPressure: '', travelSpeed: '', speedUnit: 'mph', driftPractices: '', coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', 
  latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' }, coordinates: '', 
  chemical: '', appRate: '', windSpeed: '', windDirection: 'N', temp: '', tempUnit: 'F', humidity: '', 
  incidents: 'None', damageDescription: '', flightTimeValue: '', flightTimeUnit: 'Hours', flightTimeMinutes: '', 
  kmlData: null, kmlFileName: '', attachedNotam: '' 
};

export const defaultMaintState = { date: new Date().toLocaleDateString('en-CA'), equipmentType: 'Drone', customEquipment: '', assetId: '', workPerformed: '' };
export const defaultCertState = { name: 'FAA Part 107', customName: '', licenseNumber: '', state: '', expirationDate: '', owner: '' };
export const defaultCustomerState = { name: '', contactName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '' };
export const defaultProductState = { name: '', defaultRate: '', inventory: '', description: '' };
export const defaultNotamState = { 
  date: new Date().toLocaleDateString('en-CA'), notamNumber: '', script: '', localStartTime: '08:00', duration: '4', radius: '0.5', 
  coordType: 'Decimal', latDec: '', lonDec: '', latDecDir: 'N', lonDecDir: 'W', 
  latDMS: { d: '', m: '', s: '', dir: 'N' }, lonDMS: { d: '', m: '', s: '', dir: 'W' } 
};

// --- Helper Functions ---

export const formatToNotamDMS = (input, isLon = false) => {
  if (!input) return "000000";
  const parts = input.toString().trim().split(/\s+/);
  let decimal = parts.length >= 2 
    ? Math.abs(parseFloat(parts[0]) || 0) + ((parseFloat(parts[1]) || 0) / 60) + ((parseFloat(parts[2]) || 0) / 3600) 
    : Math.abs(parseFloat(input));
  if (isNaN(decimal)) return "000000";
  const degrees = Math.floor(decimal), minutes = Math.floor((decimal - degrees) * 60), seconds = Math.round((decimal - degrees - (minutes / 60)) * 3600);
  return `${degrees.toString().padStart(isLon ? 3 : 2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
};

export const getStatusColor = (status) => {
  switch(status) {
     case 'In Progress': return 'border-blue-500/50 bg-blue-500/10 text-blue-400';
     case 'Paused': return 'border-amber-500/50 bg-amber-500/10 text-amber-500';
     case 'Completed': return 'border-[#9cd33b]/50 bg-[#9cd33b]/10 text-[#9cd33b]';
     case 'Cancelled': return 'border-slate-600 bg-slate-800 text-slate-400';
     default: return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500'; 
  }
};

export const copyToClipboard = (text) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try { 
    document.execCommand('copy'); 
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }
  document.body.removeChild(textArea);
};
