import express from "express";
import path from "node:path";
import cookieParser from "cookie-parser";
import compression from "compression";
import helmet from "helmet";
import logger from "./loggers/loggerAdapter.js";
import * as url from "url";
import cors from "cors";
import errorMiddleware from "./middlewares/error.mw.js";
import apiRouter from "./routes/api.router.js";
import errorMiddleware404 from "./middlewares/error.404.mw.js";
import envConnect from "./utils/envConnect.js";
import requestRouter from "./routes/api/request.js";
import oathRouter from "./routes/api/oauth.js";
import authMiddleware from "./middlewares/auth.mw.js";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

let app = express();
envConnect();

app.use(function (req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  );
  next();
});
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "http: data:"],
      "script-src": ["'self'", "'unsafe-inline"],
    },
  })
);
app.use(compression());

app.use(logger());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// app.use(express.static(path.join(__dirname, "build")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorMiddleware404);
app.use("/oauth", oathRouter);
app.use("/request", requestRouter);

app.use("/api", apiRouter);
app.use(errorMiddleware);
app.use(authMiddleware);
// app.get("/*", function (req, res) {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });
app.use((req, res, next) => {
  res.status(404).sendFile(path.join(__dirname, "public", "404.html"));
});

export default app;
