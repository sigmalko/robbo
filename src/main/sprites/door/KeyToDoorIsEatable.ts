import type { EatableStrategy, EatingSprite } from "../Sprite";
import { KeysForDoorsCounter } from "./KeysForDoorsCounter";

export class KeyToDoorIsEatable implements EatableStrategy {

    private onEaten:()=>void;

    registerOnEaten(callback: ()=>void) {
        this.onEaten = callback;
    }


    onEatable(by:EatingSprite):boolean {
        let counter:KeysForDoorsCounter = KeysForDoorsCounter.load(by);
        counter.increment();
        if(this.onEaten) {
            this.onEaten();
        }
        return true;
    }
}
