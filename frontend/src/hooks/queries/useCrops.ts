import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { cropService } from "@component/services/cropService";
import { cropKeys } from "@component/utils/queryKey";
import { PaginationParams } from "@component/types/crop.types";

interface UseCropsOptions extends PaginationParams {
  enabled?: boolean;
}

export const useAllCrops = (options: UseCropsOptions = {}) => {
  const { skip = 0, limit = 100, enabled = true } = options;

  return useQuery({
    queryKey: cropKeys.list({ skip, limit }),
    queryFn: () => cropService.getAllCrops({ skip, limit }),
    enabled,
  });
};

export const useGetMyCrops = (options: UseCropsOptions = {}) => {
  const { skip = 0, limit = 100, enabled = true } = options;

  const token = localStorage.getItem("access_token");

  return useQuery({
    queryKey: cropKeys.list({ skip, limit }),
    queryFn: () => {
      if (!token) throw new Error("Unauthorized");
      return cropService.getMyCrops({ skip, limit }, token);
    },
    enabled: enabled && !!token,
  });
};

export const useCropById = (id: string, options: UseCropsOptions = {}) => {
  const { enabled = true } = options;

  return useQuery({
    queryKey: cropKeys.detail(id),
    queryFn: () => cropService.getCropById(id),
    enabled: enabled && !!id,
  });
};

export const useDeleteCrops = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => cropService.deleteCrop(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crops"] });
    },
  });
};

export const useCropsByCategory = (
  category: string,
  options: UseCropsOptions = {},
) => {
  const { skip = 0, limit = 100, enabled = true } = options;

  return useQuery({
    queryKey: cropKeys.byCategory(category, { skip, limit }),
    queryFn: () => cropService.getCropsByCategory(category, { skip, limit }),
    enabled: enabled && !!category,
  });
};


