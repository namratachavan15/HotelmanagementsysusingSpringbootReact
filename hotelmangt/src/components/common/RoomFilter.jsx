import React, { useState, useEffect } from 'react'
import { FaFilter } from 'react-icons/fa'

const RoomFilter = ({data, setFilteredData}) => {
    const [filter, setFilter] = useState('');
    const [roomTypes, setRoomTypes] = useState([]);

    useEffect(() => {
        if (Array.isArray(data)) {
            const types = [''];
            data.forEach(room => {
                if (!types.includes(room.roomType)) {
                    types.push(room.roomType);
                }
            });
            setRoomTypes(types);
        }
    }, [data]);

    const handleSelectChange = (e) => {
        const selectedRoomType = e.target.value;
        setFilter(selectedRoomType);
        const filteredRooms = data.filter((room) => room.roomType.toLowerCase().includes(selectedRoomType.toLowerCase()));
        setFilteredData(filteredRooms);
    };

    const clearFilter = () => {
        setFilter('');
        setFilteredData(data);
    };
    return (
        <div className='room-filter-bar'>
            <FaFilter className='filter-icon' />
            <span className='text-muted small'>Filter by type</span>
            <select className='form-select' style={{maxWidth:'240px'}} value={filter} onChange={handleSelectChange}>
                <option value={''}>All room types</option>
                {roomTypes.filter(t => t !== '').map((type, index) => (
                    <option key={index} value={String(type)}>{String(type)}</option>
                ))}
            </select>
            <button className="btn btn-hotel-outline btn-sm" type='button' onClick={clearFilter}>Clear</button>
        </div>
    );
}

export default RoomFilter
