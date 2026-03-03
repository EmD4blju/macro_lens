function LoadingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-400">Macro Lens 🔍</h1>
          <p className="text-slate-400 text-sm">Track your nutrition with AI-powered food analysis</p>
        </div>

        {/* Loading Card */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-emerald-400">Loading...</h2>
            <p className="text-slate-400 text-sm">Please wait while we set things up</p>
          </div>

          <div className="flex justify-center gap-2">
            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default LoadingPage;
