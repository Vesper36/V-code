#!/usr/bin/env node
/**
 * Domain Manager Service
 * 轻量 HTTP 服务，运行在 VPS 宿主机上 (127.0.0.1:9876)
 * 提供 Nginx 反代 + Certbot SSL 自动配置
 */

const http = require('http');
const { execSync, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const PORT = 9876;
const HOST = '0.0.0.0';
const SECRET = process.env.DOMAIN_MANAGER_SECRET || 'v-code-domain-mgr-2024';
const NGINX_SITES = '/etc/nginx/sites-enabled';
const NGINX_AVAILABLE = '/etc/nginx/sites-available';

// --- Helpers ---

function jsonResponse(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); }
      catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function execCmd(cmd) {
  try {
    return { ok: true, output: execSync(cmd, { encoding: 'utf8', timeout: 60000 }).trim() };
  } catch (e) {
    return { ok: false, output: e.stderr || e.message };
  }
}

function validateAuth(req) {
  const auth = req.headers['x-auth-token'];
  return auth === SECRET;
}

function isValidDomain(domain) {
  return /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain);
}

function isValidPort(port) {
  const p = parseInt(port, 10);
  return p > 0 && p < 65536;
}

// --- Nginx Config Template ---

function generateNginxConfig(domain, port, cors = false) {
  let locationBlock = `
    location / {
        proxy_pass http://127.0.0.1:${port};
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";`;

  if (cors) {
    locationBlock += `

        # CORS
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization' always;

        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*';
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
            add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization';
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }`;
  }

  locationBlock += `
    }`;

  return `server {
    listen 80;
    server_name ${domain};
${locationBlock}
}
`;
}

// --- Parse existing nginx config ---

function parseNginxSite(filename) {
  const filepath = path.join(NGINX_SITES, filename);
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const domainMatch = content.match(/server_name\s+([^;]+);/);
    const portMatch = content.match(/proxy_pass\s+https?:\/\/127\.0\.0\.1:(\d+)/);
    const hasSSL = content.includes('ssl_certificate') || content.includes('listen 443 ssl');
    const hasCORS = content.includes('Access-Control-Allow-Origin');
    const domain = domainMatch ? domainMatch[1].trim() : filename;
    const port = portMatch ? parseInt(portMatch[1], 10) : null;
    return { filename, domain, port, ssl: hasSSL, cors: hasCORS };
  } catch {
    return { filename, domain: filename, port: null, ssl: false, cors: false };
  }
}

// --- Route: List domains ---

function handleList(req, res) {
  try {
    const files = fs.readdirSync(NGINX_SITES).filter(f => !f.startsWith('.') && f !== 'default');
    const domains = files.map(parseNginxSite);
    jsonResponse(res, 200, { domains });
  } catch (e) {
    jsonResponse(res, 500, { error: 'Failed to list domains: ' + e.message });
  }
}

// --- Route: Add domain ---

async function handleAdd(req, res) {
  let body;
  try { body = await readBody(req); }
  catch { return jsonResponse(res, 400, { error: 'Invalid JSON body' }); }

  const { domain, port, cors, ssl } = body;

  if (!domain || !isValidDomain(domain)) {
    return jsonResponse(res, 400, { error: 'Invalid domain: ' + domain });
  }
  if (!port || !isValidPort(port)) {
    return jsonResponse(res, 400, { error: 'Invalid port: ' + port });
  }

  // Check if config already exists
  const configPath = path.join(NGINX_SITES, domain);
  if (fs.existsSync(configPath)) {
    return jsonResponse(res, 409, { error: 'Domain config already exists: ' + domain });
  }

  try {
    // 1. Write nginx config
    const config = generateNginxConfig(domain, port, !!cors);
    const availPath = path.join(NGINX_AVAILABLE, domain);
    fs.writeFileSync(availPath, config, 'utf8');

    // 2. Create symlink in sites-enabled
    const enabledPath = path.join(NGINX_SITES, domain);
    if (!fs.existsSync(enabledPath)) {
      fs.symlinkSync(availPath, enabledPath);
    }

    // 3. Test nginx config
    const testResult = execCmd('sudo nginx -t 2>&1');
    if (!testResult.ok) {
      // Rollback
      try { fs.unlinkSync(enabledPath); } catch {}
      try { fs.unlinkSync(availPath); } catch {}
      return jsonResponse(res, 500, { error: 'Nginx config test failed: ' + testResult.output });
    }

    // 4. Reload nginx
    execCmd('sudo nginx -s reload');

    // 5. Optionally run certbot for SSL
    let sslResult = null;
    if (ssl !== false) {
      const certCmd = `sudo certbot --nginx -d ${domain} --non-interactive --agree-tos --register-unsafely-without-email 2>&1`;
      sslResult = execCmd(certCmd);
    }

    jsonResponse(res, 201, {
      message: 'Domain added successfully',
      domain, port, cors: !!cors,
      ssl: sslResult ? sslResult.ok : false,
      sslOutput: sslResult ? sslResult.output : null,
    });
  } catch (e) {
    jsonResponse(res, 500, { error: 'Failed to add domain: ' + e.message });
  }
}

