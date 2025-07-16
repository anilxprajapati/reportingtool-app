import React, { useState } from 'react';
import { Form, InputGroup, ListGroup, Collapse, Button } from 'react-bootstrap';
import { BsSearch, BsFolder, BsFolderFill, BsLockFill, BsChevronRight, BsChevronDown, BsArchiveFill } from 'react-icons/bs';
import type { Folder } from '../../../../types';

interface FolderListProps {
  folders: Folder[];
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedFolder: Folder | null;
  onSelectFolder: (folder: Folder | null) => void;
}

/**
 * A recursive component to render a folder and its children.
 */
const FolderItem: React.FC<{
  folder: Folder;
  selectedFolder: Folder | null;
  onSelectFolder: (folder: Folder | null) => void;
  level: number;
}> = ({ folder, selectedFolder, onSelectFolder, level }) => {
  const [isOpen, setIsOpen] = useState(level === 0 || folder.id === 'unsaved');
  const hasChildren = folder.children && folder.children.length > 0;
  const isSelected = selectedFolder?.id === folder.id;

  const getIcon = () => {
    if (folder.id === 'unsaved') {
      return <BsArchiveFill className="me-2 flex-shrink-0" />;
    }
    return isSelected ? <BsFolderFill className="me-2 flex-shrink-0" /> : <BsFolder className="me-2 flex-shrink-0" />;
  }

  return (
    <>
      <ListGroup.Item
        active={isSelected}
        className="d-flex justify-content-between align-items-center border-0 bg-transparent"
        style={{ paddingLeft: `${level * 1.5}rem` }}
      >
        <div
            className="d-flex align-items-center flex-grow-1"
            onClick={() => onSelectFolder(folder)}
            style={{ cursor: 'pointer', minWidth: 0 }}
        >
           {getIcon()}
           <span className="text-truncate me-2">{folder.name}</span>
           {folder.isPrivate && <BsLockFill className="ms-auto text-secondary flex-shrink-0" />}
        </div>
        {hasChildren && (
          <Button variant="link" size="sm" onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-0 text-light ms-2">
             {isOpen ? <BsChevronDown size={20} /> : <BsChevronRight size={20} />}
          </Button>
        )}
      </ListGroup.Item>
      {hasChildren && (
         <Collapse in={isOpen}>
            <div>
              {folder.children?.map(child => (
                <FolderItem 
                  key={child.id}
                  folder={child}
                  selectedFolder={selectedFolder}
                  onSelectFolder={onSelectFolder}
                  level={level + 1}
                />
              ))}
            </div>
         </Collapse>
      )}
    </>
  );
};

/**
 * Renders the list of folders with a search bar.
 */
const FolderList: React.FC<FolderListProps> = ({
  folders,
  searchQuery,
  onSearchQueryChange,
  selectedFolder,
  onSelectFolder,
}) => {
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="d-flex flex-column h-100">
      <h5 className="mb-3">Folders</h5>
      <InputGroup className="mb-3">
        <Form.Control
          placeholder="Search folder name"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
        />
        <InputGroup.Text><BsSearch /></InputGroup.Text>
      </InputGroup>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <ListGroup variant="flush">
           <ListGroup.Item
              action
              active={selectedFolder === null}
              onClick={() => onSelectFolder(null)}
              className="d-flex justify-content-between align-items-center border-0 fw-bold bg-transparent"
          >
              All Reports
          </ListGroup.Item>
          {filteredFolders.map(folder => (
            <FolderItem 
              key={folder.id} 
              folder={folder} 
              selectedFolder={selectedFolder}
              onSelectFolder={onSelectFolder}
              level={0}
            />
          ))}
        </ListGroup>
      </div>
    </div>
  );
};

export default FolderList;