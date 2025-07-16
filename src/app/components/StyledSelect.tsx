import React from 'react';
import Select, { Props, StylesConfig } from 'react-select';

// This function creates theme-aware styles for react-select using CSS variables
const getCustomStyles = (): StylesConfig<any, boolean> => ({
  control: (provided, state) => ({
    ...provided,
    backgroundColor: 'var(--bs-form-bg)',
    borderColor: state.isFocused ? 'var(--bs-primary)' : 'var(--bs-border-color)',
    boxShadow: state.isFocused ? `0 0 0 0.25rem rgba(var(--bs-primary-rgb), 0.25)` : 'none',
    '&:hover': {
      borderColor: 'var(--bs-primary-border-subtle)',
    },
    minHeight: '31px', // for size="sm" equivalent
    height: '31px',
    fontSize: '0.875rem', // sm font size
  }),
  valueContainer: (provided) => ({
    ...provided,
    height: '31px',
    padding: '0 8px'
  }),
  input: (provided) => ({
    ...provided,
    margin: '0px',
    color: 'var(--bs-body-color)',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: (provided) => ({
    ...provided,
    height: '31px',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'var(--bs-body-color)',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: 'var(--bs-body-bg)',
    border: `1px solid var(--bs-border-color)`,
    boxShadow: 'var(--bs-box-shadow)',
    zIndex: 9999, // Ensure it appears above other elements
  }),
  menuPortal: base => ({ ...base, zIndex: 9999 }), // Set z-index for the portal itself
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? 'var(--bs-primary)'
      : state.isFocused
      ? 'var(--bs-primary-bg-subtle)'
      : 'transparent',
    color: state.isSelected ? 'var(--bs-light)' : 'var(--bs-body-color)',
    '&:active': {
      backgroundColor: 'var(--bs-primary-bg-subtle)',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: 'var(--bs-secondary-color)',
  }),
});

/**
 * A styled wrapper for the react-select component that integrates
 * seamlessly with Bootstrap's dark and light themes.
 * It uses a portal to render the menu at the body level, fixing z-index issues.
 */
const StyledSelect: React.FC<Props> = (props) => {
  const customStyles = getCustomStyles();
  
  // Only portal the menu if the document object is available (i.e., in the browser)
  const menuPortalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <Select
      styles={customStyles}
      menuPortalTarget={menuPortalTarget}
      {...props}
    />
  );
};

export default StyledSelect;