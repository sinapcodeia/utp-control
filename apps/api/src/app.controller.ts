import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello(): string {
        return `
      <!DOCTYPE html>
      <html lang="es">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>UTP CONTROL | API Gateway</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
          <style>
              :root {
                  --bg: #0f172a;
                  --card: #1e293b;
                  --primary: #3b82f6;
                  --accent: #8b5cf6;
                  --text: #f8fafc;
                  --text-dim: #94a3b8;
                  --success: #22c55e;
              }
              body {
                  margin: 0;
                  padding: 0;
                  font-family: 'Inter', sans-serif;
                  background-color: var(--bg);
                  color: var(--text);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  height: 100vh;
                  overflow: hidden;
              }
              .container {
                  text-align: center;
                  background: var(--card);
                  padding: 4rem;
                  border-radius: 2.5rem;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  max-width: 600px;
                  width: 90%;
                  position: relative;
              }
              .container::before {
                  content: '';
                  position: absolute;
                  top: -2px;
                  left: -2px;
                  right: -2px;
                  bottom: -2px;
                  background: linear-gradient(45deg, var(--primary), var(--accent));
                  z-index: -1;
                  border-radius: 2.6rem;
                  opacity: 0.3;
              }
              h1 {
                  font-size: 3.5rem;
                  font-weight: 900;
                  margin: 0;
                  background: linear-gradient(to right, #60a5fa, #a78bfa);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
                  letter-spacing: -0.05em;
                  text-transform: uppercase;
              }
              p.subtitle {
                  font-size: 1.2rem;
                  color: var(--text-dim);
                  margin-top: 1rem;
                  font-weight: 500;
              }
              .status-badges {
                  display: flex;
                  gap: 1rem;
                  justify-content: center;
                  margin-top: 3rem;
              }
              .badge {
                  background: rgba(255, 255, 255, 0.05);
                  padding: 0.75rem 1.5rem;
                  border-radius: 1rem;
                  font-size: 0.9rem;
                  font-weight: 700;
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  display: flex;
                  align-items: center;
                  gap: 0.5rem;
              }
              .dot {
                  height: 8px;
                  width: 8px;
                  background-color: var(--success);
                  border-radius: 50%;
                  display: inline-block;
                  box-shadow: 0 0 10px var(--success);
                  animation: pulse 2s infinite;
              }
              @keyframes pulse {
                  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
                  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); }
                  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
              }
              footer {
                  margin-top: 4rem;
                  color: var(--text-dim);
                  font-size: 0.8rem;
                  font-weight: 600;
                  text-transform: uppercase;
                  letter-spacing: 0.1em;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <h1>UTP CONTROL API</h1>
              <p class="subtitle">Servicio de Backend Operativo y Seguro</p>
              <div class="status-badges">
                  <div class="badge">
                      <span class="dot"></span> Estado: En Línea
                  </div>
                  <div class="badge">
                      Puerto: 3001
                  </div>
              </div>
          </div>
          <footer>
              © 2026 UTP CONTROL - Advanced Regional Management Stack
          </footer>
      </body>
      </html>
    `;
    }
}
