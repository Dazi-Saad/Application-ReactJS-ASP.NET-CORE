import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const Logout = ({ setAuth }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Supprimer le token d'authentification des cookies
      Cookies.remove('authToken');
      setAuth(false);
      // Rediriger vers la page de connexion
      navigate('/login');
    }, 10000); // 10 secondes

    return () => clearTimeout(timer);
  }, [navigate, setAuth]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    setAuth(false);
    navigate('/login');
  };

  return (
    <button onClick={handleLogout}>
      Quitter
    </button>
  );
};

export default Logout;
