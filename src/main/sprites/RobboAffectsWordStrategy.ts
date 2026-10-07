import type { Position } from "../levels/LevelProvider";
import type { AffectingStrategy, AffectingStrategyContext, FiringListener } from "./Sprite";
import { SpriteDirectionOperations, SpriteOnMap, SpriteWalkingDirection } from "./Sprite";

export class RobboAffectsWordStrategy implements AffectingStrategy, FiringListener {

    private direction:SpriteWalkingDirection;

    affectTheWorld(context:AffectingStrategyContext): void {
        if(this.direction!=null) {
            let positionForCreatingSprite:Position = SpriteDirectionOperations.whatPositionOn(this.direction, context.yourPosition);
            if(context.isSomethingOn(positionForCreatingSprite)) {
                // kill it

                let spriteToKill:SpriteOnMap = context.getSpriteOnMap(positionForCreatingSprite);
                if(spriteToKill.canBeKilled()) {
                    spriteToKill.kill(context.factory, context.getSpriteOnMap);
                }

            } else {
                // create fire
                context.factory.create("world-object-missle-single", positionForCreatingSprite, [ {
                    name: "direction",
                    value: SpriteDirectionOperations.getName(this.direction)
                }]);
            }
            this.direction = null;
        }
    }

    onFire(direction:SpriteWalkingDirection):void {
        this.direction = direction;
    }
}
