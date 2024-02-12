import React from "react";
import { Container, Row, Col } from "react-bootstrap"; 
import SideBar from "../../Components/SideBar/SideBar";
import './Dashboard.css'

function Dashboard() {
  return (
    <>
      <Container fluid>
        <Row>
          <Col xs={2} id="sidebar-wrapper">
            <SideBar />
          </Col>
          <Col xs={10} id="page-content-wrapper">
            this is a test
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default Dashboard;
  