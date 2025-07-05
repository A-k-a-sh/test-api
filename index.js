const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const port = 8080;
const app = express();
const fs = require('fs');

const cors = require('cors');
app.use(cors());



app.get('/formats', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).json({ error: 'Missing URL' });

    const scriptPath = path.resolve('./yt_dlp_handler/main.py');

    const python = spawn('python3', [scriptPath, 'formats', videoUrl]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error(`Script error: ${stderr}`);
            return res.status(500).json({ error: 'Failed to get formats' });
        }

        try {
            const formats = JSON.parse(stdout);
            // console.log(formats);
            res.status(200).json(formats );
        } catch (e) {
            console.error(`JSON parse error: ${e}`);
            res.status(500).json({ error: 'Failed to parse formats' });
        }
    });
});

app.get('/download', (req, res) => {
    const { url, format } = req.query;
    if (!url || !format) return res.status(400).json({ error: 'Missing parameters' });

    console.log(url , format);

    const scriptPath = path.resolve('./yt_dlp_handler/main.py');
    const python = spawn('python3', [scriptPath, 'download', url, format]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', data => { stdout += data.toString(); });
    python.stderr.on('data', data => { stderr += data.toString(); });

    fs.unlinkSync('./yt_dlp_handler/downloads');

    python.on('close', code => {
        if (code !== 0) {
            console.error('Error:', stderr);
            return res.status(500).json({ error: 'Download failed' });
        }

        try {
            const { filename } = JSON.parse(stdout);
            const filePath = path.resolve('./yt_dlp_handler/downloads', filename);

            res.download(filePath, filename, err => {
                if (err) console.error('Send error:', err);
                fs.unlink(filePath, err => {
                    if (err) console.error('Cleanup error:', err);
                });
            });
        } catch (e) {
            console.error('Parse error:', e);
            fs.unlinkSync('./yt_dlp_handler/downloads');
            res.status(500).json({ error: 'Invalid response from Python' });
            
        }
    });
});


app.get('/get-download-url', (req, res) => {
    const { url, format } = req.query;

    if (!url || !format) {
        return res.status(400).json({ error: 'Missing parameters' });
    }

    const scriptPath = path.resolve('./yt_dlp_handler/main.py');

    const python = spawn('python3', [scriptPath, 'get_url', url, format]);

    let stdout = '';
    let stderr = '';

    python.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    python.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    python.on('close', (code) => {
        if (code !== 0) {
            console.error(`Script error: ${stderr}`);
            return res.status(500).json({ error: 'Failed to get URL' });
        }

        try {
            const data = JSON.parse(stdout);
            res.status(200).json(data);
        } catch (e) {
            console.error(`JSON parse error: ${e}`);
            res.status(500).json({ error: 'Failed to parse direct URL' });
        }
    });
});

app.listen(port, () => {
    console.log(`App is listening at port: ${port}`);
})

