import React, { useState } from 'react'


import {addRoom} from "../utils/ApiFunctions"
import RoomTYpeSelector from '../common/RoomTYpeSelector'
import { Link } from 'react-router-dom'

const AddRoom = () => {
  const [newRoom,setNewRoom]=useState({
    photo:null,
    roomType:"",
    roomPrice:""
  })
  const [imagePreview,setImagePreview]=useState("")

  const [successMessage,setSuccessMessage]=useState("")
  const[errorMessage,setErrorMessage]=useState("")
  
  const handleRoomInputChange=(e)=>{

    const name=e.target.name
    let value=e.target.value

    if(name=="roomPrice")
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
    setNewRoom({...newRoom,[name]:value})
  }

  const handleImageChange=(e)=>{

    const selectedImage = e.target.files[0];
    // Update newRoom with the selected image
    setNewRoom({ ...newRoom, photo: selectedImage });
    console.log(newRoom.photo)
    setImagePreview(URL.createObjectURL(selectedImage));
  }

 
  const handleSubmit=async(e)=>{
    e.preventDefault()
    try{

      const success=await addRoom(newRoom.photo,newRoom.roomType,newRoom.roomPrice)
      if(success!=undefined)
      {
        setSuccessMessage("A new room was added to database!")
        setNewRoom({photo:null,roomType:"",roomPrice:""})
        setImagePreview("")
        setErrorMessage("")
      }else{
        setErrorMessage("Error adding room")
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
  return (
    <div>
      <section className='container  mb-5' style={{height:'530px'}}>
        <div className='row justify-content-center'>
          <div className='col-md-8 col-lg-6'>

            <h2 className='mt-2 mb-2'>Add New Room</h2>
            {
              successMessage &&(<div className='alert alert-success fade show'>{successMessage}</div>)
            }
             {
              errorMessage &&(<div className='alert alert-danger fade show'>{errorMessage}</div>)
            }
            <form onSubmit={handleSubmit} encType="multipart/form-data">
            <div className='mb-3'>
            <label  htmlFor="roomType" className='form-label'>Room Type</label>
            <div>

              <RoomTYpeSelector handleRoomInputChange={handleRoomInputChange} newRoom={newRoom}/>
            </div>
            </div>

            <div className='mb-3'>
            <label  htmlFor="roomPrice" className='form-label'>Room Price</label>
            <input className='form-control' required id="roomPrice" name="roomPrice" type="number" value={newRoom.roomPrice} onChange={handleRoomInputChange}>
            </input>
            </div>

            <div className='mb-3'>
            <label  htmlFor="photo" className='form-label'>Room Photo</label>
            
            <input id="photo" name="photo" type="file" className='form-control' onChange={handleImageChange}/>
            
         {imagePreview && (
          <img src={imagePreview}
          alt="Preview Room Photo"
          style={{maxWidth:"200px",maxHeight:"200px"}}
          className='mb-3'/>
         )}
         
            </div>
            <div className='d-grid d-md-flex mt-2'>
              <Link to={"/existing-room"} className="btn btn-outline-info" style={{marginRight:"3px"}}>
                Back
              </Link>
              <button className='btn btn-outline-primary ml-5'>Save Room</button>
            </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AddRoom
