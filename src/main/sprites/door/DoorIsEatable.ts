import type { EatableStrategy, EatingSprite } from "../Sprite";
import { KeysForDoorsCounter } from "./KeysForDoorsCounter";

export class DoorIsEatable implements EatableStrategy {

    private onEaten:()=>void;

    registerOnEaten(callback: ()=>void) {
        this.onEaten = callback;
    }


    onEatable(by:EatingSprite):boolean {
        let counter:KeysForDoorsCounter = KeysForDoorsCounter.load(by);
        if(this.onEaten && counter.tryToUseKey()) {
            this.onEaten();
            return true;
        } else {
            return false;
        }
    }
}
