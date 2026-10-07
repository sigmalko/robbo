import type { DrawStrategy } from "./Sprite";

export class TwoStatesSpriteDrawStrategy implements DrawStrategy {

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
    }

    getPresentationClass():string {
        this.sequence++;
        if(this.sequence%this.frequency==0) {
            return this.whenTrue;
        } else {
            return this.whenFalse;
        }
    }
}
