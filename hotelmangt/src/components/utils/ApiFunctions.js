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

export async function addRoom(photo,roomType,roomPrice,totalRooms)
{
    const formData=new FormData()
    formData.append("photo",photo)
    formData.append("roomType",roomType)
    formData.append("roomPrice",roomPrice)
    formData.append("totalRooms",totalRooms)

    try{
        const response = await api.post("/rooms/add/new-room", formData,{
            ...getHeader(),
            "Content-Type": "multipart/form-data" // Make sure to set the Content-Type header to multipart/form-data
        })
        return response.status===201
    }
    catch(error)
    {
        if(error.response && error.response.data)
        {
            throw new Error(error.response.data)
        }
        throw new Error(`Error adding room: ${error.message}`)
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

/*This function gets all rooms, with bookedRooms/availableRooms calculated for
a specific check-in/check-out date range instead of "as of today" -- used by
Browse Rooms once the guest has picked dates. */
export async function getAllRoomsAvailability(checkInDate, checkOutDate)
{
    try
    {
        const result = await api.get("/rooms/all-rooms/availability", {
            params: { checkInDate, checkOutDate }
        })
        return result.data
    }
    catch(error)
    {
        throw new Error("Error fetching room availability")
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
    formData.append("totalRooms",roomData.totalRooms)
    if(roomData.photo)
    {
        formData.append("photo",roomData.photo)
    }
    try{
        const response = await api.put(`/rooms/update/${roomId}`, formData,{
            headers: {
                ...getHeader(),
                "Content-Type": "multipart/form-data"
            }
        })
        return response
    }
    catch(error)
    {
        if(error.response && error.response.data)
        {
            throw new Error(error.response.data)
        }
        throw new Error(`Error updating room: ${error.message}`)
    }
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

/*This function checks live availability (for the selected check-in/check-out
dates) for a single room -- used by the booking form to validate the chosen
number of rooms as the guest changes dates or quantity, before they submit. */
export async function getRoomAvailability(roomId, checkInDate, checkOutDate)
{
    try{
        const result = await api.get(`/rooms/room/${roomId}/availability`, {
            params: { checkInDate, checkOutDate }
        })
        return result.data
    }
    catch(error){
        throw new Error(`Error checking room availability: ${error.message}`)
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
		// Backend replies with a friendly sentence, e.g.
		// "Room Booked successfully! Your booking confirmation code is: 9846372757"
		// - pull out just the code so every caller downstream (payment
		// linking, the booking-success page, invoice lookups) gets a clean
		// code instead of the whole sentence.
		const raw = response.data
		const match = typeof raw === "string" ? raw.match(/(\d+)\s*$/) : null
		return match ? match[1] : raw
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
        // Surface the backend's actual message (e.g. "This booking has already
        // been cancelled.", "You are not authorized to access this booking")
        // instead of a generic wrapper string.
        if (error.response && error.response.data) {
            throw new Error(error.response.data);
        }
        throw new Error(`Error cancelling booking with ID ${bookingId}: ${error.message}`);
    }
}

/* Bookings belonging to the logged-in user only - the backend reads the
   guest's email from their JWT, so there's no email/userId to pass here. */
export async function getMyBookings() {
    try {
        const result = await api.get("/bookings/my-bookings", {
            headers: getHeader()
        });
        return result.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data);
        }
        throw new Error(`Error fetching your bookings: ${error.message}`);
    }
}

/* Full details (including the backend-computed price breakdown) for a single
   booking - used by the "View Details" modal in My Bookings. The backend
   only returns this if the logged-in user owns the booking (or is an admin). */
export async function getBookingDetails(bookingId) {
    try {
        const result = await api.get(`/bookings/${bookingId}`, {
            headers: getHeader()
        });
        return result.data;
    } catch (error) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data);
        }
        throw new Error(`Error fetching booking details: ${error.message}`);
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
    console.log("LOGIN API RESPONSE:", response.data); console.log("LOGIN USERNAME:", response.data?.username); console.log("LOGIN ROLE:", response.data?.role);
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
export async function getUser(email, token) {
    console.log("userEmail:", email)

    try {
        const response = await api.get(
            `/users/${encodeURIComponent(email)}`,
            {
                headers: getHeader()
            }
        )

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

/* ===================== Payment gateway (Razorpay) ===================== */

/* Creates a Razorpay order on the backend and returns the order/key details
   needed to open the checkout widget. */
export async function createPaymentOrder(orderDetails) {
	try {
		const response = await api.post("/payments/create-order", orderDetails, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data)
		}
		throw new Error(`Error creating payment order: ${error.message}`)
	}
}

/* Verifies the Razorpay signature returned by the checkout widget. */
export async function verifyPayment(verificationDetails) {
	try {
		const response = await api.post("/payments/verify", verificationDetails, {
			headers: getHeader()
		})
		return response.data
	} catch (error) {
		if (error.response && error.response.data) {
			throw new Error(error.response.data)
		}
		throw new Error(`Error verifying payment: ${error.message}`)
	}
}

/* Links a verified payment record to the booking confirmation code once the
   booking itself has been saved. */
export async function attachPaymentToBooking(paymentRecordId, confirmationCode) {
	try {
		const response = await api.put(
			`/payments/${paymentRecordId}/attach-booking?confirmationCode=${encodeURIComponent(confirmationCode)}`,
			null,
			{ headers: getHeader() }
		)
		return response.data
	} catch (error) {
		// Non-critical: booking already succeeded even if this link-up fails.
		console.error("Error attaching payment to booking:", error.message)
	}
}
/* Downloads the PDF invoice for a booking and triggers a browser download.
   Requires the caller to be logged in (the backend checks that the JWT's
   email matches the booking's guest email, or that the user is an admin). */
export async function downloadInvoice(bookingId, confirmationCode) {
	try {
		const response = await api.get(`/bookings/${bookingId}/invoice`, {
			headers: getHeader(),
			responseType: "blob"
		})

		const blob = new Blob([response.data], { type: "application/pdf" })
		const url = window.URL.createObjectURL(blob)
		const link = document.createElement("a")
		link.href = url
		link.download = `Taj-Hotel-Invoice-${confirmationCode || bookingId}.pdf`
		document.body.appendChild(link)
		link.click()
		link.remove()
		window.URL.revokeObjectURL(url)
	} catch (error) {
		// The response is a Blob even on error here (responseType: "blob"), so
		// the actual error message has to be read out of it before we can show
		// it to the user.
		if (error.response && error.response.data instanceof Blob) {
			const text = await error.response.data.text()
			throw new Error(text || "Error downloading invoice")
		}
		throw new Error(`Error downloading invoice: ${error.message}`)
	}
}
