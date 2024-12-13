const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
app.use(express.json());

const projectPaths = JSON.parse(process.env.PROJECT_PATHS);
const SECRET = process.env.SECRET;

function verifySignature(secret, payload, signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = 'sha256=' + hmac.update(payload).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

function handleWebhook(req, res) {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);

    console.log('Received webhook event');

    if (!verifySignature(SECRET, payload, signature)) {
        console.error('Invalid signature');
        return res.sendStatus(403);
    }

    const projectId = req.params.projectId;
    console.log(`Project ID from URL: ${projectId}`);

    const githubDir = projectPaths[projectId];

    if (!githubDir) {
        console.error('Unknown project');
        return res.sendStatus(400);
    }

    console.log(`Executing script for project: ${projectId} at directory: ${githubDir}`);
    exec(`bash /script.sh ${githubDir}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${stderr}`);
            return res.sendStatus(500);
        }
        console.log(`Script output: ${stdout}`);
        res.sendStatus(200);
    });
}

app.get('/', (req, res) => {
    res.send('Webhook server is running');
});

// Endpoint cho webhook với tên dự án trong URL
app.post('/webhook/:projectId', handleWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
