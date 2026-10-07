import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { LevelParametersDecoder } from "../LevelParametersDecoder";
import type { Sprite } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { TwoStatesSpriteDrawStrategy } from "../TwoStatesSpriteDrawStrategy";
import { BarrierMovingStrategy } from "./BarrierMovingStrategy";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";

export class BarrierFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-enemy-barrier";
    }

    create(name: string, params?: LevelObjectParameters[]): Sprite {
        let direction:SpriteWalkingDirection = LevelParametersDecoder.whichDirection(params);
        let movingStrategy:BarrierMovingStrategy = new BarrierMovingStrategy(direction);

        return {
            type: "world-object-enemy-barrier",
            movingStrategy:movingStrategy,
            killable: new KillableStrategyDefault(),
            drawing: new TwoStatesSpriteDrawStrategy("world-object-enemy-barrier-first", "world-object-enemy-barrier-second", 8)
        };
    }
}
