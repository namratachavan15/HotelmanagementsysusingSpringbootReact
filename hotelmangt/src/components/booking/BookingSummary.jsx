import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import moment from 'moment';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import { createPaymentOrder, verifyPayment } from '../utils/ApiFunctions';

const BookingSummary = ({ booking, roomId, payment, isFormValid, onConfirm }) => {

  const checkInDate = moment(booking.checkInDate);
  const checkOutDate = moment(booking.checkOutDate);
  const numberOfDays = checkOutDate.diff(checkInDate, 'days');

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const handlePayAndConfirm = () => {
    setPaymentError("");

    if (!window.Razorpay) {
      setPaymentError("Payment gateway failed to load. Please check your connection and try again.");
      return;
    }

    setIsProcessingPayment(true);

    createPaymentOrder({
      amount: payment,
      currency: "INR",
      roomId,
      guestEmail: booking.guestEmail,
      guestFullName: booking.guestFullName,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate
    })
      .then((order) => {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: "Taj Hotel",
          description: `Room booking · ${numberOfDays} night${numberOfDays === 1 ? "" : "s"}`,
          order_id: order.orderId,
          prefill: {
            name: booking.guestFullName,
            email: booking.guestEmail
          },
          theme: { color: "#7A2E2A" },
          handler: function (response) {
            verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature
            })
              .then(() => {
                onConfirm(order.paymentRecordId);
              })
              .catch((error) => {
                setIsProcessingPayment(false);
                setPaymentError(error.message || "Payment verification failed. Please try again.");
              });
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            }
          }
        };

        const razorpayCheckout = new window.Razorpay(options);
        razorpayCheckout.on('payment.failed', function () {
          setIsProcessingPayment(false);
          setPaymentError("Payment failed. Please try again.");
        });
        razorpayCheckout.open();
      })
      .catch((error) => {
        setIsProcessingPayment(false);
        setPaymentError(error.message || "Unable to start payment. Please try again.");
      });
  };

  return (
    <div className='booking-summary-card'>
      <h4 className='d-flex align-items-center gap-2'><FaCheckCircle className='hotel-color'/> Reservation summary</h4>

      <dl>
        <dt>Full name</dt><dd>{booking.guestFullName}</dd>
        <dt>Email</dt><dd>{booking.guestEmail}</dd>
        <dt>Check-in</dt><dd>{moment(booking.checkInDate).format('MMM Do YYYY')}</dd>
        <dt>Check-out</dt><dd>{moment(booking.checkOutDate).format('MMM Do YYYY')}</dd>
        <dt>Nights</dt><dd>{numberOfDays}</dd>
        <dt>Rooms</dt><dd>{booking.numberOfRooms || 1}</dd>
        <dt>Adults</dt><dd>{booking.numOfAdults}</dd>
        <dt>Children</dt><dd>{booking.numOfChildren}</dd>
      </dl>

      {payment > 0 ? (
        <>
          <p className='mb-3'>Total payment <span className='total-payment ms-2'>${payment}</span></p>
          {paymentError && <p className='text-danger mb-3'>{paymentError}</p>}
          {isFormValid ? (
            <Button className='btn btn-hotel d-flex align-items-center gap-2' onClick={handlePayAndConfirm} disabled={isProcessingPayment}>
              {isProcessingPayment ? (
                <>
                  <span className='spinner-border spinner-border-sm me-2' role='status' aria-hidden='true'></span>
                  Processing payment…
                </>
              ) : (
                <>
                  <FaLock size={13} /> Pay &amp; confirm booking
                </>
              )}
            </Button>
          ) : null}
          <p className='text-muted small mt-2 mb-0'>You'll be redirected to our secure payment gateway to complete your booking.</p>
        </>
      ) : (
        <p className='text-danger'>Check-out date must be after check-in date</p>
      )}
    </div>
  );
};

export default BookingSummary;
