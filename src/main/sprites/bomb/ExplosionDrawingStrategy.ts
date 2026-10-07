import type { DrawStrategy } from "../Sprite";

export class ExplosionDrawingStrategy implements DrawStrategy {

    private step:number=0;

    getPresentationClass():string {
        let css:string;
        switch(this.step) {
            case 0:
                css = "world-object-destroying-explosion-first";
                break;
            case 1:
                css = "world-object-destroying-explosion-second";
                break;
            case 2:
                css = "world-object-destroying-explosion-third";
                break;
            default:
                css ="world-object-destroying-explosion-fourth";
                break;
        }
        this.step++;
        return css;
    }

}
