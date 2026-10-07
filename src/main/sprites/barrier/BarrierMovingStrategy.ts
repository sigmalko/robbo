import type { Position } from "../../levels/LevelProvider";
import type { MovingStrategy, MovingStrategyContext } from "../Sprite";
import { SpriteWalkingDirection } from "../Sprite";
import { BarrierUtils } from "./BarrierUtils";

export class BarrierMovingStrategy implements MovingStrategy {

    private teleportLeft:Position;
    private teleportRight:Position;
    private direction:SpriteWalkingDirection;
    private step:number = 0;

    constructor(direction:SpriteWalkingDirection) {
        this.direction = direction;
    }

    updatePosition(context:MovingStrategyContext): Position {
        this.tryUpdateTeleportPositions(context);

        let candidatePosition:Position = {
            x: context.current.x,
            y: context.current.y
        };


        this.step++;


        if(this.step%2==0) {
            if (SpriteWalkingDirection.RIGHT == this.direction) {
                candidatePosition.x++;
                if (candidatePosition.x > this.teleportRight.x) {
                    return this.teleportLeft;
                } else {
                    return candidatePosition;
                }
            }
        }

        return context.current;
    }

    private tryUpdateTeleportPositions(context:MovingStrategyContext) {
        if(!this.teleportLeft || !this.teleportRight) {
            this.teleportLeft = BarrierUtils.findTeleportingPoint(SpriteWalkingDirection.LEFT, context.current, "world-object-enemy-barrier", context.getSpriteOnMap);
            this.teleportRight = BarrierUtils.findTeleportingPoint(SpriteWalkingDirection.RIGHT, context.current, "world-object-enemy-barrier", context.getSpriteOnMap);
            console.log("RIGHT: "+this.teleportRight.x+", "+this.teleportRight.y+" LEFT: "+this.teleportLeft.x+", "+this.teleportLeft.y);
        }
    }
}
