// masterController.js
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const songModel = require('../model/EmModel');

// Set up multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Set upload directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save with a timestamp to avoid duplicates
  }
});

const upload = multer({ storage: storage });

const spot = {
  // Show the page with the playlist
  showSpot: (req, res) => {
    songModel.getAllSongs((err, songs) => {
      if (err) {
        return res.status(500).send('Database Error');
      }
      res.render('kiss', { songs: songs }); // Pass songs (with titles) to the view
    });
  },

  // Handle song upload with title extraction from file name
  songUpload: (req, res) => {
    upload.single('songFile')(req, res, function (err) {
      if (err) {
        return res.status(500).send('Upload Error');
      }

      const filePath = req.file.path;
      const originalName = req.file.originalname;
      const title = path.parse(originalName).name; // Extract the file name without the extension

      // Add song to the database
      songModel.addSong(filePath, title, (err, result) => {
        if (err) {
          return res.status(500).send('Database Error');
        }
        res.redirect('/'); // Redirect to the playlist page after uploading
      });
    });
  },

  // Stream the selected song
  playSong: (req, res) => {
    const songId = req.params.id;

    songModel.getSongById(songId, (err, song) => {
      if (err || !song) {
        return res.status(404).send('Song not found');
      }

      const filePath = path.resolve(song.path);

      fs.stat(filePath, (err, stats) => {
        if (err) {
          return res.status(404).send('File not found');
        }

        const range = req.headers.range;
        if (!range) {
          return res.status(416).send('Range header required');
        }

        const fileSize = stats.size;
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunkSize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'audio/mpeg',
        };

        res.writeHead(206, head);
        fileStream.pipe(res);
      });
    });
  },
  deleteSong: (req, res) => {
    const songId = req.params.id;

    songModel.getSongById(songId, (err, song) => {
      if (err || !song) {
        return res.status(404).send('Song not found');
      }

      const filePath = path.resolve(song.path);

      // Delete the song file
      fs.unlink(filePath, (err) => {
        if (err) {
          return res.status(500).send('Failed to delete the file');
        }

        // Remove song from the database
        songModel.deleteSongById(songId, (err, result) => {
          if (err) {
            return res.status(500).send('Database Error');
          }
          res.redirect('/'); // Redirect to the playlist page after deletion
        });
      });
    });
  }
};

module.exports = spot;
