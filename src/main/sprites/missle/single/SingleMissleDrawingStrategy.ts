import type { DrawStrategy } from "../../Sprite";
import { SpriteWalkingDirection } from "../../Sprite";

export class SingleMissleDrawingStrategy implements DrawStrategy {

    private direction:SpriteWalkingDirection;

    constructor(direction:SpriteWalkingDirection) {
        this.direction = direction;
    }

    private down:string;
    private up:string;
    private left:string;
    private right:string;

    private frequency:number = 0;

    trySwitch():void {
        if(this.frequency%4==0) {
            this.switchSprite();
        }
        this.frequency++;
    }

    switchSprite():void {
        if(this.down=="world-object-missle-single-vertical-first") {
            this.down = "world-object-missle-single-vertical-second";
        } else {
            this.down = "world-object-missle-single-vertical-first";
        }

        if(this.up=="world-object-missle-single-vertical-first") {
            this.up= "world-object-missle-single-vertical-second";
        } else {
            this.up = "world-object-missle-single-vertical-first";
        }

        if(this.left=="world-object-missle-single-horizontal-first") {
            this.left= "world-object-missle-single-horizontal-second";
        } else {
            this.left = "world-object-missle-single-horizontal-first";
        }


        if(this.right=="world-object-missle-single-horizontal-first") {
            this.right= "world-object-missle-single-horizontal-second";
        } else {
            this.right = "world-object-missle-single-horizontal-first";
        }
    }

    getPresentationClass():string {
        this.trySwitch();
        switch (this.direction) {
            case SpriteWalkingDirection.DOWN:
                return this.down;
            case SpriteWalkingDirection.UP:
                return this.up;
            case SpriteWalkingDirection.RIGHT:
                return this.right;
            case SpriteWalkingDirection.LEFT:
                return this.left;
            default:
                return this.right;
        }
    }
}
