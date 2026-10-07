import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";

export class SandFactory implements SpritesFactory {

    isForYou(name):boolean {
        if(name == "world-object-sand") {
            return true;
        } else {
            return false;
        }
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: name,
            killable: new KillableStrategyDefault(),
            drawing: {
                getPresentationClass: () => {
                    return "world-object-sand";
                }
            }
        };
    }
}
