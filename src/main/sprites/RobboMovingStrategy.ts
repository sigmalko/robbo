import type { KeyboardDelta } from "../KeyboardDelta";
import type { Position } from "../levels/LevelProvider";
import type { EatingSprite, FiringListener, MovingStrategy, MovingStrategyContext, SpriteData } from "./Sprite";
import { SpriteOnMap, SpriteWalkingDirection } from "./Sprite";

export class RobboMovingStrategy implements MovingStrategy {

    private choosedDirectionByKeyboard: ()=>KeyboardDelta;

    constructor(choosedDirectionByKeyboard: ()=>KeyboardDelta) {
        this.choosedDirectionByKeyboard = choosedDirectionByKeyboard;
    }

    private step: number = 0;

    stepCounter(): number {
        return this.step;
    }

    private firing:FiringListener;

    registerFiringListener(firing:FiringListener) {
        this.firing = firing;
    }

    fire(direction:SpriteWalkingDirection) {
        if(this.firing) {
            this.firing.onFire(direction);
        }
    }

    updatePosition(context:MovingStrategyContext): Position {
        let nextPosition: Position = {
            x: context.current.x,
            y: context.current.y
        };
        let choosed: KeyboardDelta = this.choosedDirectionByKeyboard();
        if (choosed.x != 0 || choosed.y != 0) {
            this.step++;
            {   // TODO: Refactor IT
                // ==== REFACTOR IT ================================================================
                var audioWalk: HTMLAudioElement = <HTMLAudioElement>document.getElementById("walk");
                audioWalk.currentTime = 0;
                audioWalk.pause();
                audioWalk.play();
                // ==== REFACTOR IT ================================================================
            }
        }


        if(choosed.fire) {

            if (choosed.x < 0) {
                this.fire(SpriteWalkingDirection.LEFT);
            }
            if (choosed.x > 0) {
                this.fire(SpriteWalkingDirection.RIGHT);
            }
            if (choosed.y < 0) {
                this.fire(SpriteWalkingDirection.UP);
            }
            if (choosed.y > 0) {
                this.fire(SpriteWalkingDirection.DOWN);
            }


        } else {
            // one clock tick allows to do only one step
            if (choosed.x < 0) {
                nextPosition.x--;
            }
            if (choosed.x > 0) {
                nextPosition.x++;
            }
            if (choosed.y < 0) {
                nextPosition.y--;
            }
            if (choosed.y > 0) {
                nextPosition.y++;
            }
        }





            let consideredNeighbour: SpriteOnMap = context.getSpriteOnMap(nextPosition);
            if (consideredNeighbour && consideredNeighbour.getSprite()) {
                if(consideredNeighbour.getSprite().eatable) {
                    if (consideredNeighbour.getSprite().eatable.onEatable(this.asEating)) {
                        consideredNeighbour.remove();
                    } else {
                        return context.current;
                    }
                } else if(consideredNeighbour.getSprite().pushable) {
                    if(consideredNeighbour.getSprite().pushable.tryToPush({
                            direction: choosed,
                            subject: consideredNeighbour,
                            isSomethingOn: context.isSomethingOn
                        })) {
                        //   Can be pushed
                    } else {
                        return context.current;
                    }
                } else {
                    return context.current;
                }
            }


        return nextPosition;
    }

    // as eating
    private asEating: EatingSprite = new RobboAsEatingSprite();
}

export class RobboAsEatingSprite implements EatingSprite {

    private mapping: {[name: string]: SpriteData } = {};

    getData(name: string): SpriteData {
        return this.mapping[name];
    }

    setData(name: string, data: SpriteData): void {
        this.mapping[name] = data;
    }
}
