'use client';

import { useState } from 'react';
import { useComparePrices, useStates } from '@component/hooks/queries/useMandi';
import { Card, CardContent, CardHeader, CardTitle } from '@component/components/ui/card';
import { Badge } from '@component/components/ui/badge';

interface PriceComparisonProps {
  commodity: string;
}

export function PriceComparison({ commodity }: PriceComparisonProps) {
  const [selectedStates, setSelectedStates] = useState<string[]>([
    'Maharashtra',
    'Punjab',
    'Karnataka',
  ]);

  const { data: allStates } = useStates();
  const { data: comparison, isLoading } = useComparePrices({
    commodity,
    states: selectedStates,
  });

  if (isLoading) {
    return <div>Loading comparison...</div>;
  }

  if (!comparison) {
    return <div>No comparison data</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Price Comparison - {commodity}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
          <div>
            <p className="text-xs text-gray-600">Average Price</p>
            <p className="text-lg font-bold">₹{comparison.average_price}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Cheapest</p>
            <p className="text-lg font-bold text-green-600">
              ₹{comparison.cheapest_market.price}
            </p>
            <p className="text-xs text-gray-500">{comparison.cheapest_market.state}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Most Expensive</p>
            <p className="text-lg font-bold text-red-600">
              ₹{comparison.expensive_market.price}
            </p>
            <p className="text-xs text-gray-500">{comparison.expensive_market.state}</p>
          </div>
        </div>

        {/* Detailed Comparison */}
        <div className="space-y-3">
          {comparison.comparison.map((item, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{item.state}</h3>
                <Badge
                  variant={
                    item.modal_price === comparison.cheapest_market.price
                      ? 'default'
                      : 'secondary'
                  }
                >
                  {item.modal_price === comparison.cheapest_market.price
                    ? 'Cheapest'
                    : item.modal_price === comparison.expensive_market.price
                    ? 'Expensive'
                    : 'Average'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">{item.market}</p>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div>
                  <p className="text-xs text-gray-500">Min</p>
                  <p className="font-medium">₹{item.min_price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Modal</p>
                  <p className="font-medium text-green-600">₹{item.modal_price}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Max</p>
                  <p className="font-medium">₹{item.max_price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}