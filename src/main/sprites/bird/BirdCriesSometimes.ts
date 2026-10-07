import type { PlaySoundVisitor, SoundStrategy } from "../Sprite";

export class BirdCriesSometimes implements SoundStrategy {

    private step:number=0;

    constructor() {
    }

    gameTact(playVisitor:PlaySoundVisitor):void {
        this.step++;
        if(this.step%100==0) {
            playVisitor.play("bird_sometimes");
        }
    }
}
