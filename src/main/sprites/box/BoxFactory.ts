import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { BeingPushedPushableStrategy } from "../BeingPushedPushableStrategy";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";

export class BoxFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-box";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: "world-object-box",
            pushable: new BeingPushedPushableStrategy(),
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
