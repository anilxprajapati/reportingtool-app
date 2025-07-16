import React, { forwardRef } from 'react';
import {
  ActionProps,
  NotToggleProps,
  ValueEditorProps,
  DragHandleProps,
  ValueSelectorProps,
} from 'react-querybuilder';
import { Button, Form } from 'react-bootstrap';
import {
  BsPlus,
  BsTrash,
  BsCopy,
  BsLockFill,
  BsUnlockFill,
  BsGripVertical,
} from 'react-icons/bs';
import StyledSelect from '../../../../components/StyledSelect';

type SelectorType = 'combinator' | 'field' | 'operator';

interface BootstrapStyledSelectorProps extends ValueSelectorProps {
    type: SelectorType;
}

export const BootstrapStyledSelector: React.FC<BootstrapStyledSelectorProps> = ({
  className,
  handleOnChange,
  options,
  value,
  type
}) => {
    const selectOptions = options.map(o => ({
        value: o.name,
        label: o.label,
    }));
    
    const placeholderMap = {
        combinator: 'And/Or',
        field: 'Select field...',
        operator: 'Select operator...'
    };

    return (
        <div className={className} style={{minWidth: '150px'}}>
            <StyledSelect
                value={selectOptions.find(o => o.value === value)}
                options={selectOptions}
                onChange={(v) => handleOnChange(v?.value ?? '')}
                placeholder={placeholderMap[type]}
            />
        </div>
    );
};


export const BootstrapActionElement: React.FC<ActionProps & { type: 'addRule' | 'addGroup' | 'removeRule' | 'removeGroup' | 'cloneRule' | 'cloneGroup' | 'lock' }> = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  type,
}) => {
  const iconMap = {
    addRule: <BsPlus />,
    addGroup: <BsPlus />,
    removeRule: <BsTrash />,
    removeGroup: <BsTrash />,
    cloneRule: <BsCopy />,
    cloneGroup: <BsCopy />,
    lock: typeof label === 'string' && label.includes('Unlock') ? <BsUnlockFill/> : <BsLockFill />,
  };
  const variantMap = {
    addRule: 'primary',
    addGroup: 'secondary',
    removeRule: 'danger',
    removeGroup: 'danger',
    cloneRule: 'secondary',
    cloneGroup: 'secondary',
    lock: 'secondary',
  };
  const isRemove = type.includes('remove');
  
  return (
    <Button
      variant={isRemove ? 'danger' : 'primary'}
      size="sm"
      className={className}
      title={title}
      onClick={e => handleOnClick(e)}
      disabled={disabled}>
      {iconMap[type]} <span className="ms-1">{type === 'addGroup' ? 'Group' : 'Rule'}</span>
    </Button>
  );
};

export const BootstrapValueEditor: React.FC<ValueEditorProps> = ({
  fieldData,
  className,
  operator,
  value,
  handleOnChange,
}) => {
  const { inputType } = fieldData;
  if (operator === 'null' || operator === 'notNull') {
    return null;
  }
  
  if (inputType === 'checkbox') {
    return (
        <Form.Check 
            type="switch"
            checked={!!value}
            onChange={e => handleOnChange(e.target.checked)}
            className={className}
        />
    );
  }

  return (
    <Form.Control
      type={inputType || 'text'}
      value={value}
      className={className}
      onChange={e => handleOnChange(e.target.value)}
      size="sm"
    />
  );
};

export const BootstrapNotToggle: React.FC<NotToggleProps> = ({
  className,
  handleOnChange,
  checked,
}) => (
  <Form.Check
    type="checkbox"
    label="NOT"
    className={className}
    checked={!!checked}
    onChange={e => handleOnChange(e.target.checked)}
  />
);

export const BootstrapDragHandle = forwardRef<HTMLSpanElement, DragHandleProps>(
  ({ className, label }, ref) => (
    <span ref={ref} className={className} title={typeof label === 'string' ? label : undefined}>
      <BsGripVertical />
    </span>
  )
);
BootstrapDragHandle.displayName = 'BootstrapDragHandle';