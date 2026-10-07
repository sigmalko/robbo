import type { KeyboardDelta } from "../KeyboardDelta";
import type { KeyboardStrategy } from "./Sprite";
import { SpriteWalkingDirection } from "./Sprite";

export class RobboKeyboardReactionStrategy implements KeyboardStrategy {

    private delta:KeyboardDelta = {
        x:0,
        y:0,
        fire:false
    };

    // used by drawing strategy
    private direction = SpriteWalkingDirection.DOWN;

    up(fire:boolean):void {
        this.direction = SpriteWalkingDirection.UP;
        this.delta.y--;
        this.delta.fire = fire;
    }
    down(fire:boolean):void {
        this.direction = SpriteWalkingDirection.DOWN;
        this.delta.y++;
        this.delta.fire = fire;
    }
    left(fire:boolean):void {
        this.direction = SpriteWalkingDirection.LEFT;
        this.delta.x--;
        this.delta.fire = fire;
    }
    right(fire:boolean):void {
        this.direction = SpriteWalkingDirection.RIGHT;
        this.delta.x++;
        this.delta.fire = fire;
    }

    getDeltaAndReset():KeyboardDelta {
        let result:KeyboardDelta = {
            x: this.delta.x,
            y: this.delta.y,
            fire: this.delta.fire
        };

        this.delta.x = 0;
        this.delta.y = 0;
        this.delta.fire = false;

        return result;
    }

    lastDirection():SpriteWalkingDirection {
        return this.direction;
    }
}
