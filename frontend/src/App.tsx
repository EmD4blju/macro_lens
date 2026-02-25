import { useState } from 'react';
import { useHealth } from './hooks/useHealth';
import { useAddFood, useFoodList, type FoodEntryCreate } from './hooks/useFood';

function App() {
  // 1. Server status hook
  const { data: health, isLoading: isHealthLoading } = useHealth();
  
  // 2. Food adding hook
  const { mutate, isPending: isAddingFood } = useAddFood();

  // 3. Food list hook
  const { data: foodList, isLoading: isFoodListLoading } = useFoodList();

  // Form state
  const [formData, setFormData] = useState<FoodEntryCreate>({
    food_name: '', calories: 0, protein: 0, fat: 0, carbohydrates: 0
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    mutate(formData, {
      onSuccess: () => {
        setFormData({ food_name: '', calories: 0, protein: 0, fat: 0, carbohydrates: 0 });
        alert("Added!");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-xl mx-auto space-y-8">
        
        {/* Server Status Section */}
        <header className="flex justify-between items-center p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h1 className="text-xl font-bold italic text-blue-400">Macro Lens 🔍</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            {isHealthLoading ? 'Checking...' : (health?.status === 'ok' ? 'Server online' : 'Server offline')}
          </div>
        </header>

        {/* Add Entry Form */}
        <section className="bg-slate-800 p-6 rounded-xl shadow-2xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-4 text-emerald-400">What did you eat today?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input 
              type="text" 
              placeholder="Meal name"
              value={formData.food_name}
              onChange={e => setFormData({...formData, food_name: e.target.value})}
              className="w-full bg-slate-900 border border-slate-700 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 uppercase font-bold">Calories</label>
                <input 
                  type="number" 
                  value={formData.calories}
                  onChange={e => setFormData({...formData, calories: Number(e.target.value)})}
                  className="w-full bg-slate-900 border border-slate-700 p-2 rounded-lg"
                />
              </div>
              {/* You can add the remaining fields (Protein, Fat, Carbs) here in a similar way */}
            </div>

            <button 
              type="submit" 
              disabled={isAddingFood || health?.status !== 'ok'}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 py-3 rounded-lg font-bold transition-all transform active:scale-95"
            >
              {isAddingFood ? 'Sending data...' : 'Add to journal'}
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