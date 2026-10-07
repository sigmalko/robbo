import type { PlaySoundVisitor } from "../sprites/Sprite";

export class PlaySoundVisitorDefault implements PlaySoundVisitor {

    play(name:string):void {
        console.log("Playing sound "+name);
        var audioWalk:HTMLAudioElement = <HTMLAudioElement>document.getElementById(name);
        audioWalk.pause();
        audioWalk.currentTime= 0;
        audioWalk.play();
    }
}
