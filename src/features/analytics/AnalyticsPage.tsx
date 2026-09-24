import React from 'react';
import { analyticsStats } from '../../data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { BarChart3, TrendingUp, Sparkles, Layers, Database, Target } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const data = analyticsStats;
  const RADIAN = Math.PI / 180;
  // Use monochromatic or subdued brand-compatible colors instead of bright ones
  const COLORS = ['#171717', '#525252', '#a3a3a3', '#d4d4d4', '#f5f5f5'];

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill={percent > 0.15 ? 'white' : '#171717'} textAnchor="middle" dominantBaseline="central" className="text-[11px] font-medium">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto select-none pb-12">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-brand-surface border border-brand-border p-6 rounded-xl shadow-sm">
        <div className="space-y-1.5">
          <h2 className="text-[18px] font-semibold text-brand-text flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-brand-accent" />
            Semantic Research Analytics
          </h2>
          <p className="text-[13px] text-brand-textMuted">
            Insights on model popularity, publishing velocity, topic clusters, and dataset usage across the research index.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border bg-brand-bg text-[12px] font-medium text-brand-text">
          <Sparkles className="h-4 w-4" />
          <span>Realtime Index Analysis</span>
        </div>
      </div>

      {/* Grid Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1: Publications Per Year */}
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
          <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Publications Per Year
          </h3>
          <div className="h-64 w-full text-[12px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.publicationsPerYear} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#171717', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: '600', color: '#171717', marginBottom: '4px' }}
                />
                <Line type="monotone" dataKey="papers" stroke="#171717" strokeWidth={2} activeDot={{ r: 6 }} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-brand-textMuted text-center leading-relaxed">
            Illustrates the growth of computer vision and transformer publications cataloged in the index over the last 9 years.
          </p>
        </div>

        {/* Chart 2: Top Research Topics */}
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
          <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
            <Target className="h-4 w-4" />
            Top Research Topics
          </h3>
          <div className="h-64 w-full flex items-center justify-center text-[12px]">
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
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#171717', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#171717', fontWeight: '500' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="flex flex-col gap-3 pl-4 flex-shrink-0">
              {data.topResearchTopics.map((t, idx) => (
                <div key={idx} className="flex items-center gap-2 text-[12px] font-medium text-brand-textMuted">
                  <span className="h-3 w-3 rounded-full border border-brand-border" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="truncate max-w-[120px]">{t.topic}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[12px] text-brand-textMuted text-center leading-relaxed">
            Breakdown of core technical domains. Generative AI and Computer Vision remain the primary clusters.
          </p>
        </div>

        {/* Chart 3: Dataset Usage */}
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
          <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
            <Database className="h-4 w-4" />
            Common Reference Datasets
          </h3>
          <div className="h-64 w-full text-[12px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.datasetUsage} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#737373" />
                <YAxis stroke="#737373" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#171717', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f5f5f5' }}
                />
                <Bar dataKey="usage" fill="#171717" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-brand-textMuted text-center leading-relaxed">
            Number of indexed publications using benchmark sets for modeling and testing phases.
          </p>
        </div>

        {/* Chart 4: Model Popularity */}
        <div className="p-6 rounded-xl border border-brand-border bg-brand-surface shadow-sm space-y-6">
          <h3 className="text-[14px] font-semibold text-brand-textMuted uppercase tracking-wider flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Model Architecture Popularity
          </h3>
          <div className="h-64 w-full text-[12px] flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.modelPopularity}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="name" stroke="#737373" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis stroke="#737373" angle={30} domain={[0, 'auto']} />
                <Radar name="Index Share" dataKey="score" stroke="#171717" fill="#171717" fillOpacity={0.1} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#171717', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[12px] text-brand-textMuted text-center leading-relaxed">
            Self-attention Transformers hold the highest share of model implementations, followed by Diffusion backbones.
          </p>
        </div>

      </div>
    </div>
  );
};
