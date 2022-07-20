/*namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;
  
    export class ObserverMob extends ƒ.Node {
      //private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
      //private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);
  
      private health: number = healthUnitSmall;
      private dmg: number = dmgUnitSmall;
      
  
      constructor(_name: string) {
        super(_name);
  
        const mesh: ƒ.MeshSphere = new ƒ.MeshSphere();
        const material: ƒ.Material = new ƒ.Material(
          "MaterialMobP2",
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
        sprite.setAnimation(<ƒAid.SpriteSheetAnimation>animations["mobP2"]);
        sprite.setFrameDirection(1);
        sprite.mtxLocal.translateZ(0.1);
        sprite.mtxLocal.translateY(0.1);
        sprite.framerate = 8;
        sprite.mtxLocal.scale(new ƒ.Vector3(1, 1, 1));
  
  
        this.addChild(sprite);
        this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
  
        this.dispatchEvent(new Event("playSpawnSound", {bubbles: true}));
      }



    }
}*/