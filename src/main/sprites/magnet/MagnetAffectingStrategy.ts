import type { AffectingStrategy, AffectingStrategyContext } from "../Sprite";
import { SpriteOnMap } from "../Sprite";
import type { IsVictimReachable } from "./IsVictimReachable";
import type { PullingListener } from "./PullingListener";

export class MagnetAffectingStrategy implements AffectingStrategy {

    private victim:IsVictimReachable;
    private pullingStarted:boolean = false;

    constructor(victim:IsVictimReachable) {
        this.victim = victim;
    }

    affectTheWorld(context:AffectingStrategyContext):void {
        if(this.victim.isVictimReachable(context.isSomethingOn)) {
            if(!this.pullingStarted) {
                this.pullingStarted = true;
                this.fireStart(context.getSpriteOnMap(this.victim.victimsPosition()));
                console.log("Robbo has ENTERED into Magnet Space");
            }
        } else {
            if(this.pullingStarted) {
                this.pullingStarted = false;
                this.fireStop();
                console.log("Robbo has LEFT the Magnet Space");
            }
        }
    }

    private listeners:Array<PullingListener> = new Array();

    registerMagnetReachedRobbo(listener:PullingListener) {
        this.listeners.push(listener);
    }

    fireStart(sprite:SpriteOnMap):void {
        for(let listener of this.listeners) {
            listener.onPullingStarted(sprite);
        }
    }

    fireStop():void {
        for(let listener of this.listeners) {
            listener.onPullingStopped();
        }
    }
}
