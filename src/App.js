import React, { useState, useEffect } from "react";
import './App.css';
import CRUD from './CRUD';
import Login from './login';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuth(true);
    }
  }, []);

  return (
    <div className="App">
      {isAuth ? <CRUD setAuth={setIsAuth} /> : <Login setAuth={setIsAuth} />}
    </div>
  );
}

export default App;
