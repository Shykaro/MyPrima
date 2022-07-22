namespace Script {
    import ƒ = FudgeCore;

    export class CityP2 extends ƒ.Node {

        constructor(_name: string) {
            super(_name);


            let cityTexture: ƒ.TextureImage = new ƒ.TextureImage();
            cityTexture.load("Assets/CityP2v2.png");

            //cityTexture.scale(new ƒ.Vector3(0.5, 0.5, 0.01));

            let cityTextureCoat: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, cityTexture);

            const mtrCityP2: ƒ.Material = new ƒ.Material(
                "CityP2",
                ƒ.ShaderLitTextured,
                cityTextureCoat
            );
            
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(mtrCityP2));
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.translateZ(0.09);
            this.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 0.0001));
        }
    }
}