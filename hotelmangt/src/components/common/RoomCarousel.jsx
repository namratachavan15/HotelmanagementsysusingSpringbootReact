
import React, { useEffect, useState } from 'react'
import { getAllRooms } from '../utils/ApiFunctions'
import { Link } from 'react-router-dom'
import { Container, Carousel, Col, Row } from 'react-bootstrap'
import { FaArrowRight } from 'react-icons/fa'

const RoomCarousel = () => {

    const [rooms, setRooms] = useState([])
    const [errorMessage, setErrorMessage] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    // Booking clicks always navigate to /book-room/:roomId. That route is
    // wrapped in <RequireAuth>, so a guest who isn't logged in is bounced to
    // /login and sent straight back here once they sign in — no need to
    // disable the button up front.
    useEffect(() => {
        setIsLoading(true)

        getAllRooms()
            .then((data) => {
                setRooms(data)
                setIsLoading(false)
            })
            .catch((error) => {
                setErrorMessage(error.message)
                setIsLoading(false)
            })
    }, [])

    if (isLoading) {
        return (
            <Container className='text-center text-muted'>
                Loading rooms…
            </Container>
        )
    }

    if (errorMessage) {
        return (
            <Container className='text-danger'>
                Error: {errorMessage}
            </Container>
        )
    }

    return (
        <Container>

            <div className='d-flex flex-wrap align-items-end justify-content-between mb-4'>

                <div
                    className='section-heading text-start mb-0'
                    style={{ maxWidth: '480px', margin: 0 }}
                >
                    <span className='section-kicker'>
                        Rooms &amp; suites
                    </span>

                    <h2 className='mb-0'>
                        Browse all rooms
                    </h2>
                </div>

                <Link
                    to={"/browse-all-rooms"}
                    className='btn btn-hotel-outline d-flex align-items-center gap-2 mt-3 mt-md-0'
                >
                    View all <FaArrowRight size={12} />
                </Link>

            </div>

            <Carousel indicators={false} interval={null}>

                {
                    [...Array(Math.ceil(rooms.length / 3))].map((_, index) => (

                        <Carousel.Item key={index}>

                            <Row className='g-4 pb-2'>

                                {rooms
                                    .slice(index * 3, index * 3 + 3)
                                    .map((room) => {

                                        return (

                                            <Col
                                                key={room.id}
                                                xs={12}
                                                md={6}
                                                lg={4}
                                            >

                                                <div className='tj-card h-100 d-flex flex-column'>

                                                    {/* Room Image */}
                                                    <Link
                                                        to={`/book-room/${room.id}`}
                                                        className='room-img-wrap'
                                                        style={{ height: '200px' }}
                                                    >
                                                        <img
                                                            src={`data:image/png;base64,${room.photo}`}
                                                            alt={room.roomType || 'Room photo'}
                                                        />
                                                    </Link>

                                                    <div className='p-3 d-flex flex-column flex-grow-1'>

                                                        <div className='d-flex justify-content-between align-items-start mb-2'>

                                                            <h5 className="hotel-color mb-0">
                                                                {room.roomType}
                                                            </h5>

                                                            <p className="room-price mb-0">
                                                                ${room.roomPrice}
                                                                <small>/night</small>
                                                            </p>

                                                        </div>

                                                        {/* Book Button */}
                                                        <Link
                                                            to={`/book-room/${room.id}`}
                                                            className="btn btn-hotel btn-sm mt-auto align-self-start"
                                                        >
                                                            Book now
                                                        </Link>

                                                    </div>

                                                </div>

                                            </Col>

                                        )
                                    })}

                            </Row>

                        </Carousel.Item>

                    ))
                }

            </Carousel>

        </Container>
    )
}

export default RoomCarousel

