import React, { useEffect, useState } from 'react'
import RoomFilter from '../common/RoomFilter'
import {Col,Row} from 'react-bootstrap'
import RoomPaginator from '../common/RoomPaginator'
import {deleteRoom, getAllRooms } from '../utils/ApiFunctions'
import {FaEdit, FaEye, FaPlug, FaTrashAlt,FaPlus} from "react-icons/fa"

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
        fetchRooms();
    }, []);

    const fetchRooms = async () => {
        setIsLoading(true);
        try {
            const result = await getAllRooms();
            if (Array.isArray(result)) {
                setRooms(result);
                setFilteredRooms(result); // Ensure filteredRooms is initialized with rooms
            } else {
                throw new Error("Data received is not in the expected format");
            }
            setIsLoading(false);
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    useEffect(() => {
        if (selectedRoomType === '') {
            setFilteredRooms(rooms); // Initially setting filteredRooms to all rooms
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
                setSuccessMessage(`Room No ${roomId} was delete`)
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
            {isLoading ? (
                <p>Loading existing rooms</p>
            ) : (
                <>
                    <section className='mt-5 mb-5 container' style={{height:'480px'}}>
                        <div className='d-flex justify-content-between mb-3 mt-5'>
                            <h2>Existing rooms</h2>                 
                        </div>
                        <Row>
                        <Col md={6} className='mb-3 md-mb-0'>
                            <RoomFilter data={rooms} setFilteredData={setFilteredRooms} />
                        </Col>
                           <Col md={6} className='d-flex justify-content-end'>
                           <Link to={"/add-room"}>
                                <FaPlus/> Add New Room
                            </Link>
                           </Col> 
                        </Row>
                        <table className='table table-bordered table-hover'>
                            <thead>
                                <tr className='text-center'>
                                    <th>ID</th>
                                    <th>Room Type</th>
                                    <th>Room Price</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentRooms.map((room) => (
                                    <tr key={room.id} className='text-center'>
                                        <td>{room.id}</td>
                                        <td>{room.roomType}</td>
                                        <td>{room.roomPrice}</td>
                                        <td className='gap-2'>

                                            <Link to={`/edit-room/${room.id}`}>
                                                <span className='btn btn-info btn-sm'>
                                                    <FaEye/>
                                                </span>
                                                <span className='btn btn-warning btn-sm'> 
                                                <FaEdit/>
                                                </span>
                                            </Link>
                                            
                                            <button className='btn btn-danger btn-sm'
                                            onClick={()=>handleDelete(room.id)}>
                                            <FaTrashAlt/>    
                                               </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <RoomPaginator
                            currentPage={currentPage}
                            totalPages={calculateTotalPages(filteredRooms, roomsPerPage)}
                            onPageChange={handlePaginationClick}
                        />
                    </section>
                </>
            )}
        </>
    );}

export default ExistingRooms
