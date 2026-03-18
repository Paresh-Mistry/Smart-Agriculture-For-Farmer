"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@component/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@component/components/ui/chart";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface CategoryChartProps {
  data: Record<string, number>;
  totalCrops: number;
}

const chartConfig = {
  count: {
    label: "Crops",
    color: "hsl(var(--chart-1))",
  },
};

export function CategoryChart({ data, totalCrops }: CategoryChartProps) {
  const chartData = Object.entries(data || {}).map(([category, count]) => ({
    category,
    count,
    percentage: ((count / totalCrops) * 100).toFixed(1),
  }));

  return (

        <ChartContainer config={chartConfig} className="w-1/2 h-1/3">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              angle={-30}
              textAnchor="end"
            />
            <YAxis tickLine={false} axisLine={false} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="flex flex-col gap-1">
                      <span>Crops: {value}</span>
                      <span>
                        {item.payload.percentage}% of total
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
  );
}
