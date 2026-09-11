import React, { useState } from 'react'
import {Row,Button} from 'react-bootstrap'
import RoomCard from '../room/RoomCard'
import RoomPaginator from './RoomPaginator'

const RoomSearchResult = ({ results, checkInDate, checkOutDate, onClearSearch }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const resultPerPage = 3;
  const totalResults = Array.isArray(results) ? results.length : 0;
  const totalPages = Math.ceil(totalResults / resultPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const startIndex = (currentPage - 1) * resultPerPage;
  const endIndex = startIndex + resultPerPage;
  const paginatedResult = results.slice(startIndex, endIndex);

  return (
    <>
      {results.length > 0 ? (
        <>
          <h5 className="mt-5 mb-3">Search results</h5>
          <Row className='g-4'>
            {paginatedResult.map((room) => (
              <RoomCard key={room.id} room={room} checkInDate={checkInDate} checkOutDate={checkOutDate} />
            ))}
          </Row>

          <div className='d-flex flex-wrap align-items-center justify-content-between mt-3'>
            {totalResults > resultPerPage && (
              <RoomPaginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
            <Button className="btn btn-hotel-outline ms-auto" onClick={() => {
              onClearSearch();
              setCurrentPage(1);
            }}>
              Clear search
            </Button>
          </div>
        </>
      ) : (
        <p>No results found</p>
      )}
    </>
  );
};
export default RoomSearchResult
