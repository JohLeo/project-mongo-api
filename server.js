import express from "express";
import cors from "cors";
import mongoose, { Schema } from "mongoose";

import topMusicData from "./data/top-music.json";

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/project-mongo";
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = Promise;

// Defines the port the app will run on. Defaults to 8080, but can be overridden
// when starting the server. Example command to overwrite PORT env variable value:
// PORT=9000 npm start
const port = process.env.PORT || 8080;
const app = express();


// Add middlewares to enable cors and json body parsing
app.use(cors());
app.use(express.json());



const songSchema = new Schema({
  "id": Number,
  "trackName": String,
  "artistName": String,
  "genre": String,
  "bpm": Number,
  "energy": Number,
  "danceability": Number,
  "loudness": Number,
  "liveness": Number,
  "valence": Number,
  "length": Number,
  "acousticness": Number,
  "speechiness": Number,
  "popularity": Number
});

const Song = mongoose.model("Song", songSchema);

if (process.env.RESET_DB) {
  const resetDatabase = async () => {
    await Song.deleteMany();
    topMusicData.forEach((singleSong) => {
      const newSong = new Song(singleSong);
      newSong.save()
    })
  }
  resetDatabase();
  // you can also call a function while declairing it - google this
}

// Start defining your routes here
app.get("/", (req, res) => {
  res.send("Hi hello!");
});

app.get("/songs", async (req, res) => {  
  const { genre, danceability } = req.query;
  const response = {
    success: true,
    body:{}
  }
  // Regex is for strings only
  const genreRegex = new RegExp(genre);
  const danceabilityQuery = {$gt: danceability ? danceability : 0 };
  try {
    const searchResultFromDb = await Song.find({genre: genreRegex, 
      danceability: danceabilityQuery  });
  
  if (searchResultFromDb) {
    response.body = searchResultFromDb
    res.status(200).json(response)
  } else {
    response.success = false,
    res.status(500).json(response)
  }
} catch(e) {
  response.success = false,
  res.status(500).json(response)
}
});



app.get("/songs/id/:id", async (req, res) => {
  try {
    const singleSong = await Song.findById(req.params.id);
    if (singleSong) {
      res.status(200).json({
        success: true,
        body: singleSong
      })
    } else {
      res.status(404).json({
        success: false,
        body: {
          message: "Song not found"
        }
      })
    }
  } catch(e) {
    res.status(500).json({
      success: false,
      body: {
        message: e
      }
    })
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
