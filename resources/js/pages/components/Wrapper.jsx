import { useState } from 'react';
import { Container, Row, Col, Nav, Navbar, NavDropdown, Collapse, Button, Modal, Form, Card } from 'react-bootstrap';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSignOutAlt, FaImage, FaUpload, FaTrash } from 'react-icons/fa';
import { AiOutlineMenuFold, AiOutlineMenuUnfold } from 'react-icons/ai';
import logo from 'src/assets/logo.png';
import './Wrapper.scss';
import { confirm } from 'src/shared/confirm';
import Loader from 'src/shared/loader';
import { useAntMessage } from 'src/context/ant-message';
import { useMediaQuery } from 'react-responsive';
import { motion } from 'framer-motion';
import { useAuth } from 'src/hooks/useAuth';
import { useDispatch } from 'react-redux';

function Wrapper() {
  const location = useLocation();
  const dispatch = useDispatch();
  const auth = useAuth();
  const { offcanvasWidth, offcanvasExpand } = useFileViewer();
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' });
  const navigate = useNavigate();
  const antMessage = useAntMessage();
  
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);

  const handleShow = () => setShow(true);

  return (
    <>
      <Navbar 
        expand="lg" 
      >
        <Container fluid>
          <Navbar.Brand href="/" as={Link} to="/"><img src={logo} width={40} /> File Drop</Navbar.Brand>
          <Navbar.Toggle/>
          <Navbar.Collapse className="justify-content-end">
            <Nav
              className="ms-auto my-2 my-lg-0"
              style={{ maxHeight: '100px' }}
              navbarScroll
            >
              <NavDropdown 
                title={<img src={auth.getPhoto} width="30" height="30" style={{ objectFit: 'cover' }} className="rounded-circle" />} 
                id="basic-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item
                  onClick={async () => {
                    if (await confirm({ title: 'Logout', confirmation: 'Are you sure you want to logout?' })) {
                      await dispatch({ type: 'USER_LOGOUT' });
                      antMessage.success('Logout Successfully!');
                      navigate('/login');
                    }
                  }}
                >
                  <FaSignOutAlt /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container fluid>
        <Outlet />
      </Container>
     </>
  )
}

export default Wrapper;