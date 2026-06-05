'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const performanceData = [
  { name: 'DPPI', performance: 61, fill: '#0f2847' },   // brand-900
  { name: 'DPHC', performance: 44, fill: '#0e6531' },   // emerald-700
  { name: 'DPC', performance: 66, fill: '#144176' },    // brand-700
  { name: 'DHS', performance: 28, fill: '#8b5cf6' },    // violet-500
];

const budgetData = [
  { name: 'Budget Used', value: 1205000, color: '#0f2847' },
  { name: 'Budget Remaining', value: 1615000, color: '#cbd5e1' }, // slate-300
];

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `Le ${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `Le ${(value / 1_000).toFixed(0)}K`;
  return `Le ${value}`;
}

export function DirectoratePerformanceBarChart() {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            dy={10} 
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            domain={[0, 100]} 
          />
          <Tooltip
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`${value}%`, 'Performance']}
          />
          <Bar dataKey="performance" radius={[4, 4, 0, 0]} maxBarSize={40}>
            {performanceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BudgetUtilizationPieChart() {
  return (
    <div className="h-[280px] w-full flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={budgetData}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {budgetData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
            formatter={(value, _entry: any) => (
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300 ml-1">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
