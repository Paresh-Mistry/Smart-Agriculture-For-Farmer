"use client";
import axios from "axios";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface MaterialsCardProps {
    onFilters: {
        CropsName: string;
        Location: string;
        priceRange: [number, number];
    };
}


const MaterialsCard: React.FC<MaterialsCardProps> = ({ onFilters }: { onFilters: any }) => {
    const [materials, setMaterials] = useState<any[]>([]);

    // Fetch materials
    const Materialdata = async () => {
        try {
            const url = "http://127.0.0.1:8000/get_cropslists";
            const response = await axios.get(url);
            setMaterials(response.data);
        } catch (error) {
            console.error("Error fetching materials:", error);
        }
    };


    useEffect(() => {
        Materialdata();
    }, []);



    const filteredMaterials = materials.filter((material) => {
        const cropMatch =
            material.crop_name
                ?.toLowerCase()
                .includes(onFilters.CropsName.toLowerCase());

        const locationMatch =
            !onFilters.Location ||
            material.location
                ?.toLowerCase()
                .includes(onFilters.Location.toLowerCase());

        const price = Number(material.price_per_kg) || 0;
        const priceMatch =
            price >= onFilters.priceRange[0] && price <= onFilters.priceRange[1];

        return cropMatch && locationMatch && priceMatch;
    });



    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filteredMaterials.length > 0 ? (
                filteredMaterials.map((material, index) => (
                    <div
                        key={material.id}
                        className="bg-white relative flex-grow rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100"
                    >
                        {/* <span className="absolute top-0 right-0 bg-gray-300 px-2">
                            {index + 1}
                        </span> */}

                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                                    {material.crop_name}
                                </h2>

                                {/* Description */}
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {material.description || "No description available."}
                                </p>
                            </div>
                            <div>
                                <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600" alt="" className="w-20 h-20 rounded-2xl" />
                            </div>
                        </div>


                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700 mb-4">
                            <p>
                                <span className="font-medium">Location:</span>{" "}
                                {material.location || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">Price:</span>{" "}
                                ₹{material.price_per_kg}
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${material.status === "active"
                                    ? "bg-green-100 text-green-600"
                                    : material.status === "pending"
                                        ? "bg-yellow-100 text-yellow-600"
                                        : "bg-red-100 text-red-600"
                                    }`}
                            >
                                {material.status || "Available"}
                            </span>

                            <Link
                                href={`materials/${material.id}`}
                                className="flex items-center bg-gray-700 text-white gap-1 px-2.5 py-1.5 text-sm rounded-lg shadow transition"
                            >
                                <ArrowUpRight size={18} /> View
                            </Link>
                        </div>
                    </div>
                ))
            ) : (
                <div className="col-span-full text-center text-gray-500 py-10">
                    No crops found matching the filters.
                </div>
            )}
        </div>
    );
};

export default MaterialsCard;
