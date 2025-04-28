import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useCarbon, CarbonSummary } from "@/hooks/use-carbon";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend,
  Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// Helper to generate color based on category
const getColorForCategory = (category: string, index: number) => {
  const colorMap: Record<string, string> = {
    'shopping': '#ff6b6b',
    'food': '#38b2ac',
    'housing': '#805ad5',
    'transportation': '#dd6b20',
    'travel': '#3182ce',
    'utilities': '#d69e2e',
    'water': '#319795'
  };
  
  const defaultColors = [
    '#ff6b6b', '#38b2ac', '#805ad5', '#dd6b20', '#3182ce', '#d69e2e', '#319795'
  ];
  
  return colorMap[category.toLowerCase()] || defaultColors[index % defaultColors.length];
};

type ChartType = 'pie' | 'bar';

export function CarbonImpactChart() {
  const { summary, isLoading } = useCarbon();
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartType, setChartType] = useState<ChartType>('pie');
  
  useEffect(() => {
    if (summary && summary.impactByCategory) {
      const data = Object.entries(summary.impactByCategory).map(([category, value], index) => ({
        name: category,
        value: Number(value),
        color: getColorForCategory(category, index),
      }));
      setChartData(data);
    }
  }, [summary]);
  
  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-[300px] w-full" />
      </Card>
    );
  }
  
  if (!summary || !chartData.length) {
    return (
      <Card className="p-6 text-center">
        <p>No carbon impact data available yet.</p>
      </Card>
    );
  }
  
  // Format a number as kg of CO2
  const formatCO2 = (amount: number) => {
    if (amount < 1) {
      return `${(amount * 1000).toFixed(0)}g CO₂`;
    }
    return `${amount.toFixed(2)}kg CO₂`;
  };
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border p-2 text-sm shadow-md">
          <p className="font-medium">{payload[0].name}</p>
          <p>{formatCO2(payload[0].value)}</p>
          <p className="text-xs text-muted-foreground">
            {((payload[0].value / summary.totalImpact) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Carbon Impact by Category</h3>
        <div className="space-x-2">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'pie' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Pie
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 text-sm rounded-md ${
              chartType === 'bar' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-muted-foreground'
            }`}
          >
            Bar
          </button>
        </div>
      </div>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart
              data={chartData.sort((a, b) => b.value - a.value)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
              <XAxis type="number" tickFormatter={formatCO2} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={70}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" barSize={20}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Carbon Impact</p>
          <p className="text-xl font-semibold">{formatCO2(summary.totalImpact)}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Carbon Offset</p>
          <p className="text-xl font-semibold">{formatCO2(summary.totalOffset)}</p>
        </div>
      </div>
    </Card>
  );
}