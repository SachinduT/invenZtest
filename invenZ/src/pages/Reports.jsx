// src/pages/Reports.jsx - WITH ERROR HANDLING
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Reports.css';

// ✅ Dynamic imports with error handling
const Reports = () => {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [exportError, setExportError] = useState(null);

  // ✅ DEMO DATA - Backend නැතුව වැඩ කරයි
  const reportDataMap = {
    sales: {
      title: 'Sales Report',
      icon: '📊',
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
      icon: '📦',
      columns: ['ID', 'Product', 'Category', 'Current Stock', 'Min Stock', 'Status'],
      data: [
        { id: 1, product: 'Premium Rice', category: 'Food', currentStock: 45, minStock: 10, status: 'In Stock' },
        { id: 2, product: 'Sugar', category: 'Food', currentStock: 8, minStock: 10, status: 'Low Stock' },
        { id: 3, product: 'Laptop', category: 'Electronics', currentStock: 2, minStock: 5, status: 'Critical' },
        { id: 4, product: 'Wheat Flour', category: 'Food', currentStock: 45, minStock: 15, status: 'In Stock' },
        { id: 5, product: 'Office Chair', category: 'Furniture', currentStock: 20, minStock: 5, status: 'In Stock' }
      ]
    },
    suppliers: {
      title: 'Supplier Report',
      icon: '🏢',
      columns: ['ID', 'Supplier', 'Contact', 'Email', 'Products', 'Rating'],
      data: [
        { id: 1, supplier: 'Tech Distributors Ltd', contact: 'Mr. Kumar', email: 'tech@dist.com', products: 15, rating: 4.5 },
        { id: 2, supplier: 'Food Supply Co.', contact: 'Mrs. Perera', email: 'food@supply.com', products: 25, rating: 4.8 },
        { id: 3, supplier: 'Fashion Hub', contact: 'Ms. Silva', email: 'fashion@hub.com', products: 8, rating: 4.2 },
        { id: 4, supplier: 'Fresh Foods', contact: 'Mr. Jayasinghe', email: 'fresh@foods.com', products: 12, rating: 4.6 }
      ]
    },
    profit: {
      title: 'Profit Report',
      icon: '💰',
      columns: ['ID', 'Product', 'Purchase Price', 'Selling Price', 'Profit', 'Margin %'],
      data: [
        { id: 1, product: 'Premium Rice', purchasePrice: 120, sellingPrice: 150, profit: 30, margin: 25 },
        { id: 2, product: 'Sugar', purchasePrice: 80, sellingPrice: 100, profit: 20, margin: 25 },
        { id: 3, product: 'Laptop', purchasePrice: 45000, sellingPrice: 55000, profit: 10000, margin: 22 },
        { id: 4, product: 'Wheat Flour', purchasePrice: 90, sellingPrice: 120, profit: 30, margin: 33 },
        { id: 5, product: 'Office Chair', purchasePrice: 15000, sellingPrice: 25000, profit: 10000, margin: 40 }
      ]
    }
  };

  const reportTypes = [
    { id: 'sales', label: 'Sales Report', icon: '📊' },
    { id: 'stock', label: 'Stock Report', icon: '📦' },
    { id: 'suppliers', label: 'Supplier Report', icon: '🏢' },
    { id: 'profit', label: 'Profit Report', icon: '💰' }
  ];

  // ✅ Generate Report - Demo Data
  const handleGenerate = () => {
    setLoading(true);
    setExportError(null);
    setTimeout(() => {
      const data = reportDataMap[reportType];
      setReportData({
        title: data.title,
        icon: data.icon,
        generated: new Date().toLocaleString(),
        columns: data.columns,
        data: data.data,
        total: data.data.length
      });
      setLoading(false);
    }, 500);
  };

  // ✅ Export to Excel with error handling
  const exportToExcel = async () => {
    if (!reportData) {
      alert('Please generate a report first!');
      return;
    }

    try {
      // Dynamic import for xlsx
      const XLSX = await import('xlsx');
      
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

      // Auto column widths
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
      setExportError('Failed to export Excel. Please make sure xlsx package is installed.');
      alert('❌ Failed to export Excel. Please install xlsx package: npm install xlsx');
    }
  };

  // ✅ Export to PDF with error handling
  const exportToPDF = async () => {
    if (!reportData) {
      alert('⚠️ Please generate a report first!');
      return;
    }

    try {
      // Dynamic imports for pdf libraries
      const jsPDFModule = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      
      const jsPDF = jsPDFModule.default;
      const autoTable = autoTableModule.default;

      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Header
      doc.setFontSize(20);
      doc.setTextColor('#1B5E20');
      doc.text(`${reportData.icon} InvenZ - ${reportData.title}`, 14, 20);

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
      setExportError('Failed to export PDF. Please make sure jspdf and jspdf-autotable are installed.');
      alert('❌ Failed to export PDF. Please install: npm install jspdf jspdf-autotable');
    }
  };

  return (
    <div className="reports-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>

      <div className="page-header">
        <h1>📋 Reports</h1>
        <p>Generate and view reports for your business</p>
        {exportError && (
          <div className="error-banner">
            <span>⚠️</span> {exportError}
          </div>
        )}
      </div>

      <div className="report-controls">
        <div className="report-types">
          {reportTypes.map((type) => (
            <button
              key={type.id}
              className={`report-type-btn ${reportType === type.id ? 'active' : ''}`}
              onClick={() => setReportType(type.id)}
            >
              <span className="report-icon">{type.icon}</span>
              {type.label}
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
        <div className="report-card">
          <div className="report-card-header">
            <div className="report-title-section">
              <span className="report-icon-large">{reportData.icon}</span>
              <div>
                <h2>{reportData.title}</h2>
                <p>Generated: {reportData.generated}</p>
              </div>
            </div>
            <div className="report-actions">
              <button className="btn-excel" onClick={exportToExcel}>
                📥 Export Excel
              </button>
              <button className="btn-pdf" onClick={exportToPDF}>
                📄 Export PDF
              </button>
            </div>
          </div>

          <div className="report-meta">
            <span>📊 Total Records: <strong>{reportData.total}</strong></span>
            <span>📅 Report Type: <strong>{reportData.title}</strong></span>
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
                      
                      // Format numbers
                      if (typeof value === 'number' && 
                          (col.toLowerCase().includes('price') || 
                           col.toLowerCase().includes('amount') || 
                           col.toLowerCase().includes('profit') ||
                           col.toLowerCase().includes('value'))) {
                        value = `Rs. ${value.toLocaleString()}`;
                      }
                      
                      // Format dates
                      if (col.toLowerCase().includes('date') && value) {
                        value = new Date(value).toLocaleDateString();
                      }
                      
                      // Status badges
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
                      
                      // Rating stars
                      if (col.toLowerCase().includes('rating')) {
                        const fullStars = Math.round(value);
                        const emptyStars = 5 - fullStars;
                        const stars = '⭐'.repeat(fullStars) + '☆'.repeat(emptyStars);
                        return <td key={colIndex} className="rating-cell">{stars}</td>;
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
        </div>
      )}
    </div>
  );
};

export default Reports;