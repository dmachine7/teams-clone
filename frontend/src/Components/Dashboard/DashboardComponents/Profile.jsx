import React, { useEffect, useState } from "react";
import { userRef, logOut } from "../../../Helper/Firebase";
import "../Dashboard.css";
import { toast } from "react-toastify";
import Loader from "../../Loader/Loader";

const Profile = ({ user }) => {

  const { uid } = user && user;
  const [userDetails, setUserDetails] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    setUserDetails(null);
    
    userRef.doc(uid).get()
    .then((item) => {
      if (item.exists) {
        setUserDetails(item.data());
      }
    })
  }, [uid]);

  const handleChange = (e) => {
    setNewStatus(e.target.value);
  }

  const handleSubmit = async () => {
    userRef.doc(uid).update({
      status: newStatus
    }).then(() => toast.success('Status updated'));
  }

  if (userDetails) {
    return (
      <div className="db-comp-profile">
        <img src={userDetails && userDetails.photoURL} alt='no image found' />
        <div className="db-comp-profile-info">
          <h3>Profile overview</h3>
          <div>
            { userDetails.displayName } <br />
            Email: { userDetails.email } <br />
            ID: { userDetails.uid }
          </div>
          <h3>Status</h3>
          <div>
            <h4><em>Current status: </em>{ newStatus ? newStatus : userDetails.status } </h4>
            <input className='input-box' value={newStatus} placeholder='Type your new status...' onChange={(e) => handleChange(e)} />
            <button className='input-button' onClick={handleSubmit}>Update status</button>
          </div>
          <button onClick={logOut} id='logout-button'>Log Out</button>
        </div>
      </div>
    );
  } else {
    return <Loader />
  }  
};

export default Profile;
