import type { Position } from "../../levels/LevelProvider";
import { SpriteWalkingDirection } from "../Sprite";
import type { IsVictimReachable } from "./IsVictimReachable";

export class IsRobboReachableDefault implements IsVictimReachable {
    private whereIsRobbo: ()=>Position;
    private whereAmI: ()=>Position;
    private direction: SpriteWalkingDirection;

    constructor(direction: SpriteWalkingDirection, whereIsRobbo: ()=>Position, whereAmI: ()=>Position) {
        this.direction = direction;
        this.whereIsRobbo = whereIsRobbo;
        this.whereAmI = whereAmI;
    }

    victimsPosition():Position {
        return this.whereIsRobbo();
    }

    isVictimReachable(isSomethingOn:(nextPosition:Position)=>boolean):boolean {
        if(isSomethingOn && this.whereIsRobbo() && this.whereAmI() && this.isInTheSameLine(isSomethingOn)) {
            return true;
        } else {
            return false;
        }
    }

    private isInTheSameLine(isSomethingOn:(nextPosition:Position)=>boolean):boolean {
        switch(this.direction) {
            case SpriteWalkingDirection.RIGHT:
                if(this.whereIsRobbo().y == this.whereAmI().y && this.whereIsRobbo().x > this.whereAmI().x) {
                    for(let x:number=this.whereAmI().x+1; x<this.whereIsRobbo().x; x++) {
                        if(isSomethingOn({x:x, y:this.whereIsRobbo().y})) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            case SpriteWalkingDirection.LEFT:
                if(this.whereIsRobbo().y == this.whereAmI().y && this.whereIsRobbo().x < this.whereAmI().x) {
                    for(let x:number=this.whereAmI().x-1; x>this.whereIsRobbo().x; x--) {
                        if(isSomethingOn({x:x, y:this.whereIsRobbo().y})) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            case SpriteWalkingDirection.UP:
                if(this.whereIsRobbo().x == this.whereAmI().x && this.whereIsRobbo().y < this.whereAmI().y) {
                    for(let y:number=this.whereAmI().y-1; y>this.whereIsRobbo().y; y--) {
                        if(isSomethingOn({x:this.whereIsRobbo().x, y})) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            case SpriteWalkingDirection.DOWN:
                if(this.whereIsRobbo().x == this.whereAmI().x && this.whereIsRobbo().y > this.whereAmI().y) {
                    for(let y:number=this.whereAmI().y+1; y<this.whereIsRobbo().y; y++) {
                        if(isSomethingOn({x:this.whereIsRobbo().x, y})) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    return false;
                }
            default:
                return false;
        }
    }
}
