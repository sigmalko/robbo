import type { EatingSprite, SpriteData } from "../Sprite";

export class KeysForDoorsCounter implements SpriteData {
    private counter:number = 0;

    increment():void {
        this.counter++;
    }

    tryToUseKey():boolean {
        if(this.counter>0) {
            this.counter--;
            return true;
        } else {
            return false;
        }
    }


    static load(by:EatingSprite):KeysForDoorsCounter {
        let counter:KeysForDoorsCounter;
        let data:SpriteData = by.getData("door");
        if(!data) {
            counter = new KeysForDoorsCounter();
            by.setData("door", counter);
        } else {
            counter = <KeysForDoorsCounter>data;
        }
        return counter;
    }
}
