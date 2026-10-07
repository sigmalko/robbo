import type { Position } from "../../../levels/LevelProvider";
import type { AffectingStrategy, AffectingStrategyContext } from "../../Sprite";
import { SpriteOnMap } from "../../Sprite";

export class SingleMissleAffectingStrategy implements AffectingStrategy {

    private reached:boolean = false;
    private before:Position;
    private after:Position;

    onSpriteReached(before:Position, after:Position) {
        this.reached = true;
        this.before = before;
        this.after= after;
    }

    affectTheWorld(context:AffectingStrategyContext): void {
        if(this.reached) {
            console.log("Your position: "+context.yourPosition.x+", "+context.yourPosition.y);
            console.log("Before position: "+this.before.x+", "+this.before.y);
            console.log("After position: "+this.after.x+", "+this.after.y);

            let sprite:SpriteOnMap = context.getSpriteOnMap(context.yourPosition);
            sprite.remove();

            let targetSprite:SpriteOnMap = context.getSpriteOnMap(this.after);
            if(targetSprite.canBeKilled()) {
                targetSprite.kill(context.factory, context.getSpriteOnMap);
            } else {
                if(sprite.canBeKilled()) {
                    sprite.kill(context.factory, context.getSpriteOnMap);
                }
            }

            this.reached = false;
        }
    }
}
