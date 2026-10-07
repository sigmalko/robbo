import type { Position } from "../levels/LevelProvider";
import type { PushableStrategy, PushableStrategyContext } from "./Sprite";
import { SpriteWalkingDirection } from "./Sprite";

export class BeingPushedPushableStrategy implements PushableStrategy {


    private onPushed: (direction:SpriteWalkingDirection)=>void;

    registerListener(onPushed: (direction:SpriteWalkingDirection)=>void):void {
        this.onPushed = onPushed;
    }

    tryToPush(context:PushableStrategyContext):boolean {
        let nextPosition: Position = {
            x: context.subject.getPosition().x,
            y: context.subject.getPosition().y
        };

        let pushingDirection:SpriteWalkingDirection = SpriteWalkingDirection.STAND;

        if (context.direction.x < 0) {
            nextPosition.x--;
            pushingDirection = SpriteWalkingDirection.LEFT;
        }
        if (context.direction.x > 0) {
            nextPosition.x++;
            pushingDirection = SpriteWalkingDirection.RIGHT;
        }
        if (context.direction.y < 0) {
            nextPosition.y--;
            pushingDirection = SpriteWalkingDirection.UP;
        }
        if (context.direction.y > 0) {
            nextPosition.y++;
            pushingDirection = SpriteWalkingDirection.DOWN;
        }

        if(context.isSomethingOn(nextPosition)) {
            return false;
        } else {
            console.log("PUSH was tried");
            context.subject.changePosition(nextPosition);
            if(this.onPushed) {
                this.onPushed(pushingDirection);
            }
            return true;
        }
    }
}
