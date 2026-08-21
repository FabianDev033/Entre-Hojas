import type { RequestHandler } from "express";
import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { authCookieOptions, getCookie, verifyAuthToken } from "../utils/auth-token.js";

const login: RequestHandler = asyncHandler(async (request, response) => {
  const { user, password } = request.body as Record<string, unknown>;
  if (typeof user !== "string" || typeof password !== "string" || !user || !password) {
    throw new HttpError(400, "The user and password fields are required.");
  }

  const { user: authenticatedUser, session } = await authService.login(user, password);
  response.cookie("auth_token", session.token, authCookieOptions(session.maxAge));
  response.json({ user: authenticatedUser });
});

const me: RequestHandler = asyncHandler(async (request, response) => {
  const token = getCookie(request.headers.cookie, "auth_token");
  if (!token) throw new HttpError(401, "Authentication required.");

  const session = verifyAuthToken(token);
  response.json({ user: { id: Number(session.sub), user: session.user } });
});

const logout: RequestHandler = (_request, response) => {
  response.clearCookie("auth_token", authCookieOptions());
  response.status(204).send();
};

export default { login, logout, me };
