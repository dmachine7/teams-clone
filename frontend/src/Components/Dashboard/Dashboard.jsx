/**
 * Dashboard component [Authorized users only]
 * @description contains side navigation menu to switch between tabs
 */

import React, { useEffect, useContext, useState } from "react";
import { UserContext } from "../../Provider/User";
import { userRef } from "../../Helper/Firebase";
import { Redirect } from "react-router-dom";

//icons and styling
import { RiTeamLine } from "react-icons/ri";
import { CgSoftwareDownload } from "react-icons/cg";
import { FaRegCalendarPlus, FaRegUser } from "react-icons/fa";
import "./Dashboard.css";

//imported components separately
import Meeting from "./DashboardComponents/Meeting";
import Teams from "./DashboardComponents/Teams";
import Profile from "./DashboardComponents/Profile";
import Loader from "../Loader/Loader";
import Download from "./DashboardComponents/Download";

const Dashboard = () => {
  const user = useContext(UserContext);
  const [userDetails, setUserDetails] = useState(null);
  const sessionCheck = localStorage.getItem("user");
  const [redirect, setRedirect] = useState(null);
  const [component, setComponent] = useState(null);

  //check if user is logged in
  useEffect(() => {
    if (!sessionCheck) {
      setRedirect("/");
    }
    fetchUser();
  }, [user]);

  const fetchUser = () => {
    if (user && !userDetails) {
      userRef
        .doc(user.uid)
        .get()
        .then((doc) => {
          if (doc.exists) {
            setUserDetails(doc.data());
          }
        });
    }
  };

  //render only when user details fetched
  if (user && userDetails) {
    return (
      <div className="dashboard">
        {redirect ? <Redirect to={redirect} /> : null}
        <div className="dashboard-sidenav">
          <button onClick={() => setComponent(<Teams user={userDetails && userDetails} />)}>
            <RiTeamLine /> <br /> <p>Teams</p>
          </button>
          <button onClick={() => setComponent(<Meeting user={user && user} />)}>
            <FaRegCalendarPlus /> <br /> <p>Meeting</p>
          </button>
          <button onClick={() => setComponent(<Profile user={user} />)}>
            <FaRegUser /> <br /> <p>Profile</p>
          </button>
          <button onClick={() => setComponent(<Download />)}>
            <CgSoftwareDownload /> <br /> <p>Download</p>
          </button>
        </div>
        {component ? component : <Meeting user={user && user} />}
      </div>
    );
  } else {
    return (
      <div>
        {redirect ? <Redirect to={redirect} /> : null} {fetchUser()} <Loader />
      </div>
    );
  }
};

export default Dashboard;
