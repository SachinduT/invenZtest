// src/pages/Charts.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Charts.css';

const Charts = () => {
  const navigate = useNavigate();
  const salesChartRef = useRef(null);
  const categoryChartRef = useRef(null);
  const stockChartRef = useRef(null);

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    values: [12, 19, 15, 22, 28, 35, 30, 42, 38, 45, 50, 55]
  };

  const categoryData = {
    labels: ['Electronics', 'Food', 'Clothing', 'Books', 'Home', 'Other'],
    values: [45, 30, 20, 15, 10, 8]
  };

  const stockData = {
    labels: ['In Stock', 'Low Stock', 'Out of Stock'],
    values: [75, 15, 10]
  };

  useEffect(() => {
    setTimeout(() => {
      drawSalesChart();
      drawCategoryChart();
      drawStockChart();
    }, 100);
  }, []);

  const drawSalesChart = () => {
    const canvas = salesChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 30, bottom: 40, left: 40, right: 20 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);
    const maxValue = Math.max(...salesData.values) * 1.2;

    // Grid
    ctx.strokeStyle = '#e8f0e8';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartHeight / 4) * i;
      const value = maxValue - (maxValue / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = '#999';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(value), padding.left - 10, y);
    }
    ctx.setLineDash([]);

    // Bars
    const barWidth = chartWidth / salesData.labels.length * 0.6;
    const gap = chartWidth / salesData.labels.length;
    salesData.labels.forEach((label, index) => {
      const x = padding.left + index * gap + (gap - barWidth) / 2;
      const barHeight = (salesData.values[index] / maxValue) * chartHeight;
      const y = padding.top + chartHeight - barHeight;
      const gradient = ctx.createLinearGradient(x, y, x, padding.top + chartHeight);
      gradient.addColorStop(0, '#4CAF50');
      gradient.addColorStop(1, '#1B5E20');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      ctx.fillStyle = '#1a1a1a';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(salesData.values[index], x + barWidth / 2, y - 4);

      ctx.fillStyle = '#999';
      ctx.font = '9px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + barWidth / 2, padding.top + chartHeight + 8);
    });
  };

  const drawCategoryChart = () => {
    const canvas = categoryChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;

    ctx.clearRect(0, 0, width, height);
    const total = categoryData.values.reduce((sum, v) => sum + v, 0);
    const colors = ['#1B5E20', '#4CAF50', '#FF9800', '#2196F3', '#9C27B0', '#F44336'];
    let startAngle = -Math.PI / 2;

    categoryData.labels.forEach((label, index) => {
      const sliceAngle = (categoryData.values[index] / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;
      if (sliceAngle > 0.15) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round((categoryData.values[index] / total) * 100)}%`, labelX, labelY);
      }
      startAngle = endAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.35, 0, 2 * Math.PI);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, centerX, centerY - 8);
    ctx.fillStyle = '#999';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('Total', centerX, centerY + 14);
  };

  const drawStockChart = () => {
    const canvas = stockChartRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 30;

    ctx.clearRect(0, 0, width, height);
    const total = stockData.values.reduce((sum, v) => sum + v, 0);
    const colors = ['#43A047', '#FF9800', '#F44336'];
    let startAngle = -Math.PI / 2;

    stockData.labels.forEach((label, index) => {
      const sliceAngle = (stockData.values[index] / total) * 2 * Math.PI;
      const endAngle = startAngle + sliceAngle;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();

      const midAngle = startAngle + sliceAngle / 2;
      const labelRadius = radius * 0.65;
      const labelX = centerX + Math.cos(midAngle) * labelRadius;
      const labelY = centerY + Math.sin(midAngle) * labelRadius;
      if (sliceAngle > 0.15) {
        ctx.fillStyle = 'white';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round((stockData.values[index] / total) * 100)}%`, labelX, labelY);
      }
      startAngle = endAngle;
    });

    // Legend
    const legendX = width - 100;
    let legendY = 30;
    stockData.labels.forEach((label, index) => {
      ctx.fillStyle = colors[index % colors.length];
      ctx.fillRect(legendX, legendY, 12, 12);
      ctx.fillStyle = '#555';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${label} (${stockData.values[index]})`, legendX + 18, legendY + 6);
      legendY += 22;
    });
  };

  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, radii) {
      const r = Array.isArray(radii) ? radii : [radii, radii, radii, radii];
      this.moveTo(x + r[0], y);
      this.lineTo(x + w - r[1], y);
      this.quadraticCurveTo(x + w, y, x + w, y + r[1]);
      this.lineTo(x + w, y + h - r[2]);
      this.quadraticCurveTo(x + w, y + h, x + w - r[2], y + h);
      this.lineTo(x + r[3], y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - r[3]);
      this.lineTo(x, y + r[0]);
      this.quadraticCurveTo(x, y, x + r[0], y);
      this.closePath();
      return this;
    };
  }

  return (
    <div className="charts-page">
      <button className="back-btn" onClick={() => navigate('/')}>← Back to Dashboard</button>
      
      <div className="charts-header">
        <h1>📉 Charts & Analytics</h1>
        <p>Visualize your inventory data with interactive charts</p>
      </div>

      <div className="charts-grid">
        {/* Sales Chart - width 500, height 280 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📈 Sales Trend</h3>
            <span className="chart-badge">Monthly</span>
          </div>
          <div className="chart-body">
            <canvas ref={salesChartRef} width="500" height="280" />
          </div>
          <div className="chart-footer">
            <span>Total Sales: <strong>{salesData.values.reduce((a, b) => a + b, 0)}</strong></span>
            <span>Avg: <strong>{Math.round(salesData.values.reduce((a, b) => a + b, 0) / salesData.values.length)}</strong></span>
          </div>
        </div>

        {/* Category Chart - width 350, height 280 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>🏷️ Products by Category</h3>
            <span className="chart-badge">Distribution</span>
          </div>
          <div className="chart-body">
            <canvas ref={categoryChartRef} width="350" height="280" />
          </div>
          <div className="chart-footer">
            <span>Total Categories: <strong>{categoryData.labels.length}</strong></span>
            <span>Total Products: <strong>{categoryData.values.reduce((a, b) => a + b, 0)}</strong></span>
          </div>
        </div>

        {/* Stock Chart - width 350, height 280 */}
        <div className="chart-card">
          <div className="chart-header">
            <h3>📦 Stock Status</h3>
            <span className="chart-badge">Current</span>
          </div>
          <div className="chart-body">
            <canvas ref={stockChartRef} width="350" height="280" />
          </div>
          <div className="chart-footer">
            <span className="stock-good">🟢 In Stock: <strong>{stockData.values[0]}</strong></span>
            <span className="stock-warning">🟡 Low Stock: <strong>{stockData.values[1]}</strong></span>
            <span className="stock-danger">🔴 Out of Stock: <strong>{stockData.values[2]}</strong></span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="charts-summary">
        <div className="summary-card">
          <span className="summary-icon">💰</span>
          <div>
            <h4>Total Revenue</h4>
            <p>Rs. 125,000</p>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">📦</span>
          <div>
            <h4>Total Products</h4>
            <p>1,245</p>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">⚠️</span>
          <div>
            <h4>Low Stock Items</h4>
            <p>15</p>
          </div>
        </div>
        <div className="summary-card">
          <span className="summary-icon">🏢</span>
          <div>
            <h4>Suppliers</h4>
            <p>24</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;