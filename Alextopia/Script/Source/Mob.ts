namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export class Mob extends ƒ.Node {
    private movement: ƒ.Vector3 = new ƒ.Vector3(0, -1 / 600, 0);
    private lastPath: ƒ.Vector3 = new ƒ.Vector3(0, 0, 0);

    constructor(_name: string) {
      super(_name);

      const mesh: ƒ.MeshSphere = new ƒ.MeshSphere();
      const material: ƒ.Material = new ƒ.Material(
        "MaterialGhost",
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
      sprite.mtxLocal.translateZ(0.5);
      sprite.framerate = 10;

      this.addChild(sprite);
      this.getComponent(ƒ.ComponentMaterial).clrPrimary = new ƒ.Color(0, 0, 0, 0);
    }

    public move(_paths: ƒ.Node[]): void {

      
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT, ƒ.KEYBOARD_CODE.D])
      ) {
        console.log("trying to move right") //Adjust this to max out for one field
        this.mtxLocal.translateY(1);
      }
  
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN, ƒ.KEYBOARD_CODE.S])
      ) {
        this.mtxLocal.translateX(-1);
      }
  
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT, ƒ.KEYBOARD_CODE.A])
      )  {
        this.mtxLocal.translateY(-1);
      }
  
      if (
        ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP, ƒ.KEYBOARD_CODE.W])
      ) {
        this.mtxLocal.translateX(1);
      }
/*
      if (
        (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
        (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
        (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
        (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
      ) {
        const possiblePaths: ƒ.Node[] = [];

        // get possible paths
        for (const path of _paths) {
          if (
            path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
            !path.mtxLocal.translation.equals(this.mtxLocal.translation)
          ) {
            const isEvenPath =
              (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;

            const isEvenLocal =
              (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                2 ===
              0;

            if (isEvenPath !== isEvenLocal) {
              possiblePaths.push(path);
            }
          }
        }

        // lower probability for going back to same path
        const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));

        if (possiblePaths.length !== 1 && index !== -1) {
          const pathsCopy = possiblePaths.slice();
          pathsCopy.splice(index, 1);

        }

        const path = possiblePaths[Math.floor(0.2 * possiblePaths.length)];

        this.lastPath.set(
          Math.round(this.mtxLocal.translation.x),
          Math.round(this.mtxLocal.translation.y),
          0
        );

        // set moving direction
        if (path) {
          if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
            this.movement.set(0, 1 / 600, 0);
          } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
            this.movement.set(1 / 600, 0, 0);
          } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
            this.movement.set(0, -1 / 600, 0);
          } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
            //this.movement.set(-1 / 600, 0, 0);
            this.mtxLocal.translation.x -= 1;
          }
        }
      }
      this.mtxLocal.translate(this.movement);
    
*/


      /*if (
        (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
        (this.mtxLocal.translation.x + 0.025) % 1 < 0.05 &&
        (this.mtxLocal.translation.y + 0.025) % 1 < 0.05 &&
        (this.mtxLocal.translation.x + 0.025) % 1 < 0.05
      ) {
        const possiblePaths: ƒ.Node[] = [];

        // get possible paths
        for (const path of _paths) {
          if (
            path.mtxLocal.translation.equals(this.mtxLocal.translation, 1.05) &&
            !path.mtxLocal.translation.equals(this.mtxLocal.translation)
          ) {
            const isEvenPath =
              (path.mtxLocal.translation.y + path.mtxLocal.translation.x) % 2 === 0;

            const isEvenLocal =
              (Math.round(this.mtxLocal.translation.y) + Math.round(this.mtxLocal.translation.x)) %
                2 ===
              0;

            if (isEvenPath !== isEvenLocal) {
              possiblePaths.push(path);
            }
          }
        }

        // lower probability for going back to same path
        const index = possiblePaths.findIndex((p) => p.mtxLocal.translation.equals(this.lastPath));

        if (possiblePaths.length !== 1 && index !== -1) {
          const pathsCopy = possiblePaths.slice();
          pathsCopy.splice(index, 1);

          possiblePaths.push(...pathsCopy);
          possiblePaths.push(...pathsCopy.reverse());
          possiblePaths.push(...pathsCopy);
          possiblePaths.push(...pathsCopy.reverse());
          possiblePaths.push(...pathsCopy);
          possiblePaths.push(...pathsCopy.reverse());
          possiblePaths.push(...pathsCopy.reverse());
          possiblePaths.push(...pathsCopy);
          possiblePaths.push(...pathsCopy.reverse());
          possiblePaths.push(...pathsCopy);
          possiblePaths.push(...pathsCopy);
        }

        const path = possiblePaths[Math.floor(Math.random() * possiblePaths.length)];

        this.lastPath.set(
          Math.round(this.mtxLocal.translation.x),
          Math.round(this.mtxLocal.translation.y),
          0
        );

        // set moving direction
        if (path) {
          if (path.mtxLocal.translation.y > Math.round(this.mtxLocal.translation.y)) {
            this.movement.set(0, 1 / 60, 0);
          } else if (path.mtxLocal.translation.x > Math.round(this.mtxLocal.translation.x)) {
            this.movement.set(1 / 60, 0, 0);
          } else if (path.mtxLocal.translation.y < Math.round(this.mtxLocal.translation.y)) {
            this.movement.set(0, -1 / 60, 0);
          } else if (path.mtxLocal.translation.x < Math.round(this.mtxLocal.translation.x)) {
            this.movement.set(-1 / 60, 0, 0);
          }
        }
      }
      this.mtxLocal.translate(this.movement);*/
    }
  }
}
