const db = require('../config/db');

const song = {
    addSong: (filePath, title, callback) => {
        const query = 'INSERT INTO songs (path, title) VALUES (?, ?)';
        db.query(query, [filePath, title], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result);
        });
    },

    getAllSongs: (callback) => {
        const query = 'SELECT * FROM songs';
        db.query(query, (err, results) => {
            if (err) {
                return callback(err);
            }
            callback(null, results);
        });
    },

    getSongById: (id, callback) => {
        const query = 'SELECT path FROM songs WHERE id = ?';
        db.query(query, [id], (err, result) => {
            if (err) {
                return callback(err);
            }
            callback(null, result[0]);
        });
    },
    deleteSongById: (id, callback) => {
        const query = 'DELETE FROM songs WHERE id = ?';
        db.query(query, [id], (err, result) => {
          if (err) {
            return callback(err);
          }
          callback(null, result);
        });
      }
};

module.exports = song;
