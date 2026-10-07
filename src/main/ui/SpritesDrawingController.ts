import type { Level, LevelObject } from "../levels/LevelProvider";
import type { Sprite } from "../sprites/Sprite";
import type { SpritesFactory } from "../sprites/SpritesFactory";
import { SpritesFactoryChain } from "../sprites/SpritesFactory";
import type { SpritesPainter } from "./GuiLevelOperations";

export class SpritesDrawingController {
    private factory: SpritesFactory = new SpritesFactoryChain();

    drawSprites(level: Level, gui: SpritesPainter, onSpriteCreated?: (sprite: Sprite)=>void) {
        for (let spriteDescriptor of level.objects) {
            this.drawSprite(spriteDescriptor, gui, onSpriteCreated);
        }
    }

    private drawSprite(spriteDescriptor: LevelObject, gui: SpritesPainter, onSpriteCreated?: (sprite: Sprite)=>void) {
        if (spriteDescriptor.type) {


            // TODO: creating and driwing should be separated
            // TODO: BAD DESIGN
            let sprite: Sprite = this.factory.create(spriteDescriptor.type);
            if (onSpriteCreated != null) {
                onSpriteCreated(sprite);
            }

            gui.drawSprite(spriteDescriptor.position, sprite);
        }
    }
}
