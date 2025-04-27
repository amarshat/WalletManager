import React, { useState, useEffect, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BudgetAllocation, BudgetCategory } from '@shared/schema';
import { Skeleton } from '@/components/ui/skeleton';
import { formatCurrency } from '@/lib/utils';

// Enhanced type for the data we'll use in the chart
type SunburstData = {
  name: string;
  value: number;
  color: string;
  id: number;
  spent: number;
  allocated: number;
  percent: number;
  categoryId: number;
};

type BudgetSunburstProps = {
  allocations: BudgetAllocation[];
  categories: BudgetCategory[];
  isLoading?: boolean;
  currencyCode?: string;
};

export function BudgetSunburst({
  allocations,
  categories,
  isLoading = false,
  currencyCode = 'USD'
}: BudgetSunburstProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [data, setData] = useState<SunburstData[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);
  const [totalSpent, setTotalSpent] = useState<number>(0);

  // Format data for the chart
  useEffect(() => {
    // Ensure allocations and categories are properly defined and not empty
    if (!allocations || !categories || allocations.length === 0 || categories.length === 0) {
      setData([]);
      setTotalBudget(0);
      setTotalSpent(0);
      return;
    }

    try {
      let total = 0;
      let spent = 0;

      const chartData = allocations.map(allocation => {
        const category = categories.find(cat => cat.id === allocation.categoryId);
        // Safely convert to numbers with fallbacks
        const allocatedAmount = Number(allocation.allocatedAmount) || 0;
        const spentAmount = Number(allocation.spentAmount) || 0;
        
        total += allocatedAmount;
        spent += spentAmount;
        
        return {
          name: category?.name || 'Uncategorized',
          value: allocatedAmount,
          color: category?.color || '#6366F1',
          id: allocation.id,
          spent: spentAmount,
          allocated: allocatedAmount,
          percent: 0, // Will be calculated after we know the total
          categoryId: allocation.categoryId
        };
      });

      // Calculate percentages
      const dataWithPercent = chartData.map(item => ({
        ...item,
        percent: total > 0 ? (item.value / total) * 100 : 0
      }));

      setData(dataWithPercent);
      setTotalBudget(total);
      setTotalSpent(spent);
    } catch (error) {
      console.error("Error processing budget data:", error);
      // Set safe fallback values
      setData([]);
      setTotalBudget(0);
      setTotalSpent(0);
    }
  }, [allocations, categories]);

  const onPieEnter = useCallback(
    (_: any, index: number) => {
      setActiveIndex(index);
    },
    []
  );

  const onPieLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  // Custom active shape component with animation
  const renderActiveShape = (props: any) => {
    const {
      cx,
      cy,
      innerRadius,
      outerRadius,
      startAngle,
      endAngle,
      fill,
      payload,
    } = props;

    // Calculate progress percentage for this category
    const progress = payload.spent / payload.allocated;
    const progressEndAngle = startAngle + (endAngle - startAngle) * (progress > 1 ? 1 : progress);

    return (
      <g>
        {/* Background arc */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill="#f0f0f0"
          stroke={fill}
          strokeWidth={2}
        />
        
        {/* Progress arc - animated */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={progressEndAngle}
          fill={fill}
          stroke={fill}
          className="transition-all duration-500 ease-in-out"
        />
        
        {/* Inner stroke */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 5}
          outerRadius={innerRadius - 2}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        
        {/* Outer stroke */}
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={outerRadius + 2}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget Overview</CardTitle>
          <CardDescription>Loading your budget data</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Skeleton className="h-[300px] w-[300px] rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Overview</CardTitle>
        <CardDescription>
          {formatCurrency(totalSpent, currencyCode)} spent of {formatCurrency(totalBudget, currencyCode)} budgeted
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative h-[300px] w-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                activeIndex={activeIndex !== null ? activeIndex : undefined}
                activeShape={renderActiveShape}
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
                onMouseEnter={onPieEnter}
                onMouseLeave={onPieLeave}
                animationDuration={500}
                animationBegin={0}
                animationEasing="ease-out"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center display with total budget */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <p className="text-sm text-muted-foreground">Total Budget</p>
            <p className="text-lg font-bold">{formatCurrency(totalBudget, currencyCode)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0}% used
            </p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="mt-6 grid grid-cols-2 gap-4 w-full">
          {data.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center gap-2"
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 my-1">
                  <div 
                    className="h-1.5 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${Math.min(100, (item.spent / item.allocated) * 100)}%`, 
                      backgroundColor: item.color 
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(item.spent, currencyCode)} of {formatCurrency(item.allocated, currencyCode)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}