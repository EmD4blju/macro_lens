import { useState } from 'react';
import { useHealth } from './hooks/useHealth';
import { useAddFood, useDeleteFood, useFoodList } from './hooks/useFood';
import type { FoodEntryCreate } from './hooks/useFood';

function App() {
  // 1. Server status hook
  const { data: health, isLoading: isHealthLoading } = useHealth();
  
  // 2. Food adding hook
  const { mutate, isPending: isAddingFood } = useAddFood();

  // 3. Food deletion food
  const { mutate: deleteFood, isPending: isDeleting } = useDeleteFood();

  // 3. Food list hook
  const { data: foodList, isLoading: isFoodListLoading } = useFoodList();

  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) return;
    mutate(selectedFile, {
      onSuccess: () => {
        setSelectedFile(null);
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Server Status Section */}
        <header className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h1 className="text-xl font-bold text-blue-400">Macro Lens 🔍</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isHealthLoading ? 'Checking...' : (health?.status === 'ok' ? 'Server online' : 'Server offline')}
          </div>
        </header>

        {/* Add Entry Form */}
        <section className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">What did you eat today?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-slate-600 rounded-lg cursor-pointer bg-slate-900 hover:border-blue-500 transition-colors">
              {selectedFile ? (
                <span className="text-slate-300 text-sm font-medium">{selectedFile.name}</span>
              ) : (
                <span className="text-slate-500 text-sm">Click to upload a food photo</span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => setSelectedFile(e.target.files?.[0] ?? null)}
                required
              />
            </label>

            <button 
              type="submit" 
              disabled={isAddingFood || health?.status !== 'ok'}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-3 rounded-lg font-bold transition-all transform active:scale-95"
            >
              {isAddingFood ? 'Analysing image...' : 'Upload & analyse'}
            </button>
          </form>
        </section>

        {/* Food Log */}
        <section className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">Today's log</h2>
          {isFoodListLoading ? (
            <p className="text-slate-400 text-sm">Loading entries...</p>
          ) : foodList?.length > 0 ? (
            <ul className="space-y-3">
              {foodList.map((entry: FoodEntryCreate & { id: number }, index: number) => (
                <li key={entry.id ?? index} className="flex justify-between items-center p-3 bg-slate-900 rounded-lg border border-slate-700">
                  <span className="font-medium">{entry.food_name}</span>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span><span className="text-slate-200 font-bold">{entry.calories}</span> kcal</span>
                    <span><span className="text-slate-200 font-bold">{entry.protein}g</span> protein</span>
                    <span><span className="text-slate-200 font-bold">{entry.fat}g</span> fat</span>
                    <span><span className="text-slate-200 font-bold">{entry.carbohydrates}g</span> carbs</span>
                  </div>
                  <button onClick={() => deleteFood(entry.id)} disabled={isDeleting} className="p-2 text-slate-500 hover:text-red-400 transition-colors hover:cursor-pointer" title="delete_entry">
                    <span className="text-lg">🗑️</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 text-sm italic">No entries yet. Add your first meal above!</p>
          )}
        </section>

      </div>
    </div>
  );
}

export default App;