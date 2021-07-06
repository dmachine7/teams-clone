import React from 'react';
import { Redirect } from "react-router-dom";
import landing from '../../Assets/illust/undraw_through_the_park_lxnl.svg';
import Login from '../Login/Login.jsx';
import './Landing.css';

const Landing = () => {
  //check if the user is already logged in
  const sessionCheck = localStorage.getItem('user');

  return (
    <div className='landing'>
      { sessionCheck ? <Redirect to='/dashboard' /> : null }
      <img src={landing} alt='Welcome' />
      <h3> Welcome to Teams! </h3>
      <p>A place where you can meet and greet friends, hold office meetings and conversations, and organize tasks.</p>
      <Login />
    </div>
  );
}

export default Landing;