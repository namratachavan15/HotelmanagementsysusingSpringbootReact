import React, { useState,useEffect } from 'react'
import { getRoomById, updateRoom } from '../utils/ApiFunctions'
import { Link, useParams } from 'react-router-dom'

const EditRoom = () => {
    
    const[room,setRoom]=useState({
        photo:null,
        roomType:"",
        roomPrice:""
    })

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
        setRoom({...room,[name]:value})
    }

    useEffect(() => {
        const fetchRoom=async()=>{
          try{
              const roomData=await getRoomById(roomId)
             
              setRoom(roomData)
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
        try{
            const response=await updateRoom(roomId,room)
            if(response.status===200)
            {
                setSuccessMessage("Room Updated successfully!")
                const updateRoomData=await getRoomById(roomId)
                setRoom(updateRoomData)
                setImagePreview(updateRoomData.photo)
                setErrorMessage("")
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
    }
  return (
    <div>
     <section className='container mt-5 mb-5'>
        <div className='row justify-content-center'>
        <div className='col-md-8 col-lg-6'>
        <h2 className='mt-5 mb-2'>Edit Room</h2>
        {
            successMessage &&(<div className='alert alert-success fade show'>{successMessage}</div>)
        }
        {
            errorMessage && (<div className='alert alert-danger fade show'>{errorMessage}</div>)
        }
        <form onSubmit={handlesubmit}>
        <div class='mb-3'>
            <label htmlFor='roomType' className='form-label'>Room Type</label>
            <input className='form-control' required id='roomType' name='roomType' type="text" value={room.roomType} onChange={handleInputChange}>
                </input>
        </div>
        <div class='mb-3'>
            <label htmlFor='roomPrice' className='form-label'>Room Price</label>
            <input className='form-control' required id='roomPrice' name='roomPrice' type="number" value={room.roomPrice} onChange={handleInputChange}>
                </input>
        </div>

        <div className='mb-3'>
        <label htmlFor='photo' className='form-label'>Room Photo</label>
        <input id="photo" name="photo" type="file" className='form-control' onChange={handleImageChange}/>
        
        {imagePreview && (
            <img src={imagePreview}
            alt="Preview Room Photo"
            style={{maxWidth:"400px",maxHeight:"400px"}}
            className='mb-3'
            />
        )}

       </div>
            <div className='d-grid d-md-flex mt-2'>
                <Link to={"/existing-room"} className="btn btn-outline-info ml-5" style={{marginRight:"10px"}}>back</Link>
              <button type="submit" className='btn btn-outline-primary ml-5'>Edit Room</button>
            </div>

        </form>
        </div>
        </div>

     </section>
    </div>
  )
}

export default EditRoom
