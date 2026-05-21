'use client';

// Force rebuild
import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Filter,
  Search,
  Sliders,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

const initialIndicators = [
  { name: 'Under-5 Mortality Rate', category: 'Maternal & Child', baseline: 122, target: 80, current: 94, unit: 'per 1000', trend: 'down' as const },
  { name: 'Maternal Mortality Ratio', category: 'Maternal & Child', baseline: 717, target: 300, current: 443, unit: 'per 100K', trend: 'down' as const },
  { name: 'DPT3 Coverage', category: 'Immunization', baseline: 78, target: 95, current: 89, unit: '%', trend: 'up' as const },
  { name: 'Skilled Birth Attendance', category: 'Maternal & Child', baseline: 62, target: 90, current: 78, unit: '%', trend: 'up' as const },
  { name: 'Malaria Incidence Rate', category: 'Communicable Disease', baseline: 389, target: 200, current: 267, unit: 'per 1000', trend: 'down' as const },
  { name: 'Health Facility Density', category: 'Health Systems', baseline: 1.2, target: 2.0, current: 1.6, unit: 'per 10K', trend: 'up' as const },
  { name: 'TB Treatment Success Rate', category: 'Communicable Disease', baseline: 72, target: 90, current: 84, unit: '%', trend: 'up' as const },
  { name: 'Contraceptive Prevalence Rate', category: 'Reproductive Health', baseline: 16, target: 35, current: 24, unit: '%', trend: 'up' as const },
  { name: 'OPD Utilization Rate', category: 'Health Systems', baseline: 0.5, target: 1.0, current: 0.8, unit: 'per capita', trend: 'up' as const },
  { name: 'NCD Screening Coverage', category: 'NCD', baseline: 5, target: 30, current: 12, unit: '%', trend: 'up' as const },
];

function progressToTarget(baseline: number, current: number, target: number, isReduction: boolean): number {
  if (isReduction) {
    const totalNeeded = baseline - target;
    const achieved = baseline - current;
    return totalNeeded > 0 ? Math.min(Math.round((achieved / totalNeeded) * 100), 100) : 0;
  }
  const totalNeeded = target - baseline;
  const achieved = current - baseline;
  return totalNeeded > 0 ? Math.min(Math.round((achieved / totalNeeded) * 100), 100) : 0;
}

