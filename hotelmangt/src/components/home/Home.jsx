import React from 'react'
import HeaderMain from "../layout/HeaderMain"
import HotelService from '../common/HotelService'
import Parallax from '../common/Parallax'
import RoomCarousel from '../common/RoomCarousel'
import RoomSearch from '../common/RoomSearch'
import WhyChooseTaj from '../common/WhyChooseTaj'
import {useLocation} from "react-router-dom"
import { useAuth } from '../auth/AuthProvider'
import { Container, Row, Col } from 'react-bootstrap'
import { FaBed, FaSmile, FaMapMarkerAlt, FaStar } from 'react-icons/fa'
import { useInView } from '../utils/useInView'

const stats = [
  { icon: <FaBed/>, num: "120+", label: "Rooms & suites" },
  { icon: <FaSmile/>, num: "18k+", label: "Happy guests" },
  { icon: <FaMapMarkerAlt/>, num: "6", label: "City locations" },
  { icon: <FaStar/>, num: "4.8/5", label: "Average rating" },
]

const Home = () => {

  const location=useLocation()
  const message=location.state && location.state.message
  const { user } = useAuth()
  const [statsRef, statsVisible] = useInView()

  return (
    <div>
      <HeaderMain/>

      {(message || user) && (
        <div className='container pt-3'>
          {message && <p className='text-warning mb-1'>{message}</p>}
          {user && <h6 className='text-success text-center mb-0'>You are logged in as {user.sub}</h6>}
        </div>
      )}

      {/* Single search + browse component, overlapping the hero */}
      <RoomSearch/>

      <section className='stats-strip py-4'>
        <Container>
          <Row ref={statsRef} className={`g-3 reveal-up ${statsVisible ? 'is-visible' : ''}`}>
            {stats.map((s, i) => (
              <Col key={i} xs={6} md={3} className='stat-item'>
                <div className='stat-icon'>{s.icon}</div>
                <div className='stat-num'>{s.num}</div>
                <div className='stat-label'>{s.label}</div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <section className='page-section'>
        <WhyChooseTaj/>
      </section>

      <section className='page-section page-section--sage'>
        <RoomCarousel/>
      </section>

      <section className='page-section'>
        <HotelService/>
      </section>

      <Parallax/>
    </div>
  )
}

export default Home
