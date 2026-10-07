import type { LevelObjectParameters, Position } from "../../../levels/LevelProvider";
import { LevelParametersDecoder } from "../../LevelParametersDecoder";
import type { DrawStrategy, Sprite } from "../../Sprite";
import { SpriteWalkingDirection } from "../../Sprite";
import type { SpritesFactory } from "../../SpritesFactory";
import { MoveToTheFirstSpriteMovingStrategy } from "../../box/MoveToTheFirstSpriteMovingStrategy";
import { KillableStrategyDefault } from "../../destroying/killing/KillableStrategyDefault";
import { SingleMissleAffectingStrategy } from "./SingleMissleAffectingStrategy";
import { SingleMissleDrawingStrategy } from "./SingleMissleDrawingStrategy";

export class SingleMissleFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-missle-single";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let movindDirection:SpriteWalkingDirection = LevelParametersDecoder.whichDirection(params);
        let movingStrategy:MoveToTheFirstSpriteMovingStrategy = new MoveToTheFirstSpriteMovingStrategy(movindDirection);
        let affecting:SingleMissleAffectingStrategy = new SingleMissleAffectingStrategy();
        movingStrategy.registerListener(function (before:Position, after:Position) {
            affecting.onSpriteReached(before, after);
        });
        let drawing:DrawStrategy = new SingleMissleDrawingStrategy(movindDirection);

        return {
            type: "world-object-missle-single",
            drawing: drawing,
            movingStrategy: movingStrategy,
            killable: new KillableStrategyDefault(),
            affectingStrategy: affecting
        };
    }
}
