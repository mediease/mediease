// components/SegmentedTable.jsx
import React, { useState } from "react";
import SegmentedControl from "./SegmentedControl";
import './css/SegmentedTable.css';

const SegmentedTable = ({ columns, data, filterOptions, renderCell, handleRowClick, tableState }) => {
  const [selectedFilter, setSelectedFilter] = useState(`${tableState}`);

  return (
    <div className="segmented-table-wrapper">
      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={setSelectedFilter}
      />
      <div className="table-scroll-container">
        <table className="segmented-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={idx}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? "even-row" : ""}
                onClick={() => handleRowClick(row)}
                style={{ cursor: "pointer" }}
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {renderCell
                      ? renderCell(col.key, row[col.key])
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SegmentedTable;
