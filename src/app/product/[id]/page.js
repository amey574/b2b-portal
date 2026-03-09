'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProductDetail({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const [activeCompany, setActiveCompany] = useState(null);
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Real-time calculation state
  const [currentUnitPrice, setCurrentUnitPrice] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      const storedCompany = localStorage.getItem('activeCompany');
      if (!storedCompany) {
        router.push('/companies');
        return;
      }
      setActiveCompany(JSON.parse(storedCompany));

      try {
        const res = await fetch(`/api/products/${unwrappedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
          calculatePricing(data, 1);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError('Failed to fetch product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [unwrappedParams.id, router]);

  const calculatePricing = (prodData, qty) => {
    if (!prodData || !prodData.tiers) return;
    
    let activePrice = prodData.base_price;
    
    // Find matching tier
    for (const tier of prodData.tiers) {
      const max = tier.max_quantity === null ? Infinity : tier.max_quantity;
      if (qty >= tier.min_quantity && qty <= max) {
        activePrice = tier.unit_price;
        break;
      }
    }
    
    setCurrentUnitPrice(activePrice);
    setTotalPrice(activePrice * qty);
  };

  const handleQuantityChange = (e) => {
    const val = parseInt(e.target.value, 10);
    const newQty = isNaN(val) ? 0 : val;
    setQuantity(newQty);
    calculatePricing(product, newQty);
  };

  const handleOrder = async () => {
    if (quantity <= 0) {
      setError('Please enter a valid quantity.');
      return;
    }
    
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: activeCompany.id,
          productId: product.id,
          quantity: quantity
        })
      });

      const data = await res.json();

      if (res.ok) {
        // Pass order details via URL query parameters for simplicity in MVP
        const queryParams = new URLSearchParams({
          orderId: data.orderId,
          quantity: data.quantity,
          unitPrice: data.unitPrice,
          totalAmount: data.totalAmount,
          newCredit: data.newAvailableCredit,
          productName: product.name
        }).toString();
        
        router.push(`/order-confirmation?${queryParams}`);
      } else {
        setError(data.message || 'Failed to place order.');
      }
    } catch (err) {
      setError('An error occurred while placing your order.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Product...</div>;
  if (!product) return <div className="container" style={{ padding: '2rem' }}>Product not found. <Link href="/dashboard" className="text-primary">Return to dashboard.</Link></div>;

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: '800px' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <Link href="/dashboard" className="text-link" style={{ marginBottom: '1rem' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </Link>
        <h1>{product.name}</h1>
      </div>

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(300px, 1.5fr) 1fr' }}>
        
        {/* Tier Pricing Table */}
        <section className="card">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Bulk Pricing Tiers</h2>
          <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ background: 'var(--background)' }}>
                <tr>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Quantity</th>
                  <th style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>Price per Unit</th>
                </tr>
              </thead>
              <tbody>
                {product.tiers.map((tier, idx) => (
                  <tr key={idx} className="row-hover" style={{ 
                    borderBottom: idx === product.tiers.length - 1 ? 'none' : '1px solid var(--border)',
                    background: (quantity >= tier.min_quantity && quantity <= (tier.max_quantity || Infinity)) ? 'var(--surface-hover)' : 'transparent',
                    transition: 'all 0.2s ease',
                  }}>
                    <td style={{ padding: '1rem' }}>
                      {tier.min_quantity}{tier.max_quantity ? ` - ${tier.max_quantity}` : '+'} units
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>₹{tier.unit_price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Order Calculator Form */}
        <section className="card" style={{ display: 'flex', flexDirection: 'column', alignSelf: 'start', position: 'sticky', top: '2rem' }}>
           <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Calculator</h2>
           
           <div style={{ marginBottom: '1.5rem' }}>
             <label htmlFor="qty" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Quantity desired:</label>
             <input 
                id="qty" 
                type="number" 
                min="1" 
                className="input-field" 
                value={quantity} 
                onChange={handleQuantityChange}
             />
           </div>

           <div style={{ background: 'var(--background)', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span className="text-muted">Unit Price</span>
                <span>₹{currentUnitPrice.toFixed(2)}</span>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ fontWeight: 600 }}>Total</span>
                <span style={{ fontWeight: 700, fontSize: '1.5rem', color: 'var(--primary)' }}>₹{totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
             </div>
           </div>

           {error && <div className="text-error" style={{ marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

           <button 
             className="btn btn-primary" 
             onClick={handleOrder}
             disabled={submitting || quantity <= 0}
             style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
           >
             {submitting ? 'Processing Order...' : 'Place Order via Credit'}
           </button>
        </section>

      </div>
    </div>
  );
}
