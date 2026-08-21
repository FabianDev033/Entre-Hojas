import { scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import userModel from "../models/user.model.js";
import { createAuthToken } from "../utils/auth-token.js";
import { HttpError } from "../utils/http-error.js";

const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: string,
  keyLength: number,
) => Promise<Buffer>;

const invalidCredentials = () => new HttpError(401, "Invalid user or password.");

const verifyPassword = async (password: string, storedHash: string) => {
  const [algorithm, salt, expectedHash] = storedHash.split("$");
  if (algorithm !== "scrypt" || !salt || !expectedHash) return false;

  const expected = Buffer.from(expectedHash, "hex");
  if (expected.length === 0) return false;

  const actual = await scrypt(password, salt, expected.length);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
};

class AuthService {
  async login(user: string, password: string) {
    const account = await userModel.findByUser(user);
    if (!account?.password || !(await verifyPassword(password, account.password))) {
      throw invalidCredentials();
    }

    const userResponse = { id: account.id, user: account.user };
    return { user: userResponse, session: createAuthToken(userResponse) };
  }
}

export default new AuthService();
