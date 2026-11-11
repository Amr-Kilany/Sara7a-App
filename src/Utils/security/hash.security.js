import { compare, hash } from "bcrypt";
import * as argon2 from "argon2";
import { SALT_ROUNDS } from "../../../config/config.service.js";
import { HashEnum } from "../enums/security.enum.js";
import { badRequestException } from "../response/error.response.js";

export const genrateHash = async ({ plainText, saltRounds = Number(SALT_ROUNDS), algorithm = HashEnum.Bcrypt }) => {
  let hashedValue = "";

  switch (algorithm) {
    case HashEnum.Bcrypt:
      hashedValue = await hash(plainText, saltRounds);
      break;
    case HashEnum.Argon2:
      hashedValue = await argon2.hash(plainText, { saltLength: saltRounds });
      break;
    default:
      throw badRequestException("Invalid hashing algorithm");
  }

  return hashedValue;
};

export const compareHash = async ({ plainText, cipherText, algorithm = HashEnum.Bcrypt }) => {
  let match = false;

  switch (algorithm) {
    case HashEnum.Bcrypt:
      match = await compare(plainText, cipherText);
      break;
    case HashEnum.Argon2:
      match = await argon2.verify(cipherText, plainText);
      break;
    default:
      throw badRequestException("Invalid hashing algorithm");
  }

  return match;
};
