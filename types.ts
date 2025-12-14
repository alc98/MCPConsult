
// Data models matching the provided CSV structures

export interface Product {
  product_id: number;
  product_name: string;
  category: string;
  unit_price: number;
}

export interface Employee {
  employee_id: number;
  first_name: string;
  last_name: string;
  position: string;
  department?: string; // Some CSVs had department, some didn't in snippets, assumed optional or derived
  email: string;
  salary: number;
}

export interface Customer {
  customer_id: number;
  region: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface User {
  user_id: number;
  employee_id: number;
  role: string;
  email: string;
}

export interface Sale {
  sale_id: number;
  employee_id: number;
  customer_id: number;
  product_id: number;
  sales_channel: string;
  quantity: number;
  discount_percentage: number;
  payment_method: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  date: string; // Combined year-month-day
}

export interface TableSchema {
  name: string;
  columns: string[];
  description: string;
}

export type QueryResult = {
  columns: string[];
  rows: any[];
  sql?: string;
  explanation?: string; // Technical/Process explanation
  analysis?: string;    // Business insight/Analysis of the result
  error?: string;
  chartConfig?: any; // For Plotly configuration
  externalContext?: { // New field for Search MCP results
    source: string;
    content: string;
    url?: string;
  };
};

export enum ViewMode {
  CHAT = 'chat',
  TABLES = 'tables',
  SETTINGS = 'settings'
}
