'use client';

import { useState } from 'react';
import { PriceTrendChart } from '@component/components/common/PricetrendChart';
import { PriceComparison } from '@component/components/common/PriceComparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@component/components/ui/tabs';
import MandiPriceList from '@component/components/common/MandiPriceList';
import { PriceTrendTable } from '@component/components/common/PriceTrendTable';

export default function MandiPricesPage() {
    const [filters, setFilters] = useState({
        commodity: '',
        state: '',
        limit: 20,
    });

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">Live Mandi Prices</h1>

            <Tabs defaultValue="prices" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="prices">Live Prices</TabsTrigger>
                    <TabsTrigger value="trends">Price Trends</TabsTrigger>
                    <TabsTrigger value="compare">Compare States</TabsTrigger>
                </TabsList>

                <TabsContent value="prices">
                    <MandiPriceList filter={filters} setfilter={setFilters} />
                </TabsContent>

                <TabsContent value="trends">
                    <PriceTrendTable commodity={filters.commodity} />
                </TabsContent>

                <TabsContent value="compare">
                    <PriceComparison commodity={filters.commodity} />
                </TabsContent>
            </Tabs>
        </div>
    );
}