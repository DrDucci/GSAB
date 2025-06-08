const path = require('path');
const fs = require('fs');
const http = require('http');
const connect = require('./db');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.url === '/api/movies' && req.method === 'GET') {
    try {
      const db = await connect();
      const movies = await db.collection('movies').find({}).toArray();
      
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      });
      return res.end(JSON.stringify(movies));
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Could not fetch movies from database' }));
    }
  }

  if (req.url.startsWith('/api/movies/') && req.method === 'GET') {
    const id = parseInt(req.url.split('/')[3]); 
    
    if (isNaN(id)) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Invalid movie ID' }));
    }

    try {
      const db = await connect();
      const movie = await db.collection('movies').findOne({ id });
      
      if (!movie) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Movie not found' }));
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(movie));
    } catch (err) {
      console.error('❌ MongoDB error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Server error' }));
    }
  }
let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'main.html' : req.url);

if (!filePath.startsWith(PUBLIC_DIR)) {
  res.writeHead(403);
  return res.end('Forbidden');
}

const ext = path.extname(filePath);
if (!ext) {
  filePath = path.join(PUBLIC_DIR, 'main.html');
}


  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        return res.end('Not found'); 
      }
      res.writeHead(500);
      return res.end('Server error');
    }

    const contentType = {
      '.html': 'text/html',
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml'
    }[ext.toLowerCase()] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});