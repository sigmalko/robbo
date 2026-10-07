import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { BeingPushedPushableStrategy } from "../BeingPushedPushableStrategy";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";

export class PlaneFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-plane";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: "world-object-plane",
            pushable: new BeingPushedPushableStrategy(),
            drawing: {
                getPresentationClass: () => {
                    return "world-object-plane-first";
                    // return "world-object-plane-second";
                }
            }
        };
    }
}
