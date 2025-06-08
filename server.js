const path = require('path');
const fs = require('fs');
const http = require('http');

const PORT = 3000;
const PUBLIC_DIR = path.join(dirname, 'public');

const server = http.createServer((req, res) => {
  // Simple CORS handling
  if (req.method === 'OPTIONS') {
    // Handle preflight requests
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  // API endpoint for movies
  if (req.url === '/api/movies' && req.method === 'GET') {
    try {
      const data = fs.readFileSync(path.join(dirname, 'movies.json'), 'utf8');
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      });
      return res.end(data);
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'Could not load movies data' }));
    }
  }

  // Add this endpoint before the static files handler
if (req.url === '/api/transformed-movies' && req.method === 'GET') {
  try {
    const imdbData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/imdb.json')));
    const transformed = imdbData.data.map(movie => ({
      id: movie._id,
      title: movie.title,
      year: movie.year,
      rating: movie.avgRating
    }));
    
    res.writeHead(200, {'Content-Type': 'application/json'});
    return res.end(JSON.stringify(transformed));
  } catch (err) {
    res.writeHead(500);
    return res.end(JSON.stringify({error: 'Transformation failed'}));
  }
}

  // Serve static files
  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);

  // Security: Prevent directory traversal
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  // Default to index.html for non-file requests (SPA supporFt)
  const ext = path.extname(filePath);
  if (!ext) {
    filePath = path.join(PUBLIC_DIR, 'index.html');
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
      '.jpg': 'image/jpeg'
    }[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log('Server running at http://localhost:${PORT}');
});