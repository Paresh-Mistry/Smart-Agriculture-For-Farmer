"use client";
import {
  Heart,
  ShoppingCart,
  MapPin,
  Package,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { AutoTranslate } from "./AutoTranslate";
import { Crop } from "@component/types/crop.types";

interface MaterialsCardProps {
  materials: Crop[];
  loading: boolean;
}

const MaterialsCard: React.FC<MaterialsCardProps> = ({
  loading,
  materials,
}) => {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Toggle favorite
  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {[...Array(12)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="w-full h-32" />
            <CardContent className="p-2.5 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.png"; // fallback

    // If already absolute (http / https)
    if (url.startsWith("http")) {
      return url;
    }

    // Otherwise, assume backend local file
    return "http://localhost:8000" + `/uploads/${url}`;
  };

  return (
    <AutoTranslate>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
        {materials.length > 0 ? (
          materials.map((material, index) => (
            <Card
              key={material.id ?? `material-${index}`}
              className="group overflow-hidden hover:shadow-lg transition-all gap-1 py-0 duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Image Container */}
              <div className="relative w-full h-32 bg-gradient-to-br from-green-50 to-green-100 overflow-hidden">
                <button
                  onClick={() => toggleFavorite(Number(material.id))}
                  className="absolute top-2 right-2 z-10 bg-white rounded-full p-1.5 shadow-md hover:scale-110 transition-transform"
                  aria-label="Toggle favorite"
                >
                  <Heart
                    className={`w-3.5 h-3.5 transition-colors ${favorites.has(Number(material.id))
                      ? "fill-red-500 text-red-500"
                      : "text-gray-400"
                      }`}
                  />
                </button>

                {/* Status Badge */}
                {material.status && (
                  <Badge
                    className={`absolute top-2 left-2 z-10 text-[10px] px-1.5 py-0.5 ${material.status === "AVAILABLE"
                      ? "bg-green-500 hover:bg-green-600"
                      : material.status === "PENDING"
                        ? "bg-yellow-500 hover:bg-yellow-600"
                        : "bg-red-500 hover:bg-red-600"
                      }`}
                  >
                    {material.status}
                  </Badge>
                )}

                <Image
                  src={resolveImageUrl(material.image_url)}
                  alt={material.crop_name}
                  fill
                  className="object-cover brightness-95 group-hover:scale-110  transition-transform duration-300"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                />
              </div>

              {/* Content */}
              <CardContent className="p-2.5 flex-1 flex flex-col">
                {/* Product Name */}
                <h3 className="font-semibold text-start text-gray-900 text-lg mb-1">
                  {material.crop_name}
                </h3>

                {/* Location & Quantity */}
                <div className="space-y-0.5 mb-2 flex-1">
                  {material.location && (
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="line-clamp-1">{material.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Package className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span>{material.quantity_kg} kg</span>
                  </div>
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between gap-1.5 mt-auto pt-2 border-t">
                  <div>
                    <span className="text-lg font-bold text-green-700">
                      ₹{material.price_per_kg}
                    </span>{" "}
                    <span className="text-[10px] text-gray-500">/kg</span>
                  </div>
                  <Link
                    href={`/buyer/materials/crops/${material.id}`}
                    className="px-2.5 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white text-xs font-medium transition-colors duration-200 flex items-center gap-1 shadow-sm hover:shadow-md"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 px-4">
            <div className="text-5xl mb-3">🌾</div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No crops found
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-md">
              Try adjusting your filters to find what you're looking for.
            </p>
          </div>
        )}

        {/*{materials.length > 0 && (*/}
        {/*<Card className="flex justify-center items-center h-full">*/}
        {/* Content */}
        {/*<Search size={40} />
          <p className="font-medium text-[#00beac]">Explore More</p>*/}
        {/*</Card>*/}
        {/*)}*/}
      </div>
    </AutoTranslate>
  );
};

export default MaterialsCard;
