namespace Script {
    import ƒ = FudgeCore;

    export class Light extends ƒ.Node {

        constructor(_name: string) {
            super(_name);

        /*const mtrLight: ƒ.Material = new ƒ.Material(
                "Light",
                ƒ.ShaderLit,
                new ƒ.CoatColored(ƒ.Color.CSS("#90d4ed"))
            );*/



            this.addComponent(new ƒ.ComponentLight());
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.scale(new ƒ.Vector3(5, 5, 5));
            this.mtxLocal.translateZ(3);

        }
    }
}