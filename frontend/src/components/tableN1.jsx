import React from 'react';
import './css/tableN1.css';

const TableN1 = ({
  title,
  buttonLink,
  columns,
  data,
  compact,
  showHeader = true,
  showActions = false
}) => {
  return (
    <div className={`appointment-container ${compact ? 'compact-table' : ''}`}>
      {showHeader && (
        <div className="appointment-header">
          <h2>{title}</h2>
          {buttonLink && <button className="see-all-btn" onClick={buttonLink}>See All</button>}
        </div>
      )}
      <div className="appointment-table-wrapper">
        <table className="appointment-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th key={index}>{col.label}</th>
              ))}
              {showActions && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'even-row' : ''}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>{row[col.key]}</td>
                ))}
                {showActions && (
                  <td className="action-cell">
                    <span role="button">👁️</span>
                    <span role="button">⬇️</span>
                    <span role="button">🖨️</span>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableN1;
