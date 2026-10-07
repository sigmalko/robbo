import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { AffectingStrategy, DrawStrategy, Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { ExplosionAffectingStrategy } from "./ExplosionAffectingStrategy";
import { ExplosionDrawingStrategy } from "./ExplosionDrawingStrategy";
import { ExplosionPropagationStyle, ExplosionPropagationStyleOperations } from "./ExplosionPropagationStyle";

export class ExplosionFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-destroying-explosion";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let drawing:DrawStrategy = new ExplosionDrawingStrategy();

        let stage:ExplosionPropagationStyle = ExplosionPropagationStyleOperations.whichStyle(params);

        let affecting:AffectingStrategy = new ExplosionAffectingStrategy(stage);
        return {
            type: "world-object-destroying-explosion",
            drawing: drawing,
            affectingStrategy: affecting
        };
    }
}
