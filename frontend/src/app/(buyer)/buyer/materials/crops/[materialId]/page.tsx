"use client";

import { Button } from "@component/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@component/components/ui/table";
import { ArrowLeft, Check, MapPin, Minus, Phone, RefreshCw, TrendingDown, TrendingUp, User } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import Link from "next/link";
import { AutoTranslate } from "@component/components/common/AutoTranslate";
import { useCropById } from "@component/hooks/queries/useCrops";
import { Avatar, AvatarFallback, AvatarImage } from "@component/components/ui/avatar";
import { Card, CardContent } from "@component/components/ui/card";
import { Badge } from "@component/components/ui/badge";
import { useCreateRequest } from "@component/hooks/queries/useRequest";
import { usePriceTrend, useStates } from "@component/hooks/queries/useMandi";

export default function Page({ params }: { params: Promise<{ materialId: string }> }) {
  const unwrapParams = React.use(params) as { materialId: string };
  const { materialId } = unwrapParams;
  const [quantity, setQuantity] = useState<number>(1);

  const actualAmount = (discountedPrice: number, discountPercent: number) => {
    const originalPrice = discountedPrice / (1 - discountPercent / 100);
    return originalPrice.toFixed(2);
  };

  const { data: cropData, isLoading, error } = useCropById(materialId);
  const { data: trend } = usePriceTrend({ commodity: cropData?.crop_name || '' });
  console.log(trend)


  const handleClick = () => {
    alert(`Booked ${quantity} Sucessfully \n(Form Data wont commits in DB)`);
  };

  const getTrendIcon = () => {
    switch (trend?.trend) {
      case 'up':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };

  const [formData, setFormData] = useState({
    quantity_kg: 1,
    requested_price: cropData?.price_per_kg ?? 0,
    message: '',
  });

  const createRequestMutation = useCreateRequest();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createRequestMutation.mutate(
      {
        crop_id: cropData?.id || '',
        quantity_kg: formData.quantity_kg,
        requested_price: formData.requested_price,
        message: formData.message,
      },
      {
        onSuccess: () => {
          setFormData({ quantity_kg: 1, requested_price: cropData?.price_per_kg ?? 0, message: '' });
          console.log({ "formdata": formData })
        },
      }
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading crop details...</p>
        </div>
      </div>
    );
  }

  if (error || !cropData) {
    return <div className="p-10 text-center">Material not found.</div>;
  }

  const resolveImageUrl = (url?: string | null) => {
    if (!url) return "/placeholder.png"; // fallback

    // If already absolute (http / https)
    if (url.startsWith("http")) {
      return url;
    }

    // Otherwise, assume backend local file
    return `http://localhost:8000/uploads/${url}`;
  };

  const totalPrice = formData.quantity_kg * cropData?.price_per_kg! * (1 - cropData!.discount_percent / 100);

  return (
    <AutoTranslate>
      <div className="flex md:flex-row flex-col items-start mx-auto md:p-6">
        <div className="w-full lg:w-2/5 space-y-4">
          <div className="flex iteitems-center gap-3">
            <div className="">
              <Link href="/buyer/materials">
                <Button variant="secondary" size="icon-sm">
                  <ArrowLeft className="w-4 h-4 mr-2 mx-auto" />
                </Button>
              </Link>
            </div>
            <div className="flex items-center bg-green-100 px-3 py-2 rounded-2xl text-green-700 w-fit">
              <Check size={18} />
              <span className="px-2 text-sm font-medium">
                {cropData?.status || "Available"}
              </span>
            </div>
          </div>

          <div className="relative w-full h-[500px] aspect-square">
            <Image
              src={resolveImageUrl(cropData?.image_url)}
              className="rounded-3xl w-full h-full object-cover"
              width={500}
              height={500}
              alt={cropData?.crop_name ?? "Crop Image"}
              priority
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Button
              className="w-full py-6 cursor-pointer"
              disabled={createRequestMutation.isPending}
              size={"sm"}
            >
              {createRequestMutation.isPending ? 'Sending...' : 'Request For Order'}
            </Button>
          </form>
          <div className="">
            <Card className="w-full max-w-2xl">
              <CardContent className="">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-2xl font-thin">Seller Details</h2>
                  <Badge className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    Farmer
                  </Badge>
                </div>


                <div className="flex justify-between w-full items-end gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src="https://images.unsplash.com/photo-1595956481935-a9e254951d49?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZmFybWVyJTIwcGFzc3BvcnQlMjBpbWFnZXxlbnwwfHwwfHx8MA%3D%3D" />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{cropData?.farmer.name}</h3>
                      <p className="text-gray-500 text-sm">{cropData?.farmer.email}</p>
                    </div>
                  </div>

                  <Link href={`tel:${cropData.farmer.phone}`}>
                    <Button
                      variant="secondary"
                      className="px-4 py-3 text-base bg-green-500 hover:bg-green-600 text-white "
                    >
                      Call Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
           <div>
                    {trend && (
                      <table className="w-full mt-4">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Trend</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trend.dates.map((date: string, index: number) => (
                            <TableRow key={index}>
                              <TableCell>{date}</TableCell>
                              <TableCell>{trend.prices[index]}</TableCell>
                              <TableCell>{getTrendIcon()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </table>
                    )}
                  </div>
        </div>

        <div className="rounded-2xl lg:w-3/5 w-full md:p-6 pt-6">
          <div className="flex gap-4 items-center mb-2">
            <h1 className="text-2xl lg:text-3xl text-gray-800">
              <span className="font-thin">Crops Name</span>
              <span className="font-bold"> {cropData?.crop_name}</span>
            </h1>
            <span className="px-3 py-1 mt-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {cropData?.discount_percent}% OFF
            </span>
          </div>
          <Table className="w-full">
            <TableCaption>Material Details</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Field</TableHead>
                <TableHead>Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Crops ID</TableCell>
                <TableCell>{cropData?.id}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quantity</TableCell>
                <TableCell className="font-semibold text-green-600">
                  {cropData?.quantity_kg} kg
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Price /kg</TableCell>
                <TableCell>{cropData?.price_per_kg} Rs</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Category</TableCell>
                <TableCell>{cropData?.category}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Harvest Date</TableCell>
                <TableCell>
                  {cropData?.harvest_date && new Date(cropData.harvest_date).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </TableCell>
              </TableRow>
              {cropData?.expiry_date && (
                <TableRow>
                  <TableCell className="font-medium">Expiry Date</TableCell>
                  <TableCell>
                    {new Date(cropData?.expiry_date).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">Location</TableCell>
                <TableCell className="flex items-center gap-2">
                  <span>{cropData?.location.charAt(0).toUpperCase() + cropData.location.slice(1, cropData.location.length).toLowerCase()}</span>
                  <Link href={`https://www.google.com/maps/search/?api=1&query=<?= urlencode(${cropData?.location}) ?>`} className="mt-0.5 cursor-pointer">
                    <MapPin size={14} color="red" />
                  </Link>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Created Date</TableCell>
                <TableCell>{cropData?.created_at}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Updated Date</TableCell>
                <TableCell>{cropData?.updated_at}</TableCell>
              </TableRow>
            </TableBody>
          </Table>

          {/* Description */}
          <div className="mt-3">
            <h3 className="font-medium mb-1">Description</h3>
            <p className="text-gray-600 mb-6 line-clamp-6">
              {cropData?.description}
            </p>
          </div>


          <div className="">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Book this Material
            </h2>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="flex flex-col">
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message to {cropData.farmer.name}</label>
                  <textarea
                    className="p-2 border rounded"
                    id="message"
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Add any special requirements or notes..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Quantity (kg)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={cropData?.quantity_kg ?? undefined}
                    // value={quantity}
                    // onChange={(e) => setQuantity(Number(e.target.value))}
                    value={formData.quantity_kg}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity_kg: parseFloat(e.target.value) })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter quantity"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum available: {cropData?.quantity_kg} kg
                  </p>
                </div>

                {/* Price Breakdown */}
                <div className="bg-white p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Price per kg:</span>
                    <span className="font-semibold">₹{cropData?.price_per_kg}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Quantity:</span>
                    <span className="font-semibold">{formData.quantity_kg} kg</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Discount:</span>
                    <span className="font-semibold text-green-600">
                      {cropData?.discount_percent}%
                    </span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium">Total Price:</span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{totalPrice.toFixed(2)}
                      </div>
                      {cropData?.discount_percent && cropData.discount_percent > 0 && (
                        <div className="text-sm text-gray-500 line-through">
                          ₹{actualAmount(totalPrice, cropData?.discount_percent)}
                        </div>
                      )}
                    </div>
                  </div>
                 
                </div>

                {/* Validation Messages */}
                {cropData?.quantity_kg && formData.quantity_kg > cropData?.quantity_kg && (
                  <p className="text-sm text-red-600">
                    ⚠️ Quantity exceeds available stock
                  </p>
                )}
                {formData.quantity_kg < 1 && (
                  <p className="text-sm text-red-600">
                    ⚠️ Quantity must be at least 1 kg
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </AutoTranslate>
  );
}

