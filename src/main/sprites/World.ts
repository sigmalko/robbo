import type { Level, LevelObjectParameters, Position } from "../levels/LevelProvider";
import type { RobboLocationReader } from "./RobboLocationReader";
import type { PlaySoundVisitor, Sprite } from "./Sprite";
import { SpriteOnMap } from "./Sprite";
import type { SpritesFactory } from "./SpritesFactory";
import type { SpritesPainter } from "../ui/GuiLevelOperations";

export class World {

    private spritesOnMap:Array<SpriteOnMap> = new Array();


    // TODO: stupid design
    private matrix:Array<Array<SpriteOnMap>>;

    private spriteOnMapFactory:SpriteOnMapFactory;

    constructor(level:Level, factory: SpritesFactory) {


        // TODO: stupid design
        this.matrix = new Array(100);       // TODO: 100 is magic number !!! bad approach
        for(let y:number=0; y<100; y++) {
            this.matrix[y] = new Array(100);    // TODO: 100 is magic number !!! bad approach
        }

        this.spriteOnMapFactory = new SpriteOnMapFactoryDefault(factory, this.spritesOnMap, this.matrix, function(sprite:SpriteOnMap) {

        });

        for (let spriteDescriptor of level.objects) {
            if (spriteDescriptor.type) {
               this.spriteOnMapFactory.create(spriteDescriptor.type, spriteDescriptor.position, spriteDescriptor.params);
            }
        }
    }

    // TODO: this is stupid
    registerHandlerForEachCreatedSprite(onSpriteCreated: (sprite: Sprite)=>void) {
        this.spritesOnMap.forEach((spriteOnMap:SpriteOnMap) => {
            onSpriteCreated(spriteOnMap.getSprite());
        });
    }

    attachListenerForMovingOf(spriteType:string, onMoved: (sprite: SpriteOnMap)=>void) {
        this.spritesOnMap.forEach((spriteOnMap:SpriteOnMap) => {
            if(spriteOnMap.getSprite()) {
                if (spriteOnMap.getSprite().type == spriteType) {
                    spriteOnMap.registerListener(onMoved);
                }
            }
        });
    }


    // TODO: to configuration
    private soundVisitor:PlaySoundVisitor;
    registerSoundVisitor(soundVisitor:PlaySoundVisitor) {
        this.soundVisitor = soundVisitor;
    }


