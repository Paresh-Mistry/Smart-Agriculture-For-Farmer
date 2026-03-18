"use client";

import { AutoTranslate } from "@component/components/common/AutoTranslate";
import { FilterCrops } from "@component/components/common/FilterCrops";
import MaterialsCard from "@component/components/common/MaterialsCard";
import { Button } from "@component/components/ui/button";
import { orbitron } from "@component/font/font";
import { useCropsByCategory } from "@component/hooks/queries/useCrops";
import { cn } from "@component/lib/utils";
import { ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

// Map URL category names to API category names
const CATEGORY_MAP: Record<string, string> = {
  cereals: "Grains",
  vegetables: "Vegetables",
  fruits: "Fruits",
  legumes: "Legumes",
  spices: "Spices",
  plantation: "Other",
};

function capitalizeFirstLetter(string: string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default function Categories({
  params,
}: {
  params: Promise<{ catergory: string }>;
}) {
  const unwrapParams = React.use(params) as { catergory: string };
  const { catergory } = unwrapParams;
  const decodedCategory = decodeURIComponent(catergory);

  // Map URL category to API category, or capitalize if not in map
  const categoryName =
    CATEGORY_MAP[decodedCategory.toLowerCase()] ||
    capitalizeFirstLetter(decodedCategory);

  // Use React Query hook with refetch capability
  const {
    data: materials = [],
    isLoading: loading,
    error,
    refetch,
  } = useCropsByCategory(categoryName);

  // State for client-side filtering (optional)
  const [filters, setFilters] = useState({
    CropsName: "",
    Location: "",
    priceRange: [0, 100],
  });

  // Apply client-side filters to materials
  const filteredMaterials = materials.filter((material) => {
    const matchesName =
      !filters.CropsName ||
      material.crop_name
        .toLowerCase()
        .includes(filters.CropsName.toLowerCase());

    const matchesLocation =
      !filters.Location ||
      material.location.toLowerCase().includes(filters.Location.toLowerCase());

    return matchesName && matchesLocation;
  });

  return (
    <AutoTranslate>
    <div className="mb-6 md:pt-3 space-y-6">
      {/* Back Button */}
      <Link href="/with-sidebar/materials">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Crops
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1
            className={cn(
              "text-xl sm:text-2xl lg:text-3xl text-[#206969] tracking-wide",
              orbitron.className,
            )}
          >
            Crop Categories
          </h1>
          {!loading && (
            <p className="text-sm text-gray-600 mt-1">
              {filteredMaterials.length} of {materials.length} crops
            </p>
          )}
        </div>

        {/* Refresh Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filters (Optional) */}
      <div>
        <FilterCrops onFilterChange={setFilters} />
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Failed to load crops for {categoryName}. Please try again later.
        </div>
      )}

      {/* Content */}
      <div>
        {!loading && filteredMaterials.length === 0 && !error ? (
          <div className="p-10 text-center">
            <p className="text-gray-600 text-lg">
              {materials.length === 0
                ? `No materials found in ${categoryName} category.`
                : "No materials match your filters."}
            </p>
            {materials.length > 0 && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={() =>
                  setFilters({
                    CropsName: "",
                    Location: "",
                    priceRange: [0, 100],
                  })
                }
              >
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <MaterialsCard materials={filteredMaterials} loading={loading} />
        )}
      </div>
    </div>
    </AutoTranslate>
  );
}
