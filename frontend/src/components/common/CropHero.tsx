"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Leaf } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { AutoTranslate } from "./AutoTranslate";

const crops = [
  {
    name: "Green Vegetables",
    desc: "Premium quality fresh vegetables directly from organic farms.",
    img: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&auto=format&fit=crop&q=80",
    price: "₹45/kg",
  },
  {
    name: "Cereals & Grains",
    desc: "Fresh cereals and grains sourced from local farmers.",
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&auto=format&fit=crop&q=80",
    price: "₹60/kg",
  },
  {
    name: "Pesticides & Fertilizers",
    desc: "Eco-friendly agricultural solutions for better crop yield.",
    img: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&auto=format&fit=crop&q=80",
    price: "₹30/kg",
  },
  {
    name: "Fruits Basket",
    desc: "Farm-fresh seasonal fruits packed with nutrients and vitamins.",
    img: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&auto=format&fit=crop&q=80",
    price: "₹80/kg",
  },
  {
    name: "Dairy Products",
    desc: "Pure and fresh dairy products from healthy cattle farms.",
    img: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=1200&auto=format&fit=crop&q=80",
    price: "₹65/liter",
  },
  {
    name: "Premium Wheat",
    desc: "Golden wheat grains harvested from the fertile fields of Punjab.",
    img: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=1200&auto=format&fit=crop&q=80",
    price: "₹35/kg",
  },
];

export default function CropHero() {
  const [index, setIndex] = useState(0);

  const next = () => setIndex((prev) => (prev + 1) % crops.length);
  const prev = () =>
    setIndex((prev) => (prev - 1 + crops.length) % crops.length);

  return (
    <AutoTranslate>
      <div className="flex md:flex-row flex-col-reverse gap-3">
        <section className="relative w-full h-[500px] overflow-hidden">
          {/*<AnimatePresence mode="wait">*/}
          <motion.div
            key={crops[index].name}
            className="absolute w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              className="object-cover brightness-75 rounded-md"
              src={crops[index].img}
              fill
              alt={crops[index].name}
              priority
            />
          </motion.div>
          {/*</AnimatePresence>*/}

          {/* Overlay content */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="max-w-3xl"
            >
              <div className="flex justify-center items-center gap-2 mb-4">
                <Leaf className="w-6 h-6 text-yellow-400" />
                <h2 className="text-sm uppercase tracking-widest text-yellow-400 font-semibold">
                  Farm Fresh Crops
                </h2>
              </div>

              <h1 className="text-3xl md:text-6xl font-bold mb-4 text-white">
                {/*<Translate>{crops[index].name}</Translate>*/}
                {crops[index].name}
              </h1>

              <p className="text-lg md:text-xl text-white mb-6 leading-relaxed">
                {/*<Translate>{crops[index].desc}</Translate>*/}
                {crops[index].desc}
              </p>
            </motion.div>
          </div>

          {/* Navigation buttons */}
          <div className="absolute inset-0 flex items-center justify-between px-6 z-10">
            <button
              onClick={prev}
              className="p-3 bg-black/30 hover:bg-black/40 rounded-full transition"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>
            <button
              onClick={next}
              className="p-3 bg-black/30 hover:bg-black/40 rounded-full transition"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-3 z-1  0">
            {crops.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === index ? "bg-green-500 scale-135" : "bg-gray-400/70"
                  }`}
              />
            ))}
          </div>
        </section>
        <section className="relative lg:w-5/12 h-[200px] lg:h-[500px] overflow-hidden">
          <Image
            className="object-cover brightness-75 rounded-md"
            src="https://images.unsplash.com/photo-1744230673231-865d54a0aba4?q=80&w=1332&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            fill
            alt={"banner Image"}
            priority
          />
        </section>
      </div>
    </AutoTranslate>
  );
}
