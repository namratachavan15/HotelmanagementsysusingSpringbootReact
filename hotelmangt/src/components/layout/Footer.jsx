import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  const today = new Date();

  return (
    <footer className="bg-dark text-light py-3 mt-auto">
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs="12" md="auto" className="text-center">
            <p className="mb-0">
              &copy; {today.getFullYear()} LakeSide Hotel. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
