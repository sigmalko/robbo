import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";

export class WallFactory implements SpritesFactory {

    isForYou(name):boolean {
        return true;
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: name,
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
