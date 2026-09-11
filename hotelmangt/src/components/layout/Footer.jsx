import React from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaConciergeBell, FaFacebookF, FaInstagram, FaTwitter, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    let today = new Date();
  return (
    <footer className='footer'>
      <Container>
        <Row className='g-4'>
            <Col xs={12} md={4}>
                <div className='d-flex align-items-center gap-2 mb-3'>
                    <FaConciergeBell style={{color:'#C9A227'}} size={20}/>
                    <h5 className='mb-0'>Taj Hotel</h5>
                </div>
                <p style={{fontSize:'0.9rem'}}>Boutique hospitality in the heart of the city — comfortable rooms, warm service, memorable stays.</p>
                <div className='footer-social mt-3'>
                    <a href="#" aria-label="Facebook"><FaFacebookF size={13}/></a>
                    <a href="#" aria-label="Instagram"><FaInstagram size={13}/></a>
                    <a href="#" aria-label="Twitter"><FaTwitter size={13}/></a>
                </div>
            </Col>
            <Col xs={6} md={4}>
                <h5>Explore</h5>
                <div className='d-flex flex-column gap-2' style={{fontSize:'0.9rem'}}>
                    <Link to={"/browse-all-rooms"}>Browse all rooms</Link>
                    <Link to={"/find-booking"}>Find my booking</Link>
                    <Link to={"/login"}>Account</Link>
                </div>
            </Col>
            <Col xs={6} md={4}>
                <h5>Contact</h5>
                <div className='d-flex flex-column gap-2' style={{fontSize:'0.9rem'}}>
                    <span className='d-flex align-items-center gap-2'><FaMapMarkerAlt/> 12 Harbour Road, City Centre</span>
                    <span className='d-flex align-items-center gap-2'><FaPhoneAlt/> +1 (555) 012-3456</span>
                    <span className='d-flex align-items-center gap-2'><FaEnvelope/> stay@tajhotel.com</span>
                </div>
            </Col>
        </Row>
        <hr />
        <Row>
            <Col xs={12} className='text-center footer-bottom'>
            <p className='mb-0'>&copy; {today.getFullYear()} Taj Hotel. All rights reserved.</p>
            </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer
