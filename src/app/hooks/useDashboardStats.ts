import { useState, useEffect } from 'react';
import type { Report, Folder } from '../../types';

export interface DashboardStats {
    reportsByFolder: { labels: string[]; data: number[] };
    reportsCreatedOverTime: { labels: string[]; data: number[] };
}

/*
async function fetchDashboardStats(): Promise<DashboardStats> {
    const response = await fetch('/api/v1/dashboard/stats');
    if (!response.ok) throw new Error('Failed to fetch dashboard stats');
    return response.json();
}
*/

const generateMockStats = (reports: Report[], folders: Folder[]): DashboardStats => {
    // Reports by Folder
    const folderCounts: Record<string, number> = {};
    folders.forEach(f => {
        if (f.id !== 'unsaved') folderCounts[f.name] = 0;
    });
    reports.forEach(r => {
        if (folderCounts[r.folderName] !== undefined) {
            folderCounts[r.folderName]++;
        }
    });
    const reportsByFolder = {
        labels: Object.keys(folderCounts),
        data: Object.values(folderCounts),
    };

    // Reports Created Over Time (last 30 days)
    const dateCounts: Record<string, number> = {};
    const labels: string[] = [];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const a = d.toLocaleDateString('en-CA'); // YYYY-MM-DD format
        labels.push(a);
        dateCounts[a] = 0;
    }
    reports.forEach(r => {
        try {
            const reportDate = new Date(r.createdDate).toLocaleDateString('en-CA');
            if (dateCounts[reportDate] !== undefined) {
                dateCounts[reportDate]++;
            }
        } catch (e) {
          // Ignore invalid dates in mock data
        }
    });
    const reportsCreatedOverTime = {
        labels,
        data: labels.map(label => dateCounts[label]),
    };

    return { reportsByFolder, reportsCreatedOverTime };
};

export const useDashboardStats = (reports: Report[], folders: Folder[]) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (reports.length > 0 && folders.length > 0) {
            // API call: fetchDashboardStats().then(setStats).finally(() => setLoading(false));
            
            // Mock generation
            const mockStats = generateMockStats(reports, folders);
            setStats(mockStats);
            setLoading(false);
        } else if (reports.length === 0 || folders.length === 0) {
            // Handle case where one of the dependencies isn't loaded yet
            setLoading(true);
        }
    }, [reports, folders]);

    return { stats, loading };
};
