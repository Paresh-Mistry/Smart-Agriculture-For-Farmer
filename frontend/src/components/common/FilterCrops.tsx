"use client"

import { useState } from "react"
import { Button } from "@component/components/ui/button"
import { Label } from "@component/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,   
} from "@component/components/ui/popover"
import { FilterIcon } from "lucide-react"

export function FilterCrops({ onFilterChange }:{onFilterChange:any}) {
  const [localFilters, setLocalFilters] = useState({
    CropsName: "",
    Location: "",
    priceRange: [0, 100],
  })

  // Handle input changes locally
  const handleChange = (key:any, value:any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange(newFilters) // update parent state
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="secondary">
          <FilterIcon className="mr-2 h-4 w-4" />
            Filter
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-80 mx-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Filterization</h4>
            <p className="text-muted-foreground text-sm">
              Filter products based on your preferences
            </p>
          </div>

          <div className="grid gap-2">
            {/* Crops Name */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="cropsName">Crops Name</Label>
              <input
                id="cropsName"
                placeholder="Ex. Wheat"
                value={localFilters.CropsName}
                onChange={(e) => handleChange("CropsName", e.target.value)}
                className="col-span-2 h-8 border px-2 rounded"
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="location">Location</Label>
              <input
                id="location"
                placeholder="Ex. Mumbai"
                value={localFilters.Location}
                onChange={(e) => handleChange("Location", e.target.value)}
                className="col-span-2 h-8 border px-2 rounded"
              />
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="price">Price</Label>
              <input
                type="range"
                id="price"
                min={0}
                max={100}
                value={localFilters.priceRange[1]}
                onChange={(e) => handleChange("priceRange", [0, Number(e.target.value)])}
                className="col-span-2 h-8"
              />
            </div>

            <div className="text-right text-sm text-gray-600">
              Max Price: ₹{localFilters.priceRange[1]}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
