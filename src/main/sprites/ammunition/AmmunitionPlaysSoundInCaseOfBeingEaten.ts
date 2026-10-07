import type { PlaySoundVisitor, SoundStrategy } from "../Sprite";

export class AmmunitionPlaysSoundInCaseOfBeingEaten implements SoundStrategy {


    private fired:boolean = false;

    fire():void {
        this.fired = true;
    }

    gameTact(playVisitor:PlaySoundVisitor):void {
        if(this.fired) {
            playVisitor.play("ammo");
        }
    }
}
