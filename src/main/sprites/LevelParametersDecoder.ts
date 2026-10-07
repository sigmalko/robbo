import type { LevelObjectParameters } from "../levels/LevelProvider";
import { SpriteWalkingDirection } from "./Sprite";

export class LevelParametersDecoder {

    static whichDirection(params: LevelObjectParameters[]): SpriteWalkingDirection {
        let direction: SpriteWalkingDirection = SpriteWalkingDirection.RIGHT;
        if (params) {
            for (let p of params) {
                if (p.name == "direction") {
                    switch (p.value.toUpperCase()) {
                        case "LEFT":
                            direction = SpriteWalkingDirection.LEFT;
                            break;
                        case "RIGHT":
                            direction = SpriteWalkingDirection.RIGHT;
                            break;
                        case "UP":
                            direction = SpriteWalkingDirection.UP;
                            break;
                        case "DOWN":
                            direction = SpriteWalkingDirection.DOWN;
                            break;
                    }
                }
            }
        }
        return direction;
    }

    static whichFiringDirection(params: LevelObjectParameters[]): SpriteWalkingDirection {
        let direction: SpriteWalkingDirection = SpriteWalkingDirection.RIGHT;
        if (params) {
            for (let p of params) {
                if (p.name == "firingDirection") {
                    switch (p.value.toUpperCase()) {
                        case "LEFT":
                            direction = SpriteWalkingDirection.LEFT;
                            break;
                        case "RIGHT":
                            direction = SpriteWalkingDirection.RIGHT;
                            break;
                        case "UP":
                            direction = SpriteWalkingDirection.UP;
                            break;
                        case "DOWN":
                            direction = SpriteWalkingDirection.DOWN;
                            break;
                    }
                }
            }
        }
        return direction;
    }
}
