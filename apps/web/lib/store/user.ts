import { atom } from "nanostores";
import { UserWithoutPassword } from "@/auth/session";

export const $user = atom<UserWithoutPassword | null>(null);

$user.subscribe((user) => {
  if (user) {
    console.log("User logged in:", user);
  } else {
    console.log("User logged out.");
  }
});
