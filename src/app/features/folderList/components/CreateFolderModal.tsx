import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import type { Folder } from '../../../../types';

interface CreateFolderModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (folder: { name: string; isPrivate: boolean; parentId: string | null }) => void;
  selectedFolder: Folder | null;
}

/**
 * A modal component for creating a new folder or subfolder.
 * Includes form validation to ensure a name is provided.
 */
const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ show, onHide, onSave, selectedFolder }) => {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    if (!show) {
      // Reset state when modal is hidden
      setName('');
      setIsPrivate(false);
      setValidated(false);
    }
  }, [show]);

  const handleSubmit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    if (name.trim() === '') {
      setValidated(true);
      return;
    }
    onSave({ name, isPrivate, parentId: selectedFolder?.id ?? null });
  };
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create New Folder</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedFolder && (
            <Alert variant="info" className="small p-2">
                Creating subfolder in: <strong>{selectedFolder.name}</strong>
            </Alert>
        )}
        <Form noValidate validated={validated}>
          <Form.Group className="mb-3" controlId="folderName">
            <Form.Label>Folder Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter folder name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              isInvalid={validated && name.trim() === ''}
            />
            <Form.Control.Feedback type="invalid">
              Folder name is required.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="isPrivate">
            <Form.Check
              type="switch"
              label="Private Folder"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
             <Form.Text className="text-muted">
                Private folders are only visible to you.
            </Form.Text>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Folder
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateFolderModal;
