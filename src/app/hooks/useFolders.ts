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

const addFolderRecursively = (nodes: Folder[], parentId: string, newFolder: Folder): Folder[] => {
  return nodes.map(node => {
    if (node.id === parentId) {
      return {
        ...node,
        children: [...(node.children || []), newFolder],
      };
    }
    if (node.children) {
      return {
        ...node,
        children: addFolderRecursively(node.children, parentId, newFolder),
      };
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
    // Simulate network delay for fetching initial data
    const timer = setTimeout(() => {
      setFolders(MOCK_FOLDERS_DATA);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const addFolder = useCallback((folderData: { name: string; isPrivate: boolean; parentId: string | null }) => {
    const { name, isPrivate, parentId } = folderData;
    const newFolder: Folder = {
      id: `folder-${Date.now()}`,
      name,
      isPrivate,
      children: [],
    };

    if (parentId) {
      setFolders(prevFolders => addFolderRecursively(prevFolders, parentId, newFolder));
    } else {
      setFolders(prev => [newFolder, ...prev]);
    }
  }, []);

  return { folders, loading, addFolder };
};