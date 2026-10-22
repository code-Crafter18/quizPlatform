function StatCard({ title, value, icon, gradient, change }) {
  return (
    <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/70 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {change && <p className="text-xs text-slate-400 mt-1">{change}</p>}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${gradient || "bg-blue-500/20 text-blue-400"}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
