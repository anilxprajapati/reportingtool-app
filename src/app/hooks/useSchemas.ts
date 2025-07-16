import { useState, useEffect } from 'react';
import type { Schema } from '../../types';

const MOCK_SCHEMA_DATA: Schema[] = [
  {
    id: 'schema-1',
    name: 'sales_db',
    tables: [
      {
        id: 'table-1-1',
        name: 'Orders',
        displayName: 'Order Information',
        rowCount: 5000,
        columns: [
          { name: 'OrderID', dataType: 'number', isPrimaryKey: true, description: 'Unique identifier for the order.' },
          { name: 'CustomerID', dataType: 'number', isForeignKey: true, description: 'FK to Customers table' },
          { name: 'OrderDate', dataType: 'date' },
          { name: 'TotalAmount', dataType: 'number' },
        ],
        sampleData: [
          { OrderID: 57, CustomerID: 597, OrderDate: '2025-05-08T09:18:20.624Z', TotalAmount: 68.17 },
          { OrderID: 491, CustomerID: 891, OrderDate: '2025-03-31T14:54:09.098Z', TotalAmount: 46.76 },
          { OrderID: 359, CustomerID: 887, OrderDate: '2025-05-26T21:02:52.571Z', TotalAmount: 3.55 },
          { OrderID: 335, CustomerID: 895, OrderDate: '2025-06-12T05:24:16.138Z', TotalAmount: 15.54 },
          { OrderID: 95, CustomerID: 966, OrderDate: '2025-06-12T07:29:44.294Z', TotalAmount: 29.93 },
        ],
      },
      {
        id: 'table-1-2',
        name: 'Customers',
        displayName: 'Customer Data',
        rowCount: 1500,
        columns: [
            { name: 'CustomerID', dataType: 'number', isPrimaryKey: true },
            { name: 'FirstName', dataType: 'string' },
            { name: 'LastName', dataType: 'string' },
            { name: 'Email', dataType: 'string' },
        ],
        sampleData: [
            { CustomerID: 597, FirstName: 'John', LastName: 'Doe', Email: 'john.doe@example.com' },
            { CustomerID: 891, FirstName: 'Jane', LastName: 'Smith', Email: 'jane.smith@example.com' },
        ],
      },
      {
        id: 'table-1-3',
        name: 'Products',
        displayName: 'Product Catalog',
        rowCount: 250,
        columns: [{ name: 'ProductID', dataType: 'number', isPrimaryKey: true }, { name: 'ProductName', dataType: 'string' }],
        sampleData: [
            { ProductID: 101, ProductName: 'Widget A' },
            { ProductID: 102, ProductName: 'Widget B' },
        ],
      }
    ],
  },
  {
    id: 'schema-2',
    name: 'financial_db',
    tables: [
        {
            id: 'table-2-1',
            name: 'Invoices',
            displayName: 'Invoice Records',
            rowCount: 12500,
            columns: [{ name: 'InvoiceID', dataType: 'number', isPrimaryKey: true }, { name: 'Amount', dataType: 'number' }],
            sampleData: [
                { InvoiceID: 2024001, Amount: 150.75 },
                { InvoiceID: 2024002, Amount: 899.99 },
                { InvoiceID: 2024003, Amount: 45.00 },
            ],
        },
        {
            id: 'table-2-2',
            name: 'Transactions',
            displayName: 'Transaction History',
            rowCount: 45000,
            columns: [{ name: 'TransactionID', dataType: 'number', isPrimaryKey: true }, { name: 'Status', dataType: 'string' }],
            sampleData: [
                { TransactionID: 98765, Status: 'Completed' },
                { TransactionID: 98766, Status: 'Pending' },
                { TransactionID: 98767, Status: 'Completed' },
            ],
        }
    ],
  }
];


/**
 * Custom hook to manage schema data.
 * This can be easily updated to fetch from a real API.
 */
export const useSchemas = () => {
  const [schemas, setSchemas] = useState<Schema[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate network delay for fetching initial data
    const timer = setTimeout(() => {
      setSchemas(MOCK_SCHEMA_DATA);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { schemas, loading };
};