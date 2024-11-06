import axios from "axios"



export const api=axios.create(
{
    baseURL:`http://localhost:8089`
   
})

export const getHeader = () => {
    const token = localStorage.getItem("token");
    console.log("token is"+token)
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

export async function addRoom(photo,roomType,roomPrice)
{
    const formData=new FormData()
    formData.append("photo",photo)
    formData.append("roomType",roomType)
    formData.append("roomPrice",roomPrice)
    console.log(photo)

    const response = await api.post("/rooms/add/new-room", formData,{
        ...getHeader(),
        "Content-Type": "multipart/form-data" // Make sure to set the Content-Type header to multipart/form-data
	})
    if(response.status==201)
    {
        return true
    }
    else
    {
        return false
    }
}

export async function getRoomTypes()
{
    try{
        const response=await api.get("/rooms/room-types")
        return response.data
    }catch(error)
    {
        throw new Error("Error fetching room ")
    }
    
}

/*This function gets all room from db */
export async function getAllRooms()
{
    try
    {
        const result=await api.get("/rooms/all-rooms")
       
        return result.data
    }
    catch(error)
    {
        throw new Error("Erro fetching rooms")
    }
}

/*This function deletes a room by Id */
export async function deleteRoom(roomId)
{
    try{
        const result = await api.delete(`/rooms/delete/room/${roomId}`, {
			headers: getHeader()
		})
        return result.data
    }
    catch(error)
    {
        throw new Error(`Error deleting room  ${error.message}`)
    }
}

export async function updateRoom(roomId,roomData)
{
    const formData=new FormData()
    formData.append("roomType",roomData.roomType)
    formData.append("roomPrice",roomData.roomPrice)
    formData.append("photo",roomData.photo)
    const response = await api.put(`/rooms/update/${roomId}`, formData,{
		headers: getHeader()
	})
    return response
}

export async function getRoomById(roomId)
{
    try{
        const result=await api.get(`/rooms/room/${roomId}`)
        console.log(result.data.roomPrice)
        return result.data
    }
    catch(error){
        throw new Error(`Error fetching room ${error.message}`)
    }
}


// export async function bookRoom(roomId,booking)
// {
//     try {
      
//         const response = await api.post(`/bookings/room/${roomId}/booking`, booking)
//         return response.data;
//     } catch (error) {
//         if(error.response && error.response.data)
//         {
//             throw new Error(error.response.data)
//         }
//         else
//         {
//             throw new Error(`error booking room:${error.message}`)
//         }
//     }
// }

export async function bookRoom(roomId, booking) {
	try {
     
        console.log("room id"+roomId)
        console.log("booking"+booking.guestFullName)
		const response = await api.post(`/bookings/room/${roomId}/booking`, booking, {
            headers: getHeader()
        })
		return response.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data)
		} else {
			throw new Error(`Error booking room : ${error.message}`)
		}
	}
}


export async function getAllBookings()
{
    try {
        const result = await api.get("/bookings/all-bookings", {
			headers: getHeader()
		})
        return result.data
    } catch (error) {
        throw new Error(`Error fetching bookings:${error.message}`)
    }
}

export async function getBookingByConfirmationCode(confirmationCode)
{
    try {
        const result = await api.get(`/bookings/confirmation/${confirmationCode}`, {
            headers: getHeader()
        });
        return result.data;
    } catch (error) {
        if (error.response && error.response.data) {
            // Custom error message for no booking found
            if (error.response.status === 404) {
                throw new Error(`No Booking found with booking code: ${confirmationCode}`);
            }
            throw new Error(error.response.data.message);
        } else {
            throw new Error(`Error finding booking: ${error.message}`);
        }
    }
}

export async function cancelBooking(bookingId)
{
    try {
        const result = await api.delete(`/bookings/booking/${bookingId}/delete`, {
            headers: getHeader()
        });
        return result.data;
    } catch (error) {
        throw new Error(`Error cancelling booking with ID ${bookingId}: ${error.message}`);
    }
}

export async function getAvailableRooms(checkInDate,checkOutDate,roomType)
{
    const result=await api.get(`rooms/available-rooms?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&roomType=${roomType}`)

    return result
}

export async function registerUser(registration)
{
    try {
        
        const response=await api.post("/auth/register-user",registration)
        return response.data
    } catch (error) {
        
        if(error.response && error.response.data)
        {
            throw new Error(error.response.data.message)
        }
        else
        {
            throw new Error(`User registertion error:${error.message}`)
        }
    }
}

export async function loginUser(login)
{
try {
    const response=await api.post("/auth/login",login)
    if(response.status>=200 && response.status<300)
    {
        return response.data
    }
    else
    {
        return null
    }
} catch (error) {
 
    console.error(error)
    return null
}
   
}


export async function getUserProfile(userId,token)
{
    try {
        
        const response= await api.get(`users/profile/${userId}`,{
            headers:getHeader()
        })
        return response.data
    } catch (error) {
        throw error
    }
}
export async function deleteUser(userId)
{
    try{
        const response = await api.delete(`/users/delete/${userId}`, {
			headers: getHeader()
		})
		return response.data
    }
    catch(error){
        return error.message
    }
}
/* This is the function to get a single user */
export async function getUser(userId, token) {
    console.log("userId"+userId)
    console.log("token"+token)
	try {
		const response = await api.get(`/users/${userId}`, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		throw error
	}
}

/* This is the function to get user bookings by the user id */
export async function getBookingsByUserId(userId, token) {
	try {
		const response = await api.get(`/bookings/user/${userId}/bookings`, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		console.error("Error fetching bookings:", error.message)
		throw new Error("Failed to fetch bookings")
	}
}