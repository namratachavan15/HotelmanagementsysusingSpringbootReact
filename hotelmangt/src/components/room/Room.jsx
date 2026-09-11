import React, { useEffect, useState } from 'react'
import { getAllRooms, getAllRoomsAvailability } from '../utils/ApiFunctions'

import { Container, Row, Col, Form } from 'react-bootstrap'
import moment from 'moment'
import RoomFilter from '../common/RoomFilter'
import RoomPaginator from '../common/RoomPaginator'
import RoomCard from './RoomCard'

const Room = () => {
    const [data, setData] = useState([])
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [roomsPerPage] = useState(6)
    const [filteredData, setFilteredData] = useState([{ id: "" }])
    // Dates the guest wants to check availability for. Until both are set,
    // "available" would only be true for some arbitrary date (today), which
    // is misleading -- so rooms are shown with their fixed total inventory
    // count instead (see RoomCard).
    const [checkInDate, setCheckInDate] = useState("")
    const [checkOutDate, setCheckOutDate] = useState("")
    const [dateError, setDateError] = useState("")

    useEffect(() => {
        setIsLoading(true)
        getAllRooms().then((data) => {
            setData(data)
            setFilteredData(data)
            setIsLoading(false)
        }).catch((error) => {
            setError(error.message)
            setIsLoading(false)
        })
    }, [])

    // Whenever both dates are chosen (and valid), re-fetch with date-specific
    // availability instead of the plain inventory list -- and clear back to
    // the plain list if the guest empties the dates again.
    useEffect(() => {
        if (!checkInDate || !checkOutDate) {
            setDateError("")
            return;
        }
        if (!moment(checkOutDate).isAfter(moment(checkInDate))) {
            setDateError("Check-out date must be after check-in date");
            return;
        }
        setDateError("");
        setIsLoading(true)
        getAllRoomsAvailability(checkInDate, checkOutDate).then((result) => {
            setData(result)
            setFilteredData(result)
            setIsLoading(false)
        }).catch((error) => {
            setError(error.message)
            setIsLoading(false)
        })
    }, [checkInDate, checkOutDate])

    if (isLoading) {
        return <Container className='text-center text-muted'>Loading rooms…</Container>
    }

    if (error) {
        return <Container className='text-danger'>Error: {error}</Container>
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
    }

    const totalPages = Math.ceil(filteredData.length / roomsPerPage)

    const hasDates = Boolean(checkInDate && checkOutDate && !dateError)

    const renderRooms = () => {
        const startIndex = (currentPage - 1) * roomsPerPage
        const endIndex = startIndex + roomsPerPage
        return filteredData.slice(startIndex, endIndex).map((room) => (
            <RoomCard
                key={room.id}
                room={room}
                checkInDate={hasDates ? checkInDate : undefined}
                checkOutDate={hasDates ? checkOutDate : undefined}
            />
        ))
    }

    return (
        <Container>
            <div className='section-heading' style={{marginBottom: '2rem'}}>
                <span className='section-kicker'>Every room, every rate</span>
                <h2>Browse all rooms</h2>
                <p>Filter by room type to find the stay that fits you best.</p>
            </div>

            <Row className='mb-4 g-3'>
                <Col xs={12} md={4}>
                    <Form.Group controlId='browseCheckInDate'>
                        <Form.Label className='small mb-1'>Check-in date</Form.Label>
                        <Form.Control
                            type='date'
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col xs={12} md={4}>
                    <Form.Group controlId='browseCheckOutDate'>
                        <Form.Label className='small mb-1'>Check-out date</Form.Label>
                        <Form.Control
                            type='date'
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                        />
                    </Form.Group>
                </Col>
            </Row>
            {dateError && <p className='text-danger mb-3'>{dateError}</p>}
            {!hasDates && !dateError && (
                <p className='text-muted mb-3' style={{fontSize:'0.85rem'}}>
                    Select your dates above to see how many rooms are actually available for your stay.
                </p>
            )}

            <Row className='mb-4'>
                <Col md={8} className="mb-3 mb-md-0">
                    <RoomFilter data={data} setFilteredData={setFilteredData} />
                </Col>
                <Col md={4} className="d-flex align-items-center justify-content-md-end">
                    <RoomPaginator
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </Col>
            </Row>
            <Row className='g-4'>
                {renderRooms()}
            </Row>
            {totalPages > 1 && (
                <Row className='mt-4'>
                    <Col className="d-flex align-items-center justify-content-center">
                        <RoomPaginator
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </Col>
                </Row>
            )}
        </Container>
    )
}

export default Room

