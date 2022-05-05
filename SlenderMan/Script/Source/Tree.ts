namespace Script {
  import ƒ = FudgeCore;

  export class Tree extends ƒ.Node {
    public static takenPositions: ƒ.Vector3[] = [];

    constructor(_name: string, _position: ƒ.Vector3) {
      super(_name);

      const cmpTransform: ƒ.ComponentTransform = new ƒ.ComponentTransform();

      Tree.takenPositions.push(_position);
      Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z + 1));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z - 1));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z + 1));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z - 1));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x, _position.y, _position.z - 1));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x, _position.y, _position.z + 1));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x + 1, _position.y, _position.z));
      Tree.takenPositions.push(new ƒ.Vector3(_position.x - 1, _position.y, _position.z));

      this.addComponent(cmpTransform);
      this.mtxLocal.translation = _position;
      this.addComponent(new DropToGroundInitial());
      this.addGraph();
    }

    private async addGraph(): Promise<void> {
      const treeGraph = await ƒ.Project.createGraphInstance(
        ƒ.Project.resources["Graph|2022-04-26T14:53:15.560Z|71402"] as ƒ.Graph
      );
      this.addChild(treeGraph);
    }
  }
}
