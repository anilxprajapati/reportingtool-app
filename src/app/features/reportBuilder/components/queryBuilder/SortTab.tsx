import React, { useState, useRef, useMemo } from 'react';
import { Button, Row, Col, Form } from 'react-bootstrap';
import { BsPlus, BsTrash, BsArrowDown, BsArrowUp, BsGripVertical } from 'react-icons/bs';
import { useReportBuilder } from '../../context/ReportBuilderContext';
import type { Sort } from '../../../../types';
import StyledSelect from '../../../../components/StyledSelect';
import type { Options } from 'react-select';

type SelectOption = { value: string; label: string };

const SortItem: React.FC<{ sort: Sort, isDragging: boolean, dragHandleProps: any }> = ({ sort, isDragging, dragHandleProps }) => {
    const { state, dispatch } = useReportBuilder();
    const { selectedColumns } = state.steps[state.currentStepIndex];

    const columnOptions: Options<SelectOption> = useMemo(() => 
    selectedColumns.map(c => ({ 
        value: c.id, 
        label: `${c.tableName}.${c.column.name}` 
    })), [selectedColumns]);

    const handleUpdate = (data: Partial<Sort>) => {
        dispatch({ type: 'UPDATE_SORT', payload: { sortId: sort.id, data } });
    };
    
    const handleSelectChange = (option: SelectOption | null) => {
        handleUpdate({ columnId: option?.value || '' });
    };

    const handleRemove = () => {
        dispatch({ type: 'REMOVE_SORT', payload: sort.id });
    };
    
    const toggleDirection = () => {
        handleUpdate({ direction: sort.direction === 'ASC' ? 'DESC' : 'ASC' });
    };

    return (
        <div className={`p-2 border rounded ${isDragging ? 'opacity-50 bg-primary-subtle' : 'bg-body-tertiary'}`}>
            <Row className="g-3 align-items-center">
                <Col xs="auto">
                    <span {...dragHandleProps} style={{ cursor: 'grab' }} className="text-muted">
                      <BsGripVertical />
                    </span>
                </Col>
                <Col>
                    <StyledSelect
                        value={columnOptions.find(o => o.value === sort.columnId)}
                        options={columnOptions}
                        onChange={handleSelectChange}
                        placeholder="Select a column to sort by..."
                    />
                </Col>
                <Col xs="auto">
                    <Button variant="outline-secondary" size="sm" onClick={toggleDirection} title={`Set to ${sort.direction === 'ASC' ? 'Descending' : 'Ascending'}`}>
                        {sort.direction === 'ASC' ? <BsArrowUp /> : <BsArrowDown />}
                        <span className="ms-2">{sort.direction}</span>
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button variant="link" className="text-danger" size="sm" onClick={handleRemove}>
                        <BsTrash />
                    </Button>
                </Col>
            </Row>
        </div>
    );
};

const SortTab: React.FC = () => {
    const { state, dispatch } = useReportBuilder();
    const currentStep = state.steps[state.currentStepIndex];
    
    const [dragging, setDragging] = useState(false);
    const dragItem = useRef<Sort | null>(null);
    const dragOverItem = useRef<Sort | null>(null);

    const handleDragStart = (item: Sort) => {
      dragItem.current = item;
      setDragging(true);
    };

    const handleDragEnter = (item: Sort) => {
      dragOverItem.current = item;
    };

    const handleDragEnd = () => {
      if (!dragItem.current || !dragOverItem.current || dragItem.current.id === dragOverItem.current.id) {
          setDragging(false);
          return;
      }
      
      const items = [...currentStep.sorts];
      const dragItemIndex = items.findIndex(i => i.id === dragItem.current!.id);
      const dragOverItemIndex = items.findIndex(i => i.id === dragOverItem.current!.id);

      const [reorderedItem] = items.splice(dragItemIndex, 1);
      items.splice(dragOverItemIndex, 0, reorderedItem);

      dispatch({ type: 'REORDER_SORTS', payload: items });

      dragItem.current = null;
      dragOverItem.current = null;
      setDragging(false);
    };


    const handleAdd = () => {
        dispatch({ type: 'ADD_SORT' });
    };

    return (
        <div>
            <p className="text-muted small mb-3">Define the final sort order for the report output. Drag and drop to change priority.</p>
            
            <div className="d-grid gap-2">
                {currentStep.sorts.map(sort => (
                    <div
                        key={sort.id}
                        draggable
                        onDragStart={() => handleDragStart(sort)}
                        onDragEnter={() => handleDragEnter(sort)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <SortItem 
                            sort={sort} 
                            isDragging={dragging && dragItem.current?.id === sort.id}
                            dragHandleProps={{ 'data-drag-handle': true }}
                        />
                    </div>
                ))}
            </div>

            {currentStep.sorts.length === 0 && (
                <div className="p-4 bg-body-tertiary rounded text-center text-muted">
                    No sorting defined. Report will use the database's default order.
                </div>
            )}

            <div className="mt-3">
                <Button variant="outline-primary" size="sm" onClick={handleAdd}>
                    <BsPlus /> Add Sort Condition
                </Button>
            </div>
        </div>
    );
};

export default SortTab;