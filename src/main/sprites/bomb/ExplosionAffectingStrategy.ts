import type { Position } from "../../levels/LevelProvider";
import type { AffectingStrategy, AffectingStrategyContext } from "../Sprite";
import { SpriteDirectionOperations, SpriteOnMap, SpriteWalkingDirection } from "../Sprite";
import type { SpriteOnMapFactory } from "../World";
import { ExplosionPropagationStyle } from "./ExplosionPropagationStyle";

export class ExplosionAffectingStrategy implements AffectingStrategy {

    private step: number = 0;

    private propagationStyle: ExplosionPropagationStyle;

    constructor(propagationStyle: ExplosionPropagationStyle) {
        this.propagationStyle = propagationStyle;
    }

    private isDestroyableByBomb(sprite: SpriteOnMap):boolean {
        if(sprite.canBeKilled()) {
            return true;
        } else {
            if(sprite.getSprite().type=="world-object-box") {
                return true;
            }
            if(sprite.getSprite().type=="world-object-plane-screw") {
                return true;
            }
            if(sprite.getSprite().type=="world-object-door") {
                return true;
            }
            if(sprite.getSprite().type=="world-object-door-key") {
                return true;
            }
            return false;
        }
    }

    private explode(place:Position, getSpriteOnMap: (position: Position)=>SpriteOnMap, factory: SpriteOnMapFactory) {
        let sprite: SpriteOnMap = getSpriteOnMap(place);

        if (sprite != null) {
            if(this.isDestroyableByBomb(sprite)) {
                sprite.remove();
                if(sprite.canBeKilled()) {
                    sprite.kill(factory, getSpriteOnMap);
                }
                factory.create("world-object-destroying-explosion", place, [{
                    name: "propagation",
                    value: "FINISH_STAGE"
                }]);
            }
        } else {
            factory.create("world-object-destroying-explosion", place, [{
                name: "propagation",
                value: "FINISH_STAGE"
            }]);
        }
    }

    affectTheWorld(context:AffectingStrategyContext): void {

        if (this.step == 0 && this.propagationStyle == ExplosionPropagationStyle.FIRST_STAGE) {
            let downleft: Position = SpriteDirectionOperations.whatPositionOnDouble(SpriteWalkingDirection.DOWN, SpriteWalkingDirection.LEFT, context.yourPosition);
            this.explode(downleft, context.getSpriteOnMap, context.factory);

            let down: Position = SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.DOWN, context.yourPosition);
            this.explode(down, context.getSpriteOnMap, context.factory);

            let downright: Position = SpriteDirectionOperations.whatPositionOnDouble(SpriteWalkingDirection.DOWN, SpriteWalkingDirection.RIGHT, context.yourPosition);
            this.explode(downright, context.getSpriteOnMap, context.factory);

            let right: Position = SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.RIGHT, context.yourPosition);
            this.explode(right, context.getSpriteOnMap, context.factory);
        }

        if (this.step == 1 && this.propagationStyle == ExplosionPropagationStyle.FIRST_STAGE) {
            let upleft: Position = SpriteDirectionOperations.whatPositionOnDouble(SpriteWalkingDirection.UP, SpriteWalkingDirection.LEFT, context.yourPosition);
            this.explode(upleft, context.getSpriteOnMap, context.factory);

            let up: Position = SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.UP, context.yourPosition);
            this.explode(up, context.getSpriteOnMap, context.factory);

            let upright: Position = SpriteDirectionOperations.whatPositionOnDouble(SpriteWalkingDirection.UP, SpriteWalkingDirection.RIGHT, context.yourPosition);
            this.explode(upright, context.getSpriteOnMap, context.factory);

            let left: Position = SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.LEFT, context.yourPosition);
            this.explode(left, context.getSpriteOnMap, context.factory);
        }


        if (this.step > 3) {
            let sprite: SpriteOnMap = context.getSpriteOnMap(context.yourPosition);
            if (sprite != null) {
                sprite.remove();
            }
        }
        this.step++;
    }
}
