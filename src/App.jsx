import { useState } from 'react';
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";

function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentPage('home');
  };

  return (
    <div className="App">
      {currentPage === 'login' && <Login onNavigate={setCurrentPage} onLoginSuccess={handleLoginSuccess} />}
      {currentPage === 'signup' && <Signup onNavigate={setCurrentPage} />}
      {currentPage === 'home' && <Home user={user} onNavigate={setCurrentPage} />}
    </div>
  );
}

export default App;