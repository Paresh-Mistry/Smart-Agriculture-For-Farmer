"use client"

import { Button } from "@component/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@component/components/ui/table"
import axios from "axios"
import clsx from "clsx"
import { Check, IndianRupee } from "lucide-react"
import React, { useEffect, useState } from "react"

interface MaterialType {
  id: number
  crop_name: string
  description: string
  quantity_kg: number
  price_per_kg: number
  harvest_date: number
  status: string
  currency: string
  location: string
}

export default function Page({ params }: { params: { materialId: string } }) {
  const unwrapParams = React.use(params)
  const { materialId } = unwrapParams
  const [material, setMaterial] = useState<MaterialType | null>(null)
  const [quantity, setQuantity] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch material details
  useEffect(() => {
    async function fetchMaterial() {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/get_crops/${materialId}`
        )
        setMaterial(res.data)
      } catch (error) {
        console.error("Error fetching material:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMaterial()
  }, [materialId])


  const handleClick = () => {
    alert(`Booked ${quantity} Sucessfully \n(Form Data wont commits in DB)`)
  }

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>
  }

  if (!material) {
    return <div className="p-10 text-center">Material not found.</div>
  }

  const totalPrice = quantity * material.price_per_kg

  return (
    <div className="flex items-start mx-auto p-6">


      <div className="w-2/5 space-y-4">
      <div className="flex items-center bg-green-100 px-2 py-1 rounded-2xl text-green-700">
        <span><Check size={18}/></span>
        <span className="px-2 py-1 rounded-full text-xs font-medium">{material.status || "Available"}</span>
      </div>
        <img src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmljZXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600"
          className="rounded-3xl" alt="" />
        <Button
          className="w-full py-6"
          onClick={() => handleClick()}
          variant="default">
          Pay Now
        </Button>
      </div>


      <div className="rounded-2xl w-3/5 p-6">
        <h1 className="text-3xl text-gray-800 mb-2">
          <span className="font-thin">Crops Name</span>
          <span className="font-bold"> {material.crop_name}</span>
        </h1>
        <Table>
          <TableCaption>Material Details</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Field</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Quantity</TableCell>
              <TableCell>{material.quantity_kg} kg</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Price /kg</TableCell>
              <TableCell>{material.price_per_kg} {material.currency || "INR"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Harvest Date</TableCell>
              <TableCell>{material.harvest_date}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Location</TableCell>
              <TableCell>{material.location}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Crops ID</TableCell>
              <TableCell>{material.crop_name.replace(" ", "")}-{material.id}</TableCell>
            </TableRow>
          </TableBody>
        </Table>



        {/* Description */}
        <p className="text-gray-600 mb-6 line-clamp-3 mt-3">
          {`${material.description}` + "Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem ex incidunt, illum natus cupiditate molestias, nisi sit labore fuga corrupti nemo quia reprehenderit obcaecati enim laudantium vel laboriosam distinctio ducimus!"}
        </p>

        {/* Booking Form */}
        <div className="bg-gray-50 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-3">Book this Material</h2>

          <label className="block text-sm text-gray-700 mb-1">
            Enter Quantity
          </label>
          <input
            type="number"
            min={1}
            max={material.quantity_kg}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full p-2 mb-4 focus:outline-none border-b"
          />

          <p className="text-lg font-thin text-gray-800 mb-2">
            Total Price : <span className="font-bold">{totalPrice} </span><IndianRupee className="inline-flex" size={15} />
          </p>

        </div>
      </div>
    </div>
  )
}
