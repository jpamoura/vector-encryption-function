import e from "express";
import { encryptPayload } from './encryptVector.js';
import { decryptPayload } from "./decryptVector.js";
import { constants } from "./helpers.js";

const app = e();
app.use(e.json()); 

app.post("/getVector", (req, res) => {
  const {data, timestamp, iv, appname: rawAppname } = req.body || {};
  const usePadding = req.query.usePadding ? req.query.usePadding : false;
  const appname = (rawAppname || constants.defaultAppname).trim() || constants.defaultAppname;
  
  try {
    const encrypted = encryptPayload(data, appname, timestamp, iv, usePadding);
    res.status(200).json(encrypted);
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.post("/decryptVector", (req, res) => {
  const { x, y, z, appname: rawAppname } = req.body || {};
  const appname = (rawAppname || constants.defaultAppname).trim() || constants.defaultAppname;
  
  if (!x || !y || !z) {
    return res.status(400).json({ error: "Missing x, y, or z in body." });
  }

  try {
    const response = decryptPayload(z, appname, y, x);
    res.status(200).json(response);
  } 
  catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check endpoint for Docker
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    service: "vector-encryption-function"
  });
});


const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
