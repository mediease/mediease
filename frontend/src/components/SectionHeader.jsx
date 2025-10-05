import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './css/SectionHeader.css'
import { FaRegCalendarAlt } from 'react-icons/fa';

const SectionHeader = ({ title = 'Section', onDateChange }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleChange = (date) => {
    setSelectedDate(date);
    console.log("Date selected:", date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  return (
    <div className="section-header">
      <h2>{title}</h2>
      <div className="date-filter">
        <label>Select Date: </label>
        <div className="datepicker-container">
          <DatePicker
            selected={selectedDate}
            onChange={handleChange}
            dateFormat="MMM d, yyyy"
            className="date-input"
            calendarClassName="custom-calendar"
            popperPlacement="bottom-end"
          />
          <FaRegCalendarAlt className="calendar-icon" />
        </div>
      </div>
    </div>
  );
};

export default SectionHeader;
