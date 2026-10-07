import type { User } from "./User";

export interface UserProvider {
    current(): User;
}
