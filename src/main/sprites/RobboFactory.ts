import type { LevelObjectParameters } from "../levels/LevelProvider";
import { DrawStrategyForEachFromFourDirections } from "./DrawStrategyForEachFromFourDirections";
import { RobboAffectsWordStrategy } from "./RobboAffectsWordStrategy";
import { RobboKeyboardReactionStrategy } from "./RobboKeyboardReactionStrategy";
import { RobboMovingStrategy } from "./RobboMovingStrategy";
import type { Sprite } from "./Sprite";
import type { SpritesFactory } from "./SpritesFactory";

export class RobboFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-robbo";
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {

        let affecting:RobboAffectsWordStrategy = new RobboAffectsWordStrategy();

        let drawingStrategy:DrawStrategyForEachFromFourDirections = new DrawStrategyForEachFromFourDirections(
            "world-object-robbo-up-first",
            "world-object-robbo-down-first",
            "world-object-robbo-left-first",
            "world-object-robbo-right-first",

            "world-object-robbo-up-second",
            "world-object-robbo-down-second",
            "world-object-robbo-left-second",
            "world-object-robbo-right-second"
        );

        let keyboardStrategy:RobboKeyboardReactionStrategy = new RobboKeyboardReactionStrategy();

        let movingStrategy:RobboMovingStrategy = new RobboMovingStrategy(function() {
            return keyboardStrategy.getDeltaAndReset();
        });

        movingStrategy.registerFiringListener(affecting);

        drawingStrategy.useThisDirectionProvider(function() {
            return keyboardStrategy.lastDirection();
        });
        drawingStrategy.useThisStepCounterProvider(function(){
            return movingStrategy.stepCounter();
        });


        return {
            type: "world-object-robbo",
            movingStrategy: movingStrategy,
            drawing: drawingStrategy,
            keyboardReaction: keyboardStrategy,
            affectingStrategy: affecting
        };
    }
}
