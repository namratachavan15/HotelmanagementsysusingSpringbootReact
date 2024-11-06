import React, { useState } from 'react'
import {Row,Button} from 'react-bootstrap'
import RoomCard from '../room/RoomCard'
import RoomPaginator from './RoomPaginator'

const RoomSearchResult = ({ results, onClearSearch }) => {
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
          <h5 className="text-center mt-5">Search Result</h5>
          <Row>
            {paginatedResult.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </Row>

          <Row>
            {totalResults > resultPerPage && (
              <RoomPaginator
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
            <Button className="btn btn-sm btn-hotel" onClick={() => {
              onClearSearch();
              setCurrentPage(1);  // Reset to the first page
            }}>
              Clear Search
            </Button>
          </Row>
        </>
      ) : (
        <p>No results found</p>
      )}
    </>
  );
};
export default RoomSearchResult
