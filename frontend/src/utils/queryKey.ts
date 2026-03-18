import { PaginationParams } from "../types/crop.types";

export const cropKeys = {
  all: ["crops"] as const,
  lists: () => [...cropKeys.all, "list"] as const,
  list: (filters: PaginationParams) => [...cropKeys.lists(), filters] as const,
  details: () => [...cropKeys.all, "detail"] as const,
  detail: (id: string) => [...cropKeys.details(), id] as const,
  byCategory: (category: string, filters: PaginationParams) =>
    [...cropKeys.all, "category", category, filters] as const,
  byStatus: (status: string, filters: PaginationParams) =>
    [...cropKeys.all, "status", status, filters] as const,
};
