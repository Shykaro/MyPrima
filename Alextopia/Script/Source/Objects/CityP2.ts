namespace Script {
    import ƒ = FudgeCore;
    import ƒAid = FudgeAid;

    export class CityP2 extends ƒ.Node {

        constructor(_name: string) {
            super(_name);

            const mtrCityP2: ƒ.Material = new ƒ.Material(
                "CityP2",
                ƒ.ShaderLit,
                new ƒ.CoatColored(ƒ.Color.CSS("#ff6961"))
            );

            //const cityNodeP2 = new ƒ.Node("City");
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(mtrCityP2));
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 0.01));
        }
    }
}