import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Report, Case } from '../types';

interface StatsOverviewProps {
  report: Report;
}

const COLORS = {
  pass: '#22c55e', // green-500
  fail: '#ef4444', // red-500
};

export const StatsOverview: React.FC<StatsOverviewProps> = ({ report }) => {
  const stats = useMemo(() => {
    let passed = 0;
    let failed = 0;
    let totalDuration = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalAssertions = 0;
    let passedAssertions = 0;
    const modelSet = new Set<string>();
    const judgeModelSet = new Set<string>();

    report.cases.forEach((c: Case) => {
      const assertions = Object.values(c.assertions || {});
      const hasFailure = assertions.some((a) => !a.value);
      
      totalAssertions += assertions.length;
      passedAssertions += assertions.filter(a => a.value).length;

      if (hasFailure) {
        failed++;
      } else {
        passed++;
      }

      // Duration can be in task_duration, total_duration or metadata.duration
      const duration = c.task_duration || c.total_duration || c.inputs?.meta?.duration || 0;
      totalDuration += duration;

      // Tokens
      const inTokens = c.attributes?.input_tokens || c.inputs?.meta?.usage?.input_tokens || 0;
      const outTokens = c.attributes?.output_tokens || c.inputs?.meta?.usage?.output_tokens || 0;
      totalInputTokens += inTokens;
      totalOutputTokens += outTokens;

      // Target Model
      const model = c.attributes?.model || c.inputs?.meta?.request?.model;
      if (model) {
        modelSet.add(model);
      }

      // Judge Model (from assertions)
      assertions.forEach((a) => {
        const judge = a.source?.arguments?.model;
        if (typeof judge === 'string') {
          judgeModelSet.add(judge);
        }
      });
    });

    return {
      passed,
      failed,
      total: report.cases.length,
      totalAssertions,
      passedAssertions,
      failedAssertions: totalAssertions - passedAssertions,
      avgDuration: report.cases.length ? totalDuration / report.cases.length : 0,
      avgInputTokens: report.cases.length ? totalInputTokens / report.cases.length : 0,
      avgOutputTokens: report.cases.length ? totalOutputTokens / report.cases.length : 0,
      models: Array.from(modelSet),
      judgeModels: Array.from(judgeModelSet),
    };
  }, [report]);

  const chartData = [
    { name: 'Passed', value: stats.passed },
    { name: 'Failed', value: stats.failed },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {/* Key Metrics Cards */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Total Cases</h3>
        <div className="text-4xl font-bold text-slate-900 mt-2">{stats.total}</div>
        <div className="text-sm text-slate-400 mt-2">Evaluation Suite</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider mb-2">Pass Rate</h3>
        
        {/* Case Pass Rate */}
        <div>
            <div className="flex items-baseline gap-2">
                <div className="text-4xl font-bold text-slate-900">
                {stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">Cases</div>
            </div>
            <div className="flex gap-3 text-sm mt-1">
                <span className="text-green-600 font-medium">{stats.passed} Passed</span>
                <span className="text-red-500 font-medium">{stats.failed} Failed</span>
            </div>
        </div>

        {/* Assertion Pass Rate */}
        <div className="mt-4 pt-3 border-t border-slate-100">
             <div className="flex justify-between items-baseline mb-1">
                 <span className="text-slate-500 text-xs font-medium uppercase tracking-wider">Assertions</span>
                 <span className="font-bold text-slate-700">
                    {stats.totalAssertions > 0 ? ((stats.passedAssertions / stats.totalAssertions) * 100).toFixed(1) : 0}%
                 </span>
             </div>
             <div className="flex gap-2 text-xs">
                <span className="text-green-600 font-medium">{stats.passedAssertions} Pass</span>
                <span className="text-slate-300">|</span>
                <span className="text-red-500 font-medium">{stats.failedAssertions} Fail</span>
             </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Avg Latency</h3>
        <div className="text-4xl font-bold text-slate-900 mt-2">
          {stats.avgDuration.toFixed(2)}s
        </div>
        <div className="text-sm text-slate-400 mt-2">Per generation</div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Target Model</h3>
        <div className="text-xl font-bold text-slate-900 mt-2 truncate" title={stats.models.join(', ')}>
          {stats.models.length === 0 ? 'N/A' : stats.models.length === 1 ? stats.models[0] : `${stats.models.length} Models`}
        </div>
        <div className="text-sm text-slate-400 mt-2 truncate">
           {stats.models.length > 1 ? 'Multiple targets' : 'LLM under test'}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">Judge Model</h3>
        <div className="text-xl font-bold text-slate-900 mt-2 truncate" title={stats.judgeModels.join(', ')}>
          {stats.judgeModels.length === 0 ? 'N/A' : stats.judgeModels.length === 1 ? stats.judgeModels[0] : `${stats.judgeModels.length} Models`}
        </div>
        <div className="text-sm text-slate-400 mt-2 truncate">
           {stats.judgeModels.length > 1 ? 'Multiple evaluators' : 'Evaluator LLM'}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center sm:col-span-2 lg:col-span-1">
        <div className="h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={40}
                paddingAngle={5}
                dataKey="value"
                >
                <Cell key="cell-pass" fill={COLORS.pass} />
                <Cell key="cell-fail" fill={COLORS.fail} />
                </Pie>
                <Tooltip />
                <Legend verticalAlign="middle" align="right" layout="vertical" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
            </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};