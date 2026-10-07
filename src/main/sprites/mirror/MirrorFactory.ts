import type { LevelObjectParameters } from "../../levels/LevelProvider";
import type { DrawStrategy, Sprite } from "../Sprite";
import type { SpritesFactory } from "../SpritesFactory";

export class MirrorFactory implements SpritesFactory {

    isForYou(name):boolean {
        return name=="world-object-mirror";
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        return {
            type: "world-object-mirror",
            drawing: new MirrorStatesSpriteDrawStrategy("world-object-mirror-first", "world-object-mirror-second", 4)
        };
    }
}

// TODO: DRY
export class MirrorStatesSpriteDrawStrategy implements DrawStrategy {

    private sequence:number;
    private whenTrue:string;
    private whenFalse:string;
    private frequency:number;

    constructor(whenTrue:string, whenFalse:string, frequency:number) {
        this.whenTrue = whenTrue;
        this.whenFalse = whenFalse;
        this.sequence = 0;
        this.frequency = frequency;
        if(!this.frequency) {
            this.frequency = 2;
        }
        this.current = whenTrue;
    }

    private current:string;

    getPresentationClass():string {
        this.sequence++;
        if(this.sequence%this.frequency==0) {
            this.change();
        }
        return this.current;
    }

    change():void {
        if(this.current==this.whenTrue) {
            this.current = this.whenFalse;
        } else {
            this.current = this.whenTrue;
        }
    }
}
