/**
 * Main room component
 * @param {passStream} user stream
 * @param {token} room unique id
 * @description set up peer to peer connection
 * @returns connection between peers [video/audio/chat]
 */

import React, { useEffect, useState, useContext } from 'react';
import './Room.css';
import io from 'socket.io-client';
import Peer from 'peerjs';
import { UserContext } from "../../Provider/User";

//assets and icons
import { BiMicrophone, BiMicrophoneOff, BiCamera, BiCameraOff } from 'react-icons/bi';
import { IoHandRightOutline } from 'react-icons/io5';
import { MdScreenShare, MdStopScreenShare } from 'react-icons/md';
import { ImExit } from 'react-icons/im';
import { toast } from 'react-toastify';
import { WhatsappIcon, WhatsappShareButton, EmailShareButton, EmailIcon } from 'react-share';

//set up a connection through socket.io client
const socket = io.connect('https://teamscloneserver.herokuapp.com');

//will return new message dom element
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

//main room component
const RoomOnStream = ({ passStream, token, stopStream }) => {
  const user = useContext(UserContext);
  const peers = [];

  //media states
  const [audioState, setAudio] = useState(true);
  const [videoState, setVideo] = useState(true);
  const [myMessage, setMessage] = useState("");
  const [screenShare, setScreenShare] = useState(false);
  const [myStream, setMyStream] = useState(passStream)

  //initializing unique peer id for user
  const peer = new Peer(undefined, {
    host: 'teamscloneserver.herokuapp.com',
    port: 443,
    path: '/peerjs/app',
    secure: true
  });

  //to add stream in my dom
  const addStream = (video, parentDiv, stream, videoGrid) => {
    video.srcObject = stream;
    video.addEventListener('click', () => {
      let screen = document.getElementById('share-screen-grid');
      let bigVideo = document.createElement('video');
      bigVideo.srcObject = stream;
      bigVideo.addEventListener('loadedmetadata', () => {
        bigVideo.play()
      })
      bigVideo.addEventListener('click', () => {
        bigVideo.remove()
      })
      if (screen.hasChildNodes()) {
        screen.replaceChild(bigVideo, screen.childNodes[0]);
      } else {
        screen.appendChild(bigVideo)
      }
    })
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

  //to connect to user and make a call
  const connectToUser = async (userId, stream, videoGrid, uid, name) => {
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
      parentDiv.remove();
    })

    peers[userId] = call;
  }

  //closing and removing disconnected peers
  const closeCall = (userId) => {
    if (peers[userId]) peers[userId].close();
  }

  //setting up my stream and handling event emitters after component mounting
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
  
    //socket events
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
      updateScroll();
    })
    
  }, [myStream]);

  const updateScroll = () => {
    var element = document.getElementById("chat-box");
    if (element) {
      element.scrollTop = element.scrollHeight;
    }
  }

  //toggle video handler
  const toggleVideo = (e) => {
    e.preventDefault();
    const myVideo = document.getElementById(user.uid);
    const mystream = myVideo.srcObject.getVideoTracks()[0];
    mystream.enabled ? mystream.enabled = false : mystream.enabled = true;
    setVideo(!videoState);
    return;
  }

  //toggle audio handler
  const toggleAudio = (e) => {
    e.preventDefault();
    const myVideo = document.getElementById(user.uid);
    const mystream = myVideo.srcObject.getAudioTracks()[0];
    mystream.enabled ? mystream.enabled = false : mystream.enabled = true;
    setAudio(!audioState);
    return;
  }

  //raise hand emitter
  const raiseHand = (e) => {
    e.preventDefault();
    const name = user && user.displayName ? user.displayName : "Someone"
    socket.emit('notification', token, name);
  }

  //peer disconnection and redirection
  const leaveCall = (e) => {
    e.preventDefault();
    peer.disconnect();
    socket.disconnect();
    toast.warn('Leaving room ...')
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

  //real time messaging handler
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

  //share screen handler
  const shareScreen = (e, screenState) => {
    e.preventDefault();

    let stopScreenStream = () => {
      let elem = document.getElementById('share-screen-stream-video');
      if (elem) {
        let obj = elem.srcObject.getVideoTracks();
        obj.forEach(item => {
          item.enabled = false;
          item.stop();
        })
      }
      if (peers[peer.id]) peers[peer.id].close()
      peer.disconnect()
    }
    
    if (screenState) {
      window.navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      }).then(stream => {
        peer.listAllPeers((res) => {
          res.forEach((id) => {
            let metadata = {
              myId: 'share-screen-stream-video',
              myName: user && user.displayName
            }
            peer.call(id, stream, {metadata})
          })
        })
        stream.getVideoTracks()[0].onended = function () {
          setScreenShare(false);
          stopScreenStream();
        }
        const name = user && user.displayName ? user.displayName : "Someone"
        socket.emit('send-message', token, name, "I am presenting. Click to zoom in/ click on big screen to zoom out.", new Date().toLocaleTimeString().substring(0,7))
        
      })
    } else {
      stopScreenStream()
    }

    setScreenShare(screenState);
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

        <div id='chat-box'></div>

        <div className='room-utility'>

          <div>
            <input placeholder="Type your message..." value={myMessage} onChange={(e) => messageHandler(e)} className='input-box' style={{ width: '100%' }}/>
            <button className='input-button' onClick={() => sendMessage()}>Send</button>
          </div>

          <div>
            <button 
              title={ videoState ? "Turn video off" : "Turn video on" } 
              onClick={(e) => toggleVideo(e)} className='utility-button'
            > 
              { videoState ? <BiCamera /> : <BiCameraOff /> } 
            </button>

            <button 
              title={ audioState ? "Turn audio off" : "Turn audio on" } 
              onClick={(e) => toggleAudio(e)} className='utility-button'
            > 
              { audioState ? <BiMicrophone /> : <BiMicrophoneOff /> } 
            </button>

            <button 
              title={ screenShare ? "Please click stop sharing in dialog box" : "Share screen" }
              onClick={(e) => shareScreen(e, !screenShare)} className='utility-button'
            > 
              { screenShare ? <MdStopScreenShare /> : <MdScreenShare /> } 
            </button>

            <button title="Raise hand" onClick={(e) => raiseHand(e)} className='utility-button'> 
              <IoHandRightOutline /> 
            </button>

            <button title="Leave call" onClick={(e) => leaveCall(e)} className='utility-button'>
              <ImExit />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default RoomOnStream;