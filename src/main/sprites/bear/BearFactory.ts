import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { LevelParametersDecoder } from "../LevelParametersDecoder";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { StickyMovingStrategy } from "../StickyMovingStrategy";
import { TwoStatesSpriteDrawStrategy } from "../TwoStatesSpriteDrawStrategy";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";

export class BearFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-enemy-bear";
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: "world-object-enemy-bear",
            killable: new KillableStrategyDefault(),
            drawing: new TwoStatesSpriteDrawStrategy("world-object-enemy-bear-first", "world-object-enemy-bear-second", 2),
            movingStrategy: new StickyMovingStrategy(LevelParametersDecoder.whichDirection(params))
        };
    }
}
