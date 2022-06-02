namespace Script {
  import ƒAid = FudgeAid;

  export let animations: ƒAid.SpriteSheetAnimations = {};
  let spritePacman: ƒAid.NodeSprite;

  export async function loadSprites(): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Assets/pacman-sprites.png");
    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet);
    generateSprites(spriteSheet);
  }

  function generateSprites(_spritesheet: ƒ.CoatTextured): void {
    const pacman: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("pacman", _spritesheet);
    pacman.generateByGrid(ƒ.Rectangle.GET(0, 0, 64, 64), 8, 70, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(64));

    const mob: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("mob", _spritesheet);
    mob.generateByGrid(
      ƒ.Rectangle.GET(512, 0, 60, 64),
      4,
      70,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(64)
    );

    animations["pacman"] = pacman;
    animations["mob"] = mob;
  }

  export function setSprite(_node: ƒ.Node): void {
    spritePacman = new ƒAid.NodeSprite("Sprite");
    spritePacman.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spritePacman.setAnimation(<ƒAid.SpriteSheetAnimation>animations["pacman"]);
    spritePacman.setFrameDirection(1);
    spritePacman.mtxLocal.translateZ(0.5);
    spritePacman.framerate = 15;

    _node.addChild(spritePacman);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    spritePacman.mtxLocal.rotateZ(90);
  }

  export function rotateSprite(_direction: string): void {
    if (_direction !== movingDirection) {
      if (
        (_direction === "x" && movingDirection === "y") ||
        (_direction === "-y" && movingDirection === "x") ||
        (_direction === "-x" && movingDirection === "-y") ||
        (_direction === "y" && movingDirection === "-x")
      ) {
        spritePacman.mtxLocal.rotateZ(-90);
      } else if (
        (_direction === "-x" && movingDirection === "y") ||
        (_direction === "x" && movingDirection === "-y") ||
        (_direction === "y" && movingDirection === "x") ||
        (_direction === "-y" && movingDirection === "-x")
      ) {
        spritePacman.mtxLocal.rotateZ(90);
      } else if (
        (_direction === "-x" && movingDirection === "x") ||
        (_direction === "x" && movingDirection === "-x") ||
        (_direction === "y" && movingDirection === "-y") ||
        (_direction === "-y" && movingDirection === "y")
      ) {
        spritePacman.mtxLocal.rotateZ(180);
      }
    }
  }
}
