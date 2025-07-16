import React, { useState, useRef } from 'react';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import type { SelectedColumn } from '../../../../types';
import SelectedFieldItem from '../SelectedFieldItem';

interface FieldsTabProps {
  validationFocus?: { tab: string; id: string | null } | null;
}

const FieldsTab: React.FC<FieldsTabProps> = ({ validationFocus }) => {
  const { state, dispatch } = useReportBuilder();
  const currentStep = state.steps[state.currentStepIndex];
  
  const [dragging, setDragging] = useState(false);
  const dragItem = useRef<SelectedColumn | null>(null);
  const dragOverItem = useRef<SelectedColumn | null>(null);
  const [dragHandleProps, setDragHandleProps] = useState({});

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: SelectedColumn) => {
    dragItem.current = item;
    // This is a bit of a hack to allow dragging only from the handle
    // In a real app, a library like react-dnd would be better.
    if (!(e.target as HTMLElement).closest('[data-drag-handle]')) {
       // e.preventDefault();
    }
    setDragging(true);
  };
  
  const handleDragEnter = (item: SelectedColumn) => {
    dragOverItem.current = item;
  };

  const handleDragEnd = () => {
    if (!dragItem.current || !dragOverItem.current || dragItem.current.id === dragOverItem.current.id) {
        setDragging(false);
        return;
    }
    
    const items = [...currentStep.selectedColumns];
    const dragItemIndex = items.findIndex(i => i.id === dragItem.current!.id);
    const dragOverItemIndex = items.findIndex(i => i.id === dragOverItem.current!.id);

    const [reorderedItem] = items.splice(dragItemIndex, 1);
    items.splice(dragOverItemIndex, 0, reorderedItem);

    dispatch({ type: 'REORDER_COLUMNS', payload: items });

    dragItem.current = null;
    dragOverItem.current = null;
    setDragging(false);
  };

  const isInvalid = validationFocus?.tab === 'fields' && validationFocus.id === 'fields-placeholder';

  return (
    <div>
      <p className="text-muted small mb-3">Select columns from the schema sidebar to add them to the report. Drag and drop fields to reorder them.</p>
      
      {currentStep.selectedColumns.length === 0 ? (
         <div className={`p-4 bg-body-tertiary rounded text-center text-muted ${isInvalid ? 'border border-danger border-2' : ''}`}>
            Selected fields will appear here.
         </div>
      ) : (
        <div className="d-grid gap-2">
            {currentStep.selectedColumns.map((item) => (
                <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    onDragEnter={() => handleDragEnter(item)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()} // Necessary for drop to work
                >
                    <SelectedFieldItem 
                        item={item} 
                        isDragging={dragging && dragItem.current?.id === item.id}
                        dragHandleProps={{ 'data-drag-handle': true }}
                    />
                </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default FieldsTab;