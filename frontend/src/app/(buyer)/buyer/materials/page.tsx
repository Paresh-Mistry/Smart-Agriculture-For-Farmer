"use client";

import CropHero from "@component/components/common/CropHero";
import MaterialsCard from "@component/components/common/MaterialsCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@component/components/ui/card";
import { cn } from "@component/lib/utils";
import {
  Apple,
  Flower2,
  Leaf,
  Sprout,
  TreeDeciduous,
  Wheat,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useAllCrops } from "@component/hooks/queries/useCrops";
import { AutoTranslate } from "@component/components/common/AutoTranslate";
import { orbitron } from "@component/font/font";

export default function EnginePage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: materials = [], isLoading: loading, error } = useAllCrops();
  if (error) {
    console.error("Error fetching materials:", error);
  }

const categories = [
    {
      id: "Grains",
      name: "Cereals & Grains",
      icon: Wheat,
      count: 45,
      color: "bg-amber-500",
      crops: ["Wheat", "Rice", "Corn", "Barley", "Oats"],
    },
    {
      id: "Vegetables",
      name: "Vegetables",
      icon: Leaf,
      count: 15,
      color: "bg-green-500",
      crops: ["Tomato", "Potato", "Carrot", "Lettuce", "Cabbage"],
    },
    {
      id: "Fruits",
      name: "Fruits",
      icon: Apple,
      count: 62,
      color: "bg-red-500",
      crops: ["Apple", "Mango", "Banana", "Orange", "Grapes"],
    },
    {
      id: "Legumes",
      name: "Legumes",
      icon: Sprout,
      count: 34,
      color: "bg-emerald-600",
      crops: ["Chickpea", "Lentils", "Peas", "Beans", "Soybeans"],
    },
    {
      id: "Spices",
      name: "Spices & Herbs",
      icon: Flower2,
      count: 56,
      color: "bg-orange-500",
      crops: ["Turmeric", "Chili", "Coriander", "Cumin", "Mint"],
    },
    {
      id: "Other",
      name: "Plantation Crops",
      icon: TreeDeciduous,
      count: 28,
      color: "bg-teal-600",
      crops: ["Tea", "Coffee", "Rubber", "Coconut", "Sugarcane"],
    },
  ];

  const getCountByCategory = (name: string) =>
    materials.filter((crop) => crop.category === name).length;

  return (
    <>
      <AutoTranslate>
        <div className="mb-6 space-y-12">
          <CropHero />
          <div className="max-w-7xl mx-auto">
            <h1
              className={cn(
                "text-xl sm:text-2xl lg:text-3xl text-[#206969] tracking-wide",
                orbitron.className,
              )}
            >
              Crop Categories
            </h1>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-8">
              {categories.map((category, index) => {
                const Icon = category.icon;
                const isSelected = selectedCategory === category.id;
                return (
                  <Link
                    key={index}
                    href={`/buyer/materials/catergory/${category.id}`}
                    className="block"
                  >
                    <Card
                      className={`cursor-pointer h-full transition-all duration-300 hover:shadow-xl ${isSelected ? "ring-2 ring-green-500 shadow-xl" : ""
                        }`}
                      onClick={() =>
                        setSelectedCategory(isSelected ? null : category.id)
                      }
                    >
                      <CardHeader>
                        <div className="flex items-center justify-center">
                          <div
                            className={`${category.color} p-2 lg:p-4 rounded-xl text-white hover:scale-110 transition-transform duration-200 shadow-md`}
                          >
                            <Icon className="lg:w-8 lg:h-8 w-6 h-6" />
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="text-center space-y-2">
                        <CardTitle className="lg:text-xl text-green-900 leading-snug">
                          {category.name}
                        </CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          {getCountByCategory(category.id)} varieties available
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mt-12 mb-6">
              <h1
                className={cn(
                  "text-xl sm:text-2xl lg:text-3xl text-[#206969] tracking-wide",
                  orbitron.className,
                )}
              >
                Crop Materials
              </h1>
            </div>

            {/* Show error message if there's an error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                Failed to load crops. Please try again later.
              </div>
            )}

            <MaterialsCard materials={materials} loading={loading} />
          </div>
        </div>
      </AutoTranslate>
    </>
  );
}


