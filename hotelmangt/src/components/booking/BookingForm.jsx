import React, { useState, useEffect } from 'react';
import {  bookRoom, getRoomById, getRoomAvailability, attachPaymentToBooking, getUser } from '../utils/ApiFunctions';
import { useParams, useNavigate } from 'react-router-dom';
import {Form, FormControl } from 'react-bootstrap';
import moment from "moment";
import BookingSummary from './BookingSummary';
import { FaUser, FaEnvelope, FaCalendarCheck, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../auth/AuthProvider';

const BookingForm = () => {

    const [validated, setValidated] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [roomPrice, setRoomPrice] = useState(0);
    const [autoFilled, setAutoFilled] = useState(false);
    const [booking, setBooking] = useState({
        guestFullName: "",
        guestEmail: "",
        checkInDate: "",
        checkOutDate: "",
        numOfAdults: "",
        numOfChildren: "",
        numberOfRooms: 1,
    });
    const [availableRooms, setAvailableRooms] = useState(null);
    const [totalRooms, setTotalRooms] = useState(null);
    const [availabilityForDates, setAvailabilityForDates] = useState(false);
    const [availabilityError, setAvailabilityError] = useState("");
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const { roomId } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useAuth();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "numberOfRooms") {
            const parsed = parseInt(value);
            setBooking({ ...booking, numberOfRooms: isNaN(parsed) || parsed < 1 ? 1 : parsed });
            setErrorMessage("");
            return;
        }
        setBooking({ ...booking, [name]: value });
        setErrorMessage("");
    };

    const adjustRoomCount = (delta) => {
        setBooking((prev) => {
            const next = (parseInt(prev.numberOfRooms) || 1) + delta;
            return { ...prev, numberOfRooms: next < 1 ? 1 : next };
        });
    };

    const getRoomPriceById = async (roomId) => {
        try {
            const response = await getRoomById(roomId);
            setRoomPrice(response.roomPrice);
            if (typeof response.totalRooms === "number") {
                setTotalRooms(response.totalRooms);
            }
            // "As of today" only, shown until the guest picks dates -- the
            // date-range effect below immediately overrides this once they do.
            if (typeof response.availableRooms === "number") {
                setAvailableRooms(response.availableRooms);
            }
        } catch (error) {
            throw new Error(error);
        }
    };

    useEffect(() => {
        getRoomPriceById(roomId);
    }, [roomId]);

    // Re-check availability for THIS room and THESE exact dates whenever the
    // guest changes check-in, check-out, or the number of rooms -- "X rooms
    // available as of today" (fetched once above) is not the same number as
    // "X rooms available for 10 Sep - 12 Sep", so this has to be a live,
    // date-aware check rather than relying on that initial snapshot.
    useEffect(() => {
        const checkInDate = booking.checkInDate;
        const checkOutDate = booking.checkOutDate;

        if (!roomId || !checkInDate || !checkOutDate) {
            setAvailabilityForDates(false);
            setAvailabilityError("");
            return;
        }
        if (!moment(checkOutDate).isAfter(moment(checkInDate))) {
            // isCheckOutDateValid already reports this on submit -- just don't
            // run an availability check against an invalid range.
            setAvailabilityForDates(false);
            setAvailabilityError("");
            return;
        }

        let cancelled = false;
        setCheckingAvailability(true);

        getRoomAvailability(roomId, checkInDate, checkOutDate)
            .then((response) => {
                if (cancelled) return;
                setCheckingAvailability(false);
                setAvailabilityForDates(true);
                if (typeof response.availableRooms === "number") {
                    setAvailableRooms(response.availableRooms);
                    const requestedRooms = parseInt(booking.numberOfRooms) || 1;
                    if (requestedRooms > response.availableRooms) {
                        setAvailabilityError(
                            response.availableRooms > 0
                                ? `Only ${response.availableRooms} room${response.availableRooms === 1 ? "" : "s"} are available for the selected dates.`
                                : "No rooms are available for the selected dates."
                        );
                    } else {
                        setAvailabilityError("");
                    }
                }
            })
            .catch((error) => {
                if (cancelled) return;
                setCheckingAvailability(false);
                // Non-fatal here -- the backend re-checks availability again on
                // submit regardless, so a failed live check just means the guest
                // won't see the early warning this time.
                console.error("Could not check room availability:", error);
            });

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, booking.checkInDate, booking.checkOutDate, booking.numberOfRooms]);

    // Pre-fill full name & email from the logged-in user's account, so
    // returning guests don't have to retype details we already have.
    useEffect(() => {
        const prefillFromAccount = async () => {
            const userEmail = localStorage.getItem("userEmail") || user?.sub;
            const token = localStorage.getItem("token");

            if (!isLoggedIn || !userEmail) return;

            try {
                const userData = await getUser(userEmail, token);
                const fullName = [userData?.firstName, userData?.lastName]
                    .filter(Boolean)
                    .join(" ");

                setBooking((prev) => ({
                    ...prev,
                    guestFullName: prev.guestFullName || fullName,
                    guestEmail: prev.guestEmail || userData?.email || userEmail,
                }));

                if (fullName || userData?.email) {
                    setAutoFilled(true);
                }
            } catch (error) {
                // Non-fatal — the guest can still type their details manually.
                console.error("Could not prefill guest details:", error);
            }
        };

        prefillFromAccount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn, user]);

    // Total = (nights) x (price per room per night) x (number of rooms booked).
    // e.g. room price 6000, 2 nights, 2 rooms => 6000 * 2 * 2 = 24000.
    const calculatePayment = () => {
        const checkInDate = moment(booking.checkInDate);
        const checkOutDate = moment(booking.checkOutDate);
        const diffInDays = checkOutDate.diff(checkInDate,'days');
        const price = roomPrice ? roomPrice : 0;
        const rooms = parseInt(booking.numberOfRooms) || 1;
        return diffInDays * price * rooms;
    };

    const isRoomCountValid = () => {
        const count = parseInt(booking.numberOfRooms);
        if (isNaN(count) || count < 1) {
            setErrorMessage("Please select at least 1 room");
            return false;
        }
        // availabilityError already reflects the live, date-specific check for
        // the guest's exact check-in/check-out dates (see the effect above) --
        // reuse that instead of a separate, possibly stale comparison here.
        if (availabilityError) {
            setErrorMessage(availabilityError);
            return false;
        }
        return true;
    };

    const isGuestCountValid = () => {
        const adultCount = parseInt(booking.numOfAdults);
        const childrenCount = parseInt(booking.numOfChildren);
        const totalCount = adultCount + childrenCount;
        return totalCount >= 1 && adultCount >= 1;
    };

    const isCheckOutDateValid = () => {
        if (!moment(booking.checkOutDate).isSameOrAfter(moment(booking.checkInDate))) {
            setErrorMessage("Check out date must be after check-in date");
            return false;
        } else {
            setErrorMessage("");
            return true;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false || !isGuestCountValid() || !isCheckOutDateValid() || !isRoomCountValid()) {
            e.stopPropagation();
        } else {
            setIsSubmitted(true);
        }
        setValidated(true);
    };

    const handleFormSubmit = async (paymentRecordId) => {
        try {
            const confirmationCode = await bookRoom(roomId, booking);
            setIsSubmitted(true);
            if (paymentRecordId) {
                attachPaymentToBooking(paymentRecordId, confirmationCode);
            }
            navigate("/booking-success", { state: { message: confirmationCode } });
        } catch (error) {
            const errorMessage = error.message
            navigate("/booking-success", { state: { error: errorMessage } })
        }
    };

    return (
        <div className='row g-4'>
          <div className='col-lg-6'>
            <div className='booking-card'>
                <h4 className='card-title d-flex align-items-center gap-2'>
                    <FaCalendarCheck className='hotel-color'/> Reserve room
                </h4>
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                    {autoFilled && (
                        <p className='form-hint'>
                            <FaCheckCircle size={12}/> Filled in from your account — feel free to edit it.
                        </p>
                    )}
                    <Form.Group className='mb-3'>
                        <Form.Label htmlFor="guestFullName"><FaUser size={12}/> Full name</Form.Label>
                    <FormControl
                    required
                    type="text"
                    id="guestFullName"
                    name="guestFullName"
                    value={booking.guestFullName}
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please enter your full name
                    </Form.Control.Feedback>
                    </Form.Group>
                    <Form.Group className='mb-3'>
                        <Form.Label htmlFor="guestEmail"><FaEnvelope size={12}/> Email</Form.Label>
                    <FormControl
                    required
                    type="email"
                    id="guestEmail"
                    name="guestEmail"
                    value={booking.guestEmail}
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please enter your email address
                    </Form.Control.Feedback>
                    </Form.Group>
                    <fieldset>
                        <legend>Lodging period</legend>
                        <div className='row g-3'>
                            <div className='col-6'>
                        <Form.Label htmlFor="checkInDate">Check-in date</Form.Label>
                    <FormControl
                    required
                    type="date"
                    id="checkInDate"
                    name="checkInDate"
                    value={booking.checkInDate}
                    onChange={handleInputChange}
                    />
                    <Form.Control.Feedback type="invalid">
                        Please select a check-in date
                    </Form.Control.Feedback>
                            </div>
                            <div className='col-6'>
                          <Form.Label htmlFor="checkOutDate">Check-out date</Form.Label>
                      <FormControl
                      required
                      type="date"
                      id="checkOutDate"
                      name="checkOutDate"
                      value={booking.checkOutDate}
                      onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                          Please select a check-out date
                      </Form.Control.Feedback>
                              </div>
                        {errorMessage && <p className='error-message text-danger mt-2 mb-0'>{errorMessage}</p>}
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>Number of rooms</legend>
                        <div className='d-flex align-items-center gap-2'>
                            <button type='button' className='btn btn-hotel-outline btn-sm' onClick={() => adjustRoomCount(-1)}>-</button>
                            <FormControl
                                required
                                type="number"
                                id="numberOfRooms"
                                name="numberOfRooms"
                                min={1}
                                value={booking.numberOfRooms}
                                onChange={handleInputChange}
                                style={{maxWidth:'90px', textAlign:'center'}}
                            />
                            <button type='button' className='btn btn-hotel-outline btn-sm' onClick={() => adjustRoomCount(1)}>+</button>
                            {checkingAvailability && (
                                <span className='text-muted' style={{fontSize:'0.8rem'}}>Checking availability…</span>
                            )}
                        </div>
                        {availabilityForDates ? (
                            typeof availableRooms === "number" && (
                                <small className='text-muted d-block mt-1' style={{fontSize:'0.8rem'}}>
                                    {availableRooms} room{availableRooms === 1 ? "" : "s"} available for your selected dates.
                                </small>
                            )
                        ) : (
                            typeof totalRooms === "number" && (
                                <small className='text-muted d-block mt-1' style={{fontSize:'0.8rem'}}>
                                    {totalRooms} total room{totalRooms === 1 ? "" : "s"} — select your dates to check availability.
                                </small>
                            )
                        )}
                        {availabilityError && (
                            <p className='error-message text-danger mt-2 mb-0'>{availabilityError}</p>
                        )}
                    </fieldset>
                    <fieldset>
                        <legend>Number of guests</legend>
                        <div className='row g-3'>
                            <div className='col-6'>
                        <Form.Label htmlFor="numOfAdults">Adults</Form.Label>
                    <FormControl
                    required
                    type="number"
                    id="numOfAdults"
                    name="numOfAdults"
                    value={booking.numOfAdults}
                    placeholder="0"
                    min={1}
                    onChange={handleInputChange}
                    />
                    <Form.Control.Feedback type="invalid">
                       Please select at least 1 adult.
                    </Form.Control.Feedback>
                            </div>
                            <div className='col-6'>
                          <Form.Label htmlFor="numOfChildren">Children</Form.Label>
                      <FormControl
                      required
                      type="number"
                      id="numOfChildren"
                      name="numOfChildren"
                      value={booking.numOfChildren}
                      placeholder="0"
                      min={0}
                      onChange={handleInputChange}
                      />
                      <Form.Control.Feedback type="invalid">
                      Enter 0 if no children
                    </Form.Control.Feedback>
                              </div>
                        </div>
                    </fieldset>
                    <div className='mt-3'>
                        <button type="submit" className='btn btn-hotel' disabled={!!availabilityError}>Continue</button>
                    </div>
                </Form>
            </div>
          </div>

          <div className='col-lg-6'>
                {isSubmitted && (
                    <BookingSummary
                    booking={booking}
                    roomId={roomId}
                    payment={calculatePayment()}
                    isFormValid={validated}
                    onConfirm={handleFormSubmit}
                    />
                )}
          </div>
        </div>
    );
};

export default BookingForm;
