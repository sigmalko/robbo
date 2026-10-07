import type { Position } from "../levels/LevelProvider";

export interface RobboLocationUpdater {
    updateRobboLocation(position:Position):void;
}
