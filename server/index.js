/**
 * MSDAT Production Server
 *
 * This Express server serves the Vue.js SPA and handles social media crawler requests
 * by returning pre-rendered HTML with proper meta tags for social sharing.
 *
 * Usage:
 *   Development: npm run server:dev
 *   Production: npm run server:start
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const compression = require('compression');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');

// Import crawler middleware
const { crawlerMiddleware } = require('./middleware/crawlerMiddleware');

// Create Express app
const app = express();

// Configuration
const PORT = process.env.PORT || 3000;
const DIST_PATH = path.join(__dirname, '../dist');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Trust proxy for correct protocol detection behind reverse proxies
app.set('trust proxy', 1);

// Security middleware (helmet)
// CSP disabled to avoid blocking app scripts - let Nginx handle CSP if needed
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false, // Allow embedding maps and external content
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS configuration — CORS_EXTRA_ORIGINS (comma-separated) adds allowlist entries for
// Render, previews, and other frontends. Example: https://msdat-xxx.onrender.com
const defaultProdOrigins = [
  'https://msdat.fmohconnect.gov.ng',
  'https://www.msdat.fmohconnect.gov.ng',
  'https://msdat2-staging.e4eweb.space',
];
const extraOrigins = (process.env.CORS_EXTRA_ORIGINS || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
const renderPublicUrl = (process.env.RENDER_EXTERNAL_URL || '').trim();
const productionOrigins = [
  ...defaultProdOrigins,
  ...extraOrigins,
  ...(renderPublicUrl ? [renderPublicUrl] : []),
];

app.use(cors({
  origin: IS_PRODUCTION
    ? (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (productionOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    }
    : true,
  credentials: true,
}));

// Compression middleware
app.use(compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
}));

// Request logging
app.use(morgan(IS_PRODUCTION ? 'combined' : 'dev'));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Indicator Metadata Endpoint (Mock DB Fetch)
app.get('/api/indicator/:id/metadata', (req, res) => {
  // Fallback defaults / Mock DB result
  res.json({
    id: req.params.id,
    name: 'Sample Indicator',
    definition: 'Total observed events as a proportion of the expected population.',
    formula: '(Numerator / Denominator) * 100',
    source: 'National Health Information Server',
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API version info
app.get('/api/version', (req, res) => {
  res.json({
    version: process.env.APP_VERSION || '1.0.0',
    buildDate: process.env.BUILD_DATE || new Date().toISOString(),
  });
});

// ============================================================
// CRAWLER MIDDLEWARE - Must come before static file serving
// This intercepts requests from social media bots and serves
// pre-rendered HTML with proper meta tags
// ============================================================
app.use(crawlerMiddleware);

// ============================================================
// STATIC FILE SERVING
// ============================================================

// Serve static files from the Vue build directory with caching
app.use(express.static(DIST_PATH, {
  maxAge: IS_PRODUCTION ? '1y' : 0,
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Don't cache index.html to ensure meta tags are always fresh
    if (filePath.endsWith('index.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    } else if (filePath.match(/\.(js|css)$/) && filePath.includes('.')) {
      // Cache assets with hashes in filename for longer
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(png|jpg|jpeg|gif|ico|svg|webp)$/)) {
      // Cache images
      res.setHeader('Cache-Control', 'public, max-age=86400');
    }
  },
}));

// ============================================================
// SPA FALLBACK - Serve index.html for all unmatched routes
// This enables client-side routing for the Vue app
// ============================================================
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }

  // Serve the Vue app's index.html
  return res.sendFile(path.join(DIST_PATH, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err);
      return res.status(500).send('Error loading application');
    }
    return undefined;
  });
});

// Error handling middleware
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Server error:', err);

  res.status(err.status || 500).json({
    error: IS_PRODUCTION ? 'Internal server error' : err.message,
    ...(IS_PRODUCTION ? {} : { stack: err.stack }),
  });
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════════════╗
  ║                    MSDAT Production Server                     ║
  ╠═══════════════════════════════════════════════════════════════╣
  ║  Status:      Running                                          ║
  ║  Port:        ${PORT.toString().padEnd(48)}║
  ║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(48)}║
  ║  Static:      ${DIST_PATH.substring(0, 48).padEnd(48)}║
  ╠═══════════════════════════════════════════════════════════════╣
  ║  Endpoints:                                                    ║
  ║    Health:    http://localhost:${PORT}/health                       ║
  ║    App:       http://localhost:${PORT}/                             ║
  ╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

module.exports = app;
