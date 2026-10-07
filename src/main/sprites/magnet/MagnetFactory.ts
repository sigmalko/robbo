import type { LevelObjectParameters } from "../../levels/LevelProvider";
import { LevelParametersDecoder } from "../LevelParametersDecoder";
import { ObserverRobbo } from "../ObserverRobbo";
import type { Sprite } from "../Sprite";
import { SpriteDirectionOperations, SpriteDirectionUiPostfix, SpriteWalkingDirection } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";
import { IsRobboReachableDefault } from "./IsRobboReachableDefault";
import { MagnetAffectingStrategy } from "./MagnetAffectingStrategy";
import { MagnetMovingStrategy } from "./MagnetMovingStrategy";
import { MagnetSoundWhenRobboIsFound } from "./MagnetSoundWhenRobboIsFound";
import { PullingMovingStrategy } from "./PullingMovingStrategy";
import { SwitchRobboMovingStrategy } from "./SwitchRobboMovingStrategy";

export class MagnetFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-enemy-magnet";
    }

    create(name: string, params?: LevelObjectParameters[]): Sprite {
        let direction: SpriteWalkingDirection = LevelParametersDecoder.whichDirection(params);

        let observingRobbo: ObserverRobbo = new ObserverRobbo();
        let movingStrategy: MagnetMovingStrategy = new MagnetMovingStrategy();

        let isRobboReachable:IsRobboReachableDefault = new IsRobboReachableDefault(direction, function () {
            if (observingRobbo.get()) {
                return observingRobbo.get().robboLocation.whereIsNearestRobbo();
            } else {
                return null;
            }
        }, function () {
            return movingStrategy.getLastPosition();
        });



        let soundStrategy: MagnetSoundWhenRobboIsFound = new MagnetSoundWhenRobboIsFound();
        let affectingStrategy: MagnetAffectingStrategy = new MagnetAffectingStrategy(isRobboReachable);


        let pullingMovingStrategy:PullingMovingStrategy = new PullingMovingStrategy(SpriteDirectionOperations.inverseDirection(direction));

        let switchingRobboStrategy:SwitchRobboMovingStrategy = new SwitchRobboMovingStrategy(pullingMovingStrategy);

        affectingStrategy.registerMagnetReachedRobbo(soundStrategy);
        affectingStrategy.registerMagnetReachedRobbo(switchingRobboStrategy);

        return {
            type: "world-object-enemy-magnet",
            interestedInWorldContext: observingRobbo,
            movingStrategy: movingStrategy,
            soundStrategy: soundStrategy,
            affectingStrategy: affectingStrategy,
            drawing: {
                getPresentationClass: () => {
                    return SpriteDirectionUiPostfix.addPostfix(name, direction);
                }
            }
        };
    }
}
