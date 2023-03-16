import crypto from "crypto";

// const signInKey = Buffer.from("", "base64").toString("ascii");

const hex = crypto
  .randomBytes(Math.ceil(6 / 2))
  .toString("hex")
  .slice(0, 6);
const auth_code = parseInt(hex, 16);
console.log(auth_code);
