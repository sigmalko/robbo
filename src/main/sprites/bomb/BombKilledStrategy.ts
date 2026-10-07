import type { KillableStrategy, KillableStrategyContext } from "../Sprite";
import { SpriteDirectionOperations, SpriteOnMap, SpriteWalkingDirection } from "../Sprite";

export class BombKilledStrategy implements KillableStrategy {
    onKilling(context:KillableStrategyContext):void {
        let left:SpriteOnMap = context.getSpriteOnMap(SpriteDirectionOperations.whatPositionOn(SpriteWalkingDirection.LEFT, context.where));
        context.factory.create("world-object-destroying-explosion", context.where, []);
    }
}
