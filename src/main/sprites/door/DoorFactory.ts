import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { DoorIsEatable } from "./DoorIsEatable";
import { DoorPlaysSoundInCaseOfBeingEaten } from "./DoorPlaysSoundInCaseOfBeingEaten";

export class DoorFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-door";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {


        let soundStrategy:DoorPlaysSoundInCaseOfBeingEaten = new DoorPlaysSoundInCaseOfBeingEaten();
        let eatable:DoorIsEatable = new DoorIsEatable();

        eatable.registerOnEaten(function() {
            soundStrategy.fire();
        });

        return {
            type: "world-object-door",
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
