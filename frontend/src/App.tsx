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

  if (isLoading) return <div className="p-10 text-blue-500 font-bold">Handshaking backend...</div>;
  if (isError) return <div className="p-10 text-red-500 font-bold">Error: Backend is not responding!</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-4xl font-black mb-4">React + FastAPI</h1>
      
      <div className="p-6 bg-gray-800 rounded-xl shadow-xl border border-emerald-500">
        <p className="text-lg">Backend Status: 
          <span className="ml-2 px-2 py-1 bg-emerald-900 text-emerald-300 rounded">
            {data?.status}
          </span>
        </p>
        <p className="mt-2 italic text-gray-400">"{data?.message}"</p>
      </div>
      
      <button 
        onClick={() => window.location.reload()}
        className="mt-8 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all"
      >
        Sprawdź ponownie
      </button>
    </div>
  );
}

export default App;