"use client";

import { useState } from 'react';
import { Heart, Package, MapPin, Star, DollarSign, Users, ArrowRight, Award } from 'lucide-react';
import MaterialsCard from '@component/components/common/MaterialsCard';
import { useAllCrops } from '@component/hooks/queries/useCrops';
import { useBuyerDashboard } from '@component/hooks/queries/useAnalytics';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@component/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import Link from 'next/link';

export default function BuyerDashboard() {

    // Mock data
    const stats = [
        { label: 'Total Spent', value: '₹32,450', change: '+8.2%', icon: DollarSign, color: 'from-blue-500 to-indigo-600' },
        { label: 'Orders', value: '45', change: '+12', icon: Package, color: 'from-green-500 to-emerald-600' },
        { label: 'Saved', value: '18', change: '+3', icon: Heart, color: 'from-pink-500 to-rose-600' },
        { label: 'Farmers', value: '23', change: '+5', icon: Users, color: 'from-purple-500 to-violet-600' },
    ];

    const { data: materials = [], isLoading: loading } = useAllCrops();
    const { data: dashboard } = useBuyerDashboard()
    console.log(dashboard)


    const recentOrders = [
        {
            id: 'ORD-2401',
            items: ['Tomatoes 2kg', 'Onions 1kg'],
            total: '₹68',
            status: 'delivered',
            date: 'Today, 10:30 AM',
            farmer: 'Ramesh Patil'
        },
        {
            id: 'ORD-2398',
            items: ['Cauliflower 1pc', 'Carrots 500g'],
            total: '₹65',
            status: 'in-transit',
            date: 'Yesterday, 3:45 PM',
            farmer: 'Suresh Kumar'
        },
        {
            id: 'ORD-2395',
            items: ['Green Peas 1kg', 'Capsicum 500g'],
            total: '₹105',
            status: 'processing',
            date: 'Jan 22, 2:15 PM',
            farmer: 'Vijay Sharma'
        },
    ];

    const topFarmers = [
        { name: 'Ramesh Patil', location: 'Nashik', rating: 4.9, products: 24, avatar: 'RP' },
        { name: 'Suresh Kumar', location: 'Pune', rating: 4.8, products: 18, avatar: 'SK' },
        { name: 'Vijay Sharma', location: 'Mumbai', rating: 4.7, products: 32, avatar: 'VS' },
    ];

    const specialOffers = [
        { title: 'Fresh Harvest Sale', discount: '25% OFF', code: 'FRESH25', color: 'from-green-300 to-emerald-500' },
        { title: 'Organic Bundle', discount: '₹100 OFF', code: 'ORGANIC100', color: 'from-orange-300 to-red-500' },
    ];

    const chartData = Object.entries(dashboard?.price_insights ?? {}).map(
        ([category, prices]: any) => ({
            category,
            Average: prices.average,
            Lowest: prices.lowest,
            Highest: prices.highest,
        })
    )


    return (
        <div className="min-h-screen bg-gray-50">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                            </div>
                            <div className="flex justify-between items-center w-full">
                                <p className="text-gray-500 text-base mb-1">{stat.label}</p>
                                <p className="text-3xl font-medium text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Special Offers Banner */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    {specialOffers.map((offer, i) => (
                        <div key={i} className={`bg-gradient-to-r ${offer.color} rounded-2xl p-6 text-white relative overflow-hidden`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                            <div className="relative">
                                <p className="text-sm opacity-90 mb-1">Special Offer</p>
                                <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                                <p className="text-3xl font-bold mb-4">{offer.discount}</p>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg font-mono font-bold">
                                        {offer.code}
                                    </div>
                                    <button className="bg-white text-gray-900 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                                        Shop Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6">

                    {/* Left Column - Main Content (2/3) */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Featured Products */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Fresh Products</h3>
                                    <p className="text-sm text-gray-500">Direct from farmers</p>
                                </div>
                                <Link href={"/buyer/materials"} className="text-blue-600 font-semibold text-sm hover:underline">View All</Link>
                            </div>
                            <MaterialsCard materials={materials.slice(0, 10)} loading={loading} />
                        </div>
                    </div>

                    {/* Right Sidebar (1/3) */}
                    <div className="space-y-6">

                        {/* Recent Orders */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <h3 className="font-bold text-gray-900 mb-4">Recent Orders</h3>
                            <div className="space-y-3">
                                {recentOrders.map(order => (
                                    <div key={order.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-500 transition">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-mono font-bold text-gray-600">{order.id}</span>
                                            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {order.status === 'delivered' ? '✓ Delivered' :
                                                    order.status === 'in-transit' ? '🚚 In Transit' :
                                                        '⏳ Processing'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">{order.items.join(', ')}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                                            <span>{order.date}</span>
                                            <span className="font-bold text-gray-900">{order.total}</span>
                                        </div>
                                        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1">
                                            View Details
                                            <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <ChartContainer
                            config={{
                                Average: {
                                    label: "Average Price",
                                    color: "#000000",
                                },
                                Lowest: {
                                    label: "Lowest Price",
                                    color: "#16a34a",
                                },
                                Highest: {
                                    label: "Highest Price",
                                    color: "#dc2626",
                                },
                            }}
                            className="h-[320px] w-full"
                        >
                            <LineChart data={chartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="category" />
                                <YAxis />
                                <ChartTooltip content={<ChartTooltipContent />} />

                                <Line
                                    type="monotone"
                                    dataKey="Average"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Lowest"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="Highest"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ChartContainer>

                        {/* Top Farmers */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-yellow-500" />
                                <h3 className="font-bold text-gray-900">Top Farmers</h3>
                            </div>
                            <div className="space-y-3">
                                {topFarmers.map((farmer, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {farmer.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm text-gray-900">{farmer.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <MapPin className="w-3 h-3" />
                                                <span>{farmer.location}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-bold text-gray-900">{farmer.rating}</span>
                                            </div>
                                            <p className="text-xs text-gray-500">{farmer.products} items</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}