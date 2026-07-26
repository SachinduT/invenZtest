// src/pages/Reports.jsx - DEMO MODE (No Backend)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Card from '../components/common/Card';
import './Reports.css';

const Reports = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);

  // ✅ DEMO DATA - Backend නැතුව වැඩ කරයි
  const reportDataMap = {
    sales: {
      title: 'Sales Report',
      columns: ['ID', 'Product', 'Quantity', 'Amount', 'Date'],
      data: [
        { id: 1, product: 'Premium Rice', quantity: 50, amount: 7500, date: '2026-07-20' },
        { id: 2, product: 'Sugar', quantity: 30, amount: 3000, date: '2026-07-21' },
        { id: 3, product: 'Laptop', quantity: 5, amount: 275000, date: '2026-07-22' },
        { id: 4, product: 'Wheat Flour', quantity: 20, amount: 2400, date: '2026-07-22' },
        { id: 5, product: 'Rice Cooker', quantity: 10, amount: 15000, date: '2026-07-23' }
      ]
    },
    stock: {
      title: 'Stock Report',
      columns: ['ID', 'Product', 'Category', 'Current Stock', 'Min Stock', 'Status'],
      data: [
        { id: 1, product: 'Premium Rice', category: 'Food', currentStock: 45, minStock: 10, status: 'In Stock' },
        { id: 2, product: 'Sugar', category: 'Food', currentStock: 8, minStock: 10, status: 'Low Stock' },
        { id: 3, product: 'Laptop', category: 'Electronics', currentStock: 2, minStock: 5, status: 'Critical' },
        { id: 4, product: 'Wheat Flour', category: 'Food', currentStock: 45, minStock: 15, status: 'In Stock' }
      ]
    },
    suppliers: {
      title: 'Supplier Report',
      columns: ['ID', 'Supplier', 'Contact', 'Email', 'Products', 'Rating'],
      data: [
        { id: 1, supplier: 'Tech Distributors Ltd', contact: 'Mr. Kumar', email: 'tech@dist.com', products: 15, rating: 4.5 },
        { id: 2, supplier: 'Food Supply Co.', contact: 'Mrs. Perera', email: 'food@supply.com', products: 25, rating: 4.8 },
        { id: 3, supplier: 'Fashion Hub', contact: 'Ms. Silva', email: 'fashion@hub.com', products: 8, rating: 4.2 }
      ]
    },
    profit: {
      title: 'Profit Report',
      columns: ['ID', 'Product', 'Purchase Price', 'Selling Price', 'Profit', 'Margin %'],
      data: [
        { id: 1, product: 'Premium Rice', purchasePrice: 120, sellingPrice: 150, profit: 30, margin: 25 },
        { id: 2, product: 'Sugar', purchasePrice: 80, sellingPrice: 100, profit: 20, margin: 25 },
        { id: 3, product: 'Laptop', purchasePrice: 45000, sellingPrice: 55000, profit: 10000, margin: 22 },
        { id: 4, product: 'Wheat Flour', purchasePrice: 90, sellingPrice: 120, profit: 30, margin: 33 }
      ]
    }
  };

  const reportTypes = [
    { id: 'sales', label: '📊 Sales Report', icon: '📊' },
    { id: 'stock', label: '📦 Stock Report', icon: '📦' },
    { id: 'suppliers', label: '🏢 Supplier Report', icon: '🏢' },
    { id: 'profit', label: '💰 Profit Report', icon: '💰' }
  ];

  // ✅ Generate Report - Demo Data
  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      const data = reportDataMap[reportType];
      setReportData({
        title: data.title,
        generated: new Date().toLocaleString(),
        columns: data.columns,
        data: data.data,
        total: data.data.length
      });
      setLoading(false);
    }, 500);
  };

  // ✅ Export to Excel
  const exportToExcel = () => {
    if (!reportData) {
      alert('Please generate a report first!');
      return;
    }

    try {
      const excelData = reportData.data.map(item => {
        const row = {};
        reportData.columns.forEach(col => {
          const key = col.toLowerCase().replace(/ /g, '_');
          row[col] = item[key] || item[col.toLowerCase()] || '';
        });
        return row;
      });

      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');

      const colWidths = [];
      reportData.columns.forEach((col, index) => {
        let maxLen = col.length;
        excelData.forEach(row => {
          const val = String(row[col] || '');
          if (val.length > maxLen) maxLen = val.length;
        });
        colWidths.push({ wch: Math.min(Math.max(maxLen + 4, 12), 30) });
      });
      ws['!cols'] = colWidths;

      XLSX.writeFile(wb, `${reportData.title}_${new Date().toISOString().slice(0,10)}.xlsx`);
      alert('✅ Excel file downloaded successfully!');
    } catch (error) {
      console.error('Excel export error:', error);
      alert('❌ Failed to export Excel');
    }
  };

  // ✅ Export to PDF
  const exportToPDF = () => {
    if (!reportData) {
      alert('⚠️ Please generate a report first!');
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header
      doc.setFontSize(18);
      doc.setTextColor('#1B5E20');
      doc.text(`InvenZ - ${reportData.title}`, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor('#666');
      doc.text(`Generated: ${reportData.generated}`, 14, 30);
      doc.text(`Total Records: ${reportData.total}`, 14, 36);

      doc.setDrawColor('#1B5E20');
      doc.setLineWidth(0.5);
      doc.line(14, 40, pageWidth - 14, 40);

      // Table
      const tableHeaders = reportData.columns;
      const tableRows = reportData.data.map(item => {
        return reportData.columns.map(col => {
          const key = col.toLowerCase().replace(/ /g, '_');
          let value = item[key] || item[col.toLowerCase()] || '';
          
          if (typeof value === 'number' && 
              (col.toLowerCase().includes('price') || 
               col.toLowerCase().includes('amount') || 
               col.toLowerCase().includes('profit'))) {
            value = `Rs. ${value.toLocaleString()}`;
          }
          
          if (col.toLowerCase().includes('date') && value) {
            value = new Date(value).toLocaleDateString();
          }
          
          return value;
        });
      });

      autoTable(doc, {
        head: [tableHeaders],
        body: tableRows,
        startY: 45,
        styles: {
          fontSize: 8,
          cellPadding: 3,
          lineColor: '#ddd',
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: '#1B5E20',
          textColor: '#FFFFFF',
          fontSize: 9,
          fontStyle: 'bold',
          halign: 'center'
        },
        alternateRowStyles: {
          fillColor: '#F5F9F5'
        },
        margin: { left: 14, right: 14 },
        tableWidth: 'auto',
        didDrawPage: function(data) {
          const footerY = pageHeight - 10;
          doc.setFontSize(8);
          doc.setTextColor('#999');
          doc.text(
            `© ${new Date().getFullYear()} InvenZ - Smart Inventory Management`, 
            14, 
            footerY
          );
          doc.text(
            `Page ${doc.internal.getCurrentPageInfo().pageNumber}`, 
            pageWidth - 20, 
            footerY
          );
        }
      });

      doc.save(`${reportData.title}_${new Date().toISOString().slice(0,10)}.pdf`);
      alert('✅ PDF file downloaded successfully!');

    } catch (error) {
      console.error('PDF export error:', error);
      alert('❌ Failed to export PDF. Error: ' + error.message);
    }
  };

  return (
    <div className="reports-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>

      <div className="page-header">
        <h1>📋 Reports</h1>
        <p>Generate and view reports for your business</p>
      </div>

      <div className="report-controls">
        <div className="report-types">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              className={`report-type-btn ${reportType === type.id ? 'active' : ''}`}
              onClick={() => setReportType(type.id)}
            >
              {type.icon} {type.label}
            </button>
          ))}
        </div>

        <div className="date-range">
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          <button className="btn-generate" onClick={handleGenerate} disabled={loading}>
            {loading ? '⏳ Generating...' : '📊 Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <Card title={`📄 ${reportData.title}`} className="report-card">
          <div className="report-meta">
            <span>Generated: {reportData.generated}</span>
            <span>Total Records: {reportData.total}</span>
            <div className="report-actions">
              <button className="btn-sm btn-excel" onClick={exportToExcel}>
                📥 Export Excel
              </button>
              <button className="btn-sm btn-pdf" onClick={exportToPDF}>
                📄 Export PDF
              </button>
            </div>
          </div>

          <div className="report-table-wrapper">
            <table className="report-table">
              <thead>
                <tr>
                  {reportData.columns.map((col, index) => (
                    <th key={index}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportData.data.map((item, rowIndex) => (
                  <tr key={rowIndex}>
                    {reportData.columns.map((col, colIndex) => {
                      const key = col.toLowerCase().replace(/ /g, '_');
                      let value = item[key] || item[col.toLowerCase()] || '';
                      
                      if (typeof value === 'number' && 
                          (col.toLowerCase().includes('price') || 
                           col.toLowerCase().includes('amount') || 
                           col.toLowerCase().includes('profit') ||
                           col.toLowerCase().includes('value'))) {
                        value = `Rs. ${value.toLocaleString()}`;
                      }
                      
                      if (col.toLowerCase().includes('date') && value) {
                        value = new Date(value).toLocaleDateString();
                      }
                      
                      if (col.toLowerCase().includes('status')) {
                        const statusClass = value.toLowerCase().replace(/ /g, '-');
                        return (
                          <td key={colIndex}>
                            <span className={`status-badge ${statusClass}`}>
                              {value}
                            </span>
                          </td>
                        );
                      }
                      
                      if (col.toLowerCase().includes('rating')) {
                        const stars = '⭐'.repeat(Math.round(value)) + '☆'.repeat(5 - Math.round(value));
                        return <td key={colIndex}>{stars}</td>;
                      }
                      
                      return <td key={colIndex}>{value}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="report-footer">
            <span>Generated by InvenZ v1.0.0</span>
            <span>© {new Date().getFullYear()} InvenZ - Smart Inventory Management</span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default Reports;