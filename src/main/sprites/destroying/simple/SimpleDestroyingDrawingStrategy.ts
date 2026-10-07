import type { DrawStrategy } from "../../Sprite";

export class SimpleDestroyingDrawingStrategy implements DrawStrategy {

    private step:number=0;

    getPresentationClass():string {
        let css:string;
        switch(this.step) {
            case 0:
                css = "world-object-destroying-simple-big";
                break;
            case 1:
                css = "world-object-destroying-simple-medium";
                break;
            default:
                css ="world-object-destroying-simple-small";
                break;
        }
        this.step++;
        return css;
    }

}
