import type { LevelObjectParameters, Position } from "../../levels/LevelProvider";
import { BeingPushedPushableStrategy } from "../BeingPushedPushableStrategy";
import type { Sprite } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { MoveToTheFirstSpriteMovingStrategy } from "./MoveToTheFirstSpriteMovingStrategy";

export class DangerBoxFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-enemy-danger-box";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let movingStrategy:MoveToTheFirstSpriteMovingStrategy = new MoveToTheFirstSpriteMovingStrategy(SpriteWalkingDirection.STAND);

        movingStrategy.registerListener(function(before:Position, after:Position) {
            console.log("Reached Sprite by Danter Box");
        });

        let pushStrategy:BeingPushedPushableStrategy = new BeingPushedPushableStrategy();
        pushStrategy.registerListener(function(direction:SpriteWalkingDirection) {
            movingStrategy.onDirectionChanged(direction);
        });



        return {
            type: "world-object-enemy-danger-box",
            pushable: pushStrategy,
            movingStrategy: movingStrategy,
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
