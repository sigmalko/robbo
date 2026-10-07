import type { Level } from "../../main/levels/LevelProvider";
import type { LevelDimensions } from "../../main/ui/TableBuilder";
import { LevelDimensionsCalculator, TableBuilder } from "../../main/ui/TableBuilder";
import { LevelsForTesting } from "./LevelsForTesting";
import { describe, it, expect, beforeEach, vi } from "vitest";

describe("LevelDimensionsCalculator", () => {

    it("empty World should have 0x0dimension", () => {
        let level:Level = new LevelsForTesting().downloadLevel(0);
        let dimensions:LevelDimensions = LevelDimensionsCalculator.compute(level);
        expect(dimensions.x).toEqual(0);
        expect(dimensions.y).toEqual(0);
    });

    it("nullable objects World should have 0x0 dimension", () => {
        let level:Level = {
            objects: null
        };
        let dimensions:LevelDimensions = LevelDimensionsCalculator.compute(level);
        expect(dimensions.x).toEqual(0);
        expect(dimensions.y).toEqual(0);
    });

    it("nullable World should have 0x0 dimension", () => {
        let level:Level = null;
        let dimensions:LevelDimensions = LevelDimensionsCalculator.compute(level);
        expect(dimensions.x).toEqual(0);
        expect(dimensions.y).toEqual(0);
    });


    it("rows3cols3easy World should have 3x3 dimension", () => {
        let level:Level = new LevelsForTesting().downloadLevel(1);
        let dimensions:LevelDimensions = LevelDimensionsCalculator.compute(level);
        expect(dimensions.x).toEqual(3);
        expect(dimensions.y).toEqual(3);
    });
});






describe("TableBuilder", () => {

    var tableBuilder:any;
    var builder:TableBuilder = new TableBuilder();
    beforeEach(() =>{
        tableBuilder= { createRow: vi.fn(), createColumn: vi.fn() };
    });

    it("constructs 3 rows", () => {
        let level:Level = new LevelsForTesting().downloadLevel(1);
        builder.build(level, tableBuilder);
        expect(tableBuilder.createRow).toHaveBeenCalledTimes(3);
    });

    it("constructs 3x3=9 cols", () => {
        let level:Level = new LevelsForTesting().rows3cols3easy();
        builder.build(level, tableBuilder);
        expect(tableBuilder.createColumn).toHaveBeenCalledTimes(3*3);
    });
});
