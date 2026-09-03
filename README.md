# QuickUpload — Frontend

React + Vite frontend for QuickUpload, a lightweight file-upload portal.
Login/register, an authenticated dashboard for uploading/managing files
(any type, up to 500 MB), and an Admin Panel for managing users and viewing
every uploaded file. Pairs with the
[backend](https://github.com/SushilPJS/quickupload-backend) (FastAPI +
PostgreSQL).

## Local development

Requires Node.js 18+ and the backend running locally (see the backend repo).

```bash
npm install
npm run dev
```

Open `http://localhost:5174`. The Vite dev server proxies `/api/*` to
`http://localhost:8001`, so the browser sees the frontend and API as the same
origin — no CORS configuration needed in dev, and cookie-based auth behaves
identically to production.

Register a new account, or log in with an admin account created via the
backend's `create_admin.py`.

## Production build

```bash
npm run build      # outputs static files to dist/
```

Serve `dist/` with nginx, reverse-proxying `/api` to the backend on the
**same origin** — this is what makes the backend's `COOKIE_SECURE=true` +
SameSite cookies + CSRF double-submit pattern work without any cross-origin
CORS configuration. On an EC2 instance already running another app, this is
a separate `server` block for its own subdomain, pointing at the backend's
own port:

```nginx
server {
    listen 443 ssl http2;
    server_name upload.tekmo.in;

    ssl_certificate     /etc/letsencrypt/live/upload.tekmo.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/upload.tekmo.in/privkey.pem;

    # Slightly above MAX_UPLOAD_SIZE_MB in the backend's .env (headroom for
    # multipart overhead); extend timeouts to match since the limit is large.
    client_max_body_size 520m;
    client_body_timeout 300s;

    root /opt/quickupload/frontend/dist;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }

    location / {
        try_files $uri /index.html;   # client-side routing (React Router)
    }
}
```

See the [backend README](https://github.com/SushilPJS/quickupload-backend)
for provisioning PostgreSQL, PM2 process management, and the full security
notes for the API this frontend talks to.

## Structure

```
src/
├── api/client.js          axios instance (CSRF header injection, relative /api base)
├── components/            Navbar, ProtectedRoute, FileUpload, FileList
├── context/AuthContext.jsx  current-user state, login/register/logout
└── pages/                  LoginPage, RegisterPage, DashboardPage, AdminPanelPage
```

---

*This project was created for testing/audit purposes.*
