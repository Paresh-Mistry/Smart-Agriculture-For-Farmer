"use client"

import { useState } from "react";
import { FilterCrops } from "@component/components/common/FilterCrops";
import MaterialsCard from "@component/components/common/MaterialsCard";



export default function EnginePage() {
  const [filters, setFilters] = useState({
    CropsName: "",
    Location: "",
    priceRange: [0, 100],
  });

  return (
    <>
      <div className="flex justify-between items-center mb-6 md:pt-3">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 tracking-wide">
          Crops Browser
        </h1>
        <FilterCrops onFilterChange={setFilters} />
      </div>

      {/* Pass active filters to cards */}
      <MaterialsCard onFilters={filters} />
    </>
  );
}
