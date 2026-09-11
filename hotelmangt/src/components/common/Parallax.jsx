import React from 'react'
import {Container} from 'react-bootstrap'
import { Link } from 'react-router-dom'

// Free-to-use (Mixkit License, commercial + personal use ok) hotel/beach
// exterior video, served at 720p (was 360p before -- that's what made it
// look blurry on larger screens). Plays directly from Mixkit's CDN, no
// local file needed. Swap this URL any time for a different clip:
// https://mixkit.co/free-stock-video/hotel/
const ctaVideoUrl = "https://assets.mixkit.co/videos/3108/3108-720.mp4"

const Parallax = () => {
  return (
    <div className='parallax'>
      <video
        className='parallax-video'
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={ctaVideoUrl} type="video/mp4" />
      </video>
      <Container className='text-center px-4 py-5'>
        <div className='animated-texts'>
          <span className='hero-kicker'>Ready when you are</span>
          <h1>Welcome to <span style={{color:'#E4C766'}}>Taj Hotel</span></h1>
          <h3 className='fw-normal' style={{fontFamily:'var(--font-body)', fontSize:'1.1rem'}}>
            We offer the best services for all your needs
          </h3>
          <Link to={"/browse-all-rooms"} className='btn btn-gold mt-3'>Reserve your room</Link>
        </div>
      </Container>
    </div>
  )
}

export default Parallax