import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import api from '../api/axios';

export interface FoodEntry {
  id: number
  food_name: string;
  description?: string; 
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
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

export const useFoodList = (date: Date) => {
    const entryDate = date.toISOString().split('T')[0];

    return useQuery({
        queryKey: ['user-foods', entryDate],
        queryFn: async () => {
            const response = await api.get(`/user-foods/${FIXED_EMAIL}?entry_date=${entryDate}`);
            return response.data;
        },
        refetchOnWindowFocus: false,
    });
}