import axios from 'axios';
import { toast } from 'react-toastify';

export const createRoom = async () => {
  let roomId;

  //sending request to server to provide room token
  await axios.post('https://teamscloneserver.herokuapp.com/room/create')
  .then(res => roomId = res.data)
  .catch(err => toast.error('Error creating room: ' + err));
  
  //unique room ID returned
  return roomId;
}