    updateWorld(worldContext:WorldContext) {
        this.spritesOnMap.forEach((spriteOnMap:SpriteOnMap) => {
            if(spriteOnMap.getSprite().type!="world-object-robbo") {

//                    if(isNaN(spriteOnMap.getPosition().x)) {
//                        console.log("Undefined "+spriteOnMap.getSprite().type);
//                    }

            // TODO: bad design
            this.matrix[spriteOnMap.getPosition().y][spriteOnMap.getPosition().x] = null;

            if(this.soundVisitor && spriteOnMap.getSprite().soundStrategy) {
                spriteOnMap.getSprite().soundStrategy.gameTact(this.soundVisitor);
            }

            if(spriteOnMap.getSprite().interestedInWorldContext) {
                spriteOnMap.getSprite().interestedInWorldContext.set(worldContext);
            }

            if(spriteOnMap.getSprite().movingStrategy) {
                spriteOnMap.changePosition(spriteOnMap.getSprite().movingStrategy.updatePosition({
                    current: spriteOnMap.getPosition(),
                    isSomethingOn: (nextPosition:Position) => {
                        if(this.matrix[nextPosition.y][nextPosition.x]) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    getSpriteOnMap: (whatIsAt:Position) => {
                        if(this.matrix[whatIsAt.y][whatIsAt.x]) {
                            return this.matrix[whatIsAt.y][whatIsAt.x];
                        } else {
                            return null;
                        }
                    }
                }));
            }

            // TODO: bad design
            // Affecting strategies need access to the object's position after movement.
            this.matrix[spriteOnMap.getPosition().y][spriteOnMap.getPosition().x] = spriteOnMap;

            if(spriteOnMap.getSprite().affectingStrategy) {
                spriteOnMap.getSprite().affectingStrategy.affectTheWorld({
                    yourPosition: spriteOnMap.getPosition(),
                    isSomethingOn: (whatIsAt:Position) => {
                        if(this.matrix[whatIsAt.y][whatIsAt.x]) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    getSpriteOnMap: (whatIsAt:Position) => {
                        if(this.matrix[whatIsAt.y][whatIsAt.x]) {
                            return this.matrix[whatIsAt.y][whatIsAt.x];
                        } else {
                            return null;
                        }
                    },
                    factory: this.spriteOnMapFactory
                });
            }

            // TODO: bad design
            this.matrix[spriteOnMap.getPosition().y][spriteOnMap.getPosition().x] = spriteOnMap;

                spriteOnMap.considerRemoving();
            }
        });





        // BAD DESIGN - POST UPDATE WORLD

        this.spritesOnMap.forEach((spriteOnMap:SpriteOnMap) => {


            if(spriteOnMap.getSprite().type=="world-object-robbo") {


            // TODO: bad design
            this.matrix[spriteOnMap.getPosition().y][spriteOnMap.getPosition().x] = null;

            if(this.soundVisitor && spriteOnMap.getSprite().soundStrategy) {
                spriteOnMap.getSprite().soundStrategy.gameTact(this.soundVisitor);
            }

            if(spriteOnMap.getSprite().interestedInWorldContext) {
                spriteOnMap.getSprite().interestedInWorldContext.set(worldContext);
            }

            if(spriteOnMap.getSprite().movingStrategy) {
                spriteOnMap.changePosition(spriteOnMap.getSprite().movingStrategy.updatePosition({
                    current:spriteOnMap.getPosition(),
                    isSomethingOn: (nextPosition:Position) => {
                        if(this.matrix[nextPosition.y][nextPosition.x]) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    getSpriteOnMap: (whatIsAt:Position) => {
                        if(this.matrix[whatIsAt.y][whatIsAt.x]) {
                            return this.matrix[whatIsAt.y][whatIsAt.x];
                        } else {
                            return null;
                        }
                    }
                }));
            }

            if(spriteOnMap.getSprite().affectingStrategy) {
                spriteOnMap.getSprite().affectingStrategy.affectTheWorld({
                    yourPosition: spriteOnMap.getPosition(),
                    isSomethingOn: (whatIsAt:Position) => {
                        if(this.matrix[whatIsAt.y][whatIsAt.x]) {
                            return true;
                        } else {
                            return false;
                        }
                    },
                    getSpriteOnMap: (whatIsAt:Position) => {
                        if(this.matrix[whatIsAt.y][whatIsAt.x]) {
                            return this.matrix[whatIsAt.y][whatIsAt.x];
                        } else {
                            return null;
                        }
                    },
                    factory: this.spriteOnMapFactory
                });
            }

            // TODO: bad design
            this.matrix[spriteOnMap.getPosition().y][spriteOnMap.getPosition().x] = spriteOnMap;
                spriteOnMap.considerRemoving();
            }
        });

    }


    drawSpritesHere(painter:SpritesPainter):void {
        this.spritesOnMap.forEach((spriteOnMap:SpriteOnMap) => {
            painter.drawSprite(spriteOnMap.getPosition(), spriteOnMap.getSprite());

            // TODO: bad design
            this.matrix[spriteOnMap.getPosition().y][spriteOnMap.getPosition().x] = spriteOnMap;
        });
    }
}



export interface WorldContext {
    robboLocation:RobboLocationReader;
}

export interface SpriteOnMapFactory {
    create(name:string, position:Position, params:LevelObjectParameters[]):SpriteOnMap;
}

export class SpriteOnMapFactoryDefault implements SpriteOnMapFactory {

    private decorated:SpritesFactory;
    private spritesOnMap:Array<SpriteOnMap>;
    private matrix:Array<Array<SpriteOnMap>>;
    private onCreated: (sprite:SpriteOnMap)=>void;

    constructor(decorated:SpritesFactory, spritesOnMap:Array<SpriteOnMap>, matrix:Array<Array<SpriteOnMap>>, onCreated: (sprite:SpriteOnMap)=>void) {
        this.decorated = decorated;
        this.onCreated = onCreated;
        this.spritesOnMap = spritesOnMap;
        this.matrix = matrix;
    }
    create(name:string, position:Position, params:LevelObjectParameters[]):SpriteOnMap {
        if(typeof(params) == "undefined") {
            params = new Array();
        }
        let sprite:Sprite = this.decorated.create(name, params);
        let spriteOnMap:SpriteOnMap = new SpriteOnMap(sprite, position);
        this.onCreated(spriteOnMap);

        spriteOnMap.setRemoveHandler((candidate:SpriteOnMap) => {
            this.matrix[candidate.getPosition().y][candidate.getPosition().x] = null;
            let whereItIs:number = this.spritesOnMap.indexOf(candidate, 0);
            delete this.spritesOnMap[whereItIs];
        });
        this.spritesOnMap.push(spriteOnMap);

        return spriteOnMap;
    }
}
