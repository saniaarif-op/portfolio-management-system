import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import portfolioRoutes from "./routes/portfolio.js";
import {
  notFound,
  errorHandler,
} from "./middleware/error.js";

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(
  import.meta.url
);

const __dirname = path.dirname(
  __filename
);

// =====================================
// SECURITY
// =====================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// =====================================
// CORS
// =====================================

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL ||
      "http://localhost:5173",
    credentials: false,
  })
);

// =====================================
// BODY PARSER
// =====================================

app.use(
  express.json({
    limit: "1mb",
  })
);

// =====================================
// RATE LIMIT
// =====================================

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
  })
);

// =====================================
// SERVE UPLOADED IMAGES
// =====================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "../uploads"
    )
  )
);

// =====================================
// HEALTH CHECK
// =====================================

app.get(
  "/api/health",
  (req, res) => {
    res.json({
      status: "ok",
      service: "portfolio-api",
      timestamp:
        new Date().toISOString(),
    });
  }
);

// =====================================
// API ROUTES
// =====================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/portfolio",
  portfolioRoutes
);

// =====================================
// ERROR HANDLING
// =====================================

app.use(notFound);

app.use(errorHandler);

// =====================================
// START SERVER
// =====================================

app.listen(
  PORT,
  () => {
    console.log(
      `Portfolio API running at http://localhost:${PORT}`
    );
  }
);