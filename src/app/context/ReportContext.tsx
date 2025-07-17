import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import type { Report } from '../../types';
import { generateMockReports } from '../data/mockData';

interface ReportContextType {
  reports: Report[];
  loading: boolean;
  getReportById: (id: string) => Report | undefined;
  addReport: (report: Report) => Promise<void>;
  updateReport: (report: Report) => Promise<void>;
  deleteReport: (reportId: string) => Promise<void>;
}

/*
// --- Example API functions ---
const API_BASE_URL = '/api/v1/reports';

async function fetchReportsApi(): Promise<Report[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) throw new Error('Failed to fetch reports');
    return response.json();
}

async function addReportApi(report: Report): Promise<Report> {
    const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error('Failed to add report');
    return response.json();
}

async function updateReportApi(report: Report): Promise<Report> {
    const response = await fetch(`${API_BASE_URL}/${report.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
    });
    if (!response.ok) throw new Error('Failed to update report');
    return response.json();
}

async function deleteReportApi(reportId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${reportId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete report');
}
*/

const ReportContext = createContext<ReportContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'nexus_bi_reports';

export const ReportProvider = ({ children }: { children?: ReactNode }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // --- API implementation ---
    // async function loadReports() {
    //   try {
    //     const apiReports = await fetchReportsApi();
    //     setReports(apiReports);
    //   } catch (error) {
    //     console.error(error);
    //     // Optionally load mock data as fallback
    //   } finally {
    //     setLoading(false);
    //   }
    // }
    // loadReports();

    // --- LocalStorage implementation ---
    try {
      const storedReports = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      } else {
        const mockReports = generateMockReports(50);
        setReports(mockReports);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mockReports));
      }
    } catch (error) {
      console.error("Failed to load reports from localStorage", error);
      const mockReports = generateMockReports(50);
      setReports(mockReports);
    } finally {
        setLoading(false);
    }
  }, []);
  
  const getReportById = useCallback((id: string) => reports.find(r => r.id === id), [reports]);

  const addReport = useCallback(async (report: Report) => {
    // await addReportApi(report);
    // setReports(prev => [report, ...prev]);
    
    setReports(prev => {
        const newReports = [report, ...prev];
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newReports));
        return newReports;
    });
  }, []);

  const updateReport = useCallback(async (updatedReport: Report) => {
    // await updateReportApi(updatedReport);
    // setReports(prev => prev.map(r => r.id === updatedReport.id ? updatedReport : r));

    setReports(prev => {
        const newReports = prev.map(r => r.id === updatedReport.id ? updatedReport : r)
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newReports));
        return newReports;
    });
  }, []);

  const deleteReport = useCallback(async (reportId: string) => {
    // await deleteReportApi(reportId);
    // setReports(prev => prev.filter(r => r.id !== reportId));

    setReports(prev => {
        const newReports = prev.filter(r => r.id !== reportId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newReports));
        return newReports;
    });
  }, []);

  // Sync with localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === LOCAL_STORAGE_KEY && e.newValue) {
            try { setReports(JSON.parse(e.newValue)); } 
            catch (error) { console.error("Failed to parse reports from storage event", error); }
        }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
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