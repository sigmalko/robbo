import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { BounceMovingStrategy } from "../BounceMovingStrategy";
import { LevelParametersDecoder } from "../LevelParametersDecoder";
import type { Sprite } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { TwoStatesSpriteDrawStrategy } from "../TwoStatesSpriteDrawStrategy";
import { BirdCriesSometimes } from "./BirdCriesSometimes";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";

export class BirdFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-enemy-bird";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let movindDirection:SpriteWalkingDirection = LevelParametersDecoder.whichDirection(params);

        return {
            type: "world-object-enemy-bird",
            drawing: new TwoStatesSpriteDrawStrategy("world-object-enemy-bird-first", "world-object-enemy-bird-second", 2),
            movingStrategy: new BounceMovingStrategy(movindDirection),
            soundStrategy: new BirdCriesSometimes(),
            killable: new KillableStrategyDefault()
        };
    }
}
