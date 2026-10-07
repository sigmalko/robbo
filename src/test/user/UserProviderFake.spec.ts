import type { UserProvider } from "../../main/user/UserProvider";
import { UserProviderFake } from "../../main/user/UserProviderFake";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("In the UserProviderFake", ()=> {
    describe("current method", () => {

        let sut: UserProvider = new UserProviderFake();

        it("should have level greater than zero", () => {
            expect(sut.current().level).toBeGreaterThan(0);
        });

        it("should have name other than null or empty", () => {
            //expect(sut.current().name).isNot(null);
            expect(sut.current().name).toBe("mami");
        });
    });
});
