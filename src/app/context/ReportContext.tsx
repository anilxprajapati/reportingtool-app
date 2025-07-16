import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Report, ReportBuilderState } from '../../types';
import { generateMockReports } from '../data/mockData';

interface ReportContextType {
  reports: Report[];
  loading: boolean;
  getReportById: (id: string) => Report | undefined;
  addReport: (report: Report) => void;
  updateReport: (report: Report) => void;
  deleteReport: (reportId: string) => void;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const ReportProvider = ({ children }: { children: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay for fetching initial data
    const timer = setTimeout(() => {
      setReports(generateMockReports(50));
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  
  const getReportById = useCallback((id: string) => {
    return reports.find(r => r.id === id);
  }, [reports]);

  const addReport = useCallback((report: Report) => {
    setReports(prev => [report, ...prev]);
  }, []);

  const updateReport = useCallback((updatedReport: Report) => {
    setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));
  }, []);

  const deleteReport = useCallback((reportId: string) => {
    setReports(prev => prev.filter(r => r.id !== reportId));
  }, []);


  const value = { reports, loading, getReportById, addReport, updateReport, deleteReport };

  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
};

export const useReportContext = () => {
  const context = useContext(ReportContext);
  if (context === undefined) {
    throw new Error('useReportContext must be used within a ReportProvider');
  }
  return context;
};
