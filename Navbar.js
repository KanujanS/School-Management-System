import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/logo.jpg';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Dashboard</Link>
        <Link to="/attendance">Attendance</Link>
        <Link to="/assignments">Assignments</Link>
        <Link to="/marks">Marks</Link>
        <Link to="/notifications">Notifications</Link>
        <Link to="/register">Register</Link>
        <Link to="/login">Login</Link>
      </div>
      <div className="nav-right">
        <img src={logo} alt="School Logo" className="logo" />
      </div>
    </nav>
  );
}

export default Navbar;