export default function IndicatorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [indicators, setIndicators] = useState(initialIndicators);

  // Simulation state
  const [simulatedIndicator, setSimulatedIndicator] = useState<string | null>(null);
  const [simulationVal, setSimulationVal] = useState<number>(0);

  const categories = ['All', ...Array.from(new Set(initialIndicators.map((i) => i.category)))];

  const handleSimulate = (name: string, current: number) => {
    setSimulatedIndicator(name);
    setSimulationVal(current);
  };

  const saveSimulation = () => {
    if (!simulatedIndicator) return;
    setIndicators(
      indicators.map((ind) =>
        ind.name === simulatedIndicator ? { ...ind, current: simulationVal } : ind
      )
    );
    setSimulatedIndicator(null);
  };

  const filteredIndicators = indicators.filter((ind) => {
    const matchesSearch = ind.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ind.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || ind.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="heading-page">Health Indicators & Performance</h1>
          <p className="text-muted mt-1">Key performance indicators tracked across all strategic objectives.</p>
        </div>
      </header>

      {/* Filter and Search Panel */}
      <div className="card-flat p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search indicators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-9 py-2 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Indicators Table */}
        <div className="card xl:col-span-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Indicator</th>
                  <th>Category</th>
                  <th className="text-right">Baseline</th>
                  <th className="text-right">Current</th>
                  <th className="text-right">Target</th>
                  <th>Progress</th>
                  <th className="w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filteredIndicators.map((ind) => {
                  const isReduction = ind.trend === 'down';
                  const pct = progressToTarget(ind.baseline, ind.current, ind.target, isReduction);
                  const onTrack = pct >= 60;

                  return (
                    <tr key={ind.name} className="hover:bg-slate-50/50 transition-all">
                      <td>
                        <div className="font-semibold text-slate-950 text-sm leading-relaxed">{ind.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          {isReduction ? (
                            <span className="text-rose-600 font-medium flex items-center gap-0.5">
                              <TrendingDown className="h-3 w-3" /> Target: Decrease
                            </span>
                          ) : (
                            <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                              <TrendingUp className="h-3 w-3" /> Target: Increase
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge-slate text-[10px]">{ind.category}</span>
                      </td>
                      <td className="text-right tabular-nums text-slate-500 text-sm">{ind.baseline} {ind.unit}</td>
                      <td className="text-right tabular-nums font-semibold text-slate-900 text-sm">{ind.current} {ind.unit}</td>
                      <td className="text-right tabular-nums text-slate-500 text-sm">{ind.target} {ind.unit}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                onTrack ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs tabular-nums font-medium text-slate-700">{pct}%</span>
                        </div>
                      </td>
                      <td>
                        <button
                          onClick={() => handleSimulate(ind.name, ind.current)}
                          className="text-xs text-brand-700 hover:text-brand-800 font-semibold flex items-center gap-1 transition-colors"
                        >
                          <Sliders className="h-3.5 w-3.5" />
                          Simulate
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simulator Panel / Action board */}
        <div className="space-y-6">
          {simulatedIndicator ? (
            <div className="card p-6 border-brand-200 bg-brand-50/20 space-y-5 animate-scale-in">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5" />
                  Target Simulator Engine
                </span>
                <h3 className="text-base font-semibold text-slate-900 mt-1">{simulatedIndicator}</h3>
              </div>

              {/* Slider simulation */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Simulated Value:</span>
                  <span className="text-brand-800">
                    {simulationVal}{' '}
                    {indicators.find((i) => i.name === simulatedIndicator)?.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={Math.round(
                    (indicators.find((i) => i.name === simulatedIndicator)?.baseline || 0) * 0.5
                  )}
                  max={Math.round(
                    (indicators.find((i) => i.name === simulatedIndicator)?.target || 0) * 1.5
                  )}
                  value={simulationVal}
                  onChange={(e) => setSimulationVal(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-700"
                />
              </div>

              {/* Simulation metrics */}
              <div className="rounded-lg bg-white border border-slate-200/60 p-4 text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span>Baseline:</span>
                  <span className="font-semibold">
                    {indicators.find((i) => i.name === simulatedIndicator)?.baseline}{' '}
                    {indicators.find((i) => i.name === simulatedIndicator)?.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Target:</span>
                  <span className="font-semibold">
                    {indicators.find((i) => i.name === simulatedIndicator)?.target}{' '}
                    {indicators.find((i) => i.name === simulatedIndicator)?.unit}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-900">
                  <span>Simulated Progress:</span>
                  <span>
                    {progressToTarget(
                      indicators.find((i) => i.name === simulatedIndicator)?.baseline || 0,
                      simulationVal,
                      indicators.find((i) => i.name === simulatedIndicator)?.target || 0,
                      indicators.find((i) => i.name === simulatedIndicator)?.trend === 'down'
                    )}
                    %
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={saveSimulation} className="btn-primary flex-1 btn-sm">
                  Apply Simulator Data
                </button>
                <button onClick={() => setSimulatedIndicator(null)} className="btn-ghost btn-sm text-slate-500">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-6 space-y-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50">
                <HelpCircle className="h-5 w-5 text-slate-500" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Indicator Simulation Tool</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click "Simulate" on any indicator line to open the target planning sandbox. Adjust the values to forecast strategic objective status alignments.
              </p>
            </div>
          )}

          {/* Quick DHIS2 Integration Card */}
          <div className="card p-6 bg-gradient-to-br from-brand-900 to-brand-950 text-white border-none relative overflow-hidden">
            <div className="relative">
              <div className="inline-flex items-center rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-semibold text-white/90">
                DHIS2 Synchronization
              </div>
              <h3 className="text-base font-semibold mt-3">Live DHIS2 Integrations</h3>
              <p className="text-xs text-white/70 mt-1 leading-relaxed">
                Platform syncs monthly values automatically from the national DHIS2 instances.
              </p>
              <div className="mt-4 flex items-center justify-between text-xs border-t border-white/10 pt-3 text-white/60">
                <span>Last Synced: 2026-05-19</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" /> Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
