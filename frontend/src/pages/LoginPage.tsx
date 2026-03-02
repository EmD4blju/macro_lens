import { useEffect } from 'react';
import { useGoogleAuth } from '../hooks/useGoogleLogin';
import { GoogleLogin } from '@react-oauth/google';

interface LoginPageProps {
  onLoginSuccess: () => void;
}

function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const { sendTokenToBackend, isPending, isSuccess, isError, error } = useGoogleAuth();

  useEffect(() => {
    if (isSuccess) onLoginSuccess();
  }, [isSuccess]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-8">
      <div className="max-w-sm w-full space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-400">Macro Lens 🔍</h1>
          <p className="text-slate-400 text-sm">Track your nutrition with AI-powered food analysis</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700 space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-emerald-400">Sign in to continue</h2>
            <p className="text-slate-400 text-sm">Use your Google account to get started</p>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={(response) => {
                if (response.credential) {
                  sendTokenToBackend(response.credential);
                }
              }}
              onError={() => console.error("Google login failed")}
            />
          </div>

          {isPending && (
            <div className="flex justify-center gap-1">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="bg-red-900/40 border border-red-700 rounded-lg p-3 text-sm text-red-300">
              {(error as Error)?.message ?? 'Authentication failed. Please try again.'}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default LoginPage;
