import React from "react";
import { Wallet, Coins, ArrowUpRight, ArrowDownLeft, CreditCard, History, Gift } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-cyber-gradient">Wallet Dashboard</h1>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Main Balance */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Wallet className="w-5 h-5 text-primary" />
                Fiat Balance
              </span>
              <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-500 text-xs font-bold">+2.4%</span>
            </div>
            <h2 className="text-4xl font-black text-foreground mb-2">$1,240.50</h2>
            <div className="flex gap-2 mt-6">
              <button className="flex-1 bg-primary text-white py-2 rounded-xl font-medium hover:opacity-90 transition-opacity cyber-glow flex items-center justify-center gap-2">
                <ArrowUpRight className="w-4 h-4" /> Deposit
              </button>
              <button className="flex-1 bg-white/10 text-foreground py-2 rounded-xl font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <ArrowDownLeft className="w-4 h-4" /> Withdraw
              </button>
            </div>
          </div>

          {/* Coin Balance */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-yellow-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                TCK Coins
              </span>
            </div>
            <h2 className="text-4xl font-black text-foreground mb-2">15,000</h2>
            <div className="flex gap-2 mt-6">
              <button className="w-full bg-yellow-500 text-black py-2 rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" /> Buy Coins
              </button>
            </div>
          </div>

          {/* Creator Earnings */}
          <div className="glass-panel rounded-3xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground font-medium flex items-center gap-2">
                <Gift className="w-5 h-5 text-accent" />
                Creator Earnings
              </span>
            </div>
            <h2 className="text-4xl font-black text-foreground mb-2">$450.00</h2>
            <div className="flex gap-2 mt-6">
              <button className="w-full border border-white/10 text-foreground py-2 rounded-xl font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2">
                Convert to Cash
              </button>
            </div>
          </div>
        </div>

        {/* Two Column Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coin Packages */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" /> Recharge Coins
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { amount: 100, price: "$0.99", bonus: 0 },
                { amount: 500, price: "$4.99", bonus: 50 },
                { amount: 1000, price: "$9.99", bonus: 150 },
                { amount: 5000, price: "$49.99", bonus: 1000 },
                { amount: 10000, price: "$99.99", bonus: 3000 },
                { amount: 50000, price: "$499.99", bonus: 20000, popular: true },
              ].map((pkg, i) => (
                <button key={i} className={`relative glass-panel p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 hover:bg-white/10 ${pkg.popular ? 'border-primary/50 cyber-glow' : 'border-white/5'}`}>
                  {pkg.popular && <span className="absolute -top-3 bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-full">MOST POPULAR</span>}
                  <Coins className="w-8 h-8 text-yellow-500 mb-2" />
                  <span className="text-xl font-black">{pkg.amount}</span>
                  {pkg.bonus > 0 && <span className="text-xs text-yellow-500 font-bold">+{pkg.bonus} Bonus</span>}
                  <span className="mt-2 w-full bg-white/5 py-1.5 rounded-lg text-sm font-medium">{pkg.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-panel rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-muted-foreground" /> Recent History
            </h3>
            <div className="flex flex-col gap-4">
              {[
                { type: "deposit", title: "Credit Card", amount: "+$50.00", date: "Today, 14:20" },
                { type: "purchase", title: "1000 Coins", amount: "-$9.99", date: "Yesterday, 09:12" },
                { type: "earning", title: "Live Stream Gifts", amount: "+1500 Coins", date: "Oct 12, 22:00" },
                { type: "withdrawal", title: "Bank Transfer", amount: "-$100.00", date: "Oct 10, 08:30" },
              ].map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 ${tx.type === 'deposit' || tx.type === 'earning' ? 'text-green-500' : 'text-foreground'}`}>
                      {tx.type === 'deposit' || tx.type === 'earning' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-sm">{tx.title}</span>
                      <span className="text-xs text-muted-foreground">{tx.date}</span>
                    </div>
                  </div>
                  <span className={`font-bold ${tx.type === 'deposit' || tx.type === 'earning' ? 'text-green-500' : 'text-foreground'}`}>
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-sm text-primary hover:text-white transition-colors font-medium">
              View All Transactions
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
