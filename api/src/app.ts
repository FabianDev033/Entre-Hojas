import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { HttpError } from "./utils/http-error.js";
import multer from "multer";
import { uploadsDirectory } from "./config/uploads.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/uploads", express.static(uploadsDirectory, { dotfiles: "deny", index: false }));
app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api", routes);

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "Cada imagen puede pesar hasta 5 MB."
        : "Podés agregar hasta 10 imágenes por guardado. Revisá los archivos seleccionados.";
      return response.status(400).json({ error: message });
    }
    if (error instanceof HttpError) {
      return response.status(error.statusCode).json({ error: error.message });
    }
    console.error(error);
    return response.status(500).json({ error: "Internal server error." });
  },
);

export default app;
