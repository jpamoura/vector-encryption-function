import e from "express";
import { encryptPayload } from './encryptVector.js';
import { decryptPayload } from "./decryptVector.js";
import { constants } from "./helpers.js";

const app = e();
app.use(e.json());

// Middleware CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Middleware para log de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`Headers:`, req.headers);
  console.log(`Body:`, req.body);
  next();
}); 

app.post("/getVector", (req, res) => {
  console.log("GetVector endpoint called with body:", req.body);
  const {data, timestamp, iv, appname: rawAppname } = req.body || {};
  const usePadding = req.query.usePadding ? req.query.usePadding : false;
  const appname = (rawAppname || constants.defaultAppname).trim() || constants.defaultAppname;
  
  try {
    console.log("Attempting to encrypt with:", { data: data?.substring(0, 20) + "...", appname, timestamp, iv });
    const encrypted = encryptPayload(data, appname, timestamp, iv, usePadding);
    console.log("Encryption successful");
    res.status(200).json(encrypted);
  }
  catch (err) {
    console.error("Encryption error:", err.message);
    res.status(500).json({ error: err.message });
  }
});



app.post("/decryptVector", (req, res) => {
  console.log("DecryptVector endpoint called with body:", req.body);
  const { x, y, z, appname: rawAppname } = req.body || {};
  const appname = (rawAppname || constants.defaultAppname).trim() || constants.defaultAppname;
  
  if (!x || !y || !z) {
    console.log("Missing required fields:", { x: !!x, y: !!y, z: !!z });
    return res.status(400).json({ error: "Missing x, y, or z in body." });
  }

  try {
    console.log("Attempting to decrypt with:", { appname, x: x.substring(0, 10) + "...", y: y.substring(0, 10) + "...", z: z.substring(0, 10) + "..." });
    const response = decryptPayload(z, appname, y, x);
    console.log("Decryption successful");
    res.status(200).json(response);
  } 
  catch (err) {
    console.error("Decryption error:", err.message);
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

// Test endpoint for GET requests
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Vector Encryption Function API",
    version: "1.0.0",
    endpoints: {
      "POST /getVector": "Encrypt data",
      "POST /decryptVector": "Decrypt data",
      "GET /health": "Health check"
    },
    timestamp: new Date().toISOString()
  });
});


// Middleware para capturar rotas não encontradas
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      "POST /getVector": "Encrypt data",
      "POST /decryptVector": "Decrypt data", 
      "GET /health": "Health check",
      "GET /": "API information"
    }
  });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`Available endpoints:`);
  console.log(`  POST /getVector - Encrypt data`);
  console.log(`  POST /decryptVector - Decrypt data`);
  console.log(`  GET /health - Health check`);
  console.log(`  GET / - API information`);
});
