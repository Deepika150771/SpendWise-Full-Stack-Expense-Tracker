import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';

export const CategorySpendingChart = ({ categoryData, currency = '$' }) => {
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="empty-state">
        <p>No expense data available for chart analysis</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          style={{
            backgroundColor: '#1e293b',
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '8px 14px',
            borderRadius: '8px',
            color: '#fff',
            fontSize: '0.85rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
        >
          <p style={{ fontWeight: 700, color: data.color }}>{data.category}</p>
          <p>{currency}{data.amount.toLocaleString()} ({data.percentage}%)</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={95}
              paddingAngle={4}
              dataKey="amount"
              nameKey="category"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="category-legend-list">
        {categoryData.map((item, idx) => (
          <div key={idx} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: item.color }} />
            <span>{item.category}: {item.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonthlyTrendChart = ({ trendData, currency = '$' }) => {
  if (!trendData || trendData.length === 0) {
    return (
      <div className="empty-state">
        <p>No monthly trends available yet</p>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={trendData}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
          <Tooltip
            formatter={(value) => [`${currency}${value.toLocaleString()}`, '']}
            contentStyle={{
              backgroundColor: '#1e293b',
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '0.85rem' }} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
