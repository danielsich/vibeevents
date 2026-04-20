import { useState } from 'react';

const DUMMY_ORDERS = [
  { _id: 'o1', guestName: 'Anna M.', items: [{ name: 'Beer', quantity: 2, price: 400 }, { name: 'Water', quantity: 1, price: 150 }], status: 'pending', queuePosition: 1, totalAmount: 950 },
  { _id: 'o2', guestName: 'Max K.', items: [{ name: 'Burger', quantity: 1, price: 850 }], status: 'processing', queuePosition: 2, totalAmount: 850 },
  { _id: 'o3', guestName: 'Sara L.', items: [{ name: 'Fries', quantity: 2, price: 350 }], status: 'ready', queuePosition: 3, totalAmount: 700 },
  { _id: 'o4', guestName: 'Felix B.', items: [{ name: 'Cola', quantity: 3, price: 300 }], status: 'completed', queuePosition: 4, totalAmount: 900 },
];

const STATUS_FLOW = { pending: 'processing', processing: 'ready', ready: 'completed' };
const BADGE_MAP = {
  pending: 'badge-pending', processing: 'badge-processing',
  ready: 'badge-ready', completed: 'badge-completed', cancelled: 'badge-cancelled',
};

export default function StationView() {
  const [orders, setOrders] = useState(DUMMY_ORDERS);
  const [filter, setFilter] = useState('all');

  const advance = (id) =>
    setOrders(prev => prev.map(o =>
      o._id === id && STATUS_FLOW[o.status]
        ? { ...o, status: STATUS_FLOW[o.status] }
        : o
    ));

  const cancel = (id) =>
    setOrders(prev => prev.map(o => o._id === id ? { ...o, status: 'cancelled' } : o));

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = { pending: 0, processing: 0, ready: 0, completed: 0 };
  orders.forEach(o => { if (counts[o.status] !== undefined) counts[o.status]++; });

  return (
    <div>
      <div className="page-header">
        <h1>🏪 Station View</h1>
        <p>Process incoming guest orders – advance status or cancel.</p>
      </div>

      {/* Stats */}
      <div className="stats-row">
        {Object.entries(counts).map(([key, val]) => (
          <div className="stat-card" key={key}>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{key}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'processing', 'ready', 'completed'].map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filter === s ? 'btn-primary' : ''}`}
            style={filter !== s ? { background: 'var(--color-surface2)', color: 'var(--color-muted)' } : {}}
            onClick={() => setFilter(s)}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== 'all' && counts[s] !== undefined ? ` (${counts[s]})` : ''}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      <div className="grid-3">
        {filtered.map(order => (
          <div className="card" key={order._id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{order.guestName}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>Queue #{order.queuePosition}</div>
              </div>
              <span className={`badge ${BADGE_MAP[order.status]}`}>{order.status}</span>
            </div>

            <div className="divider" />

            <ul style={{ listStyle: 'none', margin: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {order.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span style={{ color: 'var(--color-muted)' }}>€{(item.price * item.quantity / 100).toFixed(2)}</span>
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1rem' }}>
              <span>Total</span>
              <span style={{ fontWeight: 700, color: 'var(--color-text)' }}>€{(order.totalAmount / 100).toFixed(2)}</span>
            </div>

            <div className="divider" />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              {STATUS_FLOW[order.status] && (
                <button className="btn btn-sm btn-success" onClick={() => advance(order._id)}>
                  → {STATUS_FLOW[order.status]}
                </button>
              )}
              {order.status !== 'completed' && order.status !== 'cancelled' && (
                <button className="btn btn-sm btn-danger" onClick={() => cancel(order._id)}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ color: 'var(--color-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '3rem' }}>
            No orders in this category.
          </div>
        )}
      </div>
    </div>
  );
}
