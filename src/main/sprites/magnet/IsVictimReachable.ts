import type { Position } from "../../levels/LevelProvider";

export interface IsVictimReachable {
    isVictimReachable(isSomethingOn:(nextPosition:Position)=>boolean):boolean;
    victimsPosition():Position;
}
