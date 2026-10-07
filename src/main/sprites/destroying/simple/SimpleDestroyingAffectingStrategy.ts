import type { AffectingStrategy, AffectingStrategyContext } from "../../Sprite";
import { SpriteOnMap } from "../../Sprite";

export class SimpleDestroyingAffectingStrategy implements AffectingStrategy {

    private step:number=0;

    affectTheWorld(context:AffectingStrategyContext): void {
        if(this.step>2) {
            let sprite:SpriteOnMap = context.getSpriteOnMap(context.yourPosition);
            if(sprite!=null) {
                sprite.remove();
            }
        }
        this.step++;
    }
}
