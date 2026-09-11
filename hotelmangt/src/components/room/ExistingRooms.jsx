import React, { useEffect, useState } from 'react'
import RoomFilter from '../common/RoomFilter'
import {Col,Row} from 'react-bootstrap'
import RoomPaginator from '../common/RoomPaginator'
import {deleteRoom, getAllRooms } from '../utils/ApiFunctions'
import {FaEdit, FaTrashAlt,FaPlus} from "react-icons/fa"

import {Link} from 'react-router-dom'

const ExistingRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [roomsPerPage] = useState(8);
    const [isLoading, setIsLoading] = useState(false);
    const [filteredRooms, setFilteredRooms] = useState([]);
    const [selectedRoomType, setSelectedRoomType] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const[successMessage,setSuccessMessage]=useState('');

    useEffect(() => {
        fetchRooms(true);

        // Someone can book a room from another tab/device at any time, so the
        // "Total rooms" / "Available" / "Booked" columns here go stale the
        // moment that happens -- there's no need to make the admin refresh
        // the page (or go re-check the booking UI) to see current numbers.
        // Poll quietly in the background, and also refetch right away
        // whenever this tab/window becomes active again.
        const pollId = setInterval(() => fetchRooms(false), 5000);

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                fetchRooms(false);
            }
        };
        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
            clearInterval(pollId);
            document.removeEventListener("visibilitychange", handleVisibility);
        };
    }, []);

    const fetchRooms = async (showLoading) => {
        if (showLoading) {
            setIsLoading(true);
        }
        try {
            const result = await getAllRooms();
            if (Array.isArray(result)) {
                setRooms(result);
                setFilteredRooms(result);
            } else {
                throw new Error("Data received is not in the expected format");
            }
            if (showLoading) {
                setIsLoading(false);
            }
        } catch (error) {
            setErrorMessage(error.message);
            if (showLoading) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (selectedRoomType === '') {
            setFilteredRooms(rooms);
        } else {
            const filtered = rooms.filter((room) => room.roomType === selectedRoomType);
            setFilteredRooms(filtered);
        }
        setCurrentPage(1);
    }, [rooms, selectedRoomType]);

    const handleDelete=async(roomId)=>{
        try{
            const result=await deleteRoom(roomId)
            if(result==="")
            {
                setSuccessMessage(`Room No ${roomId} was deleted`)
                fetchRooms()
            }else
            {
                console.error(`Error deleting room:${result.message}`)
            }
        }catch(error)
        {
            setErrorMessage(error.message)
        }
        setTimeout(()=>{
            setSuccessMessage("")
            setErrorMessage("")
        },3000)
    }
    const handlePaginationClick = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const calculateTotalPages = (filteredRooms, roomsPerPage) => {
        return Math.ceil(filteredRooms.length / roomsPerPage);
    };

    const indexOfLastRoom = currentPage * roomsPerPage;
    const indexOfFirstRoom = indexOfLastRoom - roomsPerPage;
    const currentRooms = filteredRooms.slice(indexOfFirstRoom, indexOfLastRoom);

    return (
        <>
            <style>{`
                .existing-rooms-card {
                    background: var(--color-white);
                    border-radius: var(--radius-md);
                    box-shadow: var(--shadow-soft);
                    border: 1px solid var(--color-line);
                    overflow: hidden;
                }
                .existing-rooms-card table.table-hotel thead th {
                    background: var(--color-ink);
                    color: var(--color-cream);
                    font-family: var(--font-display);
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    font-size: 0.78rem;
                    border: none;
                    padding: 0.9rem 0.75rem;
                }
                .existing-rooms-card table.table-hotel tbody tr {
                    transition: background-color 0.2s var(--ease);
                }
                .existing-rooms-card table.table-hotel tbody tr:nth-child(even) {
                    background-color: var(--color-cream);
                }
                .existing-rooms-card table.table-hotel tbody tr:hover {
                    background-color: var(--color-sage);
                }
                .existing-rooms-card table.table-hotel td {
                    padding: 0.85rem 0.75rem;
                    border-color: var(--color-line);
                    color: var(--color-text);
                }
                .room-type-pill {
                    display: inline-block;
                    padding: 0.25rem 0.7rem;
                    border-radius: 999px;
                    background: var(--color-cream-deep);
                    color: var(--color-ink);
                    font-size: 0.82rem;
                    font-weight: 600;
                }
                .count-badge {
                    display: inline-block;
                    min-width: 2.2rem;
                    padding: 0.25rem 0.6rem;
                    border-radius: 999px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }
                .count-badge--available {
                    background: rgba(201, 162, 39, 0.16);
                    color: var(--color-gold);
                    border: 1px solid var(--color-gold-soft);
                }
                .count-badge--available.is-zero {
                    background: rgba(122, 46, 42, 0.12);
                    color: var(--color-maroon);
                    border-color: var(--color-maroon);
                }
                .count-badge--booked {
                    background: rgba(122, 46, 42, 0.1);
                    color: var(--color-maroon-dark);
                }
            `}</style>
            {isLoading ? (
                <p className='container text-muted page-section--tight'>Loading existing rooms…</p>
            ) : (
                <>
                    <section className='page-section--tight container'>
                        <div className='d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2'>
                            <h2 className='mb-0' style={{fontFamily:'var(--font-display)', color:'var(--color-ink)'}}>Existing rooms</h2>
                            <Link to={"/add-room"} className="btn btn-hotel d-flex align-items-center gap-2">
                                <FaPlus size={12}/> Add new room
                            </Link>
                        </div>

                        {successMessage && <div className='alert alert-success'>{successMessage}</div>}
                        {errorMessage && <div className='alert alert-danger'>{errorMessage}</div>}

                        <Row className='mb-3'>
                            <Col md={8} className='mb-3 mb-md-0'>
                                <RoomFilter data={rooms} setFilteredData={setFilteredRooms} />
                            </Col>
                        </Row>
                        <div className='existing-rooms-card'>
                        <div className='table-responsive mb-0'>
                        <table className='table table-hotel table-hover align-middle mb-0'>
                            <thead>
                                <tr className='text-center'>
                                    <th>ID</th>
                                    <th>Room type</th>
                                    <th>Room price</th>
                                    <th>Total rooms</th>
                                    <th>Available</th>
                                    <th>Booked</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRooms.map((room) => (
                                    <tr key={room.id} className='text-center'>
                                        <td className='text-muted'>{room.id}</td>
                                        <td><span className='room-type-pill'>{room.roomType}</span></td>
                                        <td className='room-price' style={{color:'var(--color-maroon)', fontWeight:600}}>${room.roomPrice}</td>
                                        <td>{room.totalRooms}</td>
                                        <td>
                                            <span className={`count-badge count-badge--available${room.availableRooms === 0 ? ' is-zero' : ''}`}>
                                                {room.availableRooms}
                                            </span>
                                        </td>
                                        <td>
                                            <span className='count-badge count-badge--booked'>{room.bookedRooms}</span>
                                        </td>
                                        <td>
                                            <div className='d-flex justify-content-center gap-2'>
                                                <Link to={`/edit-room/${room.id}`} className='btn btn-hotel-outline btn-sm d-flex align-items-center gap-1'>
                                                    <FaEdit/> Edit
                                                </Link>
                                                <button className='btn btn-outline-danger btn-sm d-flex align-items-center gap-1'
                                                onClick={()=>handleDelete(room.id)}>
                                                <FaTrashAlt/> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        </div>
                        <div className='d-flex justify-content-center mt-3'>
                        <RoomPaginator
                            currentPage={currentPage}
                            totalPages={calculateTotalPages(filteredRooms, roomsPerPage)}
                            onPageChange={handlePaginationClick}
                        />
                        </div>
                    </section>
                </>
            )}
        </>
    );}

export default ExistingRooms
