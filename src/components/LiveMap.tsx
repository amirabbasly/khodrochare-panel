"use client";
import { useEffect, useRef } from 'react';
import type { Person } from '@/lib/types';
import 'leaflet/dist/leaflet.css';
export default function LiveMap({ people, selected, onSelect }: { people: Person[]; selected: string | null; onSelect: (id: string) => void }) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<import('leaflet').Map | null>(null);
  const boundsKey = useRef('');
  const layer = useRef<import('leaflet').LayerGroup | null>(null);
  useEffect(() => {
    let cancelled = false;
    import('leaflet').then(L => {
      if (cancelled || !element.current) return;
      map.current = L.map(element.current, { center: [32.4, 53.6], zoom: 5 });
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map.current);
      layer.current = L.layerGroup().addTo(map.current);
    });
    return () => { cancelled = true; map.current?.remove(); map.current = null; layer.current = null; };
  }, []);
  useEffect(() => {
    let cancelled = false;
    import('leaflet').then(L => {
      if (cancelled || !layer.current || !map.current) return;
      layer.current.clearLayers();
      const points = people.filter(p => p.location);
      for (const person of points) {
        const loc = person.location!;
        const marker = L.circleMarker([loc.latitude, loc.longitude], { radius: selected === person.id ? 12 : 8, color: '#fff', weight: 2, fillColor: person.role === 'DRIVER' ? '#f58a3b' : '#34b7cf', fillOpacity: loc.fresh ? 1 : .3 });
        const label = document.createElement('span'); label.textContent = `${person.fullName} · ${person.role === 'DRIVER' ? 'امدادگر' : 'مشتری'} · ${loc.fresh ? 'تازه' : 'قدیمی'}`;
        marker.bindTooltip(label).on('click', () => onSelect(person.id)).addTo(layer.current);
      }
      const focus = points.find(p => p.id === selected)?.location;
      if (focus) map.current.setView([focus.latitude, focus.longitude], 13);
      else if (points.length) { const key = points.map(p => p.id).sort().join(','); if (boundsKey.current !== key) { map.current.fitBounds(L.latLngBounds(points.map(p => [p.location!.latitude, p.location!.longitude])), { padding: [35, 35], maxZoom: 11 }); boundsKey.current = key; } }
    });
    return () => { cancelled = true; };
  }, [people, selected, onSelect]);
  return <div className="live-map" ref={element} aria-label="نقشه موقعیت مشتریان و امدادگران" />;
}
