import type { LevelObjectParameters } from "../../levels/LevelProvider";

export enum ExplosionPropagationStyle {
    FIRST_STAGE,
//        SECOND_STAGE,
    FINISH_STAGE
}

export class ExplosionPropagationStyleOperations {

    static whichStyle(params: LevelObjectParameters[]): ExplosionPropagationStyle {
        let style: ExplosionPropagationStyle = ExplosionPropagationStyle.FIRST_STAGE;
        if (params) {
            for (let p of params) {
                if (p.name == "propagation") {
                    switch (p.value.toUpperCase()) {
                        case "FIRST_STAGE":
                            style = ExplosionPropagationStyle.FIRST_STAGE;
                            break;
  //                          case "SECOND_STAGE":
   //                             style = ExplosionPropagationStyle.SECOND_STAGE;
//                            break;
                        case "FINISH_STAGE":
                            style = ExplosionPropagationStyle.FINISH_STAGE;
                            break;
                    }
                }
            }
        }
        return style;
    }
}
