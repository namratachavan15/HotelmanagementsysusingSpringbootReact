import React, { useState } from 'react'
import "react-date-range/dist/styles.css"
import "react-date-range/dist/theme/default.css"
import {DateRangePicker} from "react-date-range"
import { FaCalendarAlt } from 'react-icons/fa'

const DateSlider = ({onDateChange,onFilterChange}) => {
    const [dateRange,setDateRange]=useState({
        startDate:undefined,
        endDate:undefined,
        key:"selection"
    })

    const handleSelect=(ranges)=>{
      setDateRange(ranges.selection)
      onDateChange(ranges.selection.startDate,ranges.selection.endDate)
      onFilterChange(ranges.selection.startDate,ranges.selection.endDate)
    }

    const handleClearFilter=()=>{
      setDateRange({
        startDate:undefined,
        endDate:undefined,
        key:"selection"
      })
      onDateChange(null,null)
      onFilterChange(null,null)
    }
  return (
    <div className='tj-card p-3 p-md-4 mb-4'>
      <h5 className='d-flex align-items-center gap-2'><FaCalendarAlt className='hotel-color'/> Filter bookings by date</h5>
      <DateRangePicker ranges={[dateRange]} onChange={handleSelect} className='mb-3'/>
      <button className='btn btn-hotel-outline btn-sm' onClick={handleClearFilter}>
        Clear filter
      </button>
    </div>
  )
}

export default DateSlider
