import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { KeyToDoorIsEatable } from "./KeyToDoorIsEatable";
import { KeyToDoorPlaysSoundInCaseOfBeingEaten } from "./KeyToDoorPlaysSoundInCaseOfBeingEaten";

export class KeyToDoorFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-door-key";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {

        let soundStrategy:KeyToDoorPlaysSoundInCaseOfBeingEaten = new KeyToDoorPlaysSoundInCaseOfBeingEaten();
        let eatable:KeyToDoorIsEatable = new KeyToDoorIsEatable();

        eatable.registerOnEaten(function() {
            soundStrategy.fire();
        });

        return {
            type: "world-object-door-key",
            eatable: eatable,
            soundStrategy: soundStrategy,
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
