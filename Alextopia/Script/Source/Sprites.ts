namespace Script {
  import ƒAid = FudgeAid;

  export let animations: ƒAid.SpriteSheetAnimations = {};
  let spriteWater: ƒAid.NodeSprite;
  let spritePaths: ƒAid.NodeSprite;
  let spriteCat: ƒAid.NodeSprite;
  let spriteCatThrow: ƒAid.NodeSprite;
  let spriteCatWin: ƒAid.NodeSprite;

  export async function loadSprites(): Promise<void> {
    let imgSpriteSheet: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheet.load("Assets/3232SpriteTP.png");
    let spriteSheet: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheet);

    let imgSpriteSheetCAT: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheetCAT.load("Assets/StateMachine/PMWalk.png");
    let spriteSheetCAT: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheetCAT);

    let imgSpriteSheetCATThrow: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheetCATThrow.load("Assets/StateMachine/PMThrow.png");
    let spriteSheetCATThrow: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheetCATThrow);

    let imgSpriteSheetCATWin: ƒ.TextureImage = new ƒ.TextureImage();
    await imgSpriteSheetCATWin.load("Assets/StateMachine/PMJump.png");
    let spriteSheetCATWin: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, imgSpriteSheetCATWin);
    //generateSprites();

    generateSprites(spriteSheet, spriteSheetCAT, spriteSheetCATThrow, spriteSheetCATWin);
  }

  function generateSprites(_spritesheet: ƒ.CoatTextured, _spriteSheetCAT: ƒ.CoatTextured, _spriteSheetCATThrow: ƒ.CoatTextured, _spriteSheetCATWin: ƒ.CoatTextured): void {

    // ------------------------ Mobs p1 --------------------------------
    const mob: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("mob", _spritesheet);
    mob.generateByGrid(
      ƒ.Rectangle.GET(160, 0, 32, 32),
      4,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );
    const mob2: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("mob2", _spritesheet);
    mob2.generateByGrid(
      ƒ.Rectangle.GET(288, 0, 32, 32),
      4,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    // ------------------------ Mobs p2 --------------------------------
    const mobP2: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("mobP2", _spritesheet);
    mobP2.generateByGrid(
      ƒ.Rectangle.GET(416, 0, 32, 32),
      4,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );
    const mob2P2: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("mob2P2", _spritesheet);
    mob2P2.generateByGrid(
      ƒ.Rectangle.GET(544, 0, 32, 32),
      4,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    // ------------------------ Water --------------------------------
    const water: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("water", _spritesheet);
    water.generateByGrid(ƒ.Rectangle.GET(0, 0, 32, 32), 3, 32, ƒ.ORIGIN2D.CENTER, ƒ.Vector2.X(32));

    // ------------------------ Statemachine IDLE --------------------------------
    const cat: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("cat", _spriteSheetCAT);
    cat.generateByGrid(
      ƒ.Rectangle.GET(0, 0, 32, 32),
      6,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    // ------------------------ Statemachine THROW --------------------------------
    const catThrow: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("catThrow", _spriteSheetCATThrow);
    catThrow.generateByGrid(
      ƒ.Rectangle.GET(0, 0, 32, 32),
      4,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    // ------------------------ Statemachine WIN --------------------------------
    const catWin: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("catWin", _spriteSheetCATWin);
    catWin.generateByGrid(
      ƒ.Rectangle.GET(0, 0, 32, 32),
      8,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    // ------------------------ Paths --------------------------------
    const paths: ƒAid.SpriteSheetAnimation = new ƒAid.SpriteSheetAnimation("paths", _spritesheet);
    paths.generateByGrid(
      ƒ.Rectangle.GET(96, 0, 32, 32),
      1,
      32,
      ƒ.ORIGIN2D.CENTER,
      ƒ.Vector2.X(32)
    );

    animations["mob"] = mob;
    animations["mob2"] = mob2;
    animations["mobP2"] = mobP2;
    animations["mob2P2"] = mob2P2;
    animations["paths"] = paths;
    animations["water"] = water;
    animations["cat"] = cat;
    animations["catThrow"] = catThrow;
    animations["catWin"] = catWin;
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
  }

  export function setSpriteCat(_node: ƒ.Node): void {
    spriteCat = new ƒAid.NodeSprite("SpriteCat");
    spriteCat.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteCat.setAnimation(<ƒAid.SpriteSheetAnimation>animations["cat"]);
    spriteCat.setFrameDirection(1);
    spriteCat.mtxLocal.translateZ(0.0001);
    spriteCat.framerate = 5;

    _node.addChild(spriteCat);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    //spriteCat.mtxLocal.rotateZ(90);
  }
  export function setSpriteCatThrow(_node: ƒ.Node): void {
    spriteCatThrow = new ƒAid.NodeSprite("SpriteCatThrow");
    spriteCatThrow.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteCatThrow.setAnimation(<ƒAid.SpriteSheetAnimation>animations["catThrow"]);
    spriteCatThrow.setFrameDirection(1);
    spriteCatThrow.mtxLocal.translateZ(0.0002);
    spriteCatThrow.framerate = 5;

    _node.addChild(spriteCatThrow);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    //spriteCat.mtxLocal.rotateZ(90);
  }
  export function setSpriteCatWin(_node: ƒ.Node): void {
    spriteCatWin = new ƒAid.NodeSprite("SpriteCatWin");
    spriteCatWin.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
    spriteCatWin.setAnimation(<ƒAid.SpriteSheetAnimation>animations["catWin"]);
    spriteCatWin.setFrameDirection(1);
    spriteCatWin.mtxLocal.translateZ(0.0002);
    spriteCatWin.framerate = 5;

    _node.addChild(spriteCatWin);
    _node.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    //spriteCat.mtxLocal.rotateZ(90);
  }
}
