import React, { useState, useEffect, Fragment, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useIdleTimer } from 'react-idle-timer';
import { AiFillDelete, AiOutlineRollback, AiFillEdit } from 'react-icons/ai';
import { FiLogOut } from 'react-icons/fi';

const CRUD = ({ setAuth }) => {
  const [idleModalShow, setIdleModalShow] = useState(false);
  const [showDeleted, setShowDeleted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isActive, setIsActive] = useState(0);
  const [nameError, setNameError] = useState('');
  const [ageError, setAgeError] = useState('');
  const [data, setData] = useState([]);
  const [editModalShow, setEditModalShow] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    setAuth(false);
    toast.success('Déconnexion réussie');
  }, [setAuth]);

  const handleIdle = () => {
    setIdleModalShow(true);
  };

  const handleContinue = () => {
    setIdleModalShow(false);
    reset();
    setLastActiveTime(Date.now());
  };

  const { reset } = useIdleTimer({
    timeout: 5000,
    onIdle: handleIdle,
    debounce: 500,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsedTime = Date.now() - lastActiveTime;
      if (elapsedTime > 5000 && !idleModalShow) {
        setIdleModalShow(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastActiveTime, idleModalShow]);

  useEffect(() => {
    getData();
  }, [showDeleted]);

  useEffect(() => {
    getData();
  }, [searchTerm]);

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet employé ?")) {
      axios.delete(`https://localhost:7003/api/Employee/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
        .then((result) => {
          if (result.status === 200) {
            toast.success('Employé supprimé avec succès');
            setData(prevData => prevData.filter(item => item.id !== id));
          }
        })
        .catch((error) => {
          toast.error("Erreur lors de la suppression de l'employé : " + error.message);
        });
    }
  };

  const handleRestore = (id) => {
    axios.post(`https://localhost:7003/api/Employee/restore/${id}`)
      .then(response => {
        toast.success('Employé restauré avec succès');
        getData();
      })
      .catch(error => {
        console.error('Erreur lors de la restauration', error);
        toast.error('Erreur lors de la restauration de l\'employé');
      });
  };

  const getData = () => {
    axios.get(`https://localhost:7003/api/Employee?includeDeleted=${showDeleted}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((result) => {
        setData(result.data);
      })
      .catch((error) => {
        console.error("Erreur lors de la récupération de la liste des employés :", error);
        toast.error('Erreur lors de la récupération de la liste des employés : ' + error.message);
      });
  };

  const handleSave = () => {
    if (!validateName(name) || !validateAge(age)) {
      toast.error("Veuillez corriger les erreurs avant de soumettre.");
      return;
    }

    const url = 'https://localhost:7003/api/Employee';
    const data = {
      name: name,
      age: age,
      isActive: isActive
    };

    axios.post(url, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((result) => {
        getData();
        clear();
        toast.success('Employé ajouté avec succès');
      }).catch((error) => {
        toast.error('Erreur lors de lajout de lemployé :' + error.message);
      });
  };

  const handleUpdate = () => {
    if (!validateName(name) || !validateAge(age)) {
      toast.error("Veuillez corriger les erreurs avant de soumettre.");
      return;
    }

    const url = `https://localhost:7003/api/Employee/${selectedEmployee.id}`;
    const data = {
      id: selectedEmployee.id,
      name: name,
      age: age,
      isActive: isActive
    };

    axios.put(url, data, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((result) => {
        getData();
        clear();
        setEditModalShow(false);
        toast.success('Employé mis à jour avec succès');
      }).catch((error) => {
        toast.error('Erreur lors de la mise à jour de l\'employé :' + error.message);
      });
  };

  const validateName = (name) => {
    if (!name) {
      setNameError('Le nom ne peut pas être vide.');
      return false;
    } else if (!/^[a-zA-Z\s]+$/.test(name)) {
      setNameError('Caractères invalides. Seules les lettres sont autorisées.');
      return false;
    }
    setNameError('');
    return true;
  };

  const validateAge = (age) => {
    if (!age) {
      setAgeError('L\'âge ne peut pas être vide.');
      return false;
    } else if (!/^\d+$/.test(age)) {
      setAgeError('L\'âge doit être un nombre.');
      return false;
    }
    setAgeError('');
    return true;
  };

  const handleActiveChange = (e) => {
    const newIsActive = e.target.checked ? 1 : 0;
    setIsActive(newIsActive);
  };

  const clear = () => {
    setName('');
    setAge('');
    setIsActive(false);
    setSelectedEmployee(null);
  };

  const toggleShowDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setName(employee.name);
    setAge(employee.age);
    setIsActive(employee.isActive ? 1 : 0);
    setEditModalShow(true);
  };

  const filteredData = data.filter(item => 
    (showDeleted ? item.isDeleted : !item.isDeleted) &&
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Fragment>
      <ToastContainer />
      <Container>
        <Row className="mb-3">
          <Col md={12}>
            <button className="btn btn-info" onClick={toggleShowDeleted}>
              {showDeleted ? 'Show Active' : 'Show Deleted'}
            </button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={3}>
            <input
              type="text"
              className={`form-control ${nameError ? 'is-invalid' : ''}`}
              placeholder="Enter Name"
              value={name}
              onChange={(e) => { setName(e.target.value); validateName(e.target.value); }}
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </Col>
          <Col md={3}>
            <input
              type="text"
              className={`form-control ${ageError ? 'is-invalid' : ''}`}
              placeholder="Enter age"
              value={age}
              onChange={(e) => { setAge(e.target.value); validateAge(e.target.value); }}
            />
            {ageError && <div className="invalid-feedback">{ageError}</div>}
          </Col>
          <Col md={3}>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                checked={isActive === 1}
                onChange={handleActiveChange}
                id="isActiveCheck"
              />
              <label className="form-check-label" htmlFor="isActiveCheck">
                IsActive
              </label>
            </div>
          </Col>
          <Col md={3}>
            <button className="btn btn-primary" onClick={handleSave}>
              Submit
            </button>
            <Button variant="secondary" onClick={handleLogout} className="logout-button">
              <FiLogOut /> Déconnexion
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col md={10}>
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher un employé"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
        </Row>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Age</th>
              <th>IsActive</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData && filteredData.length > 0 ? filteredData.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.name}</td>
                <td>{item.age}</td>
                <td>{item.isActive ? 'Active' : 'Inactive'}</td>
                <td>
                  {showDeleted ? (
                    <Button className="btn btn-warning" onClick={() => handleRestore(item.id)}><AiOutlineRollback /></Button>
                  ) : (
                    <>
                      <Button className="btn btn-danger" onClick={() => handleDelete(item.id)}><AiFillDelete /></Button>
                      <Button className="btn btn-info" onClick={() => handleEdit(item)}><AiFillEdit /></Button>
                    </>
                  )}
                </td>
              </tr>
            )) : <tr><td colSpan="5">Loading...</td></tr>}
          </tbody>
        </Table>
      </Container>

      <Modal show={editModalShow} onHide={() => setEditModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Employee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <input
              type="text"
              className={`form-control ${nameError ? 'is-invalid' : ''}`}
              placeholder="Enter Name"
              value={name}
              onChange={(e) => { setName(e.target.value); validateName(e.target.value); }}
            />
            {nameError && <div className="invalid-feedback">{nameError}</div>}
          </div>
          <div className="mt-3">
            <input
              type="text"
              className={`form-control ${ageError ? 'is-invalid' : ''}`}
              placeholder="Enter age"
              value={age}
              onChange={(e) => { setAge(e.target.value); validateAge(e.target.value); }}
            />
            {ageError && <div className="invalid-feedback">{ageError}</div>}
          </div>
          <div className="mt-3 form-check">
            <input
              className="form-check-input"
              type="checkbox"
              checked={isActive === 1}
              onChange={handleActiveChange}
              id="isActiveCheckModal"
            />
            <label className="form-check-label" htmlFor="isActiveCheckModal">
              IsActive
            </label>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModalShow(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdate}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Fragment>
  );
};

export default CRUD;
