import { Product, Employee, Customer, User, Sale } from './types';

// Samples taken from provided CSV data
export const PRODUCTS: Product[] = [
  { product_id: 1, product_name: "Organizador Modular", category: "Hogar", unit_price: 355.05 },
  { product_id: 2, product_name: "Drone Infantil", category: "Juguetes", unit_price: 380.52 },
  { product_id: 3, product_name: "Kit de Manualidades", category: "Juguetes", unit_price: 391.14 },
  { product_id: 4, product_name: "Short Deportivo", category: "Ropa", unit_price: 473.37 },
  { product_id: 5, product_name: "Muñeco Articulado", category: "Juguetes", unit_price: 385.09 },
  { product_id: 6, product_name: "Blusa Elegante", category: "Ropa", unit_price: 338.61 },
  { product_id: 7, product_name: "Mouse Inalámbrico", category: "Electrónica", unit_price: 363.50 },
  { product_id: 8, product_name: "Tablet 10 pulgadas", category: "Electrónica", unit_price: 415.74 },
  { product_id: 100, product_name: "Smartwatch Deportivo", category: "Electrónica", unit_price: 450.43 },
];

export const EMPLOYEES: Employee[] = [
  { employee_id: 1, first_name: "Javier", last_name: "Rivas", position: "Operario", email: "jrivas12@empresa.com", salary: 1299.12 },
  { employee_id: 2, first_name: "Ana", last_name: "Suárez", position: "Especialista Marketing", email: "asuarez32@empresa.com", salary: 3223.8 },
  { employee_id: 3, first_name: "Raúl", last_name: "Rivas", position: "Analista Financiero", email: "rrivas28@empresa.com", salary: 2955.45 },
  { employee_id: 4, first_name: "Raúl", last_name: "Reyes", position: "Desarrollador", email: "rreyes73@empresa.com", salary: 3219.62 },
  { employee_id: 5, first_name: "Fernando", last_name: "Rodríguez", position: "Supervisor", email: "frodriguez82@empresa.com", salary: 2160.27 },
  { employee_id: 6, first_name: "Daniela", last_name: "Rodríguez", position: "Vendedor", email: "drodriguez12@empresa.com", salary: 2592.83 },
];

export const CUSTOMERS: Customer[] = [
  { customer_id: 103, region: "Centro", first_name: "Roberto", last_name: "Rivas", email: "roberto.rivas@cliente.com" },
  { customer_id: 436, region: "Centro", first_name: "Marina", last_name: "García", email: "marina.garcía@cliente.com" },
  { customer_id: 349, region: "Centro", first_name: "Carmen", last_name: "Ramírez", email: "carmen.ramírez@cliente.com" },
  { customer_id: 271, region: "Oeste", first_name: "Lucía", last_name: "Ramírez", email: "lucía.ramírez@cliente.com" },
  { customer_id: 107, region: "Sur", first_name: "Diego", last_name: "Ruiz", email: "diego.ruiz@cliente.com" },
  { customer_id: 72, region: "Este", first_name: "Carlos", last_name: "Torres", email: "carlos.torres@cliente.com" },
];

export const USERS: User[] = [
  { user_id: 1, employee_id: 1, role: "administrador", email: "jrivas12@empresa.com" },
  { user_id: 2, employee_id: 2, role: "marketing", email: "asuarez32@empresa.com" },
  { user_id: 3, employee_id: 3, role: "marketing", email: "rrivas28@empresa.com" },
  { user_id: 4, employee_id: 4, role: "administrador", email: "rreyes73@empresa.com" },
  { user_id: 6, employee_id: 6, role: "RRHH", email: "drodriguez12@empresa.com" },
];

export const SALES: Sale[] = [
  { sale_id: 1, employee_id: 92, customer_id: 103, product_id: 5, sales_channel: "Tienda física", quantity: 4, discount_percentage: 11.67, payment_method: "Efectivo", subtotal: 1852.2, discount_amount: 216.15, total: 1636.05, date: "2024-05-10" },
  { sale_id: 2, employee_id: 45, customer_id: 436, product_id: 157, sales_channel: "Distribuidor", quantity: 16, discount_percentage: 1.23, payment_method: "Efectivo", subtotal: 7122.72, discount_amount: 87.61, total: 7035.11, date: "2023-04-01" },
  { sale_id: 3, employee_id: 59, customer_id: 349, product_id: 47, sales_channel: "Distribuidor", quantity: 17, discount_percentage: 13.11, payment_method: "Paypal", subtotal: 2631.09, discount_amount: 344.94, total: 2286.15, date: "2025-05-29" },
  { sale_id: 4, employee_id: 38, customer_id: 271, product_id: 68, sales_channel: "Tienda física", quantity: 9, discount_percentage: 0.17, payment_method: "Efectivo", subtotal: 447.48, discount_amount: 0.76, total: 446.72, date: "2025-08-12" },
  { sale_id: 5, employee_id: 32, customer_id: 107, product_id: 76, sales_channel: "Online", quantity: 6, discount_percentage: 15.6, payment_method: "Tarjeta", subtotal: 414.96, discount_amount: 64.73, total: 350.23, date: "2024-11-02" },
];