"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Home, MapPin, Menu, Settings, Tag, UserCircle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { LanguageSwitcher } from "./useLanguageSwitcher";
import { AutoTranslate } from "./AutoTranslate";
import { orbitron } from "@component/font/font";
import { useCurrentUser, useLogout } from "@component/hooks/queries/useAuth";
import { useCurrentWeather } from "@component/hooks/queries/useWeather";
import { useGeolocation } from "@component/hooks/useGeolocation";



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
    const { lat, lon, loading: geoLoading } = useGeolocation();
    const {
        data: weather,
    } = useCurrentWeather(lat!, lon!, {
        enabled: !geoLoading && !!lat && !!lon,
    });
    const router = useRouter();
    const logout = useLogout();

    const handleLogout = async () => {
        await logout.mutateAsync();
        router.push("/login");
    };

    const { data: user } = useCurrentUser();
    console.log("Current User in Navbar:", user);

    return (
        <AutoTranslate>
            <nav className="bg-white fixed top-0 left-0 right-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-9">
                            <div className="text-[18px] font-bold tra   cking-wide">
                                <Link href="/" className="agrilink-logo text-[#40916c] flex items-center gap-1.5">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                                        <path d="M12 2C8 6 4 8 4 13a8 8 0 0016 0c0-5-4-7-8-11z" fill="#40916c" opacity="0.85" />
                                        <path d="M12 8v8" stroke="#d8f3dc" strokeWidth="1.5" strokeLinecap="round" />
                                    </svg>
                                    Agri<span>Link</span>
                                </Link>                            </div>
                            <div className="hidden md:flex gap-5">
                                <Link href="/" className="text-base hover:text-blue-500 transition">Home</Link>
                                <Link href="/buyer/materials" className="text-base hover:text-blue-500 transition">Browse</Link>
                                {user && (
                                    <>
                                    <Link href="/farmer/dashboard" className="text-base hover:text-blue-500 transition">Dashboard</Link>
                                    <Link href="/farmer/mandi" className="text-base hover:text-blue-500 transition">Market Trend</Link>
                                    </>
                                )}
                                <Link href="/farmer/fertilizer" className="text-base hover:text-blue-500 transition">Recommendations</Link>
                                <Link href="/farmer/assistant" className="text-base italic font-bold  hover:text-blue-500 transition">Ask AI</Link>
                            </div>
                        </div>

                        <div className="hidden md:flex space-x-3">
                                 {user ? (
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-[#b7e4c7] bg-[#f0faf4] hover:bg-[#d8f3dc] transition-all duration-200 group"
                                    >
                                        <div className="w-7 h-7 bg-gradient-to-br from-[#40916c] to-[#1b4332] rounded-full flex items-center justify-center text-white text-xs font-bold">
                                            {user.name ? user.name.charAt(0).toUpperCase() : <UserCircle size={14} />}
                                        </div>
                                        <div className="text-left">
                                            <p style={{ fontFamily: "'Source Sans 3', sans-serif" }} className="text-xs font-semibold text-[#1b4332] leading-none">{user.name}</p>
                                            <p style={{ fontFamily: "'Source Sans 3', sans-serif" }} className="text-[10px] text-[#52796f] mt-0.5">{user.email}</p>
                                        </div>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push("/login")}
                                        style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                                        className="text-sm font-semibold px-4 py-2 rounded-full border border-[#52796f] text-[#1b4332] hover:bg-[#d8f3dc] transition-all duration-200"
                                    >
                                        Sign in
                                    </button>
                                )}
                            <LanguageSwitcher />
                             {/* Weather pill */}
                                <div className="weather-pill flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f0faf4] border border-[#b7e4c7] text-[#2d6a4f]">
                                    {weather?.icon
                                        ? <img src={weather.icon} alt="" className="w-8 h-8" />
                                        : <MapPin size={18} className="text-[#52796f]" />
                                    }
                                    <div className="leading-none">
                                        <p className="text-sm font-semibold text-[#1b4332]">
                                            {weather?.location || user?.location || "Locating…"}
                                        </p>
                                        {weather?.region && (
                                            <p className="text-[12px] text-[#52796f] mt-0.5">{weather.region}</p>
                                        )}
                                    </div>
                                </div>
                            <Link
                                    href="/buyer/materials"
                                    style={{ fontFamily: "'Source Sans 3', sans-serif" }}
                                    className="group flex items-center gap-1.5 text-sm font-semibold px-5 py-2 rounded-full bg-[#1b4332] text-[#d8f3dc] hover:bg-[#2d6a4f] shadow-md shadow-[#1b4332]/20 hover:shadow-lg hover:shadow-[#2d6a4f]/30 transition-all duration-200 hover:-translate-y-px"
                                >
                                    Start building
                                    <ArrowRight size={13} className="transition-transform duration-200 group-hover:translate-x-0.5" />
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
        </AutoTranslate>

    );
}
