'use client';

import { usePriceTrend } from '@component/hooks/queries/useMandi';
import { Card, CardContent, CardHeader, CardTitle } from '@component/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PriceTrendChartProps {
  commodity: string;
  state?: string;
  days?: number;
}

export function PriceTrendChart({ commodity, state, days = 30 }: PriceTrendChartProps) {
  const { data: trend, isLoading } = usePriceTrend({ commodity, state, days });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">Loading trend...</CardContent>
      </Card>
    );
  }

  if (!trend || trend.dates.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-gray-500">
          No trend data available
        </CardContent>
      </Card>
    );
  }

  const chartData = trend.dates.map((date, index) => ({
    date: new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
    price: trend.prices[index],
  }));

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
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {commodity} Price Trend {state && `- ${state}`}
          </span>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            <span className={`text-sm font-normal ${getTrendColor()}`}>
              {trend.trend.toUpperCase()}
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div>
            <p className="text-xs text-gray-600">Average Price</p>
            <p className="text-xs font-bold text-blue-600">₹{trend.average_price}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Min Price</p>
            <p className="text-xs font-bold text-green-600">₹{trend.min_price}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Max Price</p>
            <p className="text-xs font-bold text-red-600">₹{trend.max_price}</p>
          </div>
        </div>

        <ResponsiveContainer height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              formatter={(value: number) => [`₹${value}`, 'Price']}
              contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        <p className="text-xs text-gray-500 mt-2">
          Data points: {trend.data_points} | Period: {days} days
        </p>
      </CardContent>
    </Card>
  );
}