import type { Position } from "../../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";

export class PullingMovingStrategy implements MovingStrategy {

    private direction:SpriteWalkingDirection;

    constructor(direction:SpriteWalkingDirection) {
        this.direction = direction;
    }

    updatePosition(context:MovingStrategyContext):Position {
        let nextPosition:Position = {
            x: context.current.x,
            y: context.current.y
        };
        switch (this.direction) {
            case SpriteWalkingDirection.RIGHT:
                nextPosition.x++;
                break;
            case SpriteWalkingDirection.LEFT:
                nextPosition.x--;
                break;
            case SpriteWalkingDirection.UP:
                nextPosition.y--;
                break;
            case SpriteWalkingDirection.DOWN:
                nextPosition.y++;
                break;
        }

        if(context.isSomethingOn(nextPosition)) {
            return context.current;
        } else {
            return nextPosition;
        }
    }
}
