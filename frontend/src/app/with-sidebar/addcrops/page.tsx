'use client'

import { useState } from "react"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@component/components/ui/field"
import { Button } from "@component/components/ui/button"
import { Progress } from "@component/components/ui/progress"

export default function CropFormSteps() {
  const [step, setStep] = useState(1)
  const totalSteps = 4

  // Form state
  const [formData, setFormData] = useState({
    crop_name: "",
    description: "",
    quantity_kg: "",
    price_per_kg: "",
    harvest_date: "",
    currency: "INR",  
    status: "Available",
    location: "",
    image: null,
  })

  const nextStep = () => setStep((prev) => Math.min(prev + 1, totalSteps))
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1))

  const progress = (step / totalSteps) * 100

  const handleChange = (e:any) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e:any) => {
    e.preventDefault()
    try {
      const data = new FormData()
      for (const key in formData) {
        data.append(key === "image" ? "image_url" : key, formData[key])
      }

      const res = await fetch("http://127.0.0.1:8000/cropslist", {
        method: "POST",
        body: data,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || "Failed to submit form")
      }

      const result = await res.json()
      alert("Crop added successfully!")
      console.log(result)
    } catch (error) {
      console.error(error)
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="w-full mx-auto max-w-3xl">
      <form
        className="bg-gray-100 p-6 rounded-md shadow-md space-y-4"
        onSubmit={handleSubmit}
      >
        {/* Progress Bar */}
        <Progress value={progress} className="mb-4 h-2 bg-blue-300" />

        {/* Step 1: Crop Details */}
        {step === 1 && (
          <FieldSet>
            <FieldLegend>Crop Details</FieldLegend>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="crop_name">Crop Name</FieldLabel>
                <input
                  id="crop_name"
                  name="crop_name"
                  type="text"
                  placeholder="Wheat"
                  className="w-full p-2 border rounded"
                  value={formData.crop_name}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Brief description"
                  className="w-full p-2 border rounded resize-none"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        )}

        {/* Step 2: Quantity & Price */}
        {step === 2 && (
          <FieldSet>
            <FieldLegend>Quantity & Price</FieldLegend>
            <FieldGroup className="space-y-4 grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="quantity_kg">Quantity (kg)</FieldLabel>
                <input
                  id="quantity_kg"
                  name="quantity_kg"
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.quantity_kg}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="price_per_kg">Price per kg</FieldLabel>
                <input
                  id="price_per_kg"
                  name="price_per_kg"
                  type="number"
                  className="w-full p-2 border rounded"
                  value={formData.price_per_kg}
                  onChange={handleChange}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        )}

        {/* Step 3: Harvest, Currency & Image */}
        {step === 3 && (
          <FieldSet>
            <FieldLegend>Harvest & Currency</FieldLegend>
            <FieldGroup className="space-y-4 grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel htmlFor="harvest_date">Harvest Date</FieldLabel>
                <input
                  id="harvest_date"
                  name="harvest_date"
                  type="date"
                  className="w-full p-2 border rounded"
                  value={formData.harvest_date}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="currency">Currency</FieldLabel>
                <select
                  id="currency"
                  name="currency"
                  className="w-full p-2 border rounded"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </Field>
              <Field className="col-span-2">
                <FieldLabel htmlFor="image">Upload Image</FieldLabel>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        )}

        {/* Step 4: Status & Location */}
        {step === 4 && (
          <FieldSet>
            <FieldLegend>Status & Location</FieldLegend>
            <FieldGroup className="space-y-4">
              <Field>
                <FieldLabel htmlFor="status">Status</FieldLabel>
                <select
                  id="status"
                  name="status"
                  className="w-full p-2 border rounded"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="Sold Out">Sold Out</option>
                  <option value="Pending">Pending</option>
                </select>
              </Field>
              <Field>
                <FieldLabel htmlFor="location">Location</FieldLabel>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="w-full p-2 border rounded"
                  placeholder="Farm location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {step > 1 && (
            <Button variant="outline" type="button" onClick={prevStep}>
              Previous
            </Button>
          )}
          {step < totalSteps && (
            <Button type="button" onClick={nextStep}>
              Next
            </Button>
          )}
          {step === totalSteps && <Button type="submit">Submit</Button>}
        </div>
      </form>
    </div>
  )
}
