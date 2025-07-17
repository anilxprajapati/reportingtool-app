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
  BsGripVertical,
} from 'react-icons/bs';
import StyledSelect from '../../../../components/StyledSelect';

type SelectorType = 'combinator' | 'field' | 'operator';

type BootstrapStyledSelectorProps = ValueSelectorProps & {
    type: SelectorType;
};

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
    
    // Remove 'form-select' to prevent double arrow background image with react-select
    const newClassName = className ? className.replace('form-select', '') : '';

    return (
        <div className={newClassName} style={{minWidth: '250px'}}>
            <StyledSelect
                value={selectOptions.find(o => o.value === value)}
                options={selectOptions}
                onChange={(v: any) => handleOnChange(v?.value ?? '')}
                placeholder={placeholderMap[type]}
            />
        </div>
    );
};


export const BootstrapActionElement: React.FC<ActionProps & { icon: React.ReactNode; variant?: 'primary' | 'secondary' | 'danger' }> = ({
  className,
  handleOnClick,
  label,
  title,
  disabled,
  icon,
  variant = 'primary'
}) => {
  return (
    <Button
      variant={variant}
      size="sm"
      className={className}
      title={title}
      onClick={e => handleOnClick(e)}
      disabled={disabled}>
      {icon}
      {label && <span className="ms-1">{label}</span>}
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