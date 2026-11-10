const express = require("express");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024
  }
});

app.get("/", (req, res) => {
  res.send("FruitDrama Lip Sync API fonctionne !");
});

// Envoyer une vidéo MP4 et un audio MP3 à Sync.so
app.post(
  "/api/generate",
  upload.fields([
    { name: "video", maxCount: 1 },
    { name: "audio", maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const video = req.files?.video?.[0];
      const audio = req.files?.audio?.[0];

      if (!video || !audio) {
        return res.status(400).json({
          error: "Il faut importer une vidéo MP4 et un audio MP3."
        });
      }

      const form = new FormData();

      form.append(
        "video",
        new Blob([video.buffer], {
          type: video.mimetype || "video/mp4"
        }),
        video.originalname
      );

      form.append(
        "audio",
        new Blob([audio.buffer], {
          type: audio.mimetype || "audio/mpeg"
        }),
        audio.originalname
      );

      form.append("model", "lipsync-2");

      const response = await fetch(
        "https://api.sync.so/v2/generate",
        {
          method: "POST",
          headers: {
            "x-api-key": process.env.SYNC_API_KEY
          },
          body: form
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json(data);
      }

      res.status(201).json({
        success: true,
        jobId: data.id,
        status: data.status
      });

    } catch (error) {
      console.error(error);

      res.status(500).json({
        error: error.message
      });
    }
  }
);

// Vérifier l'avancement de la vidéo
app.get("/api/status/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.sync.so/v2/generate/${encodeURIComponent(req.params.id)}`,
      {
        headers: {
          "x-api-key": process.env.SYNC_API_KEY
        }
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("FruitDrama API démarrée !");
});
