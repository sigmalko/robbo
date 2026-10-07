import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { ScrewIsEatable } from "./ScrewIsEatable";
import { ScrewPlaysSoundInCaseOfBeingEaten } from "./ScrewPlaysSoundInCaseOfBeingEaten";

export class ScrewFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-plane-screw";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {

        let soundStrategy:ScrewPlaysSoundInCaseOfBeingEaten = new ScrewPlaysSoundInCaseOfBeingEaten();
        let eatable:ScrewIsEatable = new ScrewIsEatable();

        eatable.registerOnEaten(function() {
            soundStrategy.fire();
        });

        return {
            type: "world-object-plane-screw",
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
