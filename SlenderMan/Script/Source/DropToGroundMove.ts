namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization

  export class DropToGroundMove extends ƒ.ComponentScript {
    private static graph: ƒ.Graph;
    private static ground: ƒ.Node;
    private static cmpMeshTerrain: ƒ.ComponentMesh;
    private static meshTerrain: ƒ.MeshTerrain;

    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(DropToGroundMove);
    // Properties may be mutated by users in the editor via the automatically created user interface

    constructor() {
      super();

      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR) return;

      ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.setPosition);
    }

    public setPosition = (_event: Event): void => {
      if (!DropToGroundMove.graph) {
        DropToGroundMove.graph = ƒ.Project.resources[
          "Graph|2022-04-14T12:59:19.588Z|86127"
        ] as ƒ.Graph;
        DropToGroundMove.ground = DropToGroundMove.graph
          .getChildrenByName("Environment")[0]
          .getChildrenByName("Ground")[0];
        DropToGroundMove.cmpMeshTerrain = DropToGroundMove.ground.getComponent(ƒ.ComponentMesh);
        DropToGroundMove.meshTerrain = <ƒ.MeshTerrain>DropToGroundMove.cmpMeshTerrain.mesh;
      }

      const distance = DropToGroundMove.meshTerrain.getTerrainInfo(
        this.node.mtxLocal.translation,
        DropToGroundMove.cmpMeshTerrain.mtxWorld
      ).distance;
      this.node.mtxLocal.translateY(-distance);
    };
  }
}
