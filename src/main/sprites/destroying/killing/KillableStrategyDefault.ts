import type { KillableStrategy, KillableStrategyContext } from "../../Sprite";

export class KillableStrategyDefault implements KillableStrategy {

    onKilling(context:KillableStrategyContext):void {
        context.factory.create("world-object-destroying-simple", context.where, []);
    }
}
