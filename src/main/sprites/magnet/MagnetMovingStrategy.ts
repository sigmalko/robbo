import type { Position } from "../../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "../Sprite";

export class MagnetMovingStrategy implements MovingStrategy {

    private lastPosition:Position;

    getLastPosition():Position {
        return this.lastPosition;
    }

    updatePosition(context:MovingStrategyContext):Position {
        this.lastPosition = context.current;
        return context.current;
    }
}
