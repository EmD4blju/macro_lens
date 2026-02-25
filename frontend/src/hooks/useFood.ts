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
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file); // 'file' musi pasować do nazwy w FastAPI

      // Email przesyłamy w URL tak jak wcześniej
      const response = await api.post(`/add-food-image?email=test@example.com`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-foods'] });
    },
  });
};

export const useDeleteFood = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (foodId: number) => {
            const response = await api.delete(`/delete-food/${foodId}`);
            return response.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['user-foods']})
        }
    })
}

export const useFoodList = () => {
    return useQuery({
        queryKey: ['user-foods'],
        queryFn: async () => {
            const response = await api.get(`/user-foods?email=${FIXED_EMAIL}`);
            return response.data;
        },
        refetchOnWindowFocus: false, // Nie odświeżaj przy każdym powrocie do zakładki
    });
}