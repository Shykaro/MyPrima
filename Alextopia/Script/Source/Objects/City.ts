namespace Script {
    import ƒ = FudgeCore;

    export class City extends ƒ.Node {

        constructor(_name: string) {
            super(_name);


            let cityTexture: ƒ.TextureImage = new ƒ.TextureImage();
            cityTexture.load("Assets/CityP1v2.png");

            //cityTexture.scale(new ƒ.Vector3(0.5, 0.5, 0.01));

            let cityTextureCoat: ƒ.CoatTextured = new ƒ.CoatTextured(undefined, cityTexture);

            //cityTextureCoat.scale(new ƒ.Vector3(0.5, 0.5, 0.01));
            
            const mtrCity: ƒ.Material = new ƒ.Material(
                "City",
                ƒ.ShaderLitTextured,
                cityTextureCoat
            );

            

            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshSphere()));
            this.addComponent(new ƒ.ComponentMaterial(mtrCity));
            this.addComponent(new ƒ.ComponentTransform());
            this.mtxLocal.translateZ(0.09);
            this.mtxLocal.scale(new ƒ.Vector3(0.5, 0.5, 0.0001));

        }
    }
}