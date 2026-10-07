import type { Position } from "../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "./Sprite";
import { SpriteDirectionOperations, SpriteWalkingDirection } from "./Sprite";

export class StickyMovingStrategy implements MovingStrategy {

    private direction: SpriteWalkingDirection;
    private observelable: SpriteWalkingDirection;
    private handType: StickyWalkingType;
    private step: number = 0;

    constructor(direction: SpriteWalkingDirection) {
        this.direction = direction;
        this.observelable = null;
        this.handType = null;
    }

    findNextPosition(context:MovingStrategyContext): Position {
        if (context.isSomethingOn(SpriteDirectionOperations.whatPositionOn(this.observelable, context.current))) {
            if (context.isSomethingOn(SpriteDirectionOperations.whatPositionOn(this.handType.whatDirectionShouldBeNext(this.observelable), context.current))) {
                this.observelable = this.handType.whatDirectionShouldBeNext(this.observelable);
                return {
                    x: context.current.x,
                    y: context.current.y
                };
            } else {
                return SpriteDirectionOperations.whatPositionOn(this.handType.whatDirectionShouldBeNext(this.observelable), context.current);
            }
        } else {
            let newPosition: Position = SpriteDirectionOperations.whatPositionOn(this.observelable, context.current);
            this.observelable = SpriteDirectionOperations.inverseDirection(this.handType.whatDirectionShouldBeNext(this.observelable));
            return newPosition;
        }
    }

    updatePosition(context:MovingStrategyContext): Position {
        if (this.handType == null) {
            this.handType = initialHandWalkingType(this.direction, context.current, context.isSomethingOn);
            this.observelable = SpriteDirectionOperations.inverseDirection(this.handType.whatDirectionShouldBeNext(this.direction));
        }

        this.step++;

        if (this.step % 2 == 0) {
            let nextPosition: Position = this.findNextPosition(context);
            return nextPosition;
        } else {
            return {
                x: context.current.x,
                y: context.current.y
            };
        }
    }
}

function initialHandWalkingType(direction: SpriteWalkingDirection, current: Position, isSomethingOn: (nextPosition: Position)=>boolean): StickyWalkingType {
    let newHandType: StickyWalkingType;
    switch (direction) {
        case SpriteWalkingDirection.UP:
            if (!isSomethingOn(SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.LEFT, current))) {
                newHandType = new RightHandedStickyWalkingType();
            }
            break;
        case SpriteWalkingDirection.RIGHT:
            if (!isSomethingOn(SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.UP, current))) {
                newHandType = new RightHandedStickyWalkingType();
            }
            break;
        case SpriteWalkingDirection.DOWN:
            if (!isSomethingOn(SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.RIGHT, current))) {
                newHandType = new RightHandedStickyWalkingType();
            }
            break;
        case SpriteWalkingDirection.LEFT:
            if (!isSomethingOn(SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.DOWN, current))) {
                newHandType = new RightHandedStickyWalkingType();
            }
            break;
    }
    if (newHandType == null) {
        newHandType = new LeftHandedStickyWalkingType();
    }
    return newHandType;
}


interface StickyWalkingType {
    whatDirectionShouldBeNext(direction: SpriteWalkingDirection): SpriteWalkingDirection;
}

class RightHandedStickyWalkingType implements StickyWalkingType {
    whatDirectionShouldBeNext(direction: SpriteWalkingDirection): SpriteWalkingDirection {
        switch (direction) {
            case SpriteWalkingDirection.RIGHT:
                return SpriteWalkingDirection.UP;
            case SpriteWalkingDirection.UP:
                return SpriteWalkingDirection.LEFT;
            case SpriteWalkingDirection.LEFT:
                return SpriteWalkingDirection.DOWN;
            case SpriteWalkingDirection.DOWN:
                return SpriteWalkingDirection.RIGHT;
            default:
                return SpriteWalkingDirection.STAND;
        }
    }
}

class LeftHandedStickyWalkingType implements StickyWalkingType {
    whatDirectionShouldBeNext(direction: SpriteWalkingDirection): SpriteWalkingDirection {
        switch (direction) {
            case SpriteWalkingDirection.RIGHT:
                return SpriteWalkingDirection.DOWN;
            case SpriteWalkingDirection.UP:
                return SpriteWalkingDirection.RIGHT;
            case SpriteWalkingDirection.LEFT:
                return SpriteWalkingDirection.UP;
            case SpriteWalkingDirection.DOWN:
                return SpriteWalkingDirection.LEFT;
            default:
                return SpriteWalkingDirection.STAND;
        }
    }
}
