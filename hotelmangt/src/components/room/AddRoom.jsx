import React, { useState } from 'react'

import {addRoom} from "../utils/ApiFunctions"
import RoomTYpeSelector from '../common/RoomTYpeSelector'
import { Link } from 'react-router-dom'
import { FaPlus, FaArrowLeft, FaLayerGroup } from 'react-icons/fa'

const AddRoom = () => {
  const [newRoom,setNewRoom]=useState({
    photo:null,
    roomType:"",
    roomPrice:"",
    totalRooms:1
  })
  const [imagePreview,setImagePreview]=useState("")

  const [successMessage,setSuccessMessage]=useState("")
  const[errorMessage,setErrorMessage]=useState("")
  const [isSubmitting,setIsSubmitting]=useState(false)

  const handleRoomInputChange=(e)=>{
    const name=e.target.name
    let value=e.target.value

    if(name==="roomPrice")
    {
      if(!isNaN(value))
      {
        value=parseInt(value)
      }
      else
      {
        value=""
      }
    }

    if(name==="totalRooms")
    {
      // Keep it a clean positive integer, at least 1.
      const parsed=parseInt(value)
      value=isNaN(parsed) || parsed<1 ? 1 : parsed
    }

    setNewRoom({...newRoom,[name]:value})
  }

  const handleImageChange=(e)=>{
    const selectedImage = e.target.files[0];
    setNewRoom({ ...newRoom, photo: selectedImage });
    setImagePreview(URL.createObjectURL(selectedImage));
  }

  const handleSubmit=async(e)=>{
    e.preventDefault()
    setIsSubmitting(true)

    if(!newRoom.roomType){
      setErrorMessage("Please select or enter a room type")
      setIsSubmitting(false)
      return
    }
    if(!newRoom.roomPrice || newRoom.roomPrice<=0){
      setErrorMessage("Room price must be greater than 0")
      setIsSubmitting(false)
      return
    }
    if(!newRoom.totalRooms || newRoom.totalRooms<1){
      setErrorMessage("Total rooms must be at least 1")
      setIsSubmitting(false)
      return
    }

    // ONE inventory record is created for this room type, with totalRooms
    // set to however many physical rooms the hotel has of this type.
    // Availability for bookings is calculated from this count and the sum
    // of numberOfRooms on overlapping bookings — no duplicate rows.
    try{
      const success = await addRoom(newRoom.photo, newRoom.roomType, newRoom.roomPrice, newRoom.totalRooms)

      if(success){
        setSuccessMessage(`${newRoom.roomType} was added with ${newRoom.totalRooms} room${newRoom.totalRooms===1?"":"s"} in inventory!`)
        setNewRoom({photo:null,roomType:"",roomPrice:"",totalRooms:1})
        setImagePreview("")
        setErrorMessage("")
      } else {
        setErrorMessage("Error adding room")
      }
    }catch(error)
    {
      setErrorMessage(error.message)
    }

    setIsSubmitting(false)
    setTimeout(()=>{
      setSuccessMessage("")
      setErrorMessage("")
    },3000)
  }
  return (
    <div>
      <section className='container page-section--tight'>
        <div className='row justify-content-center'>
          <div className='col-md-8 col-lg-6'>
            <div className='booking-card'>
              <h4 className='card-title d-flex align-items-center gap-2 mb-4'><FaPlus className='hotel-color'/> Add new room</h4>
              {
                successMessage &&(<div className='alert alert-success fade show'>{successMessage}</div>)
              }
               {
                errorMessage &&(<div className='alert alert-danger fade show'>{errorMessage}</div>)
              }
              <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className='mb-3'>
              <label  htmlFor="roomType" className='form-label'>Room type</label>
              <div>
                <RoomTYpeSelector handleRoomInputChange={handleRoomInputChange} newRoom={newRoom}/>
              </div>
              </div>

              <div className='mb-3'>
              <label  htmlFor="roomPrice" className='form-label'>Room price</label>
              <input className='form-control' required id="roomPrice" name="roomPrice" type="number" min={1} value={newRoom.roomPrice} onChange={handleRoomInputChange}>
              </input>
              </div>

              <div className='mb-3'>
              <label htmlFor="totalRooms" className='form-label d-flex align-items-center gap-2'>
                <FaLayerGroup size={12} className='hotel-color'/> Total rooms
              </label>
              <input className='form-control' required id="totalRooms" name="totalRooms" type="number" min={1} value={newRoom.totalRooms} onChange={handleRoomInputChange}>
              </input>
              <small className='text-muted d-block mt-1' style={{fontSize:'0.8rem'}}>
                How many physical rooms of this type the hotel has. This creates a single inventory record — availability for each booking is worked out automatically from this count.
              </small>
              </div>

              <div className='mb-3'>
              <label  htmlFor="photo" className='form-label'>Room photo</label>
              <input id="photo" name="photo" type="file" className='form-control' onChange={handleImageChange}/>

           {imagePreview && (
            <img src={imagePreview}
            alt="Preview of the room"
            style={{maxWidth:"100%",maxHeight:"260px", objectFit:'cover', borderRadius:'12px'}}
            className='mt-3'/>
           )}
              </div>
              <div className='d-flex gap-2 mt-3'>
                <Link to={"/existing-room"} className="btn btn-hotel-outline d-flex align-items-center gap-2">
                  <FaArrowLeft size={12}/> Back
                </Link>
                <button className='btn btn-hotel' disabled={isSubmitting}>
                  {isSubmitting ? "Saving…" : "Save room"}
                </button>
              </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AddRoom
