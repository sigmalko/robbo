import type { EatableStrategy, EatingSprite } from "../Sprite";

export class ScrewIsEatable implements EatableStrategy {

    private onEaten:()=>void;

    registerOnEaten(callback: ()=>void) {
        this.onEaten = callback;
    }


    onEatable(by:EatingSprite):boolean {
        if(this.onEaten) {
            this.onEaten();
        }
        return true;
    }
}
