"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, HandHelping, Home, Menu, Settings, Tag, X } from "lucide-react";

import { Orbitron } from 'next/font/google'
const orbitron = Orbitron({ subsets: ["latin"], weight:'400', variable: "--font-inter" });


const NavLink = ({
    href,
    icon,
    label,
    isOpen,
}: {
    icon: React.ReactNode;
    href: string;
    label: string;
    isOpen: boolean;
}) => {
    return (
        <Link
            href={href}
            className={`flex gap-3 items-center ${!isOpen && 'justify-center rounded-full'} hover:bg-gray-200 transition rounded-r-full cursor-pointer`}
        >
            <div className="">{icon}</div>
            {isOpen && <span className="text-sm">{label}</span>}
        </Link>
    )
}


export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="bg-white shadow fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center gap-9">
                        <div className="text-[18px] font-bold tracking-wide">
                            <Link href={'/'} className={`${orbitron.className} text-blue-600 font-semibold italic`}>AgriLink</Link>
                        </div>
                        <div className="hidden md:flex gap-5">
                            <Link href="/" className="text-sm hover:text-blue-500 transition">Home</Link>
                            <Link href="/about" className="text-sm hover:text-blue-500 transition">Pricing</Link>
                        </div>
                    </div>

                    <div className="hidden md:flex space-x-3">
                        <button className="font-semi-bold text-sm">Sign in</button>
                        <Link href="/with-sidebar/materials" className="flex items-center justify-center gap-1 overflow-hidden font-medium transition duration-300 ease-[cubic-bezier(0.4,0.36,0,1)] rounded-md bg-gray-900 text-white ring-1 ring-gray-900 text-xs px-3 py-[0.1875rem]">
                            Start building
                            <ArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsOpen(true)} className="text-gray-700 focus:outline-none">
                            <Menu size={24} />
                        </button>
                    </div>
                </div>
            </div>



            {/* Sidebar Drawer */}
            <div
                className={`fixed top-0 left-0 bottom-0 w-64 bg-gray-100 shadow-2xl z-20 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}
            >
                <div className="flex bg-white items-center justify-between px-4 py-4">
                    <div className="text-[18px] font-bold tracking-wide">
                        <span className={`${orbitron.className} text-blue-600 font-semibold italic`}>Ecochain</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-gray-700">
                        <X size={24} />
                    </button>
                </div>
                <div className="px-6 py-4 space-y-3">
                    <div className="text-xs">Menu</div>
                    <div className="space-y-3">
                        <NavLink icon={<Home />} label="Home" isOpen={isOpen} href={'/'} />
                        <NavLink icon={<Tag />} label="Pricing" isOpen={isOpen} href={'/'} />
                    </div>
                </div>
                <div className="px-6 py-4 space-y-3">
                    <div className="text-xs">Getting Started</div>
                    <div className="space-y-3">
                        <NavLink icon={<Settings />} label="Engine" isOpen={isOpen} href={'eengine'} />
                    </div>
                </div>
            </div>

        </nav>
    );
}
