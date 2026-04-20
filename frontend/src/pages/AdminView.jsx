import { useState } from 'react';

const DUMMY_EVENTS = [
  { _id: '1', name: 'Campus Spring Festival', location: 'TU München – Audimax', date: '2025-05-10', isActive: true, stations: [{ name: 'Drinks' }, { name: 'Grill' }, { name: 'Merch' }] },
  { _id: '2', name: 'AStA Summer Party', location: 'Olympiapark', date: '2025-07-20', isActive: false, stations: [{ name: 'Bar' }, { name: 'Food Truck' }] },
];

export default function AdminView() {
  const [events, setEvents] = useState(DUMMY_EVENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', location: '', date: '', stations: '' });

  const handleCreate = (e) => {
    e.preventDefault();
    const newEvent = {
      _id: String(Date.now()),
      name: form.name,
      location: form.location,
      date: form.date,
      isActive: false,
      stations: form.stations.split(',').map(s => ({ name: s.trim() })).filter(s => s.name),
    };
    setEvents(prev => [newEvent, ...prev]);
    setForm({ name: '', location: '', date: '', stations: '' });
    setShowForm(false);
  };

  const toggleActive = (id) =>
    setEvents(prev => prev.map(e => e._id === id ? { ...e, isActive: !e.isActive } : e));

  const deleteEvent = (id) =>
    setEvents(prev => prev.filter(e => e._id !== id));

  return (
    <div>
      <div className="page-header">
        <h1>🎛 Admin Dashboard</h1>
        <p>No-code event configurator — create and manage your events &amp; stations.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value">{events.length}</div>
          <div className="stat-label">Total Events</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{events.filter(e => e.isActive).length}</div>
          <div className="stat-label">Live Now</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{events.reduce((s, e) => s + e.stations.length, 0)}</div>
          <div className="stat-label">Stations</div>
        </div>
      </div>

      {/* Create button */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cancel' : '＋ New Event'}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', fontWeight: 700 }}>Create New Event</h2>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label>Event Name</label>
                <input required placeholder="e.g. Campus Spring Festival" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input placeholder="e.g. TU München – Audimax" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Date</label>
                <input required type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Stations (comma-separated)</label>
                <input placeholder="Drinks, Grill, Merch" value={form.stations} onChange={e => setForm(p => ({ ...p, stations: e.target.value }))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">Create Event</button>
          </form>
        </div>
      )}

      {/* Event Cards */}
      <div className="grid-3">
        {events.map(event => (
          <div className="card" key={event._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{event.name}</h3>
              {event.isActive
                ? <span className="badge badge-ready"><span className="status-dot online" /> Live</span>
                : <span className="badge badge-pending">Inactive</span>}
            </div>
            <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              📍 {event.location || '—'} &nbsp;·&nbsp; 📅 {event.date}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1rem' }}>
              {event.stations.map((s, i) => (
                <span key={i} className="badge badge-processing">{s.name}</span>
              ))}
            </div>
            <div className="divider" />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn btn-sm ${event.isActive ? 'btn-danger' : 'btn-success'}`} onClick={() => toggleActive(event._id)}>
                {event.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button className="btn btn-sm btn-danger" onClick={() => deleteEvent(event._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
