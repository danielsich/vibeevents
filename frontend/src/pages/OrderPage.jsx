import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// ── Stripe setup ─────────────────────────────────────────────────────────────
// Set VITE_STRIPE_PUBLISHABLE_KEY in frontend/.env for real Stripe.
// Leave unset to use "Demo Mode" (order placed without real payment).
const stripePromise = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
  : null;

// ── Demo menu fallback (used when no backend/DB is available) ─────────────────
const DEMO_STATION = {
  name: 'Drinks Bar 🍺',
  menuItems: [
    { _id: 'm1', name: 'Cold Beer (0.5L)',      price: 450, description: 'Crispy Helles' },
    { _id: 'm2', name: 'Hugo Spritz',           price: 550, description: 'Elderflower, Prosecco' },
    { _id: 'm3', name: 'Cola / Fanta / Sprite', price: 200, description: '0.33L can' },
    { _id: 'm4', name: 'Club Mate',             price: 250, description: '0.5L bottle' },
    { _id: 'm5', name: 'Water (still)',         price: 150, description: '0.5L bottle' },
  ],
};

// ── Cart helpers ──────────────────────────────────────────────────────────────
const fmt = (cents) => `€${(cents / 100).toFixed(2)}`;

// ── Stripe Checkout Form ──────────────────────────────────────────────────────
function StripeCheckoutForm({ amount, onSuccess, onError, guestName, cart, eventId, stationId }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setCardError('');

    try {
      // 1. Create PaymentIntent on backend
      const res = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount, 
          currency: 'eur', 
          metadata: { 
            eventId: eventId || '', 
            stationId: stationId || '' 
          } 
        }),
      });
      const data = await res.json();

      if (!data.clientSecret) {
        setCardError(data.message || 'Payment initialization failed. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Confirm card payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (error) {
        setCardError(error.message);
        setLoading(false);
        return;
      }

      // 3. Place order in backend
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId, stationId, guestName,
          items: cart.map(i => ({ name: i.name, quantity: i.qty, price: i.price })),
          stripePaymentIntentId: paymentIntent.id,
        }),
      });
      const orderData = await orderRes.json();
      onSuccess(orderData.data);
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{
        background: 'var(--color-surface2)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem 1rem',
        marginBottom: '0.75rem',
      }}>
        <CardElement options={{
          hidePostalCode: true,
          style: {
            base: {
              fontSize: '16px',
              color: '#e8eaf0',
              fontFamily: 'Inter, system-ui, sans-serif',
              '::placeholder': { color: '#7c8499' },
            },
            invalid: { color: '#ff5c6c' },
          },
        }} />
      </div>
      {cardError && (
        <p style={{ color: 'var(--color-danger)', fontSize: '0.82rem', marginBottom: '0.75rem' }}>{cardError}</p>
      )}
      <p style={{ color: 'var(--color-muted)', fontSize: '0.78rem', marginBottom: '1rem' }}>
        🔒 Test card: <span style={{ fontFamily: 'monospace', color: 'var(--color-accent)' }}>4242 4242 4242 4242</span> · any expiry · any CVC
      </p>
      <button
        type="submit"
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
        disabled={!stripe || loading}
      >
        {loading ? '⏳ Processing…' : `Pay ${fmt(amount)}`}
      </button>
    </form>
  );
}

// ── Demo (No-Stripe) Checkout Form ────────────────────────────────────────────
function DemoCheckoutForm({ amount, onSuccess, guestName, cart, eventId, stationId }) {
  const [loading, setLoading] = useState(false);

  const handleDemoPay = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId, stationId, guestName,
          items: cart.map(i => ({ name: i.name, quantity: i.qty, price: i.price })),
        }),
      }).then(r => r.json());
      onSuccess(res.data);
    } catch {
      // No backend – generate a local demo token
      await new Promise(r => setTimeout(r, 800));
      onSuccess({ guestToken: `demo-${Date.now().toString(36)}`, status: 'pending', queuePosition: 1 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{
        background: 'rgba(255,179,71,0.1)',
        border: '1px solid rgba(255,179,71,0.3)',
        borderRadius: 'var(--radius-sm)',
        padding: '0.85rem 1rem',
        marginBottom: '1rem',
        fontSize: '0.82rem',
        color: 'var(--color-warn)',
      }}>
        ⚠️ <strong>Demo Mode</strong> — No Stripe key configured. Payments are simulated.
        Add <code style={{ background: 'rgba(255,179,71,0.15)', padding: '0 4px', borderRadius: 3 }}>VITE_STRIPE_PUBLISHABLE_KEY</code> to <code>frontend/.env</code> to enable real Stripe.
      </div>
      <button
        className="btn btn-primary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '1rem' }}
        disabled={loading}
        onClick={handleDemoPay}
      >
        {loading ? '⏳ Processing…' : `✅ Confirm Demo Order (${fmt(amount)})`}
      </button>
    </div>
  );
}

