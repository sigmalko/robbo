import type { DrawStrategy } from "./Sprite";
import { SpriteWalkingDirection } from "./Sprite";

export class DrawStrategyForEachFromFourDirections implements DrawStrategy {

    // first
    private up_first:string;
    private down_first:string;
    private left_first:string;
    private right_first:string;
    // second
    private up_second:string;
    private down_second:string;
    private left_second:string;
    private right_second:string;

    // get direction
    private getDirection:()=>SpriteWalkingDirection;
    private getStepCounter:()=>number;

    constructor(up_first:string, down_first:string, left_first:string, right_first:string,
                up_second:string, down_second:string, left_second:string, right_second:string) {
        // first
        this.up_first = up_first;
        this.down_first = down_first;
        this.left_first = left_first;
        this.right_first = right_first;
        // second
        this.up_second = up_second;
        this.down_second = down_second;
        this.left_second = left_second;
        this.right_second = right_second;
    }

    useThisDirectionProvider(getDirection:()=>SpriteWalkingDirection) {
        this.getDirection = getDirection;
    }

    useThisStepCounterProvider(getStepCounter:()=>number) {
        this.getStepCounter = getStepCounter;
    }

    getPresentationClass():string {
        switch(this.getDirection()) {
            case SpriteWalkingDirection.UP:
                if(this.getStepCounter()%2==0) {
                    return this.up_first;
                } else {
                    return this.up_second;
                }
            case SpriteWalkingDirection.DOWN:
                if(this.getStepCounter()%2==0) {
                    return this.down_first;
                } else {
                    return this.down_second;
                }
            case SpriteWalkingDirection.LEFT:
                if(this.getStepCounter()%2==0) {
                    return this.left_first;
                } else {
                    return this.left_second;
                }
            case SpriteWalkingDirection.RIGHT:
                if(this.getStepCounter()%2==0) {
                    return this.right_first;
                } else {
                    return this.right_second;
                }
            default:
                if(this.getStepCounter()%2==0) {
                    return this.right_first;
                } else {
                    return this.right_second;
                }
        }
    }
}
