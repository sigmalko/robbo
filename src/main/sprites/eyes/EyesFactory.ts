import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { ObserverRobbo } from "../ObserverRobbo";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { TwoStatesSpriteDrawStrategy } from "../TwoStatesSpriteDrawStrategy";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";
import { FollowingRobboMovingStrategy } from "./FollowingRobboMovingStrategy";

export class EyesFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-enemy-eye";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let observingRobbo: ObserverRobbo= new ObserverRobbo();

        let movingStrategy:FollowingRobboMovingStrategy = new FollowingRobboMovingStrategy(function () {
            if (observingRobbo.get()) {
                return observingRobbo.get().robboLocation.whereIsNearestRobbo();
            } else {
                return null;
            }
        });

        return {
            type: "world-object-enemy-eye",
            drawing: new TwoStatesSpriteDrawStrategy("world-object-enemy-eye-first", "world-object-enemy-eye-second", 4),
            interestedInWorldContext: observingRobbo,
            killable: new KillableStrategyDefault(),
            movingStrategy: movingStrategy
        };
    }
}
