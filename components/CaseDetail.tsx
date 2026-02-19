import React, { useState } from 'react';
import { Case, Assertion } from '../types';

interface CaseDetailProps {
  caseData: Case;
  onClose: () => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ caseData, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail'>('all');
  
  const assertions = Object.entries(caseData.assertions || {}) as [string, Assertion][];
  const totalCount = assertions.length;
  const passedCount = assertions.filter(([_, a]) => a.value).length;
  const failedCount = totalCount - passedCount;
  const isPass = passedCount === totalCount;

  // Extract tokens for header
  const inputTokens = caseData.attributes?.input_tokens || caseData.inputs?.meta?.usage?.input_tokens || 0;
  const outputTokens = caseData.attributes?.output_tokens || caseData.inputs?.meta?.usage?.output_tokens || 0;

  // Filter assertions
  const filteredAssertions = assertions.filter(([_, a]) => {
    if (filter === 'all') return true;
    if (filter === 'pass') return a.value;
    if (filter === 'fail') return !a.value;
    return true;
  });

  // Helper to format large text blocks
  const TextBlock = ({ title, content }: { title: string; content?: string }) => {
    if (!content) return null;
    return (
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">{title}</h4>
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap text-slate-700 max-h-96 overflow-y-auto">
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${isPass ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-full ${isPass ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'}`}>
              {isPass ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{caseData.name}</h2>
              <div className="flex items-center gap-3 text-sm text-slate-500 font-mono mt-1">
                <span>{caseData.attributes?.model || caseData.inputs?.meta?.request?.model || 'Unknown Model'}</span>
                <span className="text-slate-300">|</span>
                <span className={isPass && totalCount > 0 ? "text-green-700 font-semibold" : totalCount === 0 ? "text-slate-500" : "text-red-700 font-semibold"}>
                  {passedCount}/{totalCount} passed
                </span>
                <span className="text-slate-300">|</span>
                <span>
                   <span className="font-semibold text-slate-700">{inputTokens}</span> <span className="text-slate-400">in</span>
                </span>
                <span>
                   <span className="font-semibold text-slate-700">{outputTokens}</span> <span className="text-slate-400">out</span>
                </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Column: Data & Metadata */}
          <div className="flex flex-col gap-6">
            <TextBlock title="Actual Output" content={caseData.output} />
            <TextBlock title="Prompt" content={caseData.inputs.prompt} />
            
             {/* Metadata Section moved here */}
            <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 uppercase tracking-wide">Metadata</h4>
                <div className="bg-white border border-slate-200 rounded-lg p-4 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                        <div className="text-slate-500">Duration</div>
                        <div className="font-mono text-slate-900 font-medium">
                            {(caseData.task_duration || caseData.inputs?.meta?.duration || 0).toFixed(4)}s
                        </div>
                        <div className="text-slate-500">Input Tokens</div>
                        <div className="font-mono text-slate-900 font-medium">
                            {inputTokens || '-'}
                        </div>
                        <div className="text-slate-500">Output Tokens</div>
                        <div className="font-mono text-slate-900 font-medium">
                            {outputTokens || '-'}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Right Column: Assertions only */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                 <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Assertions</h4>
                 
                 {/* Filter Toggles */}
                 <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-medium">
                    <button 
                        onClick={() => setFilter('all')}
                        className={`px-3 py-1 rounded-md transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        All <span className="text-slate-400 ml-1">{totalCount}</span>
                    </button>
                    <button 
                        onClick={() => setFilter('pass')}
                        className={`px-3 py-1 rounded-md transition-all ${filter === 'pass' ? 'bg-white text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Pass <span className="ml-1 opacity-60">{passedCount}</span>
                    </button>
                    <button 
                        onClick={() => setFilter('fail')}
                        className={`px-3 py-1 rounded-md transition-all ${filter === 'fail' ? 'bg-white text-red-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Fail <span className="ml-1 opacity-60">{failedCount}</span>
                    </button>
                 </div>
              </div>

              <div className="space-y-3">
                {filteredAssertions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-100 rounded-lg">
                        No assertions match this filter.
                    </div>
                ) : (
                    filteredAssertions.map(([key, assertion], idx) => {
                   const judgeModel = assertion.source?.arguments?.model;
                   return (
                  <div 
                    key={idx} 
                    className={`border rounded-lg p-4 ${assertion.value ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{assertion.name || key}</span>
                        {judgeModel && (
                           <span className="text-xs text-slate-500 font-mono mt-0.5">Judge: {judgeModel}</span>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${assertion.value ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                        {assertion.value ? 'PASS' : 'FAIL'}
                      </span>
                    </div>
                    {assertion.reason && (
                      <div className="mt-2 text-sm text-slate-700 bg-white/50 p-2 rounded border border-slate-200/50">
                        <span className="font-semibold text-xs text-slate-500 uppercase block mb-1">Reason</span>
                        {assertion.reason}
                      </div>
                    )}
                    {!assertion.value && !assertion.reason && (
                      <div className="mt-2 text-sm text-slate-500 italic">No specific reason provided for this failure.</div>
                    )}
                  </div>
                )})
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};