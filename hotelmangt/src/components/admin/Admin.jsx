import React from 'react'
import { Link } from 'react-router-dom'
import { Row, Col } from 'react-bootstrap'
import { FaBed, FaClipboardList, FaShieldAlt, FaArrowRight } from 'react-icons/fa'

const Admin = () => {
  return (
    <section className='container page-section--tight'>
      <div className='admin-hero d-flex align-items-center gap-3'>
        <FaShieldAlt size={32} style={{color:'#E4C766'}} />
        <div>
          <h2 className='mb-1'>Admin panel</h2>
          <p>Manage rooms and bookings for Taj Hotel.</p>
        </div>
      </div>

      <Row className='g-4'>
        <Col md={6}>
          <Link to={"/existing-room"} className='admin-tile'>
            <div className='admin-tile-icon'><FaBed/></div>
            <div>
              <h5 className='hotel-color'>Manage rooms</h5>
              <p>Add, edit, or remove rooms and room types.</p>
              <span className='hotel-color d-inline-flex align-items-center gap-1 mt-2' style={{fontSize:'0.9rem'}}>
                Go to rooms <FaArrowRight size={11}/>
              </span>
            </div>
          </Link>
        </Col>
        <Col md={6}>
          <Link to={"/existing-bookings"} className='admin-tile'>
            <div className='admin-tile-icon'><FaClipboardList/></div>
            <div>
              <h5 className='hotel-color'>Manage bookings</h5>
              <p>View, filter by date, and cancel existing bookings.</p>
              <span className='hotel-color d-inline-flex align-items-center gap-1 mt-2' style={{fontSize:'0.9rem'}}>
                Go to bookings <FaArrowRight size={11}/>
              </span>
            </div>
          </Link>
        </Col>
      </Row>
    </section>
  )
}

export default Admin
