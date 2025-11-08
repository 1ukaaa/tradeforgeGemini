require("dotenv").config();
const axios = require("axios");

const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.get('/', (req, res) => {
  res.send('Backend OK - Journal Trading IA');
});
app.use(express.json());

const promptBuilders = {
  "analysis.v1": (rawText) => `
Tu es un assistant de journal de trading, expert des marchés dérivés.
Analyse le contenu fourni et restitue un rapport ultra synthétique en français en respectant STRICTEMENT ce format markdown :

TYPE : (Analyse ou Trade) — écris le mot complet.

1. 🔭 Contexte multi-timeframes (Monthly / Weekly / Daily)
2. 🧭 Zones clés & stratégie (Daily)
3. ⏱️ Structure intraday (H4 / H1 / M15)
4. 🎯 Scénario proposé (uniquement si le trade n'est pas encore exécuté)
5. ⚠️ Risques & invalidations
6. ✅ Next steps / synthèse finale

Règles :
- Style professionnel, phrases courtes, aucune redite.
- Utilise des listes à puces pour les niveaux et arguments.
- Termine par une synthèse chiffrée si des niveaux sont mentionnés.

CONTENU SOURCE :
${rawText}
  `,
};

app.post('/api/gemini', async (req, res) => {
  const { rawText, template = "analysis.v1" } = req.body;
  if (!rawText || typeof rawText !== "string") {
    return res.status(400).json({ result: "Texte d'analyse manquant." });
  }
  try {
    const promptBuilder = promptBuilders[template] || ((text) => text);
    const prompt = promptBuilder(rawText);

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );

    // Extraction de la réponse Gemini
    const result =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Aucune réponse valide de Gemini.";
    res.json({ result });
  } catch (err) {
    console.error("Erreur Gemini :", err?.response?.data || err.message);
    res.status(500).json({ result: "Erreur réelle Gemini API." });
  }
});

app.listen(5050, () => {
  console.log('Server started on port 5050');
});