// --- Route: Delete domain ---

function handleDelete(req, res, domain) {
  if (!domain || !isValidDomain(domain)) {
    return jsonResponse(res, 400, { error: 'Invalid domain' });
  }

  const enabledPath = path.join(NGINX_SITES, domain);
  const availPath = path.join(NGINX_AVAILABLE, domain);

  if (!fs.existsSync(enabledPath) && !fs.existsSync(availPath)) {
    return jsonResponse(res, 404, { error: 'Domain config not found: ' + domain });
  }

  try {
    // 1. Remove symlink and config
    try { fs.unlinkSync(enabledPath); } catch {}
    try { fs.unlinkSync(availPath); } catch {}

    // 2. Test and reload nginx
    const testResult = execCmd('sudo nginx -t 2>&1');
    if (testResult.ok) {
      execCmd('sudo nginx -s reload');
    }

    // 3. Optionally revoke cert (just delete, don't revoke)
    execCmd(`sudo certbot delete --cert-name ${domain} --non-interactive 2>&1`);

    jsonResponse(res, 200, { message: 'Domain removed', domain });
  } catch (e) {
    jsonResponse(res, 500, { error: 'Failed to delete domain: ' + e.message });
  }
}

// --- Route: Update domain (edit port/cors) ---

async function handleUpdate(req, res, domain) {
  if (!domain || !isValidDomain(domain)) {
    return jsonResponse(res, 400, { error: 'Invalid domain' });
  }

  let body;
  try { body = await readBody(req); }
  catch { return jsonResponse(res, 400, { error: 'Invalid JSON body' }); }

  const { port, cors, ssl } = body;
  if (!port || !isValidPort(port)) {
    return jsonResponse(res, 400, { error: 'Invalid port' });
  }

  // Remove old config, write new one
  const availPath = path.join(NGINX_AVAILABLE, domain);
  const enabledPath = path.join(NGINX_SITES, domain);

  try {
    const config = generateNginxConfig(domain, port, !!cors);
    fs.writeFileSync(availPath, config, 'utf8');
    if (!fs.existsSync(enabledPath)) {
      fs.symlinkSync(availPath, enabledPath);
    }

    const testResult = execCmd('sudo nginx -t 2>&1');
    if (!testResult.ok) {
      return jsonResponse(res, 500, { error: 'Nginx test failed: ' + testResult.output });
    }
    execCmd('sudo nginx -s reload');

    // Re-run certbot if SSL requested
    let sslResult = null;
    if (ssl !== false) {
      const certCmd = `sudo certbot --nginx -d ${domain} --non-interactive --agree-tos --register-unsafely-without-email 2>&1`;
      sslResult = execCmd(certCmd);
    }

    jsonResponse(res, 200, {
      message: 'Domain updated',
      domain, port, cors: !!cors,
      ssl: sslResult ? sslResult.ok : false,
    });
  } catch (e) {
    jsonResponse(res, 500, { error: 'Failed to update domain: ' + e.message });
  }
}

// --- HTTP Server ---

const server = http.createServer(async (req, res) => {
  // Auth check
  if (!validateAuth(req)) {
    return jsonResponse(res, 401, { error: 'Unauthorized' });
  }

  const url = new URL(req.url, `http://${HOST}:${PORT}`);
  const pathname = url.pathname;

  // Route: GET /domains
  if (req.method === 'GET' && pathname === '/domains') {
    return handleList(req, res);
  }

  // Route: POST /domains
  if (req.method === 'POST' && pathname === '/domains') {
    return handleAdd(req, res);
  }

  // Route: PUT /domains/:domain
  const putMatch = pathname.match(/^\/domains\/([^/]+)$/);
  if (req.method === 'PUT' && putMatch) {
    return handleUpdate(req, res, decodeURIComponent(putMatch[1]));
  }

  // Route: DELETE /domains/:domain
  const delMatch = pathname.match(/^\/domains\/([^/]+)$/);
  if (req.method === 'DELETE' && delMatch) {
    return handleDelete(req, res, decodeURIComponent(delMatch[1]));
  }

  // Health check
  if (req.method === 'GET' && pathname === '/health') {
    return jsonResponse(res, 200, { status: 'ok', uptime: process.uptime() });
  }

  jsonResponse(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  console.log(`Domain Manager Service running on ${HOST}:${PORT}`);
});
