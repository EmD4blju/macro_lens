import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios'; // Importujesz instancję axiosa którą zrobiliśmy wcześniej

export interface FoodEntryCreate {
  food_name: string;      // Zmienione z 'name'
  description?: string;   // Opcjonalne (Optional[str])
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;  // Zmienione z 'carbs'
}
const FIXED_EMAIL = "test@example.com";

export const useAddFood = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newFood: FoodEntryCreate) => {
      // Zauważ ścieżkę: wysyłamy email w URL, a obiekt newFood w Body
      const response = await api.post(`/add-food?email=${FIXED_EMAIL}`, newFood);
      return response.data;
    },
    onSuccess: () => {
      // To odświeży listę jedzenia, gdy ją stworzymy (klucz 'food-list')
      queryClient.invalidateQueries({ queryKey: ['food-list'] });
    },
  });
};

export const useFoodList = () => {
    return useQuery({
        queryKey: ['food-list'],
        queryFn: async () => {
            const response = await api.get(`/list-foods?email=${FIXED_EMAIL}`);
            return response.data;
        },
        refetchOnWindowFocus: false, // Nie odświeżaj przy każdym powrocie do zakładki
    });
}