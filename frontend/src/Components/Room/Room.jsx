import React, { useState } from 'react';
import './Room.css';
import RoomOnStream from './RoomOnStream';
import camera from '../../Assets/illust/camera.svg';
import { Redirect } from 'react-router-dom';
import { toast } from 'react-toastify';

const Room = (props) => {
  const token = props.match.params.room;
  const sessionCheck = localStorage.getItem("user");

  const [myStream, setStream] = useState(null);

  const askAccess = () => {
    window.navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(stream => {
      window.localStream = stream;
      setStream(stream)
    }).catch(err => {
      toast.error('Please allow camera access and reload');
    });
  };

  const stopAccess = () => {
    if (window.localStream) {
      console.log(window.localStream.getVideoTracks())
      window.localStream.getVideoTracks().forEach(item => item.stop());
      window.localStream.getAudioTracks().forEach(item => item.stop());
      window.localStream = null;
    }
    if (myStream) {
      myStream.getVideoTracks().forEach(item => item.stop());
      myStream.getAudioTracks().forEach(item => item.stop());
    }
    setTimeout(() => window.location.replace('/dashboard'), 500)
  }

  if (sessionCheck) {
    if (myStream) {
      return <RoomOnStream passStream={myStream} token={token} stopStream={stopAccess} />
    } else {
      return (
        <div className='access-message'>
          <img src={camera} alt="Loading..." width="25%" /> <br />
          <h3>Please allow camera and microphone access. You can turn them on/off later too. {askAccess()} </h3>
        </div>
      ) 
    }
  } else {
    return <Redirect to='/' />
  }
}

export default Room;