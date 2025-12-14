import React, { useState, useEffect } from 'react';
import { getTableData } from '../services/mcpService';
import { Search, Filter, Download } from 'lucide-react';

const TABLES = ['products', 'employees', 'customers', 'sales', 'users'];

export const TablesView: React.FC = () => {
  const [activeTable, setActiveTable] = useState('products');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const res = await getTableData(activeTable);
      setData(res);
      setLoading(false);
    };
    fetchData();
  }, [activeTable]);

  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">Database Explorer</h2>
          <div className="flex gap-2">
            <button className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Download size={20} />
            </button>
            <button className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>
        
        {/* Table Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 custom-scrollbar">
          {TABLES.map(table => (
            <button
              key={table}
              onClick={() => setActiveTable(table)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTable === table 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {table.charAt(0).toUpperCase() + table.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 flex-1 overflow-hidden flex flex-col">
        {/* Search */}
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search in ${activeTable}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-sm"
          />
        </div>

        {/* Data Table */}
        <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-auto custom-scrollbar flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 sticky top-0 z-10">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="px-6 py-3 whitespace-nowrap capitalize bg-slate-50">
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="px-6 py-3 text-slate-700 whitespace-nowrap">
                          {typeof row[col] === 'number' && (col.includes('price') || col.includes('salary') || col.includes('total'))
                            ? `$${row[col].toLocaleString()}` 
                            : row[col]}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {filteredData.length === 0 && (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-slate-400">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500 flex justify-between items-center">
            <span>Showing {filteredData.length} records</span>
            <span>Table: public.{activeTable}</span>
          </div>
        </div>
      </div>
    </div>
  );
};