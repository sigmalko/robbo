import type { Position } from "../levels/LevelProvider";
import jQuery from "jquery";
import type { Sprite } from "../sprites/Sprite";

export interface TableBuildingGui {
    createRow():void;
    createColumn(x:number):void;
}

export interface SpritesPainter {
    drawSprite(position:Position, sprite:Sprite):void;
}

export class GuiLevelOperations implements TableBuildingGui, SpritesPainter {

    private tbody:JQuery;

    constructor(tbody:JQuery) {
        this.tbody = tbody;
        this.clearTable();
    }

    private clearTable():void {
        this.tbody.find("tr").remove();
    }


    // will be used for adding columns to last row
    private lastRow:JQuery;

    private lastY:number=-1;

    createRow():void {
        let row:JQuery = jQuery("<tr>");
        this.tbody.append(row);

        // cache it for columns
        this.lastRow = row;

        this.lastY++;
    }
    createColumn(x:number):void{
        let column:JQuery = jQuery("<td>");
        this.lastRow.append(column);

        this.cellPut(x, this.lastY, {
            tableCell: column
        });
    }

    private cells:{[id:string] : Cell;} = { };
    private all:Cell[] = [];

    private cellPut(x:number, y:number, cell:Cell) {
        this.cells[x+"_"+y] = cell;
        this.all.push(cell);
    }

    private cellGet(x:number, y:number):Cell {
        return this.cells[x+"_"+y];
    }

    drawSprite(position:Position, sprite:Sprite):void {
        if(sprite) {
            let cell: Cell = this.cellGet(position.x, position.y);
            cell.tableCell.addClass(sprite.drawing.getPresentationClass());
        }
    }

    clearMap() {
        this.all.forEach((c:Cell) => {
            if(c) {
                c.tableCell.removeClass();
            }
        });
    }
}



interface Cell {
    tableCell:JQuery;
}
