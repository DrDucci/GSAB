const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const moviesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'movies.json'), 'utf8'));

app.get('/api/movies', (req, res) => {
    res.json(moviesData);
});

//Bara för filler men inte viktigt
app.post('/submit-form', (req, res) => {
    const { name, email, comment } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ error: 'Name and email are required' });
    }

    console.log('Form submission received:', { name, email, comment });
    
    res.json({ 
        success: true,
        message: 'Thank you for your submission!'
    });
});

app.get('/:page', (req, res) => {
    const page = req.params.page;
    const filePath = path.join(__dirname, 'public', `${page}.html`);
    
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});