import type { Position } from "../../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "../Sprite";
import { SpriteDirectionOperations, SpriteWalkingDirection } from "../Sprite";

export class FollowingRobboMovingStrategy implements MovingStrategy {

    whereIsRobbo: ()=>Position;
    private step: number = 0;

    constructor(whereIsRobbo: ()=>Position) {
        this.whereIsRobbo = whereIsRobbo;
    }

    updatePosition(context:MovingStrategyContext): Position {
        this.step++;

        if (this.step % 3 == 0) {
            let robbo: Position = this.whereIsRobbo();
            if (robbo) {
                let left: number = this.distance(context.isSomethingOn, context.current, robbo, SpriteWalkingDirection.LEFT);
                let right: number = this.distance(context.isSomethingOn, context.current, robbo, SpriteWalkingDirection.RIGHT);
                let up: number = this.distance(context.isSomethingOn, context.current, robbo, SpriteWalkingDirection.UP);
                let down: number = this.distance(context.isSomethingOn, context.current, robbo, SpriteWalkingDirection.DOWN);

                let presently: number = this.computeDistance(context.current, robbo);
                let choosed: SpriteWalkingDirection = SpriteWalkingDirection.STAND;
                if (left < presently) {
                    choosed = SpriteWalkingDirection.LEFT;
                    presently = left;
                }
                if (right < presently) {
                    choosed = SpriteWalkingDirection.RIGHT;
                    presently = right;
                }
                if (down < presently) {
                    choosed = SpriteWalkingDirection.DOWN;
                    presently = down;
                }
                if (up < presently) {
                    choosed = SpriteWalkingDirection.UP;
                }
                return SpriteDirectionOperations.whatPositionOn(choosed, context.current);
            } else {
                return context.current;
            }
        } else {
            return context.current;
        }
    }

    distance(isSomethingOn: (nextPosition: Position)=>boolean, current: Position, robbo: Position, direction: SpriteWalkingDirection): number {
        let there: Position = SpriteDirectionOperations.whatPositionOn(direction, current);
        if (isSomethingOn(there)) {
            return 20000000;
        } else {
            return this.computeDistance(there, robbo);
        }
    }


    private computeDistance(p1: Position, p2: Position): number {
        return Math.sqrt(((p1.x - p2.x) * (p1.x - p2.x)) + ((p1.y - p2.y) * (p1.y - p2.y)));
    }
}
