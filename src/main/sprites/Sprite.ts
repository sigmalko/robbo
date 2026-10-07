import type { Position } from "../levels/LevelProvider";
import type { SpriteOnMapFactory, WorldContext } from "./World";

export interface Sprite {
    type: string;
    drawing: DrawStrategy;
    keyboardReaction?: KeyboardStrategy;
    movingStrategy?: MovingStrategy;
    interestedInWorldContext?: InterestedInWorldContext;
    soundStrategy?: SoundStrategy;
    affectingStrategy?: AffectingStrategy;
    eatable?:EatableStrategy;
    pushable?:PushableStrategy;
    killable?:KillableStrategy;
}

// --------------------

export interface PushableStrategy {
    tryToPush(context:PushableStrategyContext):boolean;
}

export interface PushableStrategyContext {
    direction:Position;
    subject: SpriteOnMap;
    isSomethingOn: (nextPosition: Position)=>boolean;
}

export interface KillableStrategy {
    onKilling(context:KillableStrategyContext):void;
}

export interface KillableStrategyContext {
    where:Position;
    factory: SpriteOnMapFactory;
    getSpriteOnMap: (position: Position)=>SpriteOnMap
}

export interface EatableStrategy {
    // boolean is for voting
    onEatable(by:EatingSprite):boolean;
}

export interface EatingSprite {
    getData(name:string):SpriteData;
    setData(name:string, data:SpriteData):void;
}

export interface SpriteData {

}

export interface AffectingStrategy {
    affectTheWorld(context:AffectingStrategyContext): void;
}

export interface AffectingStrategyContext {
    yourPosition: Position;
    isSomethingOn: (nextPosition: Position)=>boolean;
    getSpriteOnMap: (position: Position)=>SpriteOnMap;
    factory: SpriteOnMapFactory;
}

export interface FiringListener {
    onFire(direction:SpriteWalkingDirection):void;
}

export interface AffectingContext {

}

export interface SoundStrategy {
    gameTact(playVisitor: PlaySoundVisitor): void;
}

export interface PlaySoundVisitor {
    play(name: string): void;
}

// --------------------


export interface InterestedInWorldContext {
    set(worldContext: WorldContext);
}

export enum SpriteWalkingDirection {
    UP,         // 0
    DOWN,       // 1
    LEFT,       // 2
    RIGHT,      // 3
    STAND       // 4
}

export class SpriteDirectionUiPostfix {

    static addPostfix(prefix: string, direction: SpriteWalkingDirection): string {
        switch (direction) {
            case SpriteWalkingDirection.UP:
                return prefix + "-up";
            case SpriteWalkingDirection.DOWN:
                return prefix + "-down";
            case SpriteWalkingDirection.LEFT:
                return prefix + "-left";
            case SpriteWalkingDirection.RIGHT:
                return prefix + "-right";
            default:
                return prefix + "-right";
        }
    }
}

export class SpriteDirectionOperations {
    static inverseDirection(direction: SpriteWalkingDirection): SpriteWalkingDirection {
        switch (direction) {
            case SpriteWalkingDirection.LEFT:
                return SpriteWalkingDirection.RIGHT;
            case SpriteWalkingDirection.RIGHT:
                return SpriteWalkingDirection.LEFT;
            case SpriteWalkingDirection.UP:
                return SpriteWalkingDirection.DOWN;
            case SpriteWalkingDirection.DOWN:
                return SpriteWalkingDirection.UP;
            case SpriteWalkingDirection.STAND:
                return SpriteWalkingDirection.STAND;
            default:
                return SpriteWalkingDirection.RIGHT;
        }
    }

    static getName(direction: SpriteWalkingDirection):string {
        switch (direction) {
            case SpriteWalkingDirection.LEFT:
                return "LEFT";
            case SpriteWalkingDirection.RIGHT:
                return "RIGHT";
            case SpriteWalkingDirection.UP:
                return "UP";
            case SpriteWalkingDirection.DOWN:
                return "DOWN";
            case SpriteWalkingDirection.STAND:
                return "STAND";
            default:
                return "RIGHT";
        }
    }

