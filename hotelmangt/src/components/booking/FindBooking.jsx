import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import {
    FaSearch,
    FaTicketAlt,
    FaCopy,
    FaCheckCircle,
    FaTimesCircle,
    FaBed,
    FaCalendarAlt,
    FaMoon,
    FaDoorOpen,
    FaDownload,
    FaClipboardList,
    FaBan,
    FaHotel,
    FaUser,
    FaUsers,
    FaRedo,
    FaInfoCircle,
    FaMapMarkerAlt
} from 'react-icons/fa';
import { cancelBooking, getBookingByConfirmationCode, downloadInvoice } from '../utils/ApiFunctions';
import { statusBadge, paymentBadge, formatMoney, canCancel, canDownloadInvoice } from './bookingDisplay';

/**
 * Premium "Find My Booking" lookup page. Reuses the existing
 * GET /bookings/confirmation/{confirmationCode} endpoint (already returns
 * the full backend-computed price breakdown - see BookingController), and
 * the existing cancelBooking/downloadInvoice API functions - no new
 * endpoints, no duplicate invoice/cancellation logic.
 */
const FindBooking = () => {
    // idle -> nothing searched yet, loading -> request in flight,
    // found -> booking rendered, notfound -> 404/validation-style empty state
    const [view, setView] = useState('idle');
    const [confirmationCode, setConfirmationCode] = useState('');
    const [validationError, setValidationError] = useState('');
    const [searchError, setSearchError] = useState('');
    const [booking, setBooking] = useState(null);

    const [copied, setCopied] = useState(false);
    const copyTimeoutRef = useRef(null);

    const [cancelOpen, setCancelOpen] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [cancelSuccess, setCancelSuccess] = useState('');

    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadError, setDownloadError] = useState('');

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        };
    }, []);

    const runSearch = async (rawCode) => {
        const code = (rawCode || '').trim();

        if (!code) {
            setValidationError('Please enter your booking confirmation code.');
            return;
        }
        if (!/^[A-Za-z0-9]{4,}$/.test(code)) {
            setValidationError('That doesn\u2019t look like a valid confirmation code. Please check and try again.');
            return;
        }

        setValidationError('');
        setSearchError('');
        setCancelError('');
        setCancelSuccess('');
        setDownloadError('');
        setView('loading');

        try {
            const data = await getBookingByConfirmationCode(code);
            setBooking(data);
            setView('found');
        } catch (error) {
            setBooking(null);
            setSearchError(error.message || 'Unable to retrieve your booking right now. Please try again.');
            setView('notfound');
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        runSearch(confirmationCode);
    };

    const handleTryAgain = () => {
        setView('idle');
        setSearchError('');
        setValidationError('');
    };

    const handleCopyCode = async () => {
        if (!booking?.bookingConfirmationCode) return;
        try {
            await navigator.clipboard.writeText(booking.bookingConfirmationCode);
            setCopied(true);
            if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
            copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
        } catch (e) {
            // Clipboard API unavailable/blocked - fail quietly, the code is
            // already clearly visible on screen for the guest to select manually.
        }
    };

    const handleDownloadInvoice = async () => {
        if (!booking) return;
        setDownloadError('');
        setIsDownloading(true);
        try {
            await downloadInvoice(booking.bookingId, booking.bookingConfirmationCode);
        } catch (error) {
            setDownloadError(error.message);
        }
        setIsDownloading(false);
    };

    const confirmCancel = async () => {
        if (!booking) return;
        setIsCancelling(true);
        setCancelError('');
        try {
            await cancelBooking(booking.bookingId);
            setCancelSuccess('Your booking has been cancelled successfully.');
            setCancelOpen(false);
            const refreshed = await getBookingByConfirmationCode(booking.bookingConfirmationCode);
            setBooking(refreshed);
        } catch (error) {
            setCancelError(error.message);
        }
        setIsCancelling(false);
    };

    const nights = booking?.numberOfNights ?? 0;
    const isCancelled = booking?.bookingStatus === 'CANCELLED';
    const isPaid = booking?.paymentStatus === 'PAID' || booking?.paymentStatus === 'REFUNDED';
    const isConfirmedOrBeyond = ['CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT'].includes(booking?.bookingStatus);
    const isCheckedIn = ['CHECKED_IN', 'CHECKED_OUT'].includes(booking?.bookingStatus);
    const isCheckedOut = booking?.bookingStatus === 'CHECKED_OUT';

    return (
        <div className='container page-section fb-page'>
            <style>{`
                .fb-page { max-width: 900px; }
                @keyframes fbFadeSlideIn {
                    from { opacity: 0; transform: translateY(14px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fb-animate-in { animation: fbFadeSlideIn .45s var(--ease) both; }

                .fb-hero { text-align: center; margin-bottom: 2rem; }
                .fb-hero .fb-kicker {
                    display: inline-flex; align-items: center; gap: 0.5rem;
                    font-family: var(--font-body); font-size: 0.8rem; letter-spacing: 0.08em;
                    text-transform: uppercase; color: var(--color-maroon); font-weight: 600;
                    margin-bottom: 0.6rem;
                }
                .fb-hero h2 { font-size: clamp(1.8rem, 3.2vw, 2.5rem); margin-bottom: 0.5rem; }
                .fb-hero p { color: var(--color-text-muted); max-width: 520px; margin: 0 auto; }

                .fb-search-card {
                    background: var(--color-white);
                    border: 1px solid var(--color-line);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-md);
                    padding: 2rem;
                    max-width: 560px;
                    margin: 0 auto;
                }
                .fb-search-card.fb-search-card--compact {
                    max-width: 100%;
                    padding: 1.1rem 1.3rem;
                    margin-bottom: 2rem;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                .fb-search-label {
                    font-family: var(--font-body);
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--color-ink);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    margin-bottom: 0.5rem;
                    display: block;
                }
                .fb-input-group {
                    display: flex;
                    border: 1.5px solid var(--color-line);
                    border-radius: var(--radius-sm);
                    overflow: hidden;
                    transition: border-color .2s var(--ease), box-shadow .2s var(--ease);
                    background: var(--color-white);
                }
                .fb-input-group:focus-within {
                    border-color: var(--color-gold);
                    box-shadow: 0 0 0 3px rgba(201,162,39,0.18);
                }
                .fb-input-icon {
                    display: flex; align-items: center; justify-content: center;
                    width: 46px; color: var(--color-maroon); background: var(--color-cream-deep);
                    flex-shrink: 0;
                }
                .fb-input {
                    border: none; outline: none; flex: 1; padding: 0.75rem 0.9rem;
                    font-family: var(--font-body); font-size: 0.98rem; color: var(--color-text);
                    background: transparent; min-width: 0;
                }
                .fb-search-card--compact .fb-input-group { flex: 1; }
                .fb-search-card--compact form { flex: 1; display: flex; gap: 0.6rem; }
                .fb-validation { color: #B3261E; font-size: 0.85rem; margin-top: 0.5rem; }
                .fb-search-btn { white-space: nowrap; }

                .fb-info-card {
                    max-width: 560px;
                    margin: 1.5rem auto 0;
                    background: var(--color-sage);
                    border: 1px solid var(--color-line);
                    border-radius: var(--radius-md);
                    padding: 1.1rem 1.3rem;
                    display: flex;
                    gap: 0.75rem;
                }
                .fb-info-card svg { color: var(--color-maroon); flex-shrink: 0; margin-top: 0.15rem; }
                .fb-info-card h6 { margin-bottom: 0.3rem; font-family: var(--font-body); font-weight: 600; color: var(--color-ink); font-size: 0.92rem; }
                .fb-info-card p { margin: 0; color: var(--color-text-muted); font-size: 0.88rem; }

                .fb-empty-state {
                    text-align: center;
                    padding: 3rem 1.5rem;
                    background: var(--color-white);
                    border: 1px dashed var(--color-line);
                    border-radius: var(--radius-lg);
                }
                .fb-empty-state .fb-emoji { font-size: 2.6rem; display: block; margin-bottom: 0.75rem; }
                .fb-empty-state h4 { margin-bottom: 0.4rem; }
                .fb-empty-state ul { text-align: left; max-width: 380px; margin: 1rem auto 1.5rem; color: var(--color-text-muted); font-size: 0.92rem; }
                .fb-empty-state ul li { margin-bottom: 0.3rem; }

                .fb-result-header {
                    text-align: center;
                    margin-bottom: 1.5rem;
                }
                .fb-result-header .fb-check {
                    width: 56px; height: 56px; border-radius: 50%;
                    background: var(--color-sage); color: var(--color-maroon);
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 0.75rem; font-size: 1.6rem;
                }
                .fb-result-header .fb-check--cancelled { background: #F6E7E6; color: #7A2E2A; }
                .fb-result-header h3 { margin-bottom: 0.2rem; }
                .fb-result-header p { color: var(--color-text-muted); margin: 0; }

                .fb-code-block {
                    max-width: 560px;
                    margin: 1.25rem auto 1.75rem;
                    background: linear-gradient(135deg, var(--color-ink) 0%, #1F4B43 100%);
                    border-radius: var(--radius-md);
                    padding: 1.4rem 1.6rem;
                    text-align: center;
                    color: var(--color-cream);
                    box-shadow: var(--shadow-md);
                }
                .fb-code-block .fb-code-label {
                    font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.08em;
                    opacity: 0.75; margin-bottom: 0.4rem;
                }
                .fb-code-block .fb-code-value {
                    font-family: var(--font-display); font-size: clamp(1.5rem, 4vw, 2.1rem);
                    font-weight: 600; letter-spacing: 0.04em; margin-bottom: 0.75rem;
                }
                .fb-copy-btn {
                    display: inline-flex; align-items: center; gap: 0.4rem;
                    background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3);
                    color: var(--color-cream); padding: 0.4rem 0.9rem; border-radius: 999px;
                    font-size: 0.82rem; transition: all .2s var(--ease);
                }
                .fb-copy-btn:hover { background: rgba(255,255,255,0.22); }
                .fb-copy-btn--copied { background: var(--color-gold); border-color: var(--color-gold); color: var(--color-ink); }

                .fb-badges-row { display: flex; justify-content: center; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 2rem; }

                .fb-section {
                    background: var(--color-white);
                    border: 1px solid var(--color-line);
                    border-radius: var(--radius-md);
                    padding: 1.4rem 1.5rem;
                    margin-bottom: 1.25rem;
                    transition: box-shadow .3s var(--ease), transform .3s var(--ease);
                }
                .fb-section:hover { box-shadow: var(--shadow-soft); }
                .fb-section h5 {
                    display: flex; align-items: center; gap: 0.5rem;
                    font-size: 1rem; margin-bottom: 1rem; color: var(--color-ink);
                }
                .fb-section h5 svg { color: var(--color-maroon); }

                .fb-stay-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem 1.5rem;
                }
                .fb-field-label {
                    display: flex; align-items: center; gap: 0.35rem;
                    font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.04em;
                    color: var(--color-text-muted); margin-bottom: 0.25rem;
                }
                .fb-field-value { font-weight: 600; color: var(--color-text); font-size: 0.98rem; }
                .fb-stay-chip-row {
                    grid-column: 1 / -1;
                    display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.3rem;
                }
                .fb-chip {
                    display: inline-flex; align-items: center; gap: 0.35rem;
                    background: var(--color-cream-deep); color: var(--color-ink);
                    padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.82rem; font-weight: 500;
                }
                .fb-chip svg { color: var(--color-maroon); }

                .fb-price-row {
                    display: flex; justify-content: space-between; align-items: baseline;
                    padding: 0.45rem 0; font-size: 0.92rem; color: var(--color-text);
                    border-bottom: 1px dashed var(--color-line);
                }
                .fb-price-row:last-of-type { border-bottom: none; }
                .fb-price-row span:first-child { color: var(--color-text-muted); }
                .fb-price-row--total {
                    margin-top: 0.4rem; padding-top: 0.8rem; border-top: 1.5px solid var(--color-line);
                    font-size: 1.1rem;
                }
                .fb-price-row--total span:last-child {
                    font-family: var(--font-display); font-weight: 600; color: var(--color-maroon); font-size: 1.3rem;
                }

                .fb-timeline { list-style: none; padding: 0; margin: 0; }
                .fb-timeline li {
                    display: flex; align-items: flex-start; gap: 0.75rem; position: relative;
                    padding-bottom: 1.4rem;
                }
                .fb-timeline li:last-child { padding-bottom: 0; }
                .fb-timeline li::before {
                    content: ''; position: absolute; left: 11px; top: 26px; bottom: 0;
                    width: 2px; background: var(--color-line);
                }
                .fb-timeline li:last-child::before { display: none; }
                .fb-timeline-dot {
                    width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    background: var(--color-cream-deep); color: var(--color-text-muted);
                    font-size: 0.7rem; border: 2px solid var(--color-line); z-index: 1;
                }
                .fb-timeline li.fb-done .fb-timeline-dot {
                    background: var(--color-maroon); border-color: var(--color-maroon); color: var(--color-white);
                }
                .fb-timeline li.fb-cancelled .fb-timeline-dot {
                    background: #7A2E2A; border-color: #7A2E2A; color: var(--color-white);
                }
                .fb-timeline-label { font-weight: 600; color: var(--color-text); font-size: 0.92rem; }
                .fb-timeline-sub { font-size: 0.78rem; color: var(--color-text-muted); }

                .fb-actions {
                    display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem;
                }
                .fb-actions .btn { flex: 1 1 200px; }

                .fb-confirm-backdrop {
                    position: fixed; inset: 0; background: rgba(20,40,42,0.55);
                    z-index: 1060; display: flex; align-items: center; justify-content: center; padding: 1rem;
                }
                .fb-confirm-box {
                    background: var(--color-white); border-radius: var(--radius-md); box-shadow: var(--shadow-lift);
                    padding: 1.6rem; max-width: 420px; width: 100%; text-align: center;
                }

                @media (max-width: 576px) {
                    .fb-stay-grid { grid-template-columns: 1fr; }
                    .fb-search-card--compact { flex-direction: column; align-items: stretch; }
                    .fb-search-card--compact form { flex-direction: column; }
                    .fb-actions .btn { flex: 1 1 100%; }
                }
            `}</style>

            {view === 'idle' && (
                <div className='fb-animate-in'>
                    <div className='fb-hero'>
                        <span className='fb-kicker'><FaTicketAlt size={12} /> Find Your Booking</span>
                        <h2>Find Your Booking</h2>
                        <p>Enter your booking confirmation code to view your reservation details.</p>
                    </div>

                    <form className='fb-search-card' onSubmit={handleFormSubmit}>
                        <label className='fb-search-label' htmlFor='confirmationCode'>Booking Confirmation Code</label>
                        <div className='fb-input-group'>
                            <span className='fb-input-icon'><FaSearch size={15} /></span>
                            <input
                                id='confirmationCode'
                                name='confirmationCode'
                                className='fb-input'
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value)}
                                placeholder='Enter your 10-digit confirmation code'
                                aria-label='Booking confirmation code'
                                autoComplete='off'
                            />
                        </div>
                        {validationError && <p className='fb-validation' role='alert'>{validationError}</p>}
                        <button type='submit' className='btn btn-hotel w-100 mt-3 fb-search-btn'>
                            Find My Booking
                        </button>
                    </form>

                    <div className='fb-info-card'>
                        <FaInfoCircle size={18} />
                        <div>
                            <h6>Where can I find my booking code?</h6>
                            <p>Your booking confirmation code can be found in your booking confirmation email and invoice.</p>
                        </div>
                    </div>
                </div>
            )}

            {view === 'loading' && (
                <div className='fb-animate-in'>
                    <div className='fb-hero'>
                        <h2>Find Your Booking</h2>
                        <p>Enter your booking confirmation code to view your reservation details.</p>
                    </div>
                    <div className='fb-search-card text-center'>
                        <div className='spinner-border hotel-color mb-3' role='status' style={{ width: '2.2rem', height: '2.2rem' }}>
                            <span className='visually-hidden'>Loading</span>
                        </div>
                        <p className='text-muted mb-0'>Searching your reservation…</p>
                    </div>
                </div>
            )}

            {view === 'notfound' && (
                <div className='fb-animate-in'>
                    <form className='fb-search-card fb-search-card--compact' onSubmit={handleFormSubmit}>
                        <div className='fb-input-group'>
                            <span className='fb-input-icon'><FaSearch size={14} /></span>
                            <input
                                className='fb-input'
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value)}
                                placeholder='Enter your 10-digit confirmation code'
                                aria-label='Booking confirmation code'
                                autoComplete='off'
                            />
                        </div>
                        <button type='submit' className='btn btn-hotel fb-search-btn'>Find My Booking</button>
                    </form>

                    <div className='fb-empty-state'>
                        <span className='fb-emoji' aria-hidden='true'>🔎</span>
                        <h4>Booking not found</h4>
                        <p className='text-muted'>We couldn't find a reservation with that confirmation code.</p>
                        <ul>
                            <li>Check that the code is entered correctly.</li>
                            <li>Make sure there are no extra spaces.</li>
                            <li>Check your confirmation email.</li>
                        </ul>
                        <button className='btn btn-hotel-outline d-inline-flex align-items-center gap-2' onClick={handleTryAgain}>
                            <FaRedo size={12} /> Try Again
                        </button>
                    </div>
                </div>
            )}

            {view === 'found' && booking && (
                <div className='fb-animate-in'>
                    <form className='fb-search-card fb-search-card--compact' onSubmit={handleFormSubmit}>
                        <div className='fb-input-group'>
                            <span className='fb-input-icon'><FaSearch size={14} /></span>
                            <input
                                className='fb-input'
                                value={confirmationCode}
                                onChange={(e) => setConfirmationCode(e.target.value)}
                                placeholder='Search another confirmation code'
                                aria-label='Booking confirmation code'
                                autoComplete='off'
                            />
                        </div>
                        <button type='submit' className='btn btn-hotel-outline fb-search-btn'>Search again</button>
                    </form>

                    <div className='fb-result-header'>
                        <div className={`fb-check ${isCancelled ? 'fb-check--cancelled' : ''}`}>
                            {isCancelled ? <FaTimesCircle /> : <FaCheckCircle />}
                        </div>
                        <h3>{isCancelled ? 'Booking Cancelled' : 'Reservation Found'}</h3>
                        <p>Your stay at Taj Hotel</p>
                    </div>

                    <div className='fb-code-block'>
                        <div className='fb-code-label'>Booking Confirmation Code</div>
                        <div className='fb-code-value'>#{booking.bookingConfirmationCode}</div>
                        <button type='button' className={`fb-copy-btn ${copied ? 'fb-copy-btn--copied' : ''}`} onClick={handleCopyCode}>
                            <FaCopy size={12} /> {copied ? 'Copied!' : 'Copy confirmation code'}
                        </button>
                    </div>

                    <div className='fb-badges-row'>
                        {statusBadge(booking.bookingStatus)}
                        {paymentBadge(booking.paymentStatus)}
                    </div>

                    {cancelSuccess && <div className='alert alert-success text-center'>{cancelSuccess}</div>}

                    <div className='fb-section'>
                        <h5><FaHotel size={15} /> Stay Details</h5>
                        <div className='fb-stay-grid'>
                            <div className='fb-stay-chip-row'>
                                <span className='fb-chip'><FaBed size={11} /> {booking.room?.roomType}</span>
                            </div>
                            <div>
                                <div className='fb-field-label'><FaCalendarAlt size={11} /> Check-in</div>
                                <div className='fb-field-value'>{moment(booking.checkInDate).format('DD MMM YYYY')}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'><FaCalendarAlt size={11} /> Check-out</div>
                                <div className='fb-field-value'>{moment(booking.checkOutDate).format('DD MMM YYYY')}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'><FaMoon size={11} /> Nights</div>
                                <div className='fb-field-value'>{nights} night{nights === 1 ? '' : 's'}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'><FaDoorOpen size={11} /> Rooms</div>
                                <div className='fb-field-value'>{booking.numberOfRooms} room{booking.numberOfRooms === 1 ? '' : 's'}</div>
                            </div>
                        </div>
                    </div>

                    <div className='fb-section'>
                        <h5><FaUser size={15} /> Guest Information</h5>
                        <div className='fb-stay-grid'>
                            <div>
                                <div className='fb-field-label'>Guest</div>
                                <div className='fb-field-value'>{booking.guestFullName}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'>Email</div>
                                <div className='fb-field-value'>{booking.guestEmail}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'><FaUsers size={11} /> Adults</div>
                                <div className='fb-field-value'>{booking.numOfAdults}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'><FaUsers size={11} /> Children</div>
                                <div className='fb-field-value'>{booking.numOfChildren}</div>
                            </div>
                            <div>
                                <div className='fb-field-label'>Total Guests</div>
                                <div className='fb-field-value'>{booking.totalNumOfGuest}</div>
                            </div>
                        </div>
                    </div>

                    <div className='fb-section'>
                        <h5><FaMapMarkerAlt size={15} /> Price Summary</h5>
                        <div className='fb-price-row'>
                            <span>Room price</span>
                            <span>{formatMoney(booking.roomPricePerNight)} × {booking.numberOfRooms} room{booking.numberOfRooms === 1 ? '' : 's'} × {nights} night{nights === 1 ? '' : 's'}</span>
                        </div>
                        <div className='fb-price-row'>
                            <span>Subtotal</span>
                            <span>{formatMoney(booking.subtotal)}</span>
                        </div>
                        {Number(booking.discount) > 0 && (
                            <div className='fb-price-row'>
                                <span>Discount</span>
                                <span>- {formatMoney(booking.discount)}</span>
                            </div>
                        )}
                        <div className='fb-price-row'>
                            <span>Tax</span>
                            <span>{formatMoney(booking.tax)}</span>
                        </div>
                        <div className='fb-price-row fb-price-row--total'>
                            <span>Total</span>
                            <span>{formatMoney(booking.finalTotal)}</span>
                        </div>
                    </div>

                    <div className='fb-section'>
                        <h5><FaClipboardList size={15} /> Booking Timeline</h5>
                        <ul className='fb-timeline'>
                            <li className='fb-done'>
                                <span className='fb-timeline-dot'><FaCheckCircle size={11} /></span>
                                <div>
                                    <div className='fb-timeline-label'>Booking Created</div>
                                    {booking.bookingDate && (
                                        <div className='fb-timeline-sub'>{moment(booking.bookingDate).format('DD MMM YYYY, h:mm A')}</div>
                                    )}
                                </div>
                            </li>
                            <li className={isPaid ? 'fb-done' : ''}>
                                <span className='fb-timeline-dot'>{isPaid ? <FaCheckCircle size={11} /> : ''}</span>
                                <div className='fb-timeline-label'>Payment {isPaid ? 'Completed' : 'Pending'}</div>
                            </li>
                            {isCancelled ? (
                                <li className='fb-cancelled'>
                                    <span className='fb-timeline-dot'><FaTimesCircle size={11} /></span>
                                    <div className='fb-timeline-label'>Booking Cancelled</div>
                                </li>
                            ) : (
                                <>
                                    <li className={isConfirmedOrBeyond ? 'fb-done' : ''}>
                                        <span className='fb-timeline-dot'>{isConfirmedOrBeyond ? <FaCheckCircle size={11} /> : ''}</span>
                                        <div className='fb-timeline-label'>Reservation Confirmed</div>
                                    </li>
                                    <li className={isCheckedIn ? 'fb-done' : ''}>
                                        <span className='fb-timeline-dot'>{isCheckedIn ? <FaCheckCircle size={11} /> : ''}</span>
                                        <div className='fb-timeline-label'>Check-in</div>
                                    </li>
                                    <li className={isCheckedOut ? 'fb-done' : ''}>
                                        <span className='fb-timeline-dot'>{isCheckedOut ? <FaCheckCircle size={11} /> : ''}</span>
                                        <div className='fb-timeline-label'>Check-out</div>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>

                    {downloadError && <div className='alert alert-danger'>{downloadError}</div>}
                    {cancelError && !cancelOpen && <div className='alert alert-danger'>{cancelError}</div>}

                    <div className='fb-actions'>
                        {canDownloadInvoice(booking) && (
                            <button className='btn btn-hotel d-flex align-items-center justify-content-center gap-2' disabled={isDownloading} onClick={handleDownloadInvoice}>
                                <FaDownload size={13} /> {isDownloading ? 'Preparing…' : 'Download Invoice'}
                            </button>
                        )}
                        <Link to='/my-bookings' className='btn btn-hotel-outline d-flex align-items-center justify-content-center gap-2'>
                            <FaClipboardList size={13} /> View My Bookings
                        </Link>
                        {canCancel(booking) && (
                            <button className='btn btn-outline-danger d-flex align-items-center justify-content-center gap-2' onClick={() => { setCancelError(''); setCancelOpen(true); }}>
                                <FaBan size={13} /> Cancel Booking
                            </button>
                        )}
                        <Link to='/browse-all-rooms' className='btn btn-hotel-outline d-flex align-items-center justify-content-center gap-2'>
                            <FaHotel size={13} /> Book Another Room
                        </Link>
                    </div>
                </div>
            )}

            {cancelOpen && (
                <div className='fb-confirm-backdrop' onClick={() => !isCancelling && setCancelOpen(false)}>
                    <div className='fb-confirm-box' onClick={(e) => e.stopPropagation()}>
                        <FaBan size={30} className='text-danger mb-2' />
                        <h5>Cancel this booking?</h5>
                        <p className='text-muted'>Are you sure you want to cancel this booking? This cannot be undone.</p>
                        {cancelError && <p className='text-danger small'>{cancelError}</p>}
                        <div className='d-flex justify-content-center gap-2 mt-3'>
                            <button className='btn btn-hotel-outline' disabled={isCancelling} onClick={() => setCancelOpen(false)}>
                                Keep booking
                            </button>
                            <button className='btn btn-danger' disabled={isCancelling} onClick={confirmCancel}>
                                {isCancelling ? 'Cancelling…' : 'Yes, cancel it'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindBooking;
