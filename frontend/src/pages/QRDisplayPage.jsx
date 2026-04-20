import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Demo events – in production these come from GET /api/events
const DEMO_EVENTS = [
  {
    _id: '6650000000000000deadbeef',
    name: 'Campus Spring Festival 2025',
    location: 'TU München – Audimax Plaza',
    stations: [
      { _id: '6650000000000000dead0001', name: 'Drinks Bar 🍺' },
      { _id: '6650000000000000dead0002', name: 'Grill Station 🔥' },
      { _id: '6650000000000000dead0003', name: 'Merch & Snacks 🎽' },
    ],
  },
];

const BASE_URL = window.location.origin; // e.g. http://localhost:3000

export default function QRDisplayPage() {
  const [selectedEvent, setSelectedEvent] = useState(DEMO_EVENTS[0]);
  const [selectedStation, setSelectedStation] = useState(DEMO_EVENTS[0].stations[0]);
  const [customLabel, setCustomLabel] = useState('');
  const qrRef = useRef(null);

  const orderUrl = `${BASE_URL}/order?event=${selectedEvent._id}&station=${selectedStation._id}`;
  const displayLabel = customLabel || `${selectedEvent.name} · ${selectedStation.name}`;

  const handleEventChange = (e) => {
    const ev = DEMO_EVENTS.find(ev => ev._id === e.target.value);
    setSelectedEvent(ev);
    setSelectedStation(ev.stations[0]);
  };

  const handlePrint = () => window.print();

  const handleDownloadSVG = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${selectedStation.name.replace(/\s/g, '-').toLowerCase()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <h1>📱 QR Code Generator</h1>
        <p>Display or print this QR code at your station — guests scan to order directly.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* ── Config Panel ── */}
        <div className="card">
          <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Configure QR Code</h2>

          <div className="form-group">
            <label>Event</label>
            <select value={selectedEvent._id} onChange={handleEventChange}>
              {DEMO_EVENTS.map(ev => (
                <option key={ev._id} value={ev._id}>{ev.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Station</label>
            <select value={selectedStation._id} onChange={e => {
              const st = selectedEvent.stations.find(s => s._id === e.target.value);
              setSelectedStation(st);
            }}>
              {selectedEvent.stations.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Custom Label (optional)</label>
            <input
              placeholder={`${selectedEvent.name} · ${selectedStation.name}`}
              value={customLabel}
              onChange={e => setCustomLabel(e.target.value)}
            />
          </div>

          <div className="divider" />

          <div className="form-group">
            <label>Generated URL</label>
            <input
              readOnly
              value={orderUrl}
              style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--color-accent)' }}
              onFocus={e => e.target.select()}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button className="btn btn-primary" onClick={handlePrint}>🖨 Print</button>
            <button className="btn btn-success" onClick={handleDownloadSVG}>⬇ Download SVG</button>
          </div>
        </div>

        {/* ── QR Preview ── */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div ref={qrRef} id="qr-print-area" style={{
            background: '#fff',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            display: 'inline-block',
            marginBottom: '1.25rem',
          }}>
            <QRCodeSVG
              value={orderUrl}
              size={240}
              bgColor="#ffffff"
              fgColor="#0d0f14"
              level="H"
              includeMargin={false}
            />
            <div style={{
              marginTop: '1rem',
              color: '#0d0f14',
              fontWeight: 700,
              fontSize: '0.9rem',
              maxWidth: 240,
              textAlign: 'center',
              lineHeight: 1.3,
            }}>
              {displayLabel}
            </div>
            <div style={{ color: '#666', fontSize: '0.72rem', marginTop: '0.3rem' }}>
              Scan to order &amp; pay
            </div>
          </div>

          <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>
            Customers scan this with their phone camera — no app needed.
          </p>
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #qr-print-area, #qr-print-area * { visibility: visible; }
          #qr-print-area {
            position: fixed;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </div>
  );
}
