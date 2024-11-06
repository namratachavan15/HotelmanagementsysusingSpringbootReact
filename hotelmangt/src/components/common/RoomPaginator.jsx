import React from 'react'

const RoomPaginator = ({currentPage,totalPages,onPageChange}) => {

    const pageNumbers=Array.from({length:totalPages},(_,i)=>i+1)

  return (
    <nav>
    <ul className='pagination justify-content-center' style={{ listStyle: 'none' }}>
      {pageNumbers.map((pageNumber) => (
        <li key={pageNumber} style={{ display: 'inline-block', margin: '0 5px' }} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
          <button className='btn btn-primary' onClick={() => onPageChange(pageNumber)}>
            {pageNumber}
          </button>
        </li>
      ))}
    </ul>
  </nav>
  )
}

export default RoomPaginator
