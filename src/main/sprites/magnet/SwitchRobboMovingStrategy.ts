import type { MovingStrategy, Sprite } from "../Sprite";
import { SpriteOnMap } from "../Sprite";
import type { PullingListener } from "./PullingListener";

export class SwitchRobboMovingStrategy implements PullingListener {

    private pullingMovingStrategy:MovingStrategy;

    constructor(pullingMovingStrategy:MovingStrategy) {
        this.pullingMovingStrategy = pullingMovingStrategy;
    }

    private sprite:Sprite = null;
    private rememberedMovingStrategy:MovingStrategy = null;

    onPullingStarted(sprite:SpriteOnMap):void {
        this.sprite = sprite.getSprite();
        this.rememberedMovingStrategy = this.sprite.movingStrategy;
        this.sprite.movingStrategy = this.pullingMovingStrategy;
    }
    onPullingStopped():void {
        if(this.rememberedMovingStrategy) {
            this.sprite.movingStrategy = this.rememberedMovingStrategy;
            this.sprite = null;
            this.rememberedMovingStrategy =null;
        }
    }
}
