'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Dashboard() {
  const [activeCompany, setActiveCompany] = useState(null);
  const [creditInfo, setCreditInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      const storedCompany = localStorage.getItem('activeCompany');
      if (!storedCompany) {
        router.push('/companies');
        return;
      }

      const parsedCompany = JSON.parse(storedCompany);
      setActiveCompany(parsedCompany);

      try {
        // Fetch Credit Info
        const companyRes = await fetch(`/api/company?companyId=${parsedCompany.id}`);
        if (companyRes.ok) {
           const companyData = await companyRes.json();
           setCreditInfo(companyData);
        } else {
           throw new Error('Failed to load company credit profile.');
        }

        // Fetch Products
        const prodRes = await fetch(`/api/products`);
        if (prodRes.ok) {
           const prodData = await prodRes.json();
           setProducts(prodData.products);
        } else {
           throw new Error('Failed to load products.');
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [router]);

  const handleBackToAdmin = () => {
    localStorage.removeItem('activeCompany');
    router.push('/companies');
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Dashboard...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ marginBottom: '0.25rem' }}>Dashboard</h1>
           <p className="text-muted">Viewing data for {activeCompany?.name}</p>
        </div>
        <button onClick={handleBackToAdmin} className="text-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Admin Hub
        </button>
      </header>

      {error && <div className="card text-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        
        {/* Credit Summary Board */}
        <section className="card">
           <h2>Credit Summary</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                 <span className="text-muted">Credit Limit</span>
                 <span style={{ fontWeight: 600 }}>₹{creditInfo?.credit_limit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                 <span className="text-muted">Current Debt</span>
                 <span className="text-error" style={{ fontWeight: 600 }}>₹{creditInfo?.current_debt?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
                 <span style={{ fontWeight: 600 }}>Available Credit</span>
                 <span className="text-success" style={{ fontWeight: 700, fontSize: '1.25rem' }}>₹{creditInfo?.available_credit?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

           </div>
        </section>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--background)', borderRadius: '8px', border: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Repay Debt</h3>
             <form onSubmit={async (e) => {
               e.preventDefault();
               const amount = parseFloat(e.target.amount.value);
               if (isNaN(amount) || amount <= 0) return;
               
               setError(''); // Clear previous errors
               if (amount > creditInfo.current_debt) {
                  setError('You cannot repay more than your current debt.');
                  return;
               }

               try {
                 const res = await fetch('/api/company/repay', {
                   method: 'POST',
                   headers: { 'Content-Type': 'application/json' },
                   body: JSON.stringify({ companyId: activeCompany.id, amount })
                 });
                 
                 const data = await res.json();
                 if (res.ok) {
                    setCreditInfo(prev => ({
                      ...prev,
                      current_debt: data.newCurrentDebt,
                      available_credit: data.newAvailableCredit
                    }));
                    e.target.reset();
                 } else {
                    setError(data.message || 'Payment failed');
                 }
               } catch (err) {
                 setError('Error processing payment');
               }
             }}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ position: 'relative', flex: 1 }}>
                   <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                   <input 
                     type="number" 
                     name="amount"
                     min="0.01" 
                     step="0.01"
                     max={creditInfo?.current_debt}
                     className="input-field" 
                     style={{ paddingLeft: '2rem' }}
                     placeholder="Amount to repay" 
                     required 
                     disabled={!creditInfo || creditInfo.current_debt <= 0}
                   />
                 </div>
                 <button 
                   type="submit" 
                   className="btn btn-primary"
                   disabled={!creditInfo || creditInfo.current_debt <= 0}
                 >
                   Make Payment
                 </button>
               </div>
             </form>
          </div>


        {/* Product List */}
        <section className="card">
           <h2>Available Products</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
             {products.length === 0 ? (
               <p className="text-muted">No products available at this time.</p>
             ) : (
               products.map(product => (
                 <div key={product.id} className="row-hover" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{product.name}</h3>
                      <p className="text-muted" style={{ fontSize: '0.875rem' }}>Base Price: ₹{product.base_price.toFixed(2)}</p>
                    </div>
                    <Link href={`/product/${product.id}`} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}>
                      View Bulk Pricing
                    </Link>
                 </div>
               ))
             )}
           </div>
        </section>

      </div>
    </div>
  );
}
