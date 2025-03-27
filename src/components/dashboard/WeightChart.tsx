import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const WeightChart = () => {
  return (
    <div className="h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={[
            { date: 'Jan', weight: 180 },
            { date: 'Feb', weight: 178 },
            { date: 'Mar', weight: 176 },
            { date: 'Apr', weight: 174 },
            { date: 'May', weight: 173 },
          ]}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            contentStyle={{ backgroundColor: '#333', borderColor: '#444' }}
          />
          <Line 
            type="monotone" 
            dataKey="weight" 
            stroke="#ea384c" 
            activeDot={{ r: 8 }} 
            strokeWidth={2} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightChart;
