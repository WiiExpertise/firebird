"use client";

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';

interface ChartDataPoint {
  time: number;
  value: number;
}

interface SentimentChartProps {
  data: ChartDataPoint[];
  isLoading?: boolean;
  error?: string | null;
}

const formatXAxis = (tickItem: number) => moment(tickItem).format('MMM DD');
const formatYAxis = (tickItem: number) => tickItem.toFixed(1) // .toFixed(1);  This moves it down to 0? 

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-300 rounded shadow-sm text-xs">
        <p className="font-semibold">{moment(label).format('MMM DD, YYYY')}</p>
        <p className="text-blue-600">{`Avg. Sentiment: ${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};


const SentimentChart: React.FC<SentimentChartProps> = ({ data, isLoading, error }) => {

  if (isLoading) {
    return <div className="h-full flex items-center justify-center text-gray-500 text-sm">Loading Chart Data...</div>; // Use h-full
  }
  if (error) {
    return <div className="h-full flex items-center justify-center text-red-600 text-sm">{error}</div>; // Use h-full
  }
  if (!data || data.length === 0) {
    return <div className="h-full flex items-center justify-center text-gray-500 text-sm">No sentiment data available.</div>; // Use h-full
  }

  //  Added logic to remove duplicate timestamps 
  const uniqueTimeData = React.useMemo(() => {
    const seenTimes = new Set<number>();
    return data.filter((item) => {
      if (!seenTimes.has(item.time)) {
        seenTimes.add(item.time);
        return true;
      }
      return false;
    });
  }, [data]); // Recalculate only when the input data changes


  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={uniqueTimeData}
        margin={{ top: 5, right: 15, left: -10, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
        <XAxis
          dataKey="time"
          tickFormatter={formatXAxis}
          scale="time"
          type="number"
          domain={['dataMin', 'dataMax']}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          dy={5}
        />
        <YAxis
          domain={[-1.0, 1.0]}
          tickFormatter={formatYAxis}
          tickCount={5}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          allowDataOverflow={true}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#E8C5CB" // Miko Pink
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#D8AAB4' }} // Miko Pink Dark
          name="Avg. Sentiment"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SentimentChart;
