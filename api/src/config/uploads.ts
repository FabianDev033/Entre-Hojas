import { fileURLToPath } from "node:url";

export const uploadsDirectory = fileURLToPath(new URL("../../uploads/", import.meta.url));
