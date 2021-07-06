import React, { useContext, useEffect, useState } from 'react';
import './Navbar.css';
import teamslogo from '../../Assets/logos/microsoft-teams-1.svg'
import { Link, Redirect } from 'react-router-dom';
import { UserContext } from "../../Provider/User";
import { findUser, logOut, updateUsers } from "../../Helper/Firebase";
import { FiEdit3 } from 'react-icons/fi';
import { createRoom } from '../../Helper/RoomHelper';
import { toast } from 'react-toastify';

const DropDown = (props) => {
  const { name, email, photo, id, verified, status } = props.user;

  const [showStatusInput, setShowStatusInput] = useState(false);
  const [newStatus, setNewStatus] = useState(status && status);

  const handleChange = (e) => {
    setNewStatus(e.target.value);
  }

  const handleSubmit = async () => {
    const user = {
      displayName: name,
      email: email,
      photoURL: photo,
      status: newStatus,
      emailVerified: verified,
      uid: id
    }
    await updateUsers(user);
    setShowStatusInput(!showStatusInput);
  }

  return (
    <div className='navbar-dropdown'>
      <div style={{display: "flex"}}>
        <img src={photo && photo} alt='profile' />
        <div>
          {name && name} <br />
          {email && email}
        </div>
      </div>
      <hr />
      <div className='dropdown-status'>
        Status: <span style={{ color: 'green' }}>{newStatus && newStatus}</span> &nbsp; <span onClick={() => {setShowStatusInput(!showStatusInput)}}><FiEdit3 /></span> <br />
        {
          showStatusInput ? <div><input placeholder='Type your new status...' onChange={(e) => handleChange(e)} /><button onClick={handleSubmit}>Update</button></div> : null
        }
        
      </div>
      <hr />
      <div>
        <button onClick={logOut} id='logout-button'>Log Out</button>
      </div>
    </div>
  );
};

const Navbar = () => {
  const userTemp = useContext(UserContext);
  const [user, setUser] = useState({
    name: "",
    verified: false,
    email: "",
    id: "",
    photo: "",
    status: ""
  });

  const [roomRedirect, setRedirect] = useState(null);
  const [join, setJoin] = useState(false);

  useEffect(async () => {
    if (userTemp && user.name == "") {
      let userUpdate = await findUser(userTemp.uid);
      if (userUpdate) {
        setUser({
          name: userUpdate.displayName,
          verified: userUpdate.emailVerified,
          email: userUpdate.email,
          id: userUpdate.uid,
          photo: userUpdate.photoURL,
          status: userUpdate.status
        })
      }
    }
  }, [userTemp, user, findUser]);

  const redirectToRoom = async (e) => {
    e.preventDefault();
    const roomId = await createRoom();
    toast.info('Joining room ...');
    return setRedirect(roomId);
  }

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
            { user.name && user.name } &nbsp; 
            <div className='profile-pic'>
              <img src={user.photo && user.photo} alt='profile' />
            </div>
          </>
        }
      </div>
    </div>
  );
}

export default Navbar;