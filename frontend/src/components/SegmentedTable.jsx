// components/SegmentedTable.jsx
import React, { useState, useEffect } from "react";
import SegmentedControl from "./SegmentedControl";
import "./css/SegmentedTable.css";

const SegmentedTable = ({
  columns,
  data,
  filterOptions,
  renderCell,
  handleRowClick,
  tableState,
  setTableState,
  loading,
}) => {
  const [selectedFilter, setSelectedFilter] = useState(tableState);

  useEffect(() => {
    setSelectedFilter(tableState);
  }, [tableState]);

  const handleSegmentChange = (option) => {
    setSelectedFilter(option);
    if (setTableState) setTableState(option);
  };

  return (
    <div className="segmented-table-wrapper">
      <SegmentedControl
        options={filterOptions}
        selected={selectedFilter}
        onChange={handleSegmentChange}
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
            {loading ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  Loading...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center" }}>
                  No records
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={rowIndex % 2 === 0 ? "even-row" : ""}
                  onClick={() => handleRowClick(row)}
                  style={{ cursor: "pointer" }}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {renderCell ? renderCell(col.key, row[col.key]) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SegmentedTable;
