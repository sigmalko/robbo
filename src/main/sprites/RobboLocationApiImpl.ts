import type { Position } from "../levels/LevelProvider";
import type { RobboLocationReader } from "./RobboLocationReader";
import type { RobboLocationUpdater } from "./RobboLocationUpdater";

export class RobboLocationApiImpl implements RobboLocationReader, RobboLocationUpdater {

    private location:Position;

    whereIsNearestRobbo():Position {
        if(this.location) {
            return this.location;
        } else {
            return {
                x: 0,
                y: 0
            };
        }
    }

    updateRobboLocation(position:Position):void {
        this.location = position;
    }
}
