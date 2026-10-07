import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { LevelParametersDecoder } from "../LevelParametersDecoder";
import type { Sprite } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { StickyMovingStrategy } from "../StickyMovingStrategy";
import { TwoStatesSpriteDrawStrategy } from "../TwoStatesSpriteDrawStrategy";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";
import { WormCriesSometimes } from "./WormCriesSometimes";

export class WormFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-enemy-worm";
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let movingDirection:SpriteWalkingDirection = LevelParametersDecoder.whichDirection(params);

        return {
            type: "world-object-enemy-worm",
            drawing: new TwoStatesSpriteDrawStrategy("world-object-enemy-worm-first", "world-object-enemy-worm-second", 2),
            movingStrategy: new StickyMovingStrategy(movingDirection),
            killable: new KillableStrategyDefault(),
            soundStrategy: new WormCriesSometimes()
        };
    }
}
