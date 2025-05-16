import React, { useState } from 'react';
import { cancelBooking, getBookingByConfirmationCode } from '../utils/ApiFunctions';

const FindBooking = () => {
  const [confirmationCode, setConfirmationCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const [bookingInfo, setBookingInfo] = useState({
    id: '',
    room: { id: '', roomType: '' },
    bookingConfirmationCode: '',
    roomNumber: '',
    checkInDate: '',
    checkOutDate: '',
    guestFullName: '',
    guestEmail: '',
    numOfAdults: '',
    numOfChildren: '',
    totalNumOfGuest: ''
  });

  const clearBookingInfo = {
    id: '',
    room: { id: '', roomType: '' },
    bookingConfirmationCode: '',
    roomNumber: '',
    checkInDate: '',
    checkOutDate: '',
    guestFullName: '',
    guestEmail: '',
    numOfAdults: '',
    numOfChildren: '',
    totalNumOfGuest: ''
  };

  const handleInputChange = (e) => {
    setConfirmationCode(e.target.value);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const data = await getBookingByConfirmationCode(confirmationCode);
      setBookingInfo(data);
      setError('');
    } catch (error) {
      setBookingInfo(clearBookingInfo);
      setError(error.message);
    }
    setIsLoading(false);
  };

  const handleBookingCancellation = async (bookingId) => {
    try {
      await cancelBooking(bookingId);
      setIsDeleted(true);
      setSuccessMessage('Booking has been cancelled successfully!');
      setBookingInfo(clearBookingInfo);
      setConfirmationCode('');
      setError('');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container" style={{marginTop:0,height:'620px'}}>
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6">
          <h2 className="text-center mb-2">Find My Booking</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="input-group mb-3">
              <input
                type="text"
                className="form-control"
                name="confirmationCode"
                value={confirmationCode}
                onChange={handleInputChange}
                placeholder="Enter confirmation code"
                required
              />
              <button className="btn btn-primary" type="submit">
                Find Booking
              </button>
            </div>
          </form>

          {isLoading && <div className="text-center">Finding your booking...</div>}

          {error && <div className="alert alert-danger">{error}</div>}

          {bookingInfo.bookingConfirmationCode && (
            <div className="card mt-3">
              <div className="card-body">
                <h5 className="card-title mb-3">Booking Details</h5>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item"><strong>Confirmation:</strong> {bookingInfo.bookingConfirmationCode}</li>
                  <li className="list-group-item"><strong>Room Type:</strong> {bookingInfo.room.roomType}</li>
                  <li className="list-group-item"><strong>Check-in:</strong> {bookingInfo.checkInDate}</li>
                  <li className="list-group-item"><strong>Check-out:</strong> {bookingInfo.checkOutDate}</li>
                  <li className="list-group-item"><strong>Name:</strong> {bookingInfo.guestFullName}</li>
                  <li className="list-group-item"><strong>Email:</strong> {bookingInfo.guestEmail}</li>
                  <li className="list-group-item"><strong>Adults:</strong> {bookingInfo.numOfAdults}</li>
                  <li className="list-group-item"><strong>Children:</strong> {bookingInfo.numOfChildren}</li>
                  <li className="list-group-item"><strong>Total Guests:</strong> {bookingInfo.totalNumOfGuest}</li>
                </ul>

                {!isDeleted && (
                  <div className="d-grid mt-3 mb-1">
                    <button
                      className="btn btn-danger"
                      onClick={() => handleBookingCancellation(bookingInfo.id)}
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isDeleted && (
            <div className="alert alert-success mt-3">
              {successMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindBooking;
