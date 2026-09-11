import React, { useState,useEffect } from 'react'
import { getRoomById, updateRoom } from '../utils/ApiFunctions'
import { Link, useParams } from 'react-router-dom'
import { FaEdit, FaArrowLeft, FaLayerGroup } from 'react-icons/fa'

const EditRoom = () => {

    const[room,setRoom]=useState({
        photo:null,
        roomType:"",
        roomPrice:"",
        totalRooms:1
    })

    const[availableRooms,setAvailableRooms]=useState(null)
    const[successMessage,setSuccessMessage]=useState("")
    const[errorMessage,setErrorMessage]=useState("")
    const[imagePreview,setImagePreview]=useState("")

    const {roomId}=useParams()

    const handleImageChange=(e)=>{
        const selectedImage=e.target.files[0]
        setRoom({...room,photo:selectedImage})
        setImagePreview(URL.createObjectURL(selectedImage))
    }

    const handleInputChange=(e)=>{
        const name=e.target.name
        let value=e.target.value

        if(name==="totalRooms")
        {
            const parsed=parseInt(value)
            value=isNaN(parsed) || parsed<1 ? 1 : parsed
        }

        setRoom({...room,[name]:value})
    }

    useEffect(() => {
        const fetchRoom=async()=>{
          try{
              const roomData=await getRoomById(roomId)
              setRoom(roomData)
              setAvailableRooms(roomData.availableRooms)
              if (roomData.photo) {
                setImagePreview(`data:image/jpeg;base64,${roomData.photo}`);
            }
          }
          catch(error)
          {
            console.error(error)
          }
        }
        fetchRoom()
      }, [roomId])

    const handlesubmit=async(e)=>{
        e.preventDefault()
        setErrorMessage("")
        try{
            const response=await updateRoom(roomId,room)
            if(response.status===200)
            {
                setSuccessMessage("Room updated successfully!")
                const updateRoomData=await getRoomById(roomId)
                setRoom(updateRoomData)
                setAvailableRooms(updateRoomData.availableRooms)
                setImagePreview(updateRoomData.photo ? `data:image/jpeg;base64,${updateRoomData.photo}` : "")
            }
            else{
                setErrorMessage("Error updating room")
            }
        }
        catch(error)
        {
            console.error(error)
            setErrorMessage(error.message)
        }
        setTimeout(()=>{
            setSuccessMessage("")
        },3000)
    }
  return (
    <div>
     <section className='container page-section--tight'>
        <div className='row justify-content-center'>
        <div className='col-md-8 col-lg-6'>
        <div className='booking-card'>
        <h4 className='card-title d-flex align-items-center gap-2 mb-4'><FaEdit className='hotel-color'/> Edit room</h4>
        {
            successMessage &&(<div className='alert alert-success fade show'>{successMessage}</div>)
        }
        {
            errorMessage && (<div className='alert alert-danger fade show'>{errorMessage}</div>)
        }
        <form onSubmit={handlesubmit}>
        <div className='mb-3'>
            <label htmlFor='roomType' className='form-label'>Room type</label>
            <input className='form-control' required id='roomType' name='roomType' type="text" value={room.roomType} onChange={handleInputChange}>
                </input>
        </div>
        <div className='mb-3'>
            <label htmlFor='roomPrice' className='form-label'>Room price</label>
            <input className='form-control' required id='roomPrice' name='roomPrice' type="number" min={1} value={room.roomPrice} onChange={handleInputChange}>
                </input>
        </div>

        <div className='mb-3'>
            <label htmlFor='totalRooms' className='form-label d-flex align-items-center gap-2'>
                <FaLayerGroup size={12} className='hotel-color'/> Total rooms
            </label>
            <input className='form-control' required id='totalRooms' name='totalRooms' type="number" min={1} value={room.totalRooms} onChange={handleInputChange}>
                </input>
            {typeof availableRooms === "number" && (
                <small className='text-muted d-block mt-1' style={{fontSize:'0.8rem'}}>
                    Currently {availableRooms} of {room.totalRooms} rooms are available today. You can't reduce total rooms below what's already booked for upcoming dates.
                </small>
            )}
        </div>

        <div className='mb-3'>
        <label htmlFor='photo' className='form-label'>Room photo</label>
        <input id="photo" name="photo" type="file" className='form-control' onChange={handleImageChange}/>

        {imagePreview && (
            <img src={imagePreview}
            alt="Preview of the room"
            style={{maxWidth:"100%",maxHeight:"260px", objectFit:'cover', borderRadius:'12px'}}
            className='mt-3'
            />
        )}
       </div>
            <div className='d-flex gap-2 mt-3'>
                <Link to={"/existing-room"} className="btn btn-hotel-outline d-flex align-items-center gap-2">
                    <FaArrowLeft size={12}/> Back
                </Link>
              <button type="submit" className='btn btn-hotel'>Save changes</button>
            </div>
        </form>
        </div>
        </div>
        </div>
     </section>
    </div>
  )
}

export default EditRoom
