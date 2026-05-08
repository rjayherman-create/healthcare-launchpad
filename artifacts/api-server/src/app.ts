import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const staticDirCandidates = [
  path.resolve(runtimeDir, "public"),
  path.resolve(process.cwd(), "../healthcare-frontend/dist/public"),
  path.resolve(process.cwd(), "artifacts/healthcare-frontend/dist/public"),
];
const staticDir = staticDirCandidates.find((candidate) =>
  fs.existsSync(path.join(candidate, "index.html")),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/healthz", (_req, res) => {
  res.redirect(307, "/api/healthz");
});

app.use("/api", router);

if (staticDir) {
  app.use(express.static(staticDir));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      next();
      return;
    }

    res.sendFile(path.join(staticDir, "index.html"));
  });
} else {
  app.get("/", (_req, res) => {
    res.json({
      name: "Healthcare Launchpad API",
      status: "ok",
      health: "/api/healthz",
      frontend: "not built",
    });
  });
}

export default app;
