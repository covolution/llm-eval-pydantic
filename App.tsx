import React, { useState } from 'react';
import { Report, Case } from './types';
import { FileUpload } from './components/FileUpload';
import { StatsOverview } from './components/StatsOverview';
import { CaseList } from './components/CaseList';
import { CaseDetail } from './components/CaseDetail';

export default function App() {
  const [report, setReport] = useState<Report | null>(null);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const handleUpload = (data: Report) => {
    setReport(data);
  };

  const handleReset = () => {
    setReport(null);
    setSelectedCase(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              E
            </div>
            <h1 className="text-xl font-bold text-slate-800">
              LLM Eval Explorer
            </h1>
          </div>
          {report && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500 hidden sm:block">
                Report: <span className="font-medium text-slate-900">{report.name}</span>
              </span>
              <button 
                onClick={handleReset}
                className="text-sm text-red-600 hover:text-red-700 font-medium hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Clear Report
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!report ? (
          <FileUpload onUpload={handleUpload} />
        ) : (
          <div className="animate-fade-in space-y-8">
            <StatsOverview report={report} />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Evaluation Cases</h2>
                <span className="text-sm text-slate-500">
                  {report.cases.length} cases total
                </span>
              </div>
              <CaseList cases={report.cases} onSelectCase={setSelectedCase} />
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {selectedCase && (
        <CaseDetail 
          caseData={selectedCase} 
          onClose={() => setSelectedCase(null)} 
        />
      )}
    </div>
  );
}