// ── Order Confirmation Screen ─────────────────────────────────────────────────
function OrderConfirmation({ order }) {
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
      <div className="card">
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🎉</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h2>
        <p style={{ color: 'var(--color-muted)', marginBottom: '1.5rem' }}>
          Your order is in the queue. Show this token if asked.
        </p>

        <div style={{
          background: 'var(--color-surface2)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Your Order Token
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '1.4rem',
            fontWeight: 800,
            color: 'var(--color-accent)',
            letterSpacing: '0.1em',
          }}>
            {order?.guestToken || 'N/A'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>#{order?.queuePosition || '?'}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase' }}>Queue Position</div>
          </div>
          <div>
            <div>
              <span className={`badge badge-${order?.status || 'pending'}`}>{order?.status || 'pending'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', textTransform: 'uppercase', marginTop: '0.25rem' }}>Status</div>
          </div>
        </div>

        <p style={{ color: 'var(--color-muted)', fontSize: '0.82rem' }}>
          📱 You can track your order at <strong>{window.location.origin}/guest</strong>
        </p>
      </div>
    </div>
  );
}

// ── Main Order Page ───────────────────────────────────────────────────────────
export default function OrderPage() {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('event');
  const stationId = searchParams.get('station');

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [guestName, setGuestName] = useState('');
  const [step, setStep] = useState('menu'); // 'menu' | 'checkout' | 'done'
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Fetch station + menu from backend
  useEffect(() => {
    const fetchStation = async () => {
      try {
        const res = await fetch(`/api/events/${eventId}`);
        const data = await res.json();
        const st = data.data?.stations?.find(s => s._id === stationId);
        setStation(st || DEMO_STATION);
      } catch {
        setStation(DEMO_STATION);
      } finally {
        setLoading(false);
      }
    };

    if (eventId && stationId) {
      fetchStation();
    } else {
      setStation(DEMO_STATION);
      setLoading(false);
    }
  }, [eventId, stationId]);

  const cartItems = Object.values(cart).filter(i => i.qty > 0);
  const totalCents = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  const addItem = (item) =>
    setCart(c => ({ ...c, [item._id]: { ...item, qty: (c[item._id]?.qty || 0) + 1 } }));

  const removeItem = (id) =>
    setCart(c => {
      const qty = (c[id]?.qty || 0) - 1;
      if (qty <= 0) { const { [id]: _, ...rest } = c; return rest; }
      return { ...c, [id]: { ...c[id], qty } };
    });

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-muted)' }}>
      Loading menu…
    </div>
  );

  if (step === 'done') return <OrderConfirmation order={confirmedOrder} />;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>🛒</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{station?.name}</h1>
        <p style={{ color: 'var(--color-muted)', fontSize: '0.875rem' }}>Choose your items and pay below</p>
      </div>

      {step === 'menu' && (
        <>
          {/* Menu Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {station?.menuItems?.map(item => {
              const qty = cart[item._id]?.qty || 0;
              return (
                <div key={item._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    {item.description && (
                      <div style={{ color: 'var(--color-muted)', fontSize: '0.8rem' }}>{item.description}</div>
                    )}
                    <div style={{ color: 'var(--color-accent)', fontWeight: 700, marginTop: '0.2rem' }}>{fmt(item.price)}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => removeItem(item._id)}
                      disabled={qty === 0}
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >−</button>
                    <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => addItem(item)}
                      style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cart summary + proceed */}
          {cartItems.length > 0 && (
            <div className="card" style={{ position: 'sticky', bottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700 }}>Total ({cartItems.reduce((s,i)=>s+i.qty,0)} items)</span>
                <span style={{ fontWeight: 800, color: 'var(--color-accent)' }}>{fmt(totalCents)}</span>
              </div>
              <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                <label>Your Name</label>
                <input
                  placeholder="e.g. Anna M."
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={!guestName.trim()}
                onClick={() => setStep('checkout')}
              >
                → Proceed to Payment
              </button>
            </div>
          )}
        </>
      )}

      {step === 'checkout' && (
        <div className="card">
          <h2 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Complete Your Order</h2>

          {/* Order summary */}
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {cartItems.map(i => (
              <li key={i._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span>{i.name} × {i.qty}</span>
                <span>{fmt(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="divider" />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.05rem', marginBottom: '1.5rem' }}>
            <span>Total</span><span style={{ color: 'var(--color-accent)' }}>{fmt(totalCents)}</span>
          </div>

          {/* Payment */}
          {stripePromise ? (
            <Elements stripe={stripePromise}>
              <StripeCheckoutForm
                amount={totalCents}
                guestName={guestName}
                cart={cartItems}
                eventId={eventId}
                stationId={stationId}
                onSuccess={order => { setConfirmedOrder(order); setStep('done'); }}
                onError={msg => alert(`Payment failed: ${msg}`)}
              />
            </Elements>
          ) : (
            <DemoCheckoutForm
              amount={totalCents}
              guestName={guestName}
              cart={cartItems}
              eventId={eventId}
              stationId={stationId}
              onSuccess={order => { setConfirmedOrder(order); setStep('done'); }}
            />
          )}

          <button
            className="btn"
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', background: 'transparent', color: 'var(--color-muted)' }}
            onClick={() => setStep('menu')}
          >
            ← Back to Menu
          </button>
        </div>
      )}
    </div>
  );
}