import React, { useEffect, useState, useContext } from 'react';
import './Room.css';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { UserContext } from "../../Provider/User";
import { Redirect, useHistory } from 'react-router-dom';
import { BiMicrophone, BiMicrophoneOff, BiCamera, BiCameraOff, BiPhone } from 'react-icons/bi';
import { IoHandRightOutline } from 'react-icons/io5';
// import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';
import { toast } from 'react-toastify';
import { WhatsappIcon, WhatsappShareButton, EmailShareButton, EmailIcon } from 'react-share';

//our server is hosted by socket.io for peer to peer connection
const socket = io.connect('http://localhost:8000');

const createMsg = (name, msg, time) => {
  const msgDiv = document.createElement('div');
  msgDiv.setAttribute('class', 'message-div')
  const nameSpan = document.createElement('span');
  const nameTag = document.createElement('h5');
  const timeTag = document.createElement('h6');
  nameTag.innerHTML = name && name;
  timeTag.innerHTML = time && time;
  nameSpan.appendChild(nameTag);
  nameSpan.appendChild(timeTag);
  const msgBody = document.createElement('p');
  msgBody.innerHTML = msg;
  msgDiv.appendChild(nameSpan);
  msgDiv.appendChild(msgBody);
  return msgDiv;
};

const RoomOnStream = ({ passStream, token, stopStream }) => {
  const user = useContext(UserContext);
  const peers = [];
  const [audioState, setAudio] = useState(true);
  const [videoState, setVideo] = useState(true);
  const [myMessage, setMessage] = useState("");
  const myStream = passStream;

  const peer = new Peer(undefined, {
    host: 'localhost',
    port: 8000,
    path: '/peerjs/app'
  });

  const addStream = (video, parentDiv, stream, videoGrid) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    if (parentDiv) {
      parentDiv.appendChild(video)
      videoGrid.appendChild(parentDiv);
    } else {
      videoGrid.appendChild(video);
    }
  }

  const connectToUser = async (userId, stream, videoGrid, uid, name) => {
    console.log(userId, uid)
    //making call
    let metadata = {
      myName: user && user.displayName ? user.displayName : null,
      myId: user && user.uid ? user.uid : null
    };
    const call = peer.call(userId, stream, {metadata});
    const parentDiv = document.createElement('div');
    const videoName = document.createElement('h6');
    videoName.innerHTML = name;
    parentDiv.appendChild(videoName);
    const video = document.createElement('video');
    video.setAttribute('id', uid);
    call.on('stream', userVideoStream => {
      addStream(video, parentDiv, userVideoStream, videoGrid)
    })
    call.on('close', () => {
      console.log('onclose')
      parentDiv.remove();
    })

    peers[userId] = call;
  }

  const closeCall = (userId) => {
    console.log('close')
    console.log(userId);
    if (peers[userId]) peers[userId].close();
  }

  useEffect(async () => {

    //DOM references
    const videoGrid = document.getElementById('video-grid');
    const messageBox = document.getElementById('chat-box');
    
    //peer connection open and socket join room event triggered
    peer.on('open', id => {
      socket.emit('join-room', token, id, user && user.displayName ? user.displayName : id, user && user.uid ? user.uid : id);
    })

    peer.on('close', id => {
      socket.emit('leave-room', token, id, user && user.displayName ? user.displayName : id);
    })

    if (myStream) {
      const parentDiv = document.createElement('div');
      const videoName = document.createElement('h6');
      videoName.innerHTML = user ? user.displayName : null;
      parentDiv.appendChild(videoName);
      const myVideo = document.createElement('video');
      myVideo.setAttribute('id', user ? user.uid : null);
      
      myVideo.muted = true;
      addStream(myVideo, parentDiv, myStream, videoGrid);
    }
    
    //recieving calls
    peer.on('call', (call) => {
      call.answer(myStream);
      
      const metaData = call.metadata;
      console.log(metaData.myId);
      const parentDiv = document.createElement('div');
      const videoName = document.createElement('h6');
      videoName.innerHTML = metaData.myName;
      parentDiv.appendChild(videoName);
      const video = document.createElement('video');
      video.setAttribute('id', metaData.myId);
      call.on('stream', userStream => {
        addStream(video, parentDiv, userStream, videoGrid);
      })
      call.on('close', () => {
        parentDiv.remove()
      })
      peers[call.peer] = call;
    })
  
    socket.on('user-connected', async (userId, name, uid) => {
      toast.info(name + ' joined', { autoClose: 700 });
      setTimeout(() => { connectToUser(userId, myStream, videoGrid, uid, name) }, 1000)
    })

    socket.on('user-disconnected', (userId, name) => {
      toast.warn(name + ' left', { autoClose: 800 });
      closeCall(userId);
    })

    socket.on('notify-room', name => {
      toast.dark(name + " raised hand", { autoClose: 2500 });
    })

    socket.on('message', (name, msg, time) => {
      const box = createMsg(name, msg, time);
      messageBox.appendChild(box);
    })
    
  }, []);

  const toggleVideo = (e) => {
    e.preventDefault();
    const myVideo = document.getElementById(user.uid);
    const mystream = myVideo.srcObject.getVideoTracks()[0];
    if (mystream.enabled == false) {
      mystream.enabled = true;
      setVideo(!videoState);
      return;
    }
    if (mystream.enabled == true) {
      mystream.enabled = false;
      setVideo(!videoState);
      return;
    }
  }

  const toggleAudio = (e) => {
    e.preventDefault();
    const myVideo = document.getElementById(user.uid);
    const mystream = myVideo.srcObject.getAudioTracks()[0];
    if (mystream.enabled == false) {
      mystream.enabled = true;
      setAudio(!audioState);
      return;
    }
    if (mystream.enabled == true) {
      mystream.enabled = false;
      setAudio(!audioState);
      return;
    }
  }

  const raiseHand = (e) => {
    e.preventDefault();
    const name = user && user.displayName ? user.displayName : "Someone"
    socket.emit('notification', token, name);
  }

  const leaveCall = (e) => {
    e.preventDefault();
    socket.disconnect();
    setTimeout(() => {
      if (myStream) {
        myStream.getVideoTracks().forEach(item => item.stop());
        myStream.getAudioTracks().forEach(item => item.stop());
      }
      if (passStream) {
        passStream.getVideoTracks().forEach(item => item.stop());
        passStream.getAudioTracks().forEach(item => item.stop());
      }
      stopStream();
    }, 1000);
  }

  const messageHandler = (e) => {
    e.preventDefault();
    setMessage(e.target.value);
  }

  const sendMessage = () => {
    const name = user && user.displayName ? user.displayName : "Someone"
    if (myMessage) {
      socket.emit('send-message', token, name, myMessage, new Date().toLocaleTimeString().substring(0,7))
    }
    setMessage("")
  }

  return (
    <div className='room'>
      <div className='room-video' id='video-grid'>
        <div id='share-screen-grid'></div>
      </div>
      <div className='room-chat' id='log'>
        <div className='room-id-share'>
          <div>
            Welcome to Room: <br />
            {token} <br />
          </div>
          <div>
            <WhatsappShareButton
              url={token}
              title={'[TEAM MEETING ALERT] Hello! Copy this meeting ID after logging in'}
              separator={" -> "}
            >
              <WhatsappIcon size={26} />
            </WhatsappShareButton>
            <EmailShareButton
              url={token}
              subject={'TEAM MEETING ALERT'}
              body={'Hello! We are having a discussion. Please copy this meeting ID after logging in to join'}
              separator={" -> "}
            >
              <EmailIcon size={26} />
            </EmailShareButton>
          </div>
        </div>
        <div id='chat-box'>

        </div>
        <div className='room-utility'>
          <div>
            <input placeholder="Type your message..." value={myMessage} onChange={(e) => messageHandler(e)} className='input-box' style={{ width: '100%' }}/>
            <button className='input-button' onClick={() => sendMessage()}>Send</button>
          </div>
          <div>
            <button title={ videoState ? "Turn video off" : "Turn video on" } onClick={(e) => toggleVideo(e)} className='utility-button'> { videoState ? <BiCamera /> : <BiCameraOff /> } </button>
            <button title={ audioState ? "Turn audio off" : "Turn audio on" } onClick={(e) => toggleAudio(e)} className='utility-button'> { audioState ? <BiMicrophone /> : <BiMicrophoneOff /> } </button>
            <button title="Raise hand" onClick={(e) => raiseHand(e)} className='utility-button'> <IoHandRightOutline /> </button>
            <button title="Leave call" onClick={(e) => leaveCall(e)} className='utility-button'> <BiPhone /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomOnStream;