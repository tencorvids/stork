import { hash, verify } from "@node-rs/argon2";
import { tc } from "@stork/util";
import { err, ok, Result } from "neverthrow";

export async function hashPassword(
  password: string,
): Promise<Result<string, Error>> {
  const [hashedPassword, error] = await tc(
    hash(password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    }),
  );
  if (error) {
    return err(error);
  }
  return ok(hashedPassword);
}

export async function verifyPasswordHash(
  hash: string,
  password: string,
): Promise<Result<boolean, Error>> {
  const [result, error] = await tc(verify(hash, password));
  if (error) {
    return err(error);
  }
  return ok(result);
}
