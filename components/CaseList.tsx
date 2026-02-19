import React, { useState } from 'react';
import { Case, Assertion } from '../types';

interface CaseListProps {
  cases: Case[];
  onSelectCase: (c: Case) => void;
}

export const CaseList: React.FC<CaseListProps> = ({ cases, onSelectCase }) => {
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCases = cases.filter((c) => {
    const hasFailure = (Object.values(c.assertions || {}) as Assertion[]).some((a) => !a.value);
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'pass' ? !hasFailure :
      hasFailure; // filter === 'fail'
    
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
      {/* Toolbar */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50">
        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('pass')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'pass' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Passed
          </button>
          <button
            onClick={() => setFilter('fail')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === 'fail' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Failed
          </button>
        </div>
        
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search cases..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
        <div className="col-span-1">Status</div>
        <div className="col-span-1 text-center">Score</div>
        <div className="col-span-4">Case Name</div>
        <div className="col-span-4">Failure Reason (First)</div>
        <div className="col-span-2 text-right">Duration</div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {filteredCases.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <p>No cases match your criteria</p>
          </div>
        ) : (
          filteredCases.map((c, idx) => {
            const assertions = Object.values(c.assertions || {}) as Assertion[];
            const totalAssertions = assertions.length;
            const passedCount = assertions.filter((a) => a.value).length;
            
            const failedAssertion = assertions.find((a) => !a.value);
            const isPass = !failedAssertion;
            const duration = c.task_duration || c.inputs?.meta?.duration || 0;

            return (
              <div 
                key={idx}
                onClick={() => onSelectCase(c)}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer items-center transition-colors group"
              >
                <div className="col-span-1">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${isPass ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600 group-hover:bg-red-200'}`}>
                    {isPass ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </span>
                </div>
                <div className="col-span-1 flex items-center justify-center">
                   <span className={`text-xs font-mono font-bold px-2 py-1 rounded-md ${isPass && totalAssertions > 0 ? 'bg-green-100 text-green-700' : totalAssertions === 0 ? 'bg-slate-100 text-slate-500' : 'bg-red-100 text-red-700'}`}>
                     {passedCount}/{totalAssertions}
                   </span>
                </div>
                <div className="col-span-4 font-medium text-slate-900 truncate">
                  {c.name}
                </div>
                <div className="col-span-4 text-sm text-slate-600 truncate">
                  {failedAssertion ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <span className="font-semibold">{failedAssertion.name}:</span>
                      <span className="truncate">{failedAssertion.reason || "Check details"}</span>
                    </span>
                  ) : (
                    <span className="text-green-600 opacity-50">All checks passed</span>
                  )}
                </div>
                <div className="col-span-2 text-right text-sm text-slate-500 font-mono">
                  {duration.toFixed(3)}s
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};