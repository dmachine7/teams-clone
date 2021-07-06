import React, { useEffect, useContext, useState } from 'react';
import { UserContext } from "../../Provider/User";
import { userRef, teamsRef } from "../../Helper/Firebase";
import { Redirect } from "react-router-dom";
import { RiTeamLine } from 'react-icons/ri';
import { CgNotes, CgSoftwareDownload } from 'react-icons/cg';
import { FaRegCalendarPlus, FaRegUser } from 'react-icons/fa';
import './Dashboard.css';
import Meeting from './DashboardComponents/Meeting';
import Teams from './DashboardComponents/Teams';
import Profile from './DashboardComponents/Profile';
import Loader from '../Loader/Loader';

const Dashboard = () => {
  const user = useContext(UserContext);
  const [userDetails, setUserDetails] = useState(null);
  const [teamDeatils, setTeamDetails] = useState([]);
  const sessionCheck = localStorage.getItem("user");
  const [redirect, setRedirect] = useState(null);
  const [component, setComponent] = useState(null);

  useEffect(() => {
    if (!(sessionCheck)) {
      setRedirect("/");
    }
    fetchUser()
  }, [user]);

  const fetchUser = async () => {
    if (user && !userDetails) {
      await userRef.doc(user.uid).get()
      .then((doc) => {
        if(doc.exists) {
          console.log(doc.data());
          setUserDetails(doc.data());
          fetchTeams(doc.data().teams);
        }
      })
    }
  }

  const fetchTeams = (teams) => {
    console.log('fired')
    setTeamDetails([])
    teams && teams.map(id => {
      console.log(id)
      teamsRef.doc(id).get()
      .then((item) => {
        console.log(item.data())
        if (item.exists) {
          setTeamDetails(e => [...e, {data: item.data(), id: item.id} ])
        }
      })
    })
  }

  if (user && userDetails && teamDeatils) {
    return (
      <div className="dashboard">
        { redirect ? <Redirect to={redirect} /> : null }
        <div className='dashboard-sidenav'>
          <button onClick={() => setComponent(<Teams user={userDetails && userDetails} />)}> <RiTeamLine /> <br /> <p>Teams</p> </button>
          <button onClick={() => setComponent(<Meeting user={user && user} />)}> <FaRegCalendarPlus /> <br /> <p>Meeting</p> </button>
          <button onClick={() => setComponent(<Profile user={user} />)}> <FaRegUser /> <br /> <p>Profile</p> </button>
          {/* <button> <CgNotes /> <br /> <p>Notes</p> </button> 
          <button> <CgSoftwareDownload /> <br /> <p>Download</p> </button> */}
        </div>
        { component ? component : <Meeting user={user && user} /> }
      </div>
    );
  } else {
    return <div> { redirect ? <Redirect to={redirect} /> : null } <Loader /> </div>
  }
}

export default Dashboard;