'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editLimitValue, setEditLimitValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const router = useRouter();

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/companies');
      if (!res.ok) throw new Error('Failed to load companies');
      const data = await res.json();
      setCompanies(data.companies);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/login');
      return;
    }
    fetchCompanies();
  }, [router]);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    setError('');
    const name = e.target.name.value;
    const credit_limit = parseFloat(e.target.credit_limit.value);

    setSubmitting(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, credit_limit })
      });
      if (res.ok) {
        e.target.reset();
        fetchCompanies(); // refresh list
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create company');
      }
    } catch (err) {
      setError('Error creating company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      const res = await fetch(`/api/companies?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setConfirmDeleteId(null);
        fetchCompanies();
      } else {
        setError('Failed to delete company');
      }
    } catch (err) {
      setError('Error deleting company');
    }
  };

  const startEditing = (company, e) => {
    e.stopPropagation();
    setError('');
    setEditingId(company.id);
    setEditLimitValue(company.credit_limit);
  };

  const handleUpdateLimit = async (id, e) => {
    e.stopPropagation();
    setError('');
    const newLimit = parseFloat(editLimitValue);
    if (isNaN(newLimit) || newLimit < 0) {
      setError('Please enter a valid positive number for the credit limit.');
      return;
    }

    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, credit_limit: newLimit })
      });
      
      if (res.ok) {
        setEditingId(null);
        fetchCompanies();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update credit limit');
      }
    } catch (err) {
      setError('Error updating credit limit');
    }
  };

  const handleSelectCompany = (company) => {
    // Store selected company context and route to dashboard
    localStorage.setItem('activeCompany', JSON.stringify(company));
    router.push('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('activeCompany');
    router.push('/login');
  };

  if (loading) return <div className="container" style={{ padding: '2rem' }}>Loading Companies...</div>;

  return (
    <div className="container animate-fade-in-up" style={{ padding: '2rem 0' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ marginBottom: '0.25rem' }}>Admin Hub</h1>
           <p className="text-muted">Manage B2B Companies</p>
        </div>
        <button onClick={handleLogout} className="btn" style={{ border: '1px solid var(--border)' }}>Logout Admin</button>
      </header>

      {error && <div className="card text-error animate-fade-in-up" style={{ marginBottom: '2rem' }}>{error}</div>}

      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'minmax(300px, 1fr) 2fr' }}>
        
        {/* Create Company Form */}
        <section className="card animate-fade-in-up delay-100">
           <h2>Add New Company</h2>
           <form onSubmit={handleCreateCompany} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
             <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Company Name</label>
                <input type="text" name="name" className="input-field" placeholder="e.g. Acme Corp" required disabled={submitting} />
             </div>
             <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Initial Credit Limit (₹)</label>
                <input type="number" name="credit_limit" min="0" step="100" className="input-field" placeholder="10000" required disabled={submitting} />
             </div>
             <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Company'}
             </button>
           </form>
        </section>

        {/* Company List */}
        <section className="card animate-fade-in-up delay-200">
           <h2>Registered Companies</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
             {loading ? (
               // Loading Skeletons for companies list
               Array.from({ length: 3 }).map((_, i) => (
                 <div key={i} className="skeleton" style={{ height: '80px', width: '100%', marginBottom: '1rem' }}></div>
               ))
             ) : companies.length === 0 ? (
               <p className="text-muted">No companies found.</p>
             ) : (
               companies.map((company, index) => (
                 <div key={company.id} className={`row-hover animate-fade-in-up delay-${Math.min((index + 3) * 100, 500)}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--background)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => handleSelectCompany(company)}>
                      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem', color: 'var(--primary)', textDecoration: 'underline' }}>{company.name}</h3>
                      <div className="text-muted" style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        Limit: 
                        {editingId === company.id ? (
                          <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="number" 
                              value={editLimitValue} 
                              onChange={(e) => setEditLimitValue(e.target.value)}
                              className="input-field"
                              style={{ padding: '0.25rem', width: '100px', fontSize: '0.875rem' }}
                            />
                            <button onClick={(e) => handleUpdateLimit(company.id, e)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Save</button>
                            <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Cancel</button>
                          </div>
                        ) : (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            ₹{company.credit_limit.toLocaleString()}
                            <button onClick={(e) => startEditing(company, e)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.75rem' }}>Edit</button>
                          </span>
                        )}
                        | Debt: <span className={company.current_debt > 0 ? "text-error" : ""}>₹{company.current_debt.toLocaleString()}</span>
                      </div>
                    </div>
                    <div style={{ marginLeft: '1rem' }}>
                       {confirmDeleteId === company.id ? (
                         <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                           <span className="text-error" style={{ fontSize: '0.875rem' }}>Are you sure?</span>
                           <button onClick={(e) => { e.stopPropagation(); handleDelete(company.id); }} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'white', background: 'var(--error)', border: 'none' }}>Yes</button>
                           <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(null); }} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>No</button>
                         </div>
                       ) : (
                         <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(company.id); }} className="btn" style={{ padding: '0.5rem', color: 'var(--error)', borderColor: 'var(--error)', background: 'transparent' }}>Delete</button>
                       )}
                    </div>
                 </div>
               ))
             )}
           </div>
        </section>

      </div>
    </div>
  );
}
