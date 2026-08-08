import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { HttpError } from "./utils/http-error.js";

const app = express();

app.use(cors());
app.use(express.json());
app.get("/health", (_request, response) => response.json({ status: "ok" }));
app.use("/api", routes);

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    return response.status(error.statusCode).json({ error: error.message });
  }
  console.error(error);
  return response.status(500).json({ error: "Internal server error." });
});

export default app;
