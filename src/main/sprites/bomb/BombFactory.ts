import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { BeingPushedPushableStrategy } from "../BeingPushedPushableStrategy";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { BombKilledStrategy } from "./BombKilledStrategy";

export class BombFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-enemy-bomb";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: "world-object-enemy-bomb",
            pushable: new BeingPushedPushableStrategy(),
            killable: new BombKilledStrategy(),
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
