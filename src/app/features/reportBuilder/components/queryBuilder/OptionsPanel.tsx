
import React from 'react';
import { Form, Button, Stack } from 'react-bootstrap';
import type { QueryBuilderOptions } from './types';
import { initialOptions } from './queryBuilderConstants';

// Helper to format option keys into readable labels
const formatOptionLabel = (key: string) => {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .replace('Show not toggle', 'Show "not" toggle') // manual override for quotes
    .trim();
};

interface OptionsPanelProps {
  options: QueryBuilderOptions;
  setOptions: React.Dispatch<React.SetStateAction<QueryBuilderOptions>>;
}

export const OptionsPanel: React.FC<OptionsPanelProps> = ({ options, setOptions }) => {
  const handleOptionChange = (option: keyof QueryBuilderOptions) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };
  
  const selectAll = () => {
    const allOptions = Object.keys(options).reduce((acc, key) => {
        acc[key as keyof QueryBuilderOptions] = true;
        return acc;
    }, {} as QueryBuilderOptions);
    // Some options are mutually exclusive or nonsensical to have all true
    allOptions.disabled = false;
    allOptions.independentCombinators = false;
    allOptions.suppressStandardClassnames = false;
    setOptions(allOptions);
  };
  
  const resetToDefaults = () => {
    setOptions(initialOptions);
  };

  return (
    <div>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }} className="pe-2">
            {Object.keys(options).map((optionKey) => (
            <Form.Check
                type="checkbox"
                key={optionKey}
                id={`option-${optionKey}`}
                label={formatOptionLabel(optionKey)}
                checked={options[optionKey as keyof QueryBuilderOptions]}
                onChange={() => handleOptionChange(optionKey as keyof QueryBuilderOptions)}
            />
            ))}
        </div>
      
        <Stack direction="horizontal" gap={2} className="mt-4 pt-3 border-top">
          <Button variant="primary" size="sm" onClick={selectAll}>Select All</Button>
          <Button variant="secondary" size="sm" onClick={resetToDefaults}>Reset to Defaults</Button>
        </Stack>
    </div>
  );
};
