import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { AmmunitionIsEatable } from "./AmmunitionIsEatable";
import { AmmunitionPlaysSoundInCaseOfBeingEaten } from "./AmmunitionPlaysSoundInCaseOfBeingEaten";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";

export class AmmunitionFactory implements SpritesFactory {
    isForYou(name):boolean {
        return name=="world-object-ammunition";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {


        let soundStrategy:AmmunitionPlaysSoundInCaseOfBeingEaten = new AmmunitionPlaysSoundInCaseOfBeingEaten();
        let eatable:AmmunitionIsEatable = new AmmunitionIsEatable();

        eatable.registerOnEaten(function() {
            soundStrategy.fire();
        });

        return {
            type: "world-object-ammunition",
            eatable: eatable,
            soundStrategy: soundStrategy,
            killable: new KillableStrategyDefault(),
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
