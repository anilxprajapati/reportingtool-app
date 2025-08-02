import React from 'react';

const GlobalStyles = () => (
  <style>{`
    /* React Joyride Theming */
    :root, [data-bs-theme="light"] {
      --joyride-arrow-color: var(--bs-body-bg);
      --joyride-background-color: var(--bs-body-bg);
      --joyride-beacon-inner-color: var(--bs-primary);
      --joyride-beacon-outer-color: rgba(var(--bs-primary-rgb), 0.2);
      --joyride-text-color: var(--bs-body-color);
      --joyride-primary-color: var(--bs-primary);
      --joyride-overlay-color: rgba(var(--bs-dark-rgb), 0.5);
    }
    [data-bs-theme="dark"] {
        --joyride-arrow-color: var(--bs-tertiary-bg);
        --joyride-background-color: var(--bs-tertiary-bg);
        --joyride-text-color: var(--bs-body-color);
        --joyride-overlay-color: rgba(var(--bs-black-rgb), 0.7);
    }
    div[id^='react-joyride-step-'] > div {
      border-radius: var(--bs-border-radius-lg);
      box-shadow: var(--bs-box-shadow-lg);
      border: 1px solid var(--bs-border-color-translucent);
    }
    div[id^='react-joyride-step-'] header h4 {
        color: var(--bs-heading-color) !important;
        font-weight: 500;
        font-size: 1.1rem;
    }
    div[id^='react-joyride-step-'] div[class^="react-joyride__tooltip-content"] {
        color: var(--joyride-text-color);
    }
    div[id^='react-joyride-step-'] button {
      border-radius: var(--bs-border-radius);
      font-size: 0.875rem;
      padding: 0.375rem 0.75rem;
      transition: all 0.2s ease-in-out;
    }
    div[id^='react-joyride-step-'] button[data-action="skip"] {
        color: var(--bs-secondary-color);
        background-color: transparent;
        border: none;
        box-shadow: none;
        font-weight: normal;
    }
    div[id^='react-joyride-step-'] button[data-action="skip"]:hover {
        color: var(--bs-body-color);
        background-color: var(--bs-tertiary-bg);
    }
    div[id^='react-joyride-step-'] footer {
        border-top: 1px solid var(--bs-border-color-translucent);
        margin-top: 1rem;
        padding-top: 0.75rem;
    }

    /* --- React Query Builder Customizations --- */
    .ruleGroup {
      background-color: var(--bs-body-tertiary);
      border: 1px solid var(--bs-border-color-translucent);
      border-radius: var(--bs-border-radius);
      padding: 0.75rem;
      margin-top: 0.5rem;
    }
    
    .ruleGroup-header {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
    }
    
    .ruleGroup-combinators.form-select {
      width: auto !important;
      min-width: 90px;
      flex-grow: 0;
    }

    .ruleGroup-actions {
      margin-left: auto;
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .ruleGroup-body {
      padding-top: 0.75rem;
      margin-top: 0.75rem;
      border-top: 1px solid var(--bs-border-color-translucent);
    }
    
    .rule {
      padding: 0.25rem;
      border-radius: var(--bs-border-radius-sm);
    }
    
    .rule:hover {
      background-color: var(--bs-tertiary-bg);
    }
    
    .rule .form-select, .rule .form-control {
      min-width: 150px;
    }
    
    .rule-actions {
      margin-left: auto;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
    }
    
    .rule.is-invalid, .queryBuilder .is-invalid .rule {
      border: 1px solid var(--bs-danger);
      background-color: var(--bs-danger-bg-subtle);
    }

    [data-bs-theme="dark"] .form-select {
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23dee2e6' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e");
    }

  `}</style>
);

export default GlobalStyles;