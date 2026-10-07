import type { Position } from "../levels/LevelProvider";
import { BounceMovingStrategy } from "./BounceMovingStrategy";
import type { MovingStrategyContext } from "./Sprite";
import { SpriteWalkingDirection } from "./Sprite";

export class BounceMovingStrategyWithFrequency extends BounceMovingStrategy {

    constructor(direction:SpriteWalkingDirection, frequency:number) {
        super(direction);
        this.frequency = frequency;
    }

    private step:number = 0;
    private frequency:number = 2;

    updatePosition(context:MovingStrategyContext):Position {
        this.step++;
        if(this.step%this.frequency==0) {
            return super.updatePosition(context);
        } else {
            return {
                x:context.current.x,
                y:context.current.y
            };
        }
    }
}
