const express = require('express');
import { exec } from 'child_process';
import path from 'path';
const port = 8080;
const app = express();


app.get('/', (req, res) => {
    res.json({
        location: 'home',
        path: __dirname
    });
})

app.get('/download', (req, res) => {
    res.json({
        location: 'download',
        path: __dirname
    });
})

app.get('/format', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'Missing URL' });

    const scriptPath = path.resolve('./yt_dlp_handler/main.py');

    exec(`python3 ${scriptPath} formats "${videoUrl}"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: 'Failed to get formats' });

        try {
            const formats = JSON.parse(stdout);
            res.status(200).json({ formats });
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse formats' });
        }
    });
})


app.get('/get-download-url', (req, res) => {
    const { url, format } = req.query;
    if (!url || !format) return res.status(400).json({ error: 'Missing parameters' });

    const scriptPath = path.resolve('./yt_dlp_handler/main.py');

    exec(`python3 ${scriptPath} get_url "${url}" "${format}"`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: 'Failed to get URL' });

        try {
            const data = JSON.parse(stdout);
            res.status(200).json(data);
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse direct URL' });
        }
    });
})

app.listen(port, () => {
    console.log(`App is listening at port: ${port}`);
})

