import type { RequestHandler } from "express";
import { getCookie, verifyAuthToken } from "../utils/auth-token.js";
import { HttpError } from "../utils/http-error.js";

export const requireAuth: RequestHandler = (request, _response, next) => {
  try {
    const token = getCookie(request.headers.cookie, "auth_token");
    if (!token) throw new HttpError(401, "Authentication required.");
    verifyAuthToken(token);
    next();
  } catch (error) {
    next(error);
  }
};
