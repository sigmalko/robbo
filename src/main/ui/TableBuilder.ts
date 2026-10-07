import type { Level } from "../levels/LevelProvider";
import type { TableBuildingGui } from "./GuiLevelOperations";

export class TableBuilder {

    build(level:Level, gui:TableBuildingGui):LevelDimensions {
        return this.drawBoundaries(level, gui);
    }

    private drawBoundaries(level:Level, gui:TableBuildingGui) {
        // draw map
        let dimensions:LevelDimensions = LevelDimensionsCalculator.compute(level);
        for(let y:number=0; y<dimensions.y; y++) {
            gui.createRow();
            for(let x:number=0; x<dimensions.x; x++) {
                gui.createColumn(x);
            }
        }
        return dimensions;
    }
}

export class LevelDimensionsCalculator {

    static compute(level:Level):LevelDimensions {
        let dimensions:LevelDimensions = {
            x: 0,
            y: 0
        };
        if(level && level.objects) {
            for (let objectInTheWorld of level.objects) {
                if (objectInTheWorld.position.x > dimensions.x) {
                    dimensions.x = objectInTheWorld.position.x;
                }
                if (objectInTheWorld.position.y > dimensions.y) {
                    dimensions.y = objectInTheWorld.position.y;
                }
            }
        }
        if(dimensions.x>0) {
            dimensions.x++;
        }
        if(dimensions.y>0) {
            dimensions.y++;
        }
        return dimensions;
    }
}

export interface LevelDimensions {
    x:number;
    y:number;
}
