import type { User } from "./User";
import type { UserProvider } from "./UserProvider";

export class UserProviderFake implements UserProvider {
    current(): User {
        let user: User = {
            level: 1,
            name: "mami"
        };
        return user;
    }
}
