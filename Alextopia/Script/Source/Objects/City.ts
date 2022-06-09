namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;

    export class City extends ƒ.Node {

        constructor(_name: string) {
            super(_name);

            const mtrCity: ƒ.Material = new ƒ.Material(
                "City",
                ƒ.ShaderLit,
                new ƒ.CoatColored(ƒ.Color.CSS("#90d4ed"))
            );

            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(mtrCity));
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 0.01));

        }
    }
}