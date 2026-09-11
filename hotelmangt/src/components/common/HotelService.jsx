import React from 'react'
import {Container,Row,Col} from 'react-bootstrap'
import {FaClock,FaCocktail,FaSnowflake,FaTshirt,FaUtensils,FaWifi,FaParking} from "react-icons/fa"

const services = [
  { icon: <FaWifi/>, title: "WiFi", text: "Stay connected with high-speed internet access throughout the hotel." },
  { icon: <FaUtensils/>, title: "Breakfast", text: "Start your day with a delicious breakfast buffet." },
  { icon: <FaTshirt/>, title: "Laundry", text: "Keep your clothes clean and fresh with our laundry service." },
  { icon: <FaCocktail/>, title: "Mini-bar", text: "Enjoy a refreshing drink or snack from our in-room mini-bar." },
  { icon: <FaParking/>, title: "Parking", text: "Park your car conveniently in our on-site parking lot." },
  { icon: <FaSnowflake/>, title: "Air conditioning", text: "Stay cool and comfortable with climate control in every room." },
]

const HotelService = () => {
  return (
      <Container>
        <div className='section-heading'>
          <span className='section-kicker'>What's included</span>
          <h2>Services at <span className='hotel-color'>Taj</span> Hotel</h2>
          <p className='d-flex align-items-center justify-content-center gap-2'>
            <FaClock/> 24-hour front desk, always ready to help
          </p>
        </div>

        <Row xs={1} md={2} lg={3} className='g-4'>
          {services.map((s, i) => (
            <Col key={i}>
              <div className='service-card'>
                <div className='service-icon'>{s.icon}</div>
                <h5 className='hotel-color'>{s.title}</h5>
                <p>{s.text}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
  )
}

export default HotelService
