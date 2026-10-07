import type { Position } from "../levels/LevelProvider";

export interface RobboLocationReader {
    whereIsNearestRobbo():Position;
}
