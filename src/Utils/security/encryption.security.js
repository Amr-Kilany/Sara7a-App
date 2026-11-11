import crypto from "crypto";
import { ENC_KEY } from "./../../../config/config.service.js";

const IV_LENGTH = 16; // For AES, this is always 16
const ENCRYPTION_SECRET_KEY = Buffer.from(ENC_KEY); // must be 32 byte

export const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cypher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, iv);

  let encryptedData = cypher.update(text, "utf8", "hex");
  encryptedData += cypher.final("hex");

  return iv.toString("hex") + ":" + encryptedData;
};

export const decrypt = (encryptedText) => {
  const [iv, encryptedData] = encryptedText.split(":");
  const ivBuffer = Buffer.from(iv, "hex");
  const decypher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_SECRET_KEY, ivBuffer);

  let decryptedData = decypher.update(encryptedData, "hex", "utf8");
  decryptedData += decypher.final("utf8");
  return decryptedData;
};
