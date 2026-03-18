'use client';

import { useState } from 'react';
import { useLivePrices, useCommodities, useStates } from '@component/hooks/queries/useMandi';
import { Card, CardContent, CardHeader, CardTitle } from '@component/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@component/components/ui/select';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Skeleton } from '@component/components/ui/skeleton';
type FilterType = {
    commodity: string;
    state: string;
    limit: number;
};

type Props = {
    filter: FilterType;
    setfilter: (filters: FilterType) => void;
};
export default function MandiPriceList({ filter, setfilter }: Props) {

    const { data: prices, isLoading, error } = useLivePrices(filter);
    const { data: commodities } = useCommodities();
    const { data: states } = useStates();

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-48" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-red-600">
                    Failed to load mandi prices
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter Prices</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Select
                            value={filter.commodity}
                            onValueChange={(value) =>
                                setfilter({ ...filter, commodity: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select Commodity" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Commodities">All Commodities</SelectItem>
                                {commodities?.map((commodity) => (
                                    <SelectItem key={commodity} value={commodity}>
                                        {commodity}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select
                            value={filter.state}
                            onValueChange={(value) => setfilter({ ...filter, state: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Commodities">All States</SelectItem>
                                {states?.map((state) => (
                                    <SelectItem key={state} value={state}>
                                        {state}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <button
                            onClick={() => setfilter({ commodity: '', state: '', limit: 20 })}
                            className="px-4 py-2 border rounded hover:bg-gray-50"
                        >
                            Clear Filters
                        </button>
                    </div>
                </CardContent>
            </Card>

            {/* Results */}
            {!prices || prices.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center text-gray-500">
                        No prices found. Try different filters.
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="text-sm text-gray-600">
                        Showing {prices.length} results
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {prices.map((price, index) => (
                            <Card key={index} className="hover:shadow-lg transition-shadow">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <span>{price.commodity}</span>
                                        {price.trend && (
                                            <span className="text-sm">
                                                {price.trend === 'up' && (
                                                    <TrendingUp className="w-4 h-4 text-green-600" />
                                                )}
                                                {price.trend === 'down' && (
                                                    <TrendingDown className="w-4 h-4 text-red-600" />
                                                )}
                                                {price.trend === 'stable' && (
                                                    <Minus className="w-4 h-4 text-gray-600" />
                                                )}
                                            </span>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs text-gray-600">Market</p>
                                            <p className="font-medium">{price.market}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600">Location</p>
                                            <p className="text-sm">
                                                {price.district}, {price.state}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                                            <div>
                                                <p className="text-xs text-gray-600">Min</p>
                                                <p className="font-semibold text-sm">
                                                    ₹{price.min_price}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Modal</p>
                                                <p className="font-semibold text-green-600">
                                                    ₹{price.modal_price}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Max</p>
                                                <p className="font-semibold text-sm">
                                                    ₹{price.max_price}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 pt-2">
                                            Date: {new Date(price.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}