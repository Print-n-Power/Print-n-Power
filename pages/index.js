import React, { useState, useEffect } from 'react';
import { Award, Box, Radio, PlusCircle, CheckCircle2 } from 'lucide-react';

export default function Dashboard() {
  const [scraps, setScraps] = useState(0);
  const [logs, setLogs] = useState([]);
  const [shopItems, setShopItems] = useState([]);
  const [newLogText, setNewLogText] = useState("");

  useEffect(() => {
    fetch('/api/dashboard-data')
      .then(res => res.json())
      .then(data => {
        setScraps(data.scraps);
        setLogs(data.logs);
        setShopItems(data.shopItems);
      });
  }, []);

  const handleSubmitLog = async (e) => {
    e.preventDefault();
    if (!newLogText.trim()) return;

    const res = await fetch('/api/submit-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: newLogText, userId: 1 })
    });
    const data = await res.json();
    
    if (res.ok) {
      setLogs([data.newLog, ...logs]);
      setScraps(prev => prev + data.scrapsGained);
      setNewLogText("");
      alert(`🎉 Devlog posted! You earned +${data.scrapsGained} Scraps.`);
    }
  };

  const handlePurchase = async (item) => {
    const res = await fetch('/api/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: item.id, userId: 1 })
    });
    const data = await res.json();

    if (res.ok) {
      setScraps(prev => prev - item.price);
      setShopItems(shopItems.map(i => i.id === item.id ? { ...i, stock: i.stock - 1 } : i));
      alert(`🚀 Module unlocked! ${data.message}`);
    } else {
      alert(`❌ Error: ${data.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      {/* Print'n Power Branding Header */}
      <header className="flex justify-between items-center border-b border-purple-900/40 pb-6 mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-wider text-purple-400 flex items-center gap-2">
            <Radio className="animate-pulse text-purple-500" /> PRINT'N POWER CENTRAL
          </h1>
          <p className="text-xs text-slate-400 mt-1">Automated 3D Work Tracking Platform</p>
        </div>
        <div className="bg-purple-950/40 border border-purple-500/30 px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg">
          <Award className="text-yellow-400" />
          <div>
            <p className="text-[10px] text-purple-300 uppercase tracking-wider font-semibold">Balance</p>
            <p className="font-bold text-yellow-400 text-lg leading-tight">{scraps} ✨ Scraps</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <PlusCircle size={18} className="text-purple-400" /> Log Print Progress
            </h2>
            <form onSubmit={handleSubmitLog} className="space-y-4">
              <textarea
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="What did you print or design today? Add logging notes to earn Scraps..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition h-24 resize-none"
              />
              <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-2.5 rounded-xl text-sm transition">
                Submit Activity & Claim Scraps
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-300 px-1">Print Activity Log Feed</h2>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <p className="text-sm text-slate-500 italic p-4">No logged print updates found. Submit an entry above!</p>
              ) : (
                logs.map(log => (
                  <div key={log.id} className="bg-slate-900 border border-slate-800/80 p-4 rounded-xl flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-200">{log.text}</p>
                      <p className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleDateString()}</p>
                    </div>
                    <span className="bg-green-950/60 border border-green-500/20 text-green-400 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shrink-0">
                      <CheckCircle2 size={12} /> +{log.scrapsGained} Scraps
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-slate-300 px-1 flex items-center gap-2">
            <Box size={18} className="text-purple-400" /> Scraps Depot Shop
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {shopItems.map(item => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-44 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-200">{item.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">Stock remaining: <span className={item.stock > 0 ? "text-slate-300" : "text-red-500 font-medium"}>{item.stock}</span></p>
                  </div>
                  <span className="text-yellow-400 text-xs font-bold bg-yellow-950/30 border border-yellow-500/20 px-2.5 py-1 rounded-lg">
                    {item.price} Scraps
                  </span>
                </div>
                <button
                  onClick={() => handlePurchase(item)}
                  disabled={item.stock <= 0 || scraps < item.price}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition ${
                    item.stock > 0 && scraps >= item.price
                      ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/10'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {item.stock <= 0 ? 'Out of Stock' : scraps < item.price ? 'Need More Scraps' : 'Redeem Reward'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
