import jwt, { VerifyErrors } from "jsonwebtoken";

import { environmentVariable } from "../../config";

export const verifyRefreshToken = async function (
  refreshToken: any
): Promise<string> {
  return new Promise(function (resolve, reject) {
    jwt.verify(
      refreshToken,
      environmentVariable.REFRESH_TOKEN_SECRET as jwt.Secret,
      (err: VerifyErrors | null, payload: any) => {
        if (err) {
          return reject(err);
        }

        if (process?.env?.NODE_ENV && process.env.NODE_ENV === "development") {
          console.log(payload.aud);
        }

        const userId = payload.aud;
        resolve(userId);
      }
    );
  });
};

export default verifyRefreshToken;
