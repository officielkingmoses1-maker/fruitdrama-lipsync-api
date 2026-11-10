const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("FruitDrama Lip Sync API fonctionne !");
});

// Créer une synchronisation labiale
app.post("/api/generate", async (req, res) => {
  try {
    const { videoUrl, audioUrl } = req.body;

    if (!videoUrl || !audioUrl) {
      return res.status(400).json({
        error: "Il faut fournir une vidéo et un audio."
      });
    }

    const response = await fetch("https://api.sync.so/v2/generate", {
      method: "POST",
      headers: {
        "x-api-key": process.env.SYNC_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "lipsync-2",
        input: [
          { type: "video", url: videoUrl },
          { type: "audio", url: audioUrl }
        ],
        options: {
          sync_mode: "cut_off"
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json({
      success: true,
      jobId: data.id,
      status: data.status
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Vérifier le résultat
app.get("/api/status/:id", async (req, res) => {
  try {
    const response = await fetch(
      `https://api.sync.so/v2/generate/${req.params.id}`,
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FruitDrama API démarrée sur le port ${PORT}`);
});
