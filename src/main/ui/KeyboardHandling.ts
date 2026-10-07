import type { KeyboardStrategy, Sprite } from "../sprites/Sprite";

export class KeyboardHandling {

    listeners:KeyboardStrategy[] = [];

    constructor() {
        var copiedListener:KeyboardStrategy[] = this.listeners;

        // Notify all listeners when arrow key is pressed
        addEventListener("keydown", function (kn:KeyboardEvent) {
            if(kn.key=="ArrowRight" || kn.key=="ArrowLeft" || kn.key=="ArrowUp"|| kn.key=="ArrowDown") {

                let fire:boolean = false;
                if(kn.ctrlKey) {
                    fire = true;
                }

                copiedListener.forEach((keyboardStrategy:KeyboardStrategy)=> {
                    switch(kn.key) {
                        case "ArrowRight" :
                            keyboardStrategy.right(fire);
                            break;
                        case "ArrowLeft" :
                            keyboardStrategy.left(fire);
                            break;
                        case "ArrowUp":
                            keyboardStrategy.up(fire);
                            break;
                        case "ArrowDown":
                            keyboardStrategy.down(fire);
                            break;
                    }
                });
                kn.preventDefault();
            }
        });
    }


    onSpriteCreated(sprite:Sprite):void {
        if(sprite && sprite.keyboardReaction) {
            this.listeners.push(sprite.keyboardReaction);
        }
    }
}
