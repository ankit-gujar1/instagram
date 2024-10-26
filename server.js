const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 8080; // Use environment port or default to 3000
const TARGET = 'https://www.instagram.com';

// Middleware to block requests containing "/reels" in the path
const blockReelsMiddleware = (req, res, next) => {
    if (req.url.includes('/reels') || req.url.includes('/explore')) {
        res.status(403).send('This content is blocked.');
    } else {
        next();
    }
};

// Use the blocking middleware
app.use(blockReelsMiddleware);

// Proxy middleware configuration
app.use(
    '/',
    createProxyMiddleware({
        target: TARGET,
        changeOrigin: true,
        pathRewrite: (path) => path,
        onProxyReq: (proxyReq, req, res) => {
            // Forward User-Agent and any authentication headers
            proxyReq.setHeader('User-Agent', req.headers['user-agent'] || '');
            if (req.headers.cookie) {
                proxyReq.setHeader('Cookie', req.headers.cookie);
            }
        },
        onProxyRes: (proxyRes, req, res) => {
            // Set cookies from Instagram back to the client
            if (proxyRes.headers['set-cookie']) {
                res.setHeader('set-cookie', proxyRes.headers['set-cookie']);
            }
        }
    })
);


// Start the server
app.listen(PORT, () => {
    console.log(`Proxy server running on port ${PORT}`);
});
