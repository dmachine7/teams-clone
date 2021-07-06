import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { userRef, teamsRef } from "../../../Helper/Firebase";
import "../Dashboard.css";
import team1 from '../../../Assets/illust/team-1.svg';
import team2 from '../../../Assets/illust/team-2.svg';
import { toast } from "react-toastify";

const Profile = ({ user }) => {

  useEffect(() => {
    console.log(user);
  }, []);

  return (
    <div className="db-comp-parent">
      <div className="db-comp-nav">
        <h2>Hello!</h2>
      </div>
      <div className="db-comp-main">
        
      </div>
    </div>
  );
};

export default Profile;
