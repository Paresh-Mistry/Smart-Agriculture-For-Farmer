'use client';

import { usePriceTrend, useCommodities, useStates } from '@component/hooks/queries/useMandi';
import { Card, CardContent, CardHeader, CardTitle } from '@component/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@component/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@component/components/ui/select';
import { Badge } from '@component/components/ui/badge';
import { Skeleton } from '@component/components/ui/skeleton';
import {
    TrendingUp,
    TrendingDown,
    Minus,
    ArrowUp,
    ArrowDown,
    AlertCircle,
    Calendar,
    DollarSign,
} from 'lucide-react';
import { useState } from 'react';

interface PriceTrendTableProps {
    commodity: string;
}

export function PriceTrendTable({ commodity }: PriceTrendTableProps) {
    const [state, setState] = useState<string>('');
    const [days, setDays] = useState<number>(30);

    const { data: trend, isLoading, error } = usePriceTrend({ commodity, state, days });
    const { data: states } = useStates();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 text-red-600 rounded text-center">
                <AlertCircle className="h-4 w-4" />
                Failed to load price trend data. Please try again.
            </div>
        );
    }

    if (!trend || trend.dates.length === 0) {
        return (
            <Card>
                <CardContent className="p-12 text-center">
                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No price data available for {commodity}</p>
                    <p className="text-sm text-gray-400 mt-2">
                        Try selecting a different commodity or state
                    </p>
                </CardContent>
            </Card>
        );
    }

    // Prepare table data
    const tableData = trend.dates.map((date, index) => {
        const currentPrice = trend.prices[index];
        const previousPrice = index > 0 ? trend.prices[index - 1] : null;
        const priceChange = previousPrice ? currentPrice - previousPrice : 0;
        const percentageChange = previousPrice
            ? ((priceChange / previousPrice) * 100).toFixed(2)
            : '0';

        return {
            date,
            price: currentPrice,
            change: priceChange,
            percentageChange: parseFloat(percentageChange),
        };
    }).reverse(); // Reverse to show latest date first

    const getTrendIcon = () => {
        switch (trend.trend) {
            case 'up':
                return <TrendingUp className="w-5 h-5 text-green-600" />;
            case 'down':
                return <TrendingDown className="w-5 h-5 text-red-600" />;
            default:
                return <Minus className="w-5 h-5 text-gray-600" />;
        }
    };

    const getTrendColor = () => {
        switch (trend.trend) {
            case 'up':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'down':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Card with Filters */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <CardTitle className="text-2xl">{commodity} - Price Trend</CardTitle>
                            <Badge className={getTrendColor()}>
                                <span className="flex items-center gap-1">
                                    {getTrendIcon()}
                                    {trend.trend.toUpperCase()}
                                </span>
                            </Badge>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Select value={state} onValueChange={setState}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All States" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="States">All States</SelectItem>
                                    {states?.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={days.toString()} onValueChange={(v) => setDays(parseInt(v))}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7">Last 7 Days</SelectItem>
                                    <SelectItem value="15">Last 15 Days</SelectItem>
                                    <SelectItem value="30">Last 30 Days</SelectItem>
                                    <SelectItem value="60">Last 60 Days</SelectItem>
                                    <SelectItem value="90">Last 90 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    {/* Summary Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="w-4 h-4 text-blue-600" />
                                <p className="text-xs text-blue-600 font-medium">Average Price</p>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">
                                ₹{trend.average_price.toFixed(2)}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowDown className="w-4 h-4 text-green-600" />
                                <p className="text-xs text-green-600 font-medium">Lowest Price</p>
                            </div>
                            <p className="text-2xl font-bold text-green-700">₹{trend.min_price}</p>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                                <ArrowUp className="w-4 h-4 text-red-600" />
                                <p className="text-xs text-red-600 font-medium">Highest Price</p>
                            </div>
                            <p className="text-2xl font-bold text-red-700">₹{trend.max_price}</p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Calendar className="w-4 h-4 text-purple-600" />
                                <p className="text-xs text-purple-600 font-medium">Data Points</p>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">
                                {trend.data_points || trend.dates.length}
                            </p>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <p className="text-sm text-gray-600 mb-2">Price Range</p>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gradient-to-r from-green-500 to-red-500 h-2 rounded"></div>
                            <span className="text-xs text-gray-500">
                                ₹{trend.min_price} - ₹{trend.max_price}
                            </span>
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-xs text-green-600">Low</span>
                            <span className="text-xs text-red-600">High</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Price Trend Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Daily Price Records</CardTitle>
                    <p className="text-sm text-gray-500">
                        Showing {tableData.length} records from {days} days
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50">
                                    <TableHead className="w-[100px]">#</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">Price (₹/quintal)</TableHead>
                                    <TableHead className="text-right">Change (₹)</TableHead>
                                    <TableHead className="text-right">Change (%)</TableHead>
                                    <TableHead className="text-center">Trend</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tableData.map((row, index) => {
                                    const isPositive = row.change > 0;
                                    const isNegative = row.change < 0;
                                    const isHighest = row.price === trend.max_price;
                                    const isLowest = row.price === trend.min_price;

                                    return (
                                        <TableRow
                                            key={index}
                                            className={`
                        ${isHighest ? 'bg-red-50 hover:bg-red-100' : ''}
                        ${isLowest ? 'bg-green-50 hover:bg-green-100' : ''}
                      `}
                                        >
                                            <TableCell className="font-medium text-gray-500">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">
                                                        {new Date(row.date).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-base">₹{row.price}</span>
                                                    {isHighest && (
                                                        <Badge variant="destructive" className="text-xs mt-1">
                                                            Highest
                                                        </Badge>
                                                    )}
                                                    {isLowest && (
                                                        <Badge variant="default" className="text-xs mt-1 bg-green-600">
                                                            Lowest
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {index < tableData.length - 1 ? (
                                                    <span
                                                        className={`font-semibold ${isPositive
                                                                ? 'text-green-600'
                                                                : isNegative
                                                                    ? 'text-red-600'
                                                                    : 'text-gray-600'
                                                            }`}
                                                    >
                                                        {isPositive && '+'}
                                                        {row.change.toFixed(2)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {index < tableData.length - 1 ? (
                                                    <div className="flex items-center justify-end gap-1">
                                                        {isPositive && (
                                                            <ArrowUp className="w-4 h-4 text-green-600" />
                                                        )}
                                                        {isNegative && (
                                                            <ArrowDown className="w-4 h-4 text-red-600" />
                                                        )}
                                                        <span
                                                            className={`font-semibold ${isPositive
                                                                    ? 'text-green-600'
                                                                    : isNegative
                                                                        ? 'text-red-600'
                                                                        : 'text-gray-600'
                                                                }`}
                                                        >
                                                            {isPositive && '+'}
                                                            {row.percentageChange}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {index < tableData.length - 1 ? (
                                                    <div className="flex justify-center">
                                                        {isPositive ? (
                                                            <div className="bg-green-100 p-1 rounded">
                                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                                            </div>
                                                        ) : isNegative ? (
                                                            <div className="bg-red-100 p-1 rounded">
                                                                <TrendingDown className="w-4 h-4 text-red-600" />
                                                            </div>
                                                        ) : (
                                                            <div className="bg-gray-100 p-1 rounded">
                                                                <Minus className="w-4 h-4 text-gray-600" />
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Export Button */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={() => {
                                // Convert to CSV and download
                                const csv = [
                                    ['Date', 'Price (₹)', 'Change (₹)', 'Change (%)'],
                                    ...tableData.map((row) => [
                                        new Date(row.date).toLocaleDateString(),
                                        row.price,
                                        row.change.toFixed(2),
                                        row.percentageChange,
                                    ]),
                                ]
                                    .map((row) => row.join(','))
                                    .join('\n');

                                const blob = new Blob([csv], { type: 'text/csv' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${commodity}_price_trend_${new Date().toISOString().split('T')[0]}.csv`;
                                a.click();
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Export to CSV
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}