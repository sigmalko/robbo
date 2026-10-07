import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { BeingPushedPushableStrategy } from "../BeingPushedPushableStrategy";
import { BounceMovingStrategyWithFrequency } from "../BounceMovingStrategyWithFrequency";
import { LevelParametersDecoder } from "../LevelParametersDecoder";
import type { Sprite } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { FiringDirectionDrawStrategy } from "./FiringDirectionDrawStrategy";

export class CannonFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-cannon-walking";
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let walkingDirection:SpriteWalkingDirection = LevelParametersDecoder.whichDirection(params);
        let firingDirection:SpriteWalkingDirection = LevelParametersDecoder.whichFiringDirection(params);
        return {
            type: "world-object-cannon-walking",
            pushable: new BeingPushedPushableStrategy(),
            drawing: new FiringDirectionDrawStrategy("world-object-cannon-walking", firingDirection),
            movingStrategy: new BounceMovingStrategyWithFrequency(walkingDirection, 3)
        };
    }
}
