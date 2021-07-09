import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { userRef, teamsRef } from "../../../Helper/Firebase";
import "../Dashboard.css";
import './Teams.css';
import {
  WhatsappIcon,
  WhatsappShareButton,
  EmailShareButton,
  EmailIcon,
} from "react-share";
import team1 from '../../../Assets/illust/team-1.svg';
import team2 from '../../../Assets/illust/team-2.svg';
import { toast } from "react-toastify";
import Message from "./Message";

const ChatBox = ({ members, id, name, me, uid }) => {

  const leaveTeam = (e) => {
    e.preventDefault();
    if (me && uid && id) {
      teamsRef.doc(id).update({
        members: firebase.firestore.FieldValue.arrayRemove({
          membername: me,
          memberid: uid
        })
      });
      
      userRef.doc(uid).update({
        teams: firebase.firestore.FieldValue.arrayRemove(id)
      }).then(() => toast.warn('Team left'))

    } else {
      toast.error('Error leaving team')
    }
    console.log('succese')
  }
  
  return (
    <div className='team-chat-box'>
      <div className='team-chat-box-head'> 
        <h2> {name} </h2>
        <h6>
          {id} &nbsp;
          <WhatsappShareButton
            url={id}
            title={"[JOIN TEAM] Hello! Here is the team code to join"}
            separator={" -> "}
          >
            <WhatsappIcon size={22} />
          </WhatsappShareButton>
          <EmailShareButton
            url={id}
            subject={"JOIN TEAM"}
            body={" Hello! Here is the team code to join"}
            separator={" -> "}
          >
            <EmailIcon size={22} />
          </EmailShareButton>
        </h6>
      </div>
      <div className='team-chat-box-detail'>
        <div className='team-chat-box-member'>
          <button className='leave-team-button' onClick={(e) => leaveTeam(e)}>Leave team</button>
          <h4>Members</h4>
          {
            members.map(item => {
              return <h6> {item.membername && item.membername} </h6>
            })
          }
        </div>
        <div className='team-chat-box-msg'>
          <Message roomId={id} user={me && me} />
        </div>
      </div>
    </div>
  )
}

const Teams = ({ user }) => {
  const [teams, setTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [userDetails, setUserDetails] = useState(null);
  const [currentTeam, setCurrentTeam] = useState(null);

  const { displayName, uid } = user && user;

  const [newTeam, setNewTeam] = useState({
    message: [
      {
        msg: 'Team created',
        timestamp: new Date().getTime()/1000,
        sender: displayName
      }
    ],
    members: [
      {
        memberid: uid,
        membername: displayName
      }
    ],
    meeting: [],
    name: ''
  });

  const [joinCode, setJoincode] = useState("")
  const { name } = newTeam;

  useEffect(() => {
    setUserDetails(null);
    setMyTeams([]);
    
    userRef.onSnapshot((doc) => {
      doc.forEach((item) => {
        if (item.exists && item.id == uid) {
          setUserDetails(item.data());
          setMyTeams(item.data().teams)
        }
      })
    })
  }, [uid]);

  useEffect(() => {
    teamsRef.onSnapshot((doc) => {
      setTeams([])
      doc.forEach(item => {
        if (item.exists && myTeams.includes(item.id)) {
          setTeams(e => [...e, {data: item.data(), id: item.id} ])
        }
      })
    })
  }, [myTeams])

  const inputHandler = (e, property) => {
    setNewTeam({...newTeam, [property]: e.target.value});
  }

  const createTeam = async (e) => {
    e.preventDefault();
    teamsRef.add(newTeam)
    .then((docRef) => {
      if (userDetails && userDetails.teams) {
        userDetails.teams.push(docRef.id)
        toast.success('New Team added');
        userRef.doc(uid).set(userDetails, {merge: true});
      }
    })
    .catch(err => toast.error('Error creating team'))
  }

  const joinTeam = (e) => {
    e.preventDefault();
    if (userDetails && userDetails.teams) {
      teamsRef.doc(joinCode).update({
        members: firebase.firestore.FieldValue.arrayUnion({
          membername: displayName,
          memberid: uid
        })
      });
      userDetails.teams.push(joinCode)
      userRef.doc(uid).set(userDetails, {merge: true});
      toast.success('Team joined');
    }
    setJoincode('')
  }

  return (
    <div className="db-comp-parent">
      <div className="db-comp-nav">
        <h2>Teams</h2>
        <hr />
        <div>
          <button className='navbar-button' onClick={() => setCurrentTeam(null)}> Create or join team </button>
        </div>
        <hr />
        <div>
          <h4>Your teams</h4>
          <div>
            {teams && teams.map((item) => {
              const members = item.data.members && item.data.members;
              const name = item.data.name && item.data.name;
              const id = item.id && item.id;
              return (
                <button className='switch-team-button'
                  onClick={() => setCurrentTeam(<ChatBox members={members} name={name} id={id} me={displayName && displayName} uid={uid && uid} />)}
                > {name} </button>
              )
            })}
          </div>
        </div>
      </div>
      { currentTeam ? 
        <div className="db-comp-main">
          { currentTeam }
        </div> : 
        <div className="db-comp-main">
          <div className='db-comp-meeting'>
            <img src={team1} alt='image' />
            <input placeholder='Team name' value={name} onChange={(e) => inputHandler(e, 'name')} />
            <button onClick={(e) => createTeam(e)}> Create Team </button>
          </div>
          <div className='db-comp-meeting'>
            <img src={team2} alt='image' />
            <input placeholder='Enter the code you recieved' value={joinCode} onChange={(e) => setJoincode(e.target.value)} id='join-team-code' />
            <button style={{backgroundColor: 'limegreen'}} onClick={(e) => joinTeam(e)} >Join Team</button>
          </div>
        </div>
      }
    </div>
  );
};

export default Teams;
