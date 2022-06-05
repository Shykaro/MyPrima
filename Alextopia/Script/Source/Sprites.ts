namespace Script {
  import ƒAid = FudgeAid;

  export let animations: ƒAid.SpriteSheetAnimations = {};
  let spriteWater: ƒAid.NodeSprite;
  let spritePaths: ƒAid.NodeSprite;

  export async function loadSprites(): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Assets/3232SpriteTP.png");
    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet);
    generateSprites(spriteSheet);
  }

  function generateSprites(_spritesheet: ƒ.CoatTextured): void {
    //const pacman: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("pacman", _spritesheet);
    //pacman.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 3, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));

    const water: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("water", _spritesheet);
    water.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 3, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));

    const mob: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("mob", _spritesheet);
    //mob.generateByGrid(
      mob.generateByGrid(
      ƒ.Rectangle.GET(160, 0, 32, 32),
      4,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    const paths: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("paths", _spritesheet);
    //mob.generateByGrid(
      paths.generateByGrid(
      ƒ.Rectangle.GET(96, 0, 32, 32),
      2,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    //animations["pacman"] = pacman;
    animations["mob"] = mob;
    animations["paths"] = paths;
    animations["water"] = water;
  }

  export function setSprite(_node: ƒ.Node): void {
    spriteWater = new ƒAid.NodeSprite("Sprite");
    spriteWater.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteWater.setAnimation(<ƒAid.SpriteSheetAnimation>animations["water"]);
    spriteWater.setFrameDirection(1);
    spriteWater.mtxLocal.translateZ(0.0001);
    spriteWater.framerate = 2;

    _node.addChild(spriteWater);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    //spritePacman.mtxLocal.rotateZ(90);
  }
  export function setSpritePaths(_node: ƒ.Node): void {
    spritePaths = new ƒAid.NodeSprite("Sprite");
    spritePaths.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spritePaths.setAnimation(<ƒAid.SpriteSheetAnimation>animations["paths"]);
    spritePaths.setFrameDirection(1);
    spritePaths.mtxLocal.translateZ(0.0001);
    spritePaths.framerate = 1;

    _node.addChild(spritePaths);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    //spritePacman.mtxLocal.rotateZ(90);
  }
  /*export function setSprite(_node: ƒ.Node): void {
    spritePacman = new ƒAid.NodeSprite("Sprite");
    spritePacman.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spritePacman.setAnimation(<ƒAid.SpriteSheetAnimation>animations["water"]);
    spritePacman.setFrameDirection(1);
    spritePacman.mtxLocal.translateZ(0.0001);
    spritePacman.framerate = 1;

    _node.addChild(spritePacman);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    //spritePacman.mtxLocal.rotateZ(90);
  }*/

  /*export function rotateSprite(_direction: string): void {
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
  }*/
}
