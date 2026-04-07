/**
 * VOLITIX AG - COMPLIANCE MAP COMPONENT
 * Renders flight coordinates and KML boundary data to ensure 
 * adherence to Part 137 lateral boundaries.
 * * NOTE: This component expects Leaflet (`L`) and Leaflet-Omnivore 
 * to be globally available via CDN scripts in your index.html.
 */

import React, { useEffect, useRef } from 'react';

export const LeafletMap = ({ lat, lon, kmlData, jobs = [], selectedJob = null }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const featureGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize map only once
    if (!mapInstanceRef.current) {
        // Ensure window.L is available (loaded via CDN in index.html)
        if (!window.L) {
            console.error("Leaflet is not loaded. Please ensure leaflet.js is included.");
            return;
        }

       mapInstanceRef.current = window.L.map(mapContainerRef.current, {
          zoomControl: false // Keep interface clean
       }).setView([lat || 38.3364, lon || -90.1498], lat ? 15 : 4); // Default to Waterloo, IL area

       // Dark mode satellite tiles for clear field boundary contrast
       window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri',
          className: 'map-tiles'
       }).addTo(mapInstanceRef.current);

       featureGroupRef.current = window.L.featureGroup().addTo(mapInstanceRef.current);
    }

    const map = mapInstanceRef.current;
    const fg = featureGroupRef.current;
    fg.clearLayers();

    let hasLayers = false;

    const itemsToPlot = jobs.length > 0 ? jobs : [];
    
    // If no jobs array is passed, plot the single lat/lon/KML provided
    if (jobs.length === 0 && (lat || kmlData)) {
         itemsToPlot.push({ finalLat: lat, finalLon: lon, kmlData, id: 'single' });
    }

    itemsToPlot.forEach(job => {
       const isSelected = selectedJob ? selectedJob.id === job.id : true;
       const color = isSelected ? '#9cd33b' : '#3b82f6'; // Volitix Green if selected, Blue if background job
       
       // Add standard pin if lat/lon exist
       if (job.finalLat && job.finalLon && !isNaN(job.finalLat) && !isNaN(job.finalLon)) {
           const marker = window.L.marker([job.finalLat, job.finalLon]);
           if (job.title || job.customer) marker.bindPopup(`<b>${job.title || job.customer}</b>`);
           fg.addLayer(marker);
           hasLayers = true;
       }

       // Parse and render KML boundaries if omnivore is available
       if (job.kmlData && window.omnivore) {
           try {
               const customStyle = window.L.geoJson(null, {
                   style: function() { 
                       return { 
                           color: color, 
                           weight: isSelected ? 4 : 2, 
                           opacity: 1, 
                           fillColor: color, 
                           fillOpacity: isSelected ? 0.4 : 0.1 
                       }; 
                   }
               });
               const runLayer = window.omnivore.kml.parse(job.kmlData, null, customStyle);
               fg.addLayer(runLayer);
               hasLayers = true;
           } catch(e) {
               console.error('KML Parse error', e);
           }
       }
    });

    if (hasLayers) {
        setTimeout(() => {
            if (fg.getBounds().isValid()) {
                map.fitBounds(fg.getBounds(), { padding: [20, 20], maxZoom: 16 });
            }
        }, 100);
    }
  }, [lat, lon, kmlData, jobs, selectedJob]);

  return (
      <div 
        ref={mapContainerRef} 
        className="w-full h-full rounded-[2.5rem] overflow-hidden bg-slate-900 border border-slate-800" 
        style={{minHeight: '300px', zIndex: 1}} 
      />
  );
};

// --- CANVAS PREVIEW ONLY ---
// This default export ensures the previewer does not crash and provides a visual test of the map frame.
export default function App() {
  return (
    <div className="p-10 bg-slate-950 min-h-screen text-slate-200 flex flex-col items-center">
      <div className="max-w-4xl w-full">
         <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Leaflet Map Module</h1>
         <p className="text-[#9cd33b] text-[10px] font-black uppercase tracking-widest mb-8">Part 137 Boundary Verification Frame</p>
         
         <div className="h-[400px] w-full rounded-[2.5rem] border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden relative">
             <div className="text-center p-6 z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-slate-800">
                 <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Map Frame Initialized</p>
                 <p className="text-[#9cd33b] text-xs mt-2">Requires Leaflet CDN in actual deployment.</p>
             </div>
         </div>
      </div>
    </div>
  );
}
