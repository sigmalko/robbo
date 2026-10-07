import type { Position } from "../../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";

export class MoveToTheFirstSpriteMovingStrategy implements MovingStrategy {

    private direction:SpriteWalkingDirection;
    private onAnySpriteReached: (before:Position, after:Position)=>void;

    registerListener(onAnySpriteReached: (before:Position, after:Position)=>void) {
        this.onAnySpriteReached = onAnySpriteReached;
    }

    constructor(movingDirection:SpriteWalkingDirection) {
        this.direction = movingDirection;

    }
    onDirectionChanged(candidatingDirection:SpriteWalkingDirection):void {
        this.direction = candidatingDirection;
    }

    updatePosition(context:MovingStrategyContext): Position {
        let nextPosition:Position = {
            x: context.current.x,
            y: context.current.y
        };

        if(SpriteWalkingDirection.RIGHT == this.direction) {
            if(context.isSomethingOn({ x: context.current.x+1, y: context.current.y })) {
                this.direction = SpriteWalkingDirection.STAND;
                if(this.onAnySpriteReached) {
                    this.onAnySpriteReached(context.current, { x: context.current.x+1, y: context.current.y });
                }
            } else {
                nextPosition.x++;
            }
        }

        if(SpriteWalkingDirection.LEFT == this.direction) {
            if(context.isSomethingOn({ x: context.current.x-1, y: context.current.y })) {
                this.direction = SpriteWalkingDirection.STAND;
                if(this.onAnySpriteReached) {
                    this.onAnySpriteReached(context.current, { x: context.current.x-1, y: context.current.y });
                }
            } else {
                nextPosition.x--;
            }
        }


        if(SpriteWalkingDirection.UP == this.direction) {
            if(context.isSomethingOn({ x: context.current.x, y: context.current.y-1 })) {
                this.direction = SpriteWalkingDirection.STAND;
                if(this.onAnySpriteReached) {
                    this.onAnySpriteReached(context.current, { x: context.current.x, y: context.current.y-1 });
                }
            } else {
                nextPosition.y--;
            }
        }

        if(SpriteWalkingDirection.DOWN== this.direction) {
            if(context.isSomethingOn({ x: context.current.x, y: context.current.y+1 })) {
                this.direction = SpriteWalkingDirection.STAND;
                if(this.onAnySpriteReached) {
                    this.onAnySpriteReached(context.current, { x: context.current.x, y: context.current.y+1 });
                }
            } else {
                nextPosition.y++;
            }
        }

        return nextPosition;
    }
}
