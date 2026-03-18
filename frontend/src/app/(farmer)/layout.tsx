"use client";

import Navbar from "@component/components/common/Navbar";
import NextBreadcrumb from "@component/components/common/NextBreadcrumb";
import SidebarLink from "@component/components/common/SidebarLink";
import {
    Bell,
    Home,
    Info,
    LayoutDashboard,
    Leaf,
    Menu,
    MessageCircle,
    Plus,
    Sprout,
    Tag,
    TrendingUp,
    User,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Orbitron } from "next/font/google";
import { AutoTranslate } from "@component/components/common/AutoTranslate";
import { LanguageSwitcher } from "@component/components/common/useLanguageSwitcher";
import { useGeolocation } from "@component/hooks/useGeolocation";
import { useCurrentWeather } from "@component/hooks/queries/useWeather";
import { useCurrentUser } from "@component/hooks/queries/useAuth";
const orbitron = Orbitron({
    subsets: ["latin"],
    weight: "400",
    variable: "--font-inter",
});

export default function Sidebarlayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const { lat, lon, loading: geoLoading } = useGeolocation();
    const {
        data: weather,
    } = useCurrentWeather(lat!, lon!, {
        enabled: !geoLoading && !!lat && !!lon,
    });
    const { data: user } = useCurrentUser();
    return (
        <>
            <AutoTranslate>
                <div className="md:hidden">
                    <Navbar />
                </div>
                <div className="md:pt-0 pt-16 md:grid grid-cols-[auto_1fr] min-h-screen transition-all duration-300 ease-in-out">
                    {/* Sidebar */}
                    <aside
                        className={`hidden md:block border-r border-gray-200 bg-gray-100 h-full transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-20"} overflow-hidden`}
                    >
                        <div
                            className={`flex items-center mb-3 ${isOpen ? "justify-between bg-white border-b border-gray-200" : "justify-center"} px-4 py-4`}
                        >
                            <Link
                                href={"/"}
                                className={`${orbitron.className} flex items-center gap-2 text-lg italic text-[#04a091]`}
                            >
                                {isOpen && <Leaf className="w-6 h-6" />}

                                {isOpen && "AgriLink"}
                            </Link>
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="focus:outline-none"
                            >
                                <Menu size={20} />
                            </button>
                        </div>

                        <div>
                            {isOpen && (
                                <div className="px-4">
                                    <h5 className="text-xs">Menu</h5>
                                </div>
                            )}

                            <nav className="mt-3 space-y-1">
                                <SidebarLink
                                    icon={<Home />}
                                    label="Home"
                                    isOpen={isOpen}
                                    href={"/"}
                                />
                                <SidebarLink
                                    icon={<Info />}
                                    label="About "
                                    isOpen={isOpen}
                                    href={"/"}
                                />
                                <SidebarLink
                                    icon={<User />}
                                    label="Profile"
                                    isOpen={isOpen}
                                    href={"/profile"}
                                />
                            </nav>
                        </div>

                        {!isOpen && (
                            <div className="w-1 h-1 mx-auto mt-5 bg-gray-700 rounded"></div>
                        )}

                        <div className="mt-5">
                            {isOpen && (
                                <div className="px-4">
                                    <h5 className="text-xs">Getting Started</h5>
                                </div>
                            )}

                            <nav className="mt-3 space-y-1">
                                <SidebarLink icon={<Tag />} label="Products" isOpen={isOpen} href={"/buyer/materials"} />
                                <SidebarLink icon={<LayoutDashboard />} label="Dashboard" isOpen={isOpen} href={'/buyer/dashboard'} />
                                <SidebarLink icon={<Plus />} label="Add Crops" isOpen={isOpen} href={'/buyer/addcrops'} />
                                <SidebarLink icon={<MessageCircle />} label="Notifications" isOpen={isOpen} href={'/farmer/message'} />
                                <SidebarLink icon={<TrendingUp />} label="Market Trend" isOpen={isOpen} href={'/farmer/mandi'} />
                                <SidebarLink icon={<Sprout />} label="Pesticides" isOpen={isOpen} href={'/farmer/fertilizers'} />
                            </nav>
                        </div>
                        {isOpen && <div className="px-4 bg-white fixed bottom-0 py-3 w-64 border-t border-gray-200 space-y-4">
                            <div className="flex items-center gap-3">
                                <img src={weather?.icon} alt="" className="w-10 h-10" />
                                <div className="">
                                    <p className="text-sm font-semibold text-blue-500">{weather?.location} | {weather?.region}</p>
                                    <p className="text-xs text-gray-500">Today's feels like {weather?.feels_like} °C</p>
                                </div>
                            </div>
                            {user && user.role === "farmer" && <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                    {user.name.slice(0)}
                                </div>
                                <div className="">
                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">Farmer ID: {user.email}</p>
                                </div>
                            </div>}
                        </div>}
                    </aside>

                    {/* Main Content */}
                    <section className="bg-gray-50">
                        <div className="hidden md:flex md:px-4.5 py-3.5 justify-between items-center">
                            <NextBreadcrumb key={"Nextbreadcrumb"} />
                            <div className="flex items-center gap-6">
                                <LanguageSwitcher />
                                <Link
                                    href={"/message"}
                                    className="flex gap-1 items-center hover:no-underline text-sm font-medium cursor-pointer hover:text-blue-600"
                                >
                                    <MessageCircle size={15} />
                                    Message
                                </Link>
                                <Link
                                    href={"/auth/login"}
                                    className="hover:no-underline bg-gray-200 rounded-xl py-1 px-3 text-sm font-medium cursor-pointer hover:text-blue-600"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        </div>

                        <div className="mt-4 mx-4 md:mx-8">
                            <AutoTranslate>{children}</AutoTranslate>
                        </div>
                    </section>
                </div>
            </AutoTranslate>
        </>
    );
}
