import { useState, useEffect, useCallback } from 'react';
import type { Folder } from '../../types';

// Mock data is now self-contained within the hook
const MOCK_FOLDERS_DATA: Folder[] = [
  {
    id: 'unsaved',
    name: 'Unsaved Reports',
    isPrivate: true,
  },
  {
    id: '1',
    name: 'Academic Reports',
    isPrivate: false,
    children: [
      { id: '1-1', name: 'Sub-folder 1', isPrivate: false },
      { id: '1-2', name: 'Sub-folder 2', isPrivate: true },
    ],
  },
  { id: '2', name: 'Active Students', isPrivate: false },
  { id: '3', name: 'Archived Projects', isPrivate: true },
  { id: '4', name: 'Customer Feedback', isPrivate: false },
  {
    id: '5',
    name: 'Finance Reports',
    isPrivate: false,
    children: [
        { id: '5-1', name: 'Quarterly', isPrivate: true },
        { id: '5-2', name: 'Annual', isPrivate: false },
    ],
  },
  { id: '6', name: 'General Documents', isPrivate: false },
  { id: '7', name: 'HR Documents', isPrivate: true },
  { 
      id: '8', 
      name: 'Marketing Campaigns', 
      isPrivate: false,
      children: [
        { id: '8-1', name: 'Q1 Social Media', isPrivate: false },
        { id: '8-2', name: 'Q2 Email Outreach', isPrivate: false },
      ]
  },
  { id: '9', name: 'IT Support Tickets', isPrivate: true },
];

/*
// --- Example of a real API call ---
async function fetchFoldersFromApi(): Promise<Folder[]> {
  try {
    const response = await fetch('/api/v1/folders');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.folders; // Assuming the API returns { folders: [...] }
  } catch (error) {
    console.error("Could not fetch folders:", error);
    return MOCK_FOLDERS_DATA; // Fallback
  }
}

async function createFolderInApi(folderData: { name: string; isPrivate: boolean; parentId: string | null }): Promise<Folder> {
    const response = await fetch('/api/v1/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folderData),
    });
    if (!response.ok) throw new Error('Failed to create folder');
    return await response.json();
}
*/

const addFolderRecursively = (nodes: Folder[], parentId: string, newFolder: Folder): Folder[] => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return { ...node, children: [...(node.children || []), newFolder] };
    }
    if (node.children) {
      return { ...node, children: addFolderRecursively(node.children, parentId, newFolder) };
    }
    return node;
  });
};

/**
 * Custom hook to manage folder data.
 * This can be easily updated to fetch from a real API.
 */
export const useFolders = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // To use API: fetchFoldersFromApi().then(data => { setFolders(data); setLoading(false); });
    const timer = setTimeout(() => {
      setFolders(MOCK_FOLDERS_DATA);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const addFolder = useCallback(async (folderData: { name: string; isPrivate: boolean; parentId: string | null }) => {
    /*
    // --- To use a real API ---
    try {
        const newFolder = await createFolderInApi(folderData);
        if (newFolder.parentId) {
             setFolders(prevFolders => addFolderRecursively(prevFolders, newFolder.parentId, newFolder));
        } else {
             setFolders(prev => [newFolder, ...prev]);
        }
    } catch (error) { console.error("Failed to save folder:", error); }
    */
    
    // --- Mock implementation ---
    const { name, isPrivate, parentId } = folderData;
    const newFolder: Folder = { id: `folder-${Date.now()}`, name, isPrivate, children: [] };

    if (parentId) {
      setFolders(prevFolders => addFolderRecursively(prevFolders, parentId, newFolder));
    } else {
      setFolders(prev => [newFolder, ...prev]);
    }
  }, []);

  return { folders, loading, addFolder };
};