    static whatPositionOn(direction: SpriteWalkingDirection, from: Position): Position {
        let nextPosition: Position = {
            x: from.x,
            y: from.y
        };
        switch (direction) {
            case SpriteWalkingDirection.UP:
                nextPosition.y--;
                break;
            case SpriteWalkingDirection.DOWN:
                nextPosition.y++;
                break;
            case SpriteWalkingDirection.LEFT:
                nextPosition.x--;
                break;
            case SpriteWalkingDirection.RIGHT:
                nextPosition.x++;
                break;
            default:
        }

        return nextPosition;
    }

    static whatPositionOnDouble(direction1: SpriteWalkingDirection, direction2: SpriteWalkingDirection, from: Position): Position {
        let nextPosition: Position = {
            x: from.x,
            y: from.y
        };
        switch (direction1) {
            case SpriteWalkingDirection.UP:
                nextPosition.y--;
                break;
            case SpriteWalkingDirection.DOWN:
                nextPosition.y++;
                break;
            case SpriteWalkingDirection.LEFT:
                nextPosition.x--;
                break;
            case SpriteWalkingDirection.RIGHT:
                nextPosition.x++;
                break;
            default:
        }

        switch (direction2) {
            case SpriteWalkingDirection.UP:
                nextPosition.y--;
                break;
            case SpriteWalkingDirection.DOWN:
                nextPosition.y++;
                break;
            case SpriteWalkingDirection.LEFT:
                nextPosition.x--;
                break;
            case SpriteWalkingDirection.RIGHT:
                nextPosition.x++;
                break;
            default:
        }

        return nextPosition;
    }
}

export class SpriteOnMap {

    private current: Position;
    private sprite: Sprite;

    //
    removeHandler:(candidate:SpriteOnMap)=>void;

    setRemoveHandler(removeHandler:(candidate:SpriteOnMap)=>void) {
        this.removeHandler = removeHandler;
    }

    canBeKilled():boolean {
        if(this.sprite!=null && this.sprite.killable!=null) {
            return true;
        } else {
            return false;
        }
    }

    kill(factory: SpriteOnMapFactory, getSpriteOnMap: (position: Position)=>SpriteOnMap):void {
        this.remove();
        this.sprite.killable.onKilling({
            where: this.current,
            factory: factory,
            getSpriteOnMap: getSpriteOnMap
        });
    }


    private removingWasOrdered:boolean = false;
    remove():void {
        this.removingWasOrdered = true;

    }

    considerRemoving() {
        if(this.removingWasOrdered) {
            this.removeHandler(this);
        }
    }

    getPosition(): Position {
        return this.current;
    }

    changePosition(newPosition: Position) {
        let changed: boolean = false;
        if (this.current.x != newPosition.x || this.current.y != newPosition.y) {
            changed = true;
        }
        this.current = newPosition;
        if (changed) {
            for (let listener of this.movingListeners) {
                listener(this);
            }
        }
    }

    private movingListeners: Array<(sprite: SpriteOnMap)=>void> = new Array();

    registerListener(onMoved: (sprite: SpriteOnMap)=>void) {
        this.movingListeners.push(onMoved);
        onMoved(this);
    }

    getSprite(): Sprite {
        return this.sprite;
    }

    constructor(sprite: Sprite, position: Position) {
        this.current = position;
        this.sprite = sprite;
    }
}

export interface MovingStrategy {
    updatePosition(context:MovingStrategyContext):Position;
}

export interface MovingStrategyContext {
    current: Position;
    isSomethingOn: (nextPosition: Position)=>boolean;
    getSpriteOnMap: (position: Position)=>SpriteOnMap;
}

export interface DrawStrategy {
    getPresentationClass(): string;
}

export interface KeyboardStrategy {
    up(fire:boolean): void;
    down(fire:boolean): void;
    left(fire:boolean): void;
    right(fire:boolean): void;
}
