interface RejectedPageProps {
  onLogout: () => void;
}

function RejectedPage({ onLogout }: RejectedPageProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-400">Macro Lens 🔍</h1>
          <p className="text-slate-400 text-sm">Track your nutrition with AI-powered food analysis</p>
        </div>

        {/* Rejected Card */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-red-400">Access Denied</h2>
            <p className="text-slate-400 text-sm">
              Your account request has been rejected. If you believe this is a mistake, please contact the administrator.
            </p>
          </div>

          <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-sm text-red-300">
            Your account has been rejected and cannot access this application.
          </div>

          <button
            onClick={onLogout}
            className="w-full py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
          >
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}

export default RejectedPage;
