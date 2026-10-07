import type { Level } from "../../main/levels/LevelProvider";
import { SpritesDrawingController } from "../../main/ui/SpritesDrawingController";
import { TableBuilder } from "../../main/ui/TableBuilder";
import { LevelsForTesting } from "./LevelsForTesting";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("SpritesDrawingController", () => {

        var gui:any;
        var builder:TableBuilder = new TableBuilder();
        var drawingController:SpritesDrawingController = new SpritesDrawingController();

        beforeEach(() =>{
            gui= { createRow: vi.fn(), createColumn: vi.fn(), drawSprite: vi.fn() };
        });

        it("drawSprite is called for only one object in the map", () => {
            let level:Level = new LevelsForTesting().rows20cols10andSandInThe5x5();
            builder.build(level, gui);
            drawingController.drawSprites(level, gui);
            expect(gui.drawSprite).toHaveBeenCalledTimes(1);
        });

        it("drawSprite is called with 5x5 position in the map with one sand", () => {
            let level:Level = new LevelsForTesting().rows20cols10andSandInThe5x5();
            builder.build(level, gui);
            drawingController.drawSprites(level, gui);
            expect(gui.drawSprite).toHaveBeenCalledWith({
                x: 5,
                y: 5
            }, expect.any(Object));
        });
    });
