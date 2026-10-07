import type { LevelObjectParameters } from "../levels/LevelProvider";
import { RobboFactory } from "./RobboFactory";
import type { Sprite } from "./Sprite";
import { AmmunitionFactory } from "./ammunition/AmmunitionFactory";
import { BarrierFactory } from "./barrier/BarrierFactory";
import { BearFactory } from "./bear/BearFactory";
import { BirdFactory } from "./bird/BirdFactory";
import { BombFactory } from "./bomb/BombFactory";
import { ExplosionFactory } from "./bomb/ExplosionFactory";
import { BoxFactory } from "./box/BoxFactory";
import { DangerBoxFactory } from "./box/DangerBoxFactory";
import { CannonFactory } from "./cannon/CannonFactory";
import { SimpleDestroyingFactory } from "./destroying/simple/SimpleDestroyingFactory";
import { DoorFactory } from "./door/DoorFactory";
import { KeyToDoorFactory } from "./door/KeyToDoorFactory";
import { EyesFactory } from "./eyes/EyesFactory";
import { MagnetFactory } from "./magnet/MagnetFactory";
import { MirrorFactory } from "./mirror/MirrorFactory";
import { SingleMissleFactory } from "./missle/single/SingleMissleFactory";
import { PlaneFactory } from "./plane/PlaneFactory";
import { ScrewFactory } from "./plane/ScrewFactory";
import { QuestionFactory } from "./question/QuestionFactory";
import { SandFactory } from "./sand/SandFactory";
import { WallFactory } from "./wall/WallFactory";
import { WormFactory } from "./worm/WormFactory";

export interface SpritesFactory {
    isForYou(name):boolean;
    create(name:string, params?:LevelObjectParameters[]):Sprite;
}

export class SpritesFactoryChain implements SpritesFactory {

    private factories:Array<SpritesFactory> = new Array();
    private defaultFactory:SpritesFactory;

    constructor() {
        this.factories.push(new MagnetFactory());
        this.factories.push(new BarrierFactory());
        this.factories.push(new RobboFactory());
        this.factories.push(new EyesFactory());
        this.factories.push(new BirdFactory());
        this.factories.push(new WormFactory());
        this.factories.push(new CannonFactory());
        this.factories.push(new BearFactory());
        this.factories.push(new BoxFactory());
        this.factories.push(new DangerBoxFactory());
        this.factories.push(new DoorFactory());
        this.factories.push(new KeyToDoorFactory());
        this.factories.push(new PlaneFactory());
        this.factories.push(new ScrewFactory());
        this.factories.push(new AmmunitionFactory());
        this.factories.push(new BombFactory());
        this.factories.push(new QuestionFactory());
        this.factories.push(new MirrorFactory());
        // created by others (robbo,cannon,bird)
        this.factories.push(new SingleMissleFactory());
        this.factories.push(new SimpleDestroyingFactory());
        this.factories.push(new SandFactory());
        this.factories.push(new ExplosionFactory());

        // always accepts
        this.factories.push(new WallFactory());
        this.defaultFactory = new WallFactory();
    }

    isForYou(name):boolean {
        return true;
    }

    create(name:string, params?:LevelObjectParameters[]):Sprite {
        for(let factory of this.factories) {
            if(factory.isForYou(name)) {
                return factory.create(name, params);
            }
        }
    }
}
