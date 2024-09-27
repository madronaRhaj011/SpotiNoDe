// sRoutes.js
const express = require('express');
const router = express.Router();
const masterController = require('../controller/masterController');

// Display all songs (playlist)
router.get('/', masterController.showSpot);

// Upload a new song
router.post('/uploadSong', masterController.songUpload);

// Play the selected song
router.get('/playSong/:id', masterController.playSong);

// Delete a song
router.post('/deleteSong/:id', masterController.deleteSong);

module.exports = router;
