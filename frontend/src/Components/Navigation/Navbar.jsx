/**
 * Navigation bar 
 * [Features] Start Meeting
 * [Features] Join Meeting
 * [Features] Name and profile picture
 */

import React, { useContext, useState } from 'react';
import './Navbar.css';
import teamslogo from '../../Assets/logos/microsoft-teams-1.svg'
import { Link, Redirect } from 'react-router-dom';
import { UserContext } from "../../Provider/User";
import { createRoom } from '../../Helper/RoomHelper';
import { toast } from 'react-toastify';

const Navbar = () => {

  const userTemp = useContext(UserContext);
  const [roomRedirect, setRedirect] = useState(null);
  const [join, setJoin] = useState(false);

  //start instant meeting handler
  const redirectToRoom = async (e) => {
    e.preventDefault();
    createRoom()
    .then(res => {
      toast.info('Joining room ...');
      setRedirect(res);
    })
    .catch(err => toast.error('Error creating room ...'))
    
  }

  //join meeting handler
  const joinRedirect = async (e) => {
    e.preventDefault();
    let id = document.getElementById('join-code').value;
    if (id) {
      toast.info('Joining room ...');
      setJoin(false);
      return setRedirect(id);
    }
    else toast.warning('Wrong code');
  }

  return (
    <div className="navbar">
      { 
        roomRedirect != null && roomRedirect.length > 0 ? 
        <Redirect to={{ pathname: "/room/" + roomRedirect }} /> 
        : null 
      }
      <div className="navbar-section">
        <img src={teamslogo} alt='logo'/> &nbsp;
        <Link to='/' className="navbar-homelink">
          Microsoft Teams Clone
        </Link>
      </div>
      <div className="navbar-profile">
        {
          !(userTemp) ? null : 
          <>
            <button className='navbar-button' onClick={(e) => redirectToRoom(e)}> Start meeting </button> &nbsp;
            <div>
              <button className='navbar-join' onClick={() => {setJoin(!join)}}> Join meeting </button>
              {
                !join ? null :
                <div className='navbar-join-input'>
                  <input placeholder='Enter the code you recieved' id='join-code' className='input-box'/>
                  <button onClick={(e) => joinRedirect(e)} className='input-button'>Join</button>
                </div>
              }
            </div>
            { userTemp.displayName && userTemp.displayName } &nbsp; 
            <div className='profile-pic'>
              <img src={userTemp.photoURL && userTemp.photoURL} alt='profile' />
            </div>
          </>
        }
      </div>
    </div>
  );
}

export default Navbar;