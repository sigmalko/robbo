import type { InterestedInWorldContext } from "./Sprite";
import type { WorldContext } from "./World";

export class ObserverRobbo implements InterestedInWorldContext {
    private worldContext: WorldContext;

    constructor() {
    }

    set(worldContext: WorldContext): void {
        this.worldContext = worldContext;
    }

    get(): WorldContext {
        return this.worldContext;
    }
}
