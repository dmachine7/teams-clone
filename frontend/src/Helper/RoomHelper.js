import axios from 'axios';
import { toast } from 'react-toastify';

export const createRoom = async () => {
  let roomId;

  //setting up headers to avoid cross-origin error [CORS]
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  await axios.post('/room/create', {}, headers)
  .then(res => roomId = res.data)
  .catch(err => toast.error('Error creating room: ' + err));
  
  //unique room ID returned
  return roomId;
}