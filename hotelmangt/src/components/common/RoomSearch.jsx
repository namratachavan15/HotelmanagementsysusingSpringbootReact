import React, { useState } from 'react'

import moment from "moment";
import { getAvailableRooms } from '../utils/ApiFunctions';
import {Container,Row,Col,Button,Form} from 'react-bootstrap'
import { FaSearch } from 'react-icons/fa'

import RoomTYpeSelector from './RoomTYpeSelector'
import RoomSearchResult from './RoomSearchResult';

const RoomSearch = () => {
    const [searchQuery, setSearchQuery] = useState({
        checkInDate: "",
        checkOutDate: "",
        roomType: ""
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();

        const checkIn = moment(searchQuery.checkInDate);
        const checkOut = moment(searchQuery.checkOutDate);

        if (!checkIn.isValid() || !checkOut.isValid()) {
            setErrorMessage("Please enter a valid date range");
            return;
        }

        if (!checkOut.isSameOrAfter(checkIn)) {
            setErrorMessage("Check-In Date must come before Check-Out Date");
            return;
        }

        setIsLoading(true);
        setHasSearched(true);

        getAvailableRooms(searchQuery.checkInDate, searchQuery.checkOutDate, searchQuery.roomType)
            .then((response) => {
                setAvailableRooms(response.data);
            })
            .catch((error) => {
                console.error(error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchQuery((prevSearchQuery) => ({
            ...prevSearchQuery,
            [name]: value
        }));

        const checkIn = moment(searchQuery.checkInDate);
        const checkOut = moment(searchQuery.checkOutDate);

        if (checkIn.isValid() && checkOut.isValid()) {
            setErrorMessage("");
        }

    };

    const clearSearch = () => {
        setSearchQuery({
            checkInDate: "",
            checkOutDate: "",
            roomType: ""
        });
        setAvailableRooms([]);
        setHasSearched(false);
    };

    return (
        <div className='search-widget-wrap'>
            <Container className='search-widget'>
                <Form onSubmit={handleSearch}>
                    <Row className='align-items-end g-3'>
                        <Col xs={12} md={3}>
                            <Form.Group controlId='checkInDate'>
                                <Form.Label>Check-in date</Form.Label>
                                <Form.Control
                                    type='date'
                                    name='checkInDate'
                                    value={searchQuery.checkInDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={3}>
                            <Form.Group controlId='checkOutDate'>
                                <Form.Label>Check-out date</Form.Label>
                                <Form.Control
                                    type='date'
                                    name='checkOutDate'
                                    value={searchQuery.checkOutDate}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={4}>
                            <Form.Group>
                                <Form.Label>Room type</Form.Label>
                                <RoomTYpeSelector handleRoomInputChange={handleInputChange} newRoom={searchQuery} />
                            </Form.Group>
                        </Col>
                        <Col xs={12} md={2}>
                            <Button className="btn btn-hotel w-100 d-flex align-items-center justify-content-center gap-2" type='submit'>
                                <FaSearch size={13}/> Search
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {errorMessage && <p className='text-danger mt-3 mb-0'>{errorMessage}</p>}

                {isLoading ? (
                    <p className='mt-4 mb-0 text-muted'>Finding available rooms…</p>
                ) : hasSearched && availableRooms.length ? (
                    <RoomSearchResult results={availableRooms} onClearSearch={clearSearch} />
                ) : hasSearched ? (
                    <p className='mt-4 mb-0 text-muted'>No rooms available for the selected dates and room type.</p>
                ) : null}
            </Container>
        </div>
    );
};

export default RoomSearch;
