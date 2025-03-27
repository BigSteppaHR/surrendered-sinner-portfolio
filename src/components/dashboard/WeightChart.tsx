import React, { useState, useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const WeightChart = () => {
  const { profile } = useAuth();
  const [weightData, setWeightData] = useState([
    { date: 'Jan', weight: 180 },
    { date: 'Feb', weight: 178 },
    { date: 'Mar', weight: 176 },
    { date: 'Apr', weight: 174 },
    { date: 'May', weight: 173 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchWeightData = async () => {
      if (!profile?.id) return;
      
      setIsLoading(true);
      try {
        // For now, we'll keep using the static data
        // In the future, we'll fetch from the weight_records table
        // const { data, error } = await supabase
        //   .from('weight_records')
        //   .select('*')
        //   .eq('user_id', profile.id)
        //   .order('recorded_at', { ascending: true });
        
        // if (error) throw error;
        
        // if (data && data.length > 0) {
        //   const formattedData = data.map(record => ({
        //     date: new Date(record.recorded_at).toLocaleDateString('en-US', { month: 'short' }),
        //     weight: record.weight
        //   }));
        //   setWeightData(formattedData);
        // }
      } catch (error) {
        console.error('Error fetching weight data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeightData();
  }, [profile]);

  return (
    <div className="h-[200px]">
      {isLoading ? (
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-4 border-[#ea384c] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={weightData}
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
      )}
    </div>
  );
};

export default WeightChart;
