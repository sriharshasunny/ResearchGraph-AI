import React from 'react';
import { analyticsStats } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, TrendingUp, Sparkles, Layers, Database, Target } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const data = analyticsStats;
  const RADIAN = Math.PI / 180;
  const COLORS = ['#6366f1', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 select-none pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/40 dark:bg-slate-900/45 border border-slate-200/80 dark:border-slate-800/40 p-5 rounded-2xl backdrop-blur-md shadow-sm">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Semantic Research Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Insights on model popularity, publishing velocity, topic clusters, and dataset usage across the research index.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-950/50 bg-indigo-50/20 dark:bg-indigo-950/10 text-xs font-semibold text-indigo-650 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5 animate-pulse" />
          <span>Realtime Index Analysis</span>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Publications Per Year */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
            Publications Per Year
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.publicationsPerYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis dataKey="year" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="papers" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 8 }} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-450 text-center leading-normal">
            Illustrates the growth of computer vision and transformer publications cataloged in the index over the last 9 years.
          </p>
        </div>

        {/* Chart 2: Top Research Topics */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="h-4.5 w-4.5 text-blue-500" />
            Top Research Topics
          </h3>
          <div className="h-64 w-full flex items-center justify-center text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.topResearchTopics}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="topic"
                >
                  {data.topResearchTopics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex flex-col gap-2 pl-4 flex-shrink-0">
              {data.topResearchTopics.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate max-w-[90px]">{t.topic}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-450 text-center leading-normal">
            Breakdown of core technical domains. Generative AI and Computer Vision remain the primary clusters.
          </p>
        </div>

        {/* Chart 3: Dataset Usage */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <Database className="h-4.5 w-4.5 text-emerald-500" />
            Common Reference Datasets
          </h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.datasetUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:opacity-10" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '12px', color: '#fff' }}
                />
                <Bar dataKey="usage" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-450 text-center leading-normal">
            Number of indexed publications using benchmark sets for modeling and testing phases.
          </p>
        </div>

        {/* Chart 4: Model Popularity */}
        <div className="p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/40 bg-white/40 dark:bg-slate-900/45 backdrop-blur-md shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-450 uppercase tracking-widest flex items-center gap-1.5">
            <Layers className="h-4.5 w-4.5 text-purple-500" />
            Model Architecture Popularity
          </h3>
          <div className="h-64 w-full text-xs flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.modelPopularity}>
                <PolarGrid stroke="#e2e8f0" className="dark:opacity-10" />
                <PolarAngleAxis dataKey="name" stroke="#94a3b8" />
                <PolarRadiusAxis stroke="#94a3b8" />
                <Radar name="Index Share" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-450 text-center leading-normal">
            Self-attention Transformers hold the highest share of model implementations, followed by Diffusion backbones.
          </p>
        </div>

      </div>
    </div>
  );
};
