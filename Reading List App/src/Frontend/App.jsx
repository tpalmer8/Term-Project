import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import './App.css'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Link,
} from "react-router-dom";
import Login from "./login";
import Home from "./home";
import ForgotPassword from "./ForgotPassword";
import Register from "./Register";
import TBR from './TBR';
import BookSearch from './BookSearch';
import ReadBooks from './ReadBooks'


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <section id="center">
              <div className="hero">
                <img src={heroImg} className="base" width="170" height="179" alt="" />
                <img src={reactLogo} className="framework" alt="React logo" />
                <img src={viteLogo} className="vite" alt="Vite logo" />
              </div>
              <div>
                <h1>Get started</h1>
                <p>
                  Edit <code>src/App.jsx</code> and save to test <code>HMR</code>
                </p>
              </div>
              <button
                className="counter"
                onClick={() => setCount((count) => count + 1)}
              >
                Count is {count}
              </button>

              <Link to="/login">
                <button className="login-button">
                  Go to Login
                </button>
              </Link>
            </section>
          } />
          <Route path="/home" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/tbr" element={<TBR />} />
          <Route path="/BookSearch" element={<BookSearch />} />
          <Route path="/read" element={<ReadBooks />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
