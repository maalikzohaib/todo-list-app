import "dotenv/config";
import express, { type NextFunction, type Request, type Response } from "express";
import type { IncomingMessage, ServerResponse } from "http";
import type { Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const isVercel = Boolean(process.env.VERCEL);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "...";
      }

      log(logLine);
    }
  });

  next();
});

let serverPromise: Promise<Server> | null = null;

async function createServerInstance(): Promise<Server> {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });

    if (!isVercel) {
      throw err;
    } else {
      console.error(err);
    }
  });

  if (app.get("env") === "development" && !isVercel) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  return server;
}

function getServer(): Promise<Server> {
  if (!serverPromise) {
    serverPromise = createServerInstance();
  }
  return serverPromise;
}

if (!isVercel) {
  getServer()
    .then((server) => {
      const port = parseInt(process.env.PORT || "5000", 10);
      server.listen({
        port,
        host: "0.0.0.0",
      }, () => {
        log(`serving on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to start server", error);
      process.exit(1);
    });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const server = await getServer();
  server.emit("request", req, res);
}
