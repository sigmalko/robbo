import type { Position } from "../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "./Sprite";
import { SpriteWalkingDirection } from "./Sprite";

export class BounceMovingStrategy implements MovingStrategy {

    private direction:SpriteWalkingDirection;

    constructor(direction:SpriteWalkingDirection) {
        this.direction = direction;
    }

    updatePosition(context:MovingStrategyContext):Position {
        let nextPosition:Position = {
            x: context.current.x,
            y: context.current.y
        };

        if(SpriteWalkingDirection.RIGHT == this.direction) {
            if(context.isSomethingOn({ x: context.current.x+1, y: context.current.y })) {
                this.direction = SpriteWalkingDirection.LEFT;
            } else {
                nextPosition.x++;
            }
        }

        if(SpriteWalkingDirection.LEFT == this.direction) {
            if(context.isSomethingOn({ x: context.current.x-1, y: context.current.y })) {
                this.direction = SpriteWalkingDirection.RIGHT;
            } else {
                nextPosition.x--;
            }
        }


        if(SpriteWalkingDirection.UP == this.direction) {
            if(context.isSomethingOn({ x: context.current.x, y: context.current.y-1 })) {
                this.direction = SpriteWalkingDirection.DOWN;
            } else {
                nextPosition.y--;
            }
        }

        if(SpriteWalkingDirection.DOWN== this.direction) {
            if(context.isSomethingOn({ x: context.current.x, y: context.current.y+1 })) {
                this.direction = SpriteWalkingDirection.UP;
            } else {
                nextPosition.y++;
            }
        }

        return nextPosition;
    }
}
