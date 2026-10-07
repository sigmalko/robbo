import type { DrawStrategy } from "../Sprite";
import { SpriteDirectionUiPostfix, SpriteWalkingDirection } from "../Sprite";

export class FiringDirectionDrawStrategy implements DrawStrategy {
    private firingDirection:SpriteWalkingDirection;
    private prefixName:string;

    constructor(prefixName:string, firingDirection:SpriteWalkingDirection) {
        this.firingDirection = firingDirection;
        this.prefixName = prefixName;
    }

    getPresentationClass():string {
        return SpriteDirectionUiPostfix.addPostfix(this.prefixName, this.firingDirection);
    }
}
