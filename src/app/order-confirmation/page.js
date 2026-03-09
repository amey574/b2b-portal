'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function OrderDetails() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const productName = searchParams.get('productName');
  const quantity = searchParams.get('quantity');
  const unitPrice = searchParams.get('unitPrice');
  const totalAmount = searchParams.get('totalAmount');
  const newCredit = searchParams.get('newCredit');

  if (!orderId) {
    return (
      <div className="container" style={{ padding: '2rem 0', textAlign: 'center' }}>
        <Link href="/dashboard" className="text-link" style={{ justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '4rem 0', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '600px', width: '100%' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
             width: '64px', height: '64px', background: 'var(--success)', 
             borderRadius: '50%', display: 'flex', alignItems: 'center', 
             justifyContent: 'center', margin: '0 auto 1.5rem auto'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h1>Order Confirmed!</h1>
          <p className="text-muted">Order #{orderId.padStart(6, '0')} has been successfully placed via your credit account.</p>
        </div>

        <div style={{ background: 'var(--background)', borderRadius: '8px', padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Receipt</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted">Product</span>
            <span style={{ fontWeight: 500 }}>{productName}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted">Quantity</span>
            <span>{quantity} units</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span className="text-muted">Unit Price</span>
            <span>₹{parseFloat(unitPrice).toFixed(2)}</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)' }}>
            <span style={{ fontWeight: 600 }}>Total Charged</span>
            <span style={{ fontWeight: 700, fontSize: '1.25rem' }}>₹{parseFloat(totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div style={{ padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>New Available Credit:</span>
            <span className="text-success" style={{ fontWeight: 700, fontSize: '1.25rem' }}>
               ₹{parseFloat(newCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Link href="/dashboard" className="text-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Return to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function OrderConfirmation() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '2rem 0' }}>Loading Order Details...</div>}>
      <OrderDetails />
    </Suspense>
  );
}
