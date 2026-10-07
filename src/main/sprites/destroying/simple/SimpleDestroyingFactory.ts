import type { LevelObjectParameters } from "../../../levels/LevelProvider";
import type { AffectingStrategy, DrawStrategy, Sprite } from "../../Sprite";
import type { SpritesFactory } from "../../SpritesFactory";
import { SimpleDestroyingAffectingStrategy } from "./SimpleDestroyingAffectingStrategy";
import { SimpleDestroyingDrawingStrategy } from "./SimpleDestroyingDrawingStrategy";

export class SimpleDestroyingFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-destroying-simple";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        let drawing:DrawStrategy = new SimpleDestroyingDrawingStrategy();
        let affecting:AffectingStrategy = new SimpleDestroyingAffectingStrategy();
        return {
            type: "world-object-destroying-simple",
            drawing: drawing,
            affectingStrategy: affecting
        };
    }
}
