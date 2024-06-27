import React, { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = ({ setAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const url = 'https://localhost:7003/api/Account/Login';
    const data = {
      email: email,
      password: password
    };

    axios.post(url, data)
      .then((result) => {
        if (result.data.token) {
          localStorage.setItem("token", result.data.token);
          setAuth(true);
          toast.success('Logged in successfully');
        }
      })
      .catch((error) => {
        console.error("Error logging in:", error);
        toast.error('Failed to login: ' + error.message);
      });
  };

  return (
    <Container className="login-container">
      <ToastContainer />
      <Row className="justify-content-center align-items-center">
        <Col md="auto">
          <Form className="p-4 shadow-sm rounded" style={{ backgroundColor: "#f8f9fa" }}>
            <h2 className="text-center mb-4">Login</h2>
            <Form.Group controlId="formEmail" className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><FaEnvelope /></span>
              </div>
              <Form.Control
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text"><FaLock /></span>
              </div>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>
            <Button variant="primary" type="button" className="w-100" onClick={handleLogin}>
              Login
            </Button>
            <p className="text-center mt-3">Dazi Saad</p>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
