import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: any) {
  log("Development mode: serving client files statically");
  
  // In development, serve the client files directly from the client directory
  const clientPublicPath = path.resolve(__dirname, "..", "client", "public");
  const clientSrcPath = path.resolve(__dirname, "..", "client", "src");
  
  // Serve static assets from client/public
  if (fs.existsSync(clientPublicPath)) {
    app.use(express.static(clientPublicPath));
    log(`Serving static files from ${clientPublicPath}`);
  }
  
  // Simple development index.html that loads the React app
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    
    // Skip API routes
    if (url.startsWith('/api')) {
      return next();
    }
    
    try {
      const indexPath = path.resolve(clientPublicPath, "index.html");
      
      if (fs.existsSync(indexPath)) {
        // Read and serve the existing index.html
        let template = await fs.promises.readFile(indexPath, "utf-8");
        res.status(200).set({ "Content-Type": "text/html" }).end(template);
      } else {
        // Fallback development HTML
        const developmentHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Heinous Trivia - Development</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background: linear-gradient(135deg, #1a1a2e, #16213e, #0f0f23);
            color: white; 
            margin: 0; 
            padding: 2rem;
            text-align: center;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 3rem;
            background: rgba(0,0,0,0.7);
            border-radius: 15px;
            border: 1px solid rgba(255,107,107,0.3);
        }
        h1 { 
            color: #ff6b6b; 
            font-size: 3rem; 
            margin-bottom: 1rem;
            text-shadow: 0 0 20px rgba(255,107,107,0.5);
        }
        .status {
            color: #4ade80;
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(74,222,128,0.1);
            border-radius: 8px;
        }
        .api-test {
            margin-top: 2rem;
            padding: 1rem;
            background: rgba(123,97,255,0.1);
            border-radius: 8px;
        }
        button {
            background: linear-gradient(45deg, #ff6b6b, #bb86fc);
            border: none;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            cursor: pointer;
            margin: 0.5rem;
        }
        button:hover {
            opacity: 0.8;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Heinous Trivia</h1>
        <p>Development Server Active</p>
        <div class="status">Backend API Running on Port ${process.env.PORT || 5000}</div>
        
        <div class="api-test">
            <h3>API Test Panel</h3>
            <button onclick="testHealth()">Test Health Endpoint</button>
            <button onclick="testTrivia()">Test Trivia Questions</button>
            <button onclick="testAds()">Test Ads Endpoint</button>
            <div id="results" style="margin-top: 1rem; text-align: left; background: rgba(0,0,0,0.5); padding: 1rem; border-radius: 8px;"></div>
        </div>
    </div>
    
    <script>
        async function testEndpoint(url, name) {
            const results = document.getElementById('results');
            try {
                const response = await fetch(url);
                const data = await response.json();
                results.innerHTML += \`<div style="color: #4ade80; margin-bottom: 0.5rem;">✅ \${name}: \${response.status}</div>\`;
                results.innerHTML += \`<pre style="color: #ccc; font-size: 0.8rem; margin-bottom: 1rem;">\${JSON.stringify(data, null, 2).slice(0, 200)}...</pre>\`;
            } catch (error) {
                results.innerHTML += \`<div style="color: #ff6b6b; margin-bottom: 1rem;">❌ \${name}: \${error.message}</div>\`;
            }
        }
        
        function testHealth() {
            testEndpoint('/api/health', 'Health Check');
        }
        
        function testTrivia() {
            testEndpoint('/api/trivia-questions/headquarters', 'Trivia Questions');
        }
        
        function testAds() {
            testEndpoint('/api/ads/headquarters', 'Ads Endpoint');
        }
    </script>
</body>
</html>`;
        res.status(200).set({ "Content-Type": "text/html" }).end(developmentHtml);
      }
    } catch (e) {
      log(`Error serving development page: ${e}`);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}