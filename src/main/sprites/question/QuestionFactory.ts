import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { BeingPushedPushableStrategy } from "../BeingPushedPushableStrategy";
import type { Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { KillableStrategyDefault } from "../destroying/killing/KillableStrategyDefault";

export class QuestionFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-question";
    }
    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: "world-object-question",
            pushable: new BeingPushedPushableStrategy(),
            killable: new KillableStrategyDefault(),
            drawing: {
                getPresentationClass: () => {
                    return name;
                }
            }
        };
    }
}
