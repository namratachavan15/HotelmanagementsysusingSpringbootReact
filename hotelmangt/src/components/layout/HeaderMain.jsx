import React from 'react'
import { FaChevronDown, FaStar } from 'react-icons/fa'

const HeaderMain = () => {

  return (
    <header className='header-banner'>
        <div className='header-banner-overlay' aria-hidden="true"></div>
        <div className='container'>
          <div className='animated-texts hero-inner'>
              <span className='hero-kicker'><FaStar size={11}/> Boutique hospitality, since day one</span>
              <h1>Welcome to <span className='hotel-color' style={{color:'#E4C766'}}>Taj Hotel</span></h1>
              <span className='hero-divider' aria-hidden="true"></span>
              <h4>Experience the best hospitality in town — book your stay in minutes.</h4>
          </div>
        </div>
        <FaChevronDown className='hero-scroll-cue' aria-hidden="true" />
    </header>
  )
}

export default HeaderMain