import type { Level } from "../../main/levels/LevelProvider";
import type { SpritesFactory } from "../../main/sprites/SpritesFactory";
import { SpritesFactoryChain } from "../../main/sprites/SpritesFactory";
import { World } from "../../main/sprites/World";
import { LevelsForTestingWorld } from "./LevelsForTestingWorld";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("World", () => {

    it("World constructor needs level and sprites factory", () => {
        let level:Level = new LevelsForTestingWorld().rows20cols10andSandInThe5x5();
        let factory:SpritesFactory = new SpritesFactoryChain();

        let world:World = new World(level, factory);
        expect(world).not.toBeNull();
    });

    it("Sprites factory is used once because there is only one SAND", () => {
        let level:Level = new LevelsForTestingWorld().rows20cols10andSandInThe5x5();
        let factory:any = { create: vi.fn() };

        new World(level, factory);
        expect(factory.create).toHaveBeenCalledTimes(1);
    });

    it("Sprites factory is used 4 times because there is 1 robbo and 3 sands", () => {
        let level:Level = new LevelsForTestingWorld().rows30cols15blankAndOneRobboAndThreeSands();
        let factory:any = { create: vi.fn() };

        new World(level, factory);
        expect(factory.create).toHaveBeenCalledTimes(4);
    });

    it("Sprites factory creates one sprite based on name world-object-sand", () => {
        let level:Level = new LevelsForTestingWorld().rows20cols10andSandInThe5x5();
        let factory:any = { create: vi.fn() };

        new World(level, factory);
        expect(factory.create).toHaveBeenCalledWith("world-object-sand", []);
    });

    it("Sprites factory creates 4 sprites three sands and 1 robbo", () => {
        let level:Level = new LevelsForTestingWorld().rows30cols15blankAndOneRobboAndThreeSands();
        let factory:any = { create: vi.fn() };

        new World(level, factory);
        expect(factory.create).toHaveBeenCalledWith("world-object-sand", []);
        expect(factory.create).toHaveBeenCalledWith("world-object-sand", []);
        expect(factory.create).toHaveBeenCalledWith("world-object-sand", []);
        expect(factory.create).toHaveBeenCalledWith("world-object-robbo", []);
    });

    it("World draws 4 sprites: it draws 4 sprites =  3 sands and 1 robbo", () => {
        let level:Level = new LevelsForTestingWorld().rows30cols15blankAndOneRobboAndThreeSands();
        let factory:any = { create: vi.fn() };
        let painter:any = { drawSprite: vi.fn() };

        let world:World = new World(level, factory);
        world.drawSpritesHere(painter);

        expect(painter.drawSprite).toHaveBeenCalledTimes(4);
    });

    it("World draws 4 sprites on right positions: it draws 4 sprites =  3 sands and 1 robbo", () => {
        let level:Level = new LevelsForTestingWorld().rows30cols15blankAndOneRobboAndThreeSands();
        let factory:SpritesFactory = new SpritesFactoryChain();
        let painter:any = { drawSprite: vi.fn() };

        let world:World = new World(level, factory);
        world.drawSpritesHere(painter);

        expect(painter.drawSprite).toHaveBeenCalledWith({
            x: 3,
            y: 3
        }, expect.any(Object));

        expect(painter.drawSprite).toHaveBeenCalledWith({
            x: 4,
            y: 3
        }, expect.any(Object));

        expect(painter.drawSprite).toHaveBeenCalledWith({
            x: 5,
            y: 3
        }, expect.any(Object));

        expect(painter.drawSprite).toHaveBeenCalledWith({
            x: 10,
            y: 10
        }, expect.any(Object));
    });



    it("World registers handler for each created sprite - it is called 4 times - for 3 sands and for 1 robbo", () => {
        let level:Level = new LevelsForTestingWorld().rows30cols15blankAndOneRobboAndThreeSands();
        let factory:SpritesFactory = new SpritesFactoryChain();
        let world:World = new World(level, factory);

        let onSpriteCreated:any = { onSpriteCreated: vi.fn() };
        world.registerHandlerForEachCreatedSprite(onSpriteCreated.onSpriteCreated);

        expect(onSpriteCreated.onSpriteCreated).toHaveBeenCalledTimes(4);
    });




});
