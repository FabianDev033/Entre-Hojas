import type { RequestHandler } from "express";
import authService from "../services/auth.service.js";
import { asyncHandler } from "../utils/async-handler.js";
import { HttpError } from "../utils/http-error.js";
import { authCookieOptions, getCookie, verifyAuthToken } from "../utils/auth-token.js";

const login: RequestHandler = asyncHandler(async (request, response) => {
  const { usuario, contraseña } = request.body as Record<string, unknown>;
  if (typeof usuario !== "string" || typeof contraseña !== "string" || !usuario || !contraseña) {
    throw new HttpError(400, "Los campos usuario y contraseña son obligatorios.");
  }

  const { user, session } = await authService.login(usuario, contraseña);
  response.cookie("auth_token", session.token, authCookieOptions(session.maxAge));
  response.json({ user });
});

const me: RequestHandler = asyncHandler(async (request, response) => {
  const token = getCookie(request.headers.cookie, "auth_token");
  if (!token) throw new HttpError(401, "Sesión requerida.");

  const session = verifyAuthToken(token);
  response.json({ user: { id: Number(session.sub), usuario: session.usuario } });
});

const logout: RequestHandler = (_request, response) => {
  response.clearCookie("auth_token", authCookieOptions());
  response.status(204).send();
};

export default { login, logout, me };
