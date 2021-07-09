import React, { useEffect, useState } from "react";
import firebase from "firebase";
import { toast } from "react-toastify";
import { teamsRef } from "../../../Helper/Firebase";
import "../Dashboard.css";
import './Teams.css';

const Message = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    teamsRef.doc(roomId).onSnapshot({
    // Listen for document metadata changes
    includeMetadataChanges: true
    },(doc) => {
      setMessages([]);
      if (doc.exists) {
        setMessages(doc.data().message);
        updateScroll();
      }
    })
  }, [roomId]);

  const updateScroll = () => {
    var element = document.getElementById("tcb-msg-comp");
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  const sendMessage = (e) => {
    e.preventDefault();
    let currentTime = new Date().getTime()/1000;
    teamsRef.doc(roomId).update({
      message: firebase.firestore.FieldValue.arrayUnion({
        msg: newMessage,
        sender: user || "User",
        timestamp: currentTime
      })
    }).then(() => {console.log('done')})
    .catch(err => toast.error('Error sending message'));
    setNewMessage('');
  }

  return (
    <div className='tcb-msg-comp' id='tcb-msg-comp'>
      {
        messages && messages.map((item, index) => {
          const { msg, sender, timestamp } = item && item;
          return (
            <div className='message-div' key={index} style={{ width: 'max-content', minWidth: '300px' }}>
              <span>
                <h5> {sender || "Undefined"} </h5>
                <h6> {new Date(timestamp*1000).toLocaleString()} </h6>
              </span>
              <p>
                {msg || "Error displaying message please reload"}
              </p>
            </div>
          )
        })
      }
      <div className='tcb-msg-input'>
        <input placeholder='Type your message' value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
        <button onClick={(e) => {sendMessage(e)}}> Send </button>
      </div>
    </div>
  )
};

export default Message;
