# Flux Client (React + Vite)

## Requirements

- Node.js 18+ (recommended 20)
- npm

## Local dev

```bash
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173)

## Backend proxy

During development, the client proxies `/api/*` requests to the Go server:

- Client: [http://localhost:5173/api/](http://localhost:5173/api/)...
- Proxies to: [http://localhost:8080/api/](http://localhost:8080/api/)...

Make sure the Go server is running on port 8080.
