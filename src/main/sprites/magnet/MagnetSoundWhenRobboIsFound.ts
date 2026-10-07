import type { PlaySoundVisitor, SoundStrategy } from "../Sprite";
import { SpriteOnMap } from "../Sprite";
import type { PullingListener } from "./PullingListener";

export class MagnetSoundWhenRobboIsFound implements SoundStrategy, PullingListener {

    private step:number = 0;
    private started:boolean = false;
    private pulling:boolean = false;

    onPullingStarted(sprite:SpriteOnMap):void {
        this.pulling = true;
    }
    onPullingStopped():void {
        this.pulling = false;
    }

    gameTact(playVisitor:PlaySoundVisitor):void {
        if(this.pulling) {
            if (!this.started) {
                playVisitor.play("magnet");
                this.started = true;
                this.step = 5;
            } else {
                this.step--;
                if (this.step <= 0) {
                    this.started = false;
                }
            }
        }
    }
}
