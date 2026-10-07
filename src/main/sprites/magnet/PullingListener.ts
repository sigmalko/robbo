import { SpriteOnMap } from "../Sprite";

export interface PullingListener {
    onPullingStarted(sprite:SpriteOnMap):void;
    onPullingStopped():void;
}
