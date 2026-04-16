"use client";

import {
    Activity, Droplets, MapPin, Wind, Users, Package, DollarSign,
    RefreshCw,
} from 'lucide-react';
import { useCurrentWeather } from '@component/hooks/queries/useWeather';
import { useGeolocation } from '@component/hooks/useGeolocation';
import { AutoTranslate } from '@component/components/common/AutoTranslate';
import { useDeleteCrops, useGetMyCrops } from '@component/hooks/queries/useCrops';
import { Button } from '@component/components/ui/button';
import { useFarmerDashboard } from '@component/hooks/queries/useAnalytics';
import { formatNumber } from '@component/lib/utils';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@component/components/ui/accordion";
import { CategoryChart } from '@component/components/common/CategoryChart';
import { PriceTrendChart } from '@component/components/common/PricetrendChart';
import FarmerNewsSection from '@component/components/common/FarmerNewSection';

export default function FarmerDashboard() {
    // const [selectedCrop, setSelectedCrop] = useState('tomato');

    const { data: mycrops } = useGetMyCrops();
    console.log(mycrops)
    const { mutate: deletecrop, isPending } = useDeleteCrops()
    const { data: dashboard, isLoading, errorfarm } = useFarmerDashboard();


    const mandiPrices: { [key: string]: Array<{ mandi: string; price: number; distance: string; trend: string; change: number; lastUpdated: string }> } = {
        tomato: [
            { mandi: 'Mumbai APMC', price: 2500, distance: '12 km', trend: 'up', change: 13.6, lastUpdated: '2 hours ago' },
            { mandi: 'Pune Market', price: 2300, distance: '45 km', trend: 'up', change: 8.2, lastUpdated: '1 hour ago' },
            { mandi: 'Nashik Mandi', price: 2700, distance: '68 km', trend: 'down', change: -2.5, lastUpdated: '3 hours ago' },
            { mandi: 'Thane Market', price: 2400, distance: '8 km', trend: 'up', change: 15.1, lastUpdated: '30 mins ago' },
        ],
    };

    const demandAlerts = [
        { buyer: 'Fresh Basket Pvt Ltd', crop: 'Tomato', quantity: '500 kg', price: '₹28/kg', location: 'Mumbai', urgent: true },
        { buyer: 'Green Valley Foods', crop: 'Onion', quantity: '1 Ton', price: '₹19/kg', location: 'Pune', urgent: false },
    ];

    // const currentPrices = mandiPrices[selectedCrop] || [];
    // const avgPrice = currentPrices.reduce((sum, m) => sum + m.price, 0) / currentPrices.length;
    const { lat, lon, loading: geoLoading } = useGeolocation();
    const {
        data: weather,
    } = useCurrentWeather(lat!, lon!, {
        enabled: !geoLoading && !!lat && !!lon,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">Loading Dashboard</p>
                </div>
            </div>
        )
    }

    if (errorfarm) {
        return <div className="p-10 text-center">Material not found.</div>;
    }

    // Mock dat
    const stats = [
        { label: 'Total Sales', value: '₹45,230', change: '+12.5%', icon: DollarSign, color: 'from-emerald-500 to-teal-600' },
        { label: 'Buyers', value: '156', change: '+23', icon: Users, color: 'from-purple-500 to-pink-600' },
        { label: 'Products', value: `${mycrops?.length || 0}`, change: '+2', icon: Package, color: 'from-orange-500 to-red-600' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <FarmerNewsSection />
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center`}>
                                    <stat.icon className="w-6 h-6 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
                            </div>
                            <div className='flex justify-between w-full items-center'>
                                <p className="text-gray-500 text-base mb-1">{stat.label}</p>
                                <p className="text-3xl font-medium text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Grid */}
                < div className="grid lg:grid-cols-3 gap-6" >

                    {/* Left Column - 2/3 width */}
                    < div className="lg:col-span-2 space-y-6" >

                        {/* Weather + Smart Recommendation */}
                        < div className="grid md:grid-cols-1 gap-6" >
                            {/* Weather Widget */}
                            < div className="bg-gradient-to-br from-blue-300 to-cyan-500 rounded-md p-6 text-white relative overflow-hidden" >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
                                <div className="relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="flex gap-2">
                                                <p className="text-blue-100 text-sm mb-1">{weather?.condition || "No Weather Data"}</p>
                                                <span className="w-1 h-1 bg-white rounded-full mt-2"></span>
                                                <p className="text-blue-100 text-sm mb-1">Feels Like {weather?.feels_like || "N/A"}°C</p>
                                            </div>
                                            <p className="text-5xl font-bold">{weather?.temperature || "N/A"}°C</p>
                                        </div>
                                        <img src={weather?.icon || ""} alt="Weather Icon" className="w-16 h-16" />
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 pt-4 border-t border-white/20">
                                        <div className="text-center">
                                            <Droplets className="w-4 h-4 mx-auto mb-1 opacity-80" />
                                            <p className="text-xs">{weather?.humidity || "N/A"}%</p>
                                        </div>
                                        <div className="text-center">
                                            <Wind className="w-4 h-4 mx-auto mb-1 opacity-80" />
                                            <p className="text-xs">{weather?.wind_speed || "N/A"} km/h</p>
                                        </div>
                                        <div className="text-center">
                                            <Activity className="w-4 h-4 mx-auto mb-1 opacity-80" />
                                            <p className="text-xs">{weather?.pressure || "N/A"}</p>
                                        </div>
                                        <div className="text-center">
                                            <Activity className="w-4 h-4 mx-auto mb-1 opacity-80" />
                                            <p className="text-xs">Good</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-4">
                                        <p className="text-blue-100 font-bold text-sm mb-1">{weather?.location || "N/A"}</p>
                                        <span className="w-1 h-1 bg-white rounded-full mt-2"></span>
                                        <p className="text-blue-100 text-sm mb-1">{weather?.region || "N/A"} | {weather?.country || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* <AIInsights
                                insights={dashboard?.ai_insights ?? ''}
                                aiStatus={dashboard?.ai_status ?? ''}
                            /> */}

                        <div className='flex gap-4'>
                            <CategoryChart
                                data={dashboard?.category_distribution}
                                totalCrops={dashboard?.summary.total_crops}
                            />

                            {dashboard?.top_performers.most_viewed && (
                                <div className="grid md:grid-cols-1 gap-6 w-1/2">
                                    <div className="bg-gradient-to-br from-indigo-300 to-purple-500 rounded-lg p-6 text-white">
                                        <h3 className="text-lg font-semibold mb-2">🏆 Most Viewed Crop</h3>
                                        <p className="text-2xl font-bold">{dashboard.top_performers.most_viewed.crop_name}</p>
                                        <p className="text-sm opacity-90 mt-1">
                                            {formatNumber(dashboard.top_performers.most_viewed.views)} views •
                                            {dashboard.top_performers.most_viewed.category}
                                        </p>
                                    </div>

                                    {dashboard.top_performers.best_category && (
                                        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg p-6 text-white">
                                            <h3 className="text-lg font-semibold mb-2">⭐ Best Selling Category</h3>
                                            <p className="text-2xl font-bold">{dashboard.top_performers.best_category}</p>
                                            <p className="text-sm opacity-90 mt-1">
                                                Your top performing category
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mx-auto p-4">
                            <h2 className="text-xl font-semibold mb-4">
                                Farmer Help & FAQs
                            </h2>

                            <Accordion type="single" collapsible className="w-full space-y-2">

                                <AccordionItem value="item-1">
                                    <AccordionTrigger>
                                        Which crop is best to grow this season?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        The best crop depends on your location, soil type, and current
                                        weather conditions. Our AI assistant analyzes seasonal data and
                                        local trends to recommend the most profitable crops for you.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2">
                                    <AccordionTrigger>
                                        How can I check today’s market price for my crops?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        You can view real-time market prices directly on our platform.
                                        Prices are updated based on nearby markets and verified buyers to
                                        help you sell at the right time.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3">
                                    <AccordionTrigger>
                                        How do I sell my crops directly to buyers?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Simply list your crops with quantity and expected price. Buyers can
                                        contact you directly through the platform, eliminating middlemen
                                        and increasing your profit.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-4">
                                    <AccordionTrigger>
                                        Is transportation provided for selling crops?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        We help connect you with verified transport services. This ensures
                                        safe delivery of crops and reduces post-harvest losses.
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-5">
                                    <AccordionTrigger>
                                        Is this platform legal and safe to use?
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        Yes. The platform follows local agricultural trade guidelines and
                                        ensures secure communication between farmers and buyers.
                                    </AccordionContent>
                                </AccordionItem>

                            </Accordion>
                        </div>

                    </div>

                    {/* Right Column - 1/3 width */}
                    <div className="space-y-6">

                        {/* Demand Alerts */}
                        {/* <div className="bg-white rounded-2xl p-6 border border-gray-200">
                                <div className="flex items-center gap-2 mb-4">
                                    <AlertCircle className="w-5 h-5 text-orange-500" />
                                    <h3 className="font-bold text-gray-900">Live Demands</h3>
                                </div>
                                <div className="space-y-3">
                                    {demandAlerts.map((alert, i) => (
                                        <div key={i} className={`p-4 rounded-xl border-2 ${alert.urgent ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
                                            {alert.urgent && (
                                                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold mb-2 inline-block">
                                                    URGENT
                                                </span>
                                            )}
                                            <h4 className="font-bold text-sm text-gray-900 mb-2">{alert.buyer}</h4>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-semibold">{alert.crop}</span> • {alert.quantity}
                                            </p>
                                            <p className="text-lg font-bold text-gray-900 mb-2">{alert.price}</p>
                                            <p className="text-xs text-gray-600 flex items-center gap-1 mb-3">
                                                <MapPin className="w-3 h-3" /> {alert.location}
                                            </p>
                                            <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-semibold transition">
                                                Accept Order
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div> */}
                        {/* <PriceTrendChart commodity={dashboard.top_performers.most_viewed.crop_name} /> */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-200">
                            <div className="flex items-center gap-2 mb-4">
                                <h3 className="font-thin text-gray-900">My Crops</h3>
                            </div>
                            <div className="space-y-3">
                                {mycrops && mycrops?.length > 0 && mycrops?.map((crop, i) => (
                                    <div key={i} className="flex items-center justify-between  p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                                        <div className='flex gap-2'>
                                            <div className="text-right">
                                                <img src={crop.image_url || ''} className='w-15 h-10 rounded' alt="" />
                                            </div>
                                            <div className="">
                                                <p className="font-medium text-sm text-gray-900">{crop.crop_name}</p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                                    <MapPin className="w-3 h-3 mt-0.5" />
                                                    <span>{crop.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Button disabled={isPending} onClick={() => deletecrop(crop.id)} variant={"outline"}>
                                            {isPending ? "Deleting..." : "Delete"}
                                        </Button>
                                    </div>
                                )) || "Crops Not Created Yet"}
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div>
    );
}