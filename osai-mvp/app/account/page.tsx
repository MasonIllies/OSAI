'use client';
import { useState } from 'react';

export default function AccountPage(){
  const [loading, setLoading] = useState(false);
  async function openPortal(){
    setLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    if (res.ok){
      const { url } = await res.json();
      window.location.href = url;
    } else {
      alert('No billing portal available yet.');
      setLoading(false);
    }
  }
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-semibold mb-6">Account</h1>
      <button onClick={openPortal} disabled={loading} className="rounded border px-4 py-2 hover:bg-gray-50">
        {loading ? 'Opening…' : 'Open Billing Portal'}
      </button>
    </main>
  );
}