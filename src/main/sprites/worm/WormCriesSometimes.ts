import type { PlaySoundVisitor, SoundStrategy } from "../Sprite";

export class WormCriesSometimes implements SoundStrategy {

    private step:number=0;

    constructor() {
    }

    gameTact(playVisitor:PlaySoundVisitor):void {
        this.step++;
        if(this.step%75==0) {
            playVisitor.play("worm_sometimes");
        }
    }
}
