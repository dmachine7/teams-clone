const express = require('express');
const router = express.Router();
const { v4 : uuidv4 } = require('uuid');

router.post('/create', (req, res, next) => {
  //unique token for room
  const token = uuidv4();  
  res.send(token);
});

module.exports = router;