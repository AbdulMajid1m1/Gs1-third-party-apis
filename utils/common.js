import { pool1 } from "../config/connection.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sql from "mssql"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });
let jwtSecret = process.env.JWT_SECRET;
let jwtExpiration = process.env.JWT_EXPIRATION;

const saltRounds = 10;

export {
  pool1,
  sql,
  bcrypt,
  jwt,
  dotenv,
  path,
  saltRounds,
  jwtSecret,
  jwtExpiration,
};
