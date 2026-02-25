import { useQuery } from '@tanstack/react-query';
import api from './api/axios';

// Definiujemy typ danych, których się spodziewamy
interface HealthResponse {
  status: string;
  message: string;
}

function App() {
  // TanStack Query: 'healthCheck' to klucz w cache
  const { data, isLoading, isError } = useQuery<HealthResponse>({
    queryKey: ['healthCheck'],
    queryFn: async () => {
      const response = await api.get('/api/health-check');
      return response.data;
    },
  });

  const theme = isLoading
    ? { border: 'border-blue-500', bg: 'bg-blue-900', text: 'text-blue-300', status: 'loading', message: 'Handshaking backend...' }
    : isError
    ? { border: 'border-red-500', bg: 'bg-red-900', text: 'text-red-300', status: 'error', message: 'Backend is not responding!' }
    : { border: 'border-emerald-500', bg: 'bg-emerald-900', text: 'text-emerald-300', status: data?.status, message: data?.message };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-black mb-4">React + FastAPI</h1>
      
      <div className={`p-6 bg-gray-800 rounded-xl shadow-xl border ${theme.border}`}>
        <p className="text-lg">Backend Status: 
          <span className={`ml-2 px-2 py-1 ${theme.bg} ${theme.text} rounded`}>
            {theme.status}
          </span>
        </p>
        <p className="mt-2 italic text-gray-400">"{theme.message}"</p>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
      >
        Reload
      </button>
    </div>
  );
}

export default App;