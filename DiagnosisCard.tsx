import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, Legend 
} from 'recharts';
import { Activity, Users, MapPin, AlertTriangle, Clock } from 'lucide-react';
import { Diagnosis } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

const MOCK_DATA = [
  { month: 'Oct', cases: 45 },
  { month: 'Nov', cases: 52 },
  { month: 'Dec', cases: 48 },
  { month: 'Jan', cases: 95 },
  { month: 'Feb', cases: 180 },
  { month: 'Mar', cases: 342 },
];

const DISTRICT_DATA = [
  { name: 'Kakamega', cases: 342, trend: 'up' },
  { name: 'Turkana West', cases: 195, trend: 'up' },
  { name: 'Lodwar', cases: 42, trend: 'stable' },
  { name: 'Kakuma', cases: 88, trend: 'up' },
];

interface MinistryDashboardProps {
  liveFeed: Diagnosis[];
}

export const MinistryDashboard: React.FC<MinistryDashboardProps> = ({ liveFeed }) => {
  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 h-full">
      {/* Main Content */}
      <div className="flex-1 space-y-6 overflow-y-auto pr-2">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Health Surveillance</h1>
            <p className="text-slate-500">Ministry of Health • National Dashboard</p>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold flex items-center gap-2 border border-red-100">
              <AlertTriangle className="w-4 h-4" />
              High Alert: Kakamega District
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center">
                <Activity className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Diagnoses</p>
                <p className="text-2xl font-bold text-slate-900">1,284</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Active CHVs</p>
                <p className="text-2xl font-bold text-slate-900">42</p>
              </div>
            </div>
          </div>
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Districts Covered</p>
                <p className="text-2xl font-bold text-slate-900">8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Malaria Outbreak Trend (Kakamega District)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cases" 
                    stroke="#ef4444" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Cases by District</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DISTRICT_DATA} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} width={100} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="cases" radius={[0, 8, 8, 0]} barSize={32}>
                    {DISTRICT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cases > 100 ? '#ef4444' : '#22c55e'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Live Feed */}
      <aside className="w-full lg:w-80 bg-slate-100 rounded-3xl p-6 flex flex-col gap-4 border border-slate-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-brand-600" />
            Live Feed
          </h3>
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {liveFeed.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <p className="text-sm">Waiting for incoming data...</p>
            </div>
          ) : (
            liveFeed.map((item) => (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                    item.suspectedIllness === 'Malaria' ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
                  )}>
                    {item.suspectedIllness}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-800 line-clamp-1">{item.symptoms}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  {item.district}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
