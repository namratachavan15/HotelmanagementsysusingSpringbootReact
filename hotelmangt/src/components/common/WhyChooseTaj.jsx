import React from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { FaCheckCircle } from 'react-icons/fa'
import { useInView } from '../utils/useInView'

// Free-to-use (Mixkit License) hotel-room video -- plays directly from
// Mixkit's CDN, no local file needed. Swap this URL any time for a
// different clip: https://mixkit.co/free-stock-video/hotel-room/
const whyVideoUrl = "https://assets.mixkit.co/videos/4196/4196-360.mp4"

const highlights = [
  "Premium rooms",
  "Exceptional hospitality",
  "24/7 guest support",
  "Easy and secure booking",
  "Comfortable stay",
]

const WhyChooseTaj = () => {
  const [ref, isVisible] = useInView()

  return (
    <Container>
      <Row className='align-items-center g-5'>
        <Col md={6}>
          <div className='why-choose-img-wrap'>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              <source src={whyVideoUrl} type="video/mp4" />
            </video>
          </div>
        </Col>
        <Col md={6}>
          <div ref={ref} className={`reveal-up ${isVisible ? 'is-visible' : ''}`}>
            <span className='section-kicker'>Why choose Taj</span>
            <h2 className='mb-3'>A stay designed around comfort, service and memorable experiences.</h2>
            <ul className='why-choose-list'>
              {highlights.map((item, i) => (
                <li key={i}>
                  <FaCheckCircle/> <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default WhyChooseTaj