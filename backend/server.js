import express from "express";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ 
    status: "AI Summarizer API ✅", 
    endpoints: ["/summarize (POST)"],
    version: "1.0.0"
  });
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/summarize", async (req, res) => {
  console.log("📥 Summarize request received:", req.body?.text?.substring(0, 50));
  console.log("🔑 API Key loaded:", process.env.OPENAI_API_KEY ? "YES ✅" : "NO ❌");
  
  if (!req.body.text?.trim()) {
    return res.json({ summary: "❌ Empty text" });
  }
  
  if (!process.env.OPENAI_API_KEY) {
    return res.json({ summary: "✅ Backend works! Add valid OPENAI_API_KEY to .env" });
  }

  try {
    console.log("🤖 Calling OpenAI...");
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{
        role: "user",
        content: `Summarize this in 2-3 sentences:\n\n${req.body.text.slice(0, 3000)}`
      }],
      max_tokens: 150
    });
    
    const summary = completion.choices[0].message.content.trim();
    console.log("✅ SUCCESS:", summary.substring(0, 50));
    res.json({ summary });
    
  } catch (error) {
    console.error("❌ FULL OpenAI ERROR:", error.message);
    console.error("❌ ERROR OBJECT:", JSON.stringify(error, null, 2));
    
    res.json({ summary: `OpenAI Error: ${error.message}` });
  }
});


app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
});
