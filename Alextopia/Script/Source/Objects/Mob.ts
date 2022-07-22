namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export class Mob extends ƒ.Node {

     health: number = healthUnitSmall;
     dmg: number = dmgUnitSmall;

    constructor(_name: string) {
      super(_name);

      const mesh: ƒ.MeshSphere = new ƒ.MeshSphere();
      const material: ƒ.Material = new ƒ.Material(
        "MaterialMob",
        ƒ.ShaderLit,
        new ƒ.CoatColored()
      );

      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();
      const cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
      const cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
      cmpMaterial.clrPrimary = ƒ.Color.CSS("red");

      this.addComponent(cmpTransform);
      this.addComponent(cmpMesh);
      this.addComponent(cmpMaterial);

      // sprites
      const sprite: ƒAid.NodeSprite = new ƒAid.NodeSprite("Sprite");
      sprite.addComponent(new ƒ.ComponentTransform(new ƒ.Matrix4x4()));
      sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations["mob"]);
      sprite.setFrameDirection(1);
      sprite.mtxLocal.translateZ(0.1);
      sprite.mtxLocal.translateY(0.1);
      sprite.framerate = 8;
      sprite.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 1));

      this.addChild(sprite);
      this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    }
    public spawn():void {
      this.dispatchEvent(new Event("playSpawnSound", {bubbles: true}));
    }
  }
}
