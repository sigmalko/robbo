import type { Position } from "../../levels/LevelProvider";
import { SpriteOnMap, SpriteWalkingDirection } from "../Sprite";

export class BarrierUtils {
    static findTeleportingPoint(direction:SpriteWalkingDirection, current: Position, barrierType:string, getSpriteOnMap: (position: Position)=>SpriteOnMap):Position {

        if(SpriteWalkingDirection.LEFT == direction) {
            let x:number=current.x-1;
            while(x>=0) {
                let candidatePoint = {x: x, y: current.y};
                let spriteOnMap:SpriteOnMap = getSpriteOnMap(candidatePoint);
                if(spriteOnMap) {
                    if(spriteOnMap.getSprite().type==barrierType) {
                        x--;
                    } else {
                        return {x: candidatePoint.x+1, y: candidatePoint.y};
                    }
                } else {
                    x--;
                }
            }
            if(x<0) x=0;
            return {x: x+1, y: current.y};
        }

        if(SpriteWalkingDirection.RIGHT == direction) {
            let x:number=current.x+1;
            while(x<10000) {// TODO: magic number
                let candidatePoint = {x: x, y: current.y};
                let spriteOnMap:SpriteOnMap = getSpriteOnMap(candidatePoint);
                if(spriteOnMap) {
                    if(spriteOnMap.getSprite().type==barrierType) {
                        x++;
                    } else {
                        return {x: candidatePoint.x-1, y:candidatePoint.y};
                    }
                } else {
                    x++;
                }
            }
            return {x: x-1, y: current.y};
        }

        return null;
    }
}
