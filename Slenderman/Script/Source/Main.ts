namespace Script {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  ƒ.Debug.info("Main Program Template running!");

  interface Config{
    drain: number;
    [key: string]: number | string | Config;
  }

  let viewport: ƒ.Viewport;
  let avatar: ƒ.Node;
  let camera: ƒ.ComponentCamera;
  let graph: ƒ.Node;
  let node: ƒ.Node;
  let root: ƒ.Node;

  const speedRotY: number = -0.1;
  const speedRotX: number = 0.2;
  let rotationX: number = 0;
  let cntrWalk: ƒ.Control = new ƒ.Control("cntrWalk", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 300);
  let battery: number = 1.0;
  let config: Config;

  

  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;
    graph = viewport.getBranch();
    avatar = graph.getChildrenByName("Avatar")[0];
    camera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
    viewport.camera = camera;
    init();

    let response: Response = await fetch("External.json");
    config = await response.json();
    console.log(config);




    viewport.getCanvas().addEventListener("pointermove", hndPointerMove);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a

    
    addTrees();
  }

  function update(_event: Event): void {
    //ƒ.Physics.simulate();  // if physics is included and used
    controlWalk();

    viewport.draw();
    ƒ.AudioManager.default.update();
    if(battery > config.drain){ //config drain 
    battery -= config.drain;
  }

    console.log(battery);
    (<HTMLInputElement>document.querySelector("div#vui>input")).value = battery.toFixed(2);
  }

  function hndPointerMove(_event: PointerEvent): void {
    //avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY))
    avatar.mtxLocal.rotateY(_event.movementX * speedRotY);

    rotationX += _event.movementY * speedRotX;
    rotationX = Math.min(60, Math.max(-60, rotationX));
    camera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
  }

  function init(): void {
    root = new ƒ.Node("Root");
    node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
    root.appendChild(node);
    viewport = ƒAid.Viewport.create(root);
    viewport.draw();

    initAnim();
    document.body.addEventListener("change", initAnim);
    (<HTMLInputElement>document.querySelector("button[id=jump]")).addEventListener("click", jump);
    function jump(_event: Event): void {
      console.log("Jump");
      let cmpAnimator: ƒ.ComponentAnimator = node.getComponent(ƒ.ComponentAnimator);
      cmpAnimator.jumpToLabel("jump");
    }

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();
  }


  function initAnim(): void {
    console.log("%cStart over", "color: red;");
    let form: HTMLFormElement = document.forms[0];
    let formData: FormData = new FormData(document.forms[0]);
    let time0: number = parseInt((<HTMLInputElement>form.querySelector("input[name=time0]")).value);
    let time1: number = parseInt((<HTMLInputElement>form.querySelector("input[name=time1]")).value);
    let value0: number = parseInt((<HTMLInputElement>form.querySelector("input[name=value0]")).value);
    let value1: number = parseInt((<HTMLInputElement>form.querySelector("input[name=value1]")).value);

    let animseq: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    animseq.addKey(new ƒ.AnimationKey(time0, value0));
    animseq.addKey(new ƒ.AnimationKey(time1, value1));

    let animStructure: ƒ.AnimationStructure = {
      components: {
        ComponentTransform: [
          {
            "ƒ.ComponentTransform": {
              mtxLocal: {
                rotation: {
                  x: animseq,
                  y: animseq
                }
              }
            }
          }
        ]
      }
    };


    let fpsInput: HTMLInputElement = (<HTMLInputElement>document.querySelector("input[name=fps]"));
    let fps: number = parseInt(fpsInput.value);

    let animation: ƒ.Animation = new ƒ.Animation("testAnimation", animStructure, fps);
    animation.setEvent("event", parseInt((<HTMLInputElement>form.querySelector("input[name=event]")).value));
    animation.labels["jump"] = parseInt((<HTMLInputElement>form.querySelector("input[name=label]")).value);

    let playmode: string = String(formData.get("mode"));
    let playback: string = String(formData.get("back"));

    let cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE[playmode], ƒ.ANIMATION_PLAYBACK[playback]);
    cmpAnimator.scale = 1;
    cmpAnimator.addEventListener("event", (_event: Event) => {
      let time: number = (<ƒ.ComponentAnimator>_event.target).time;
      console.log(`Event fired at ${time}`, _event);
    });


    if (node.getComponent(ƒ.ComponentAnimator)) {
      node.removeComponent(node.getComponent(ƒ.ComponentAnimator));
    }


    node.addComponent(cmpAnimator);
    cmpAnimator.activate(true);

    console.log("Component", cmpAnimator);
  }

  function controlWalk(): void {
     /*let input: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP],
      [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]
    );

    cntrWalk.setInput(input);
    cntrWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 5 : 2);

    let input2: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT],
      [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]
    );
    
    /*avatar
    .getComponent(ƒ.ComponentRigidbody)
    .setVelocity(ƒ.Vector3.SCALE(avatar.mtxLocal.getZ(), (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20));

    let vector = new ƒ.Vector3(
      (1.5 * input2 * ƒ.Loop.timeFrameGame) / 20, 0, (cntrWalk.getOutput()*ƒ.Loop.timeFrameGame) / 20);

    vector.transform(avatar.mtxLocal, false);

    avatar.getComponent(ƒ.ComponentRigidbody).setVelocity(vector);*/

    let input: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP],
      [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]
    );

    cntrWalk.setInput(input);
    cntrWalk.setFactor(ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SHIFT_LEFT]) ? 6 : 2);

    let input2: number = ƒ.Keyboard.mapToTrit(
      [ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT],
      [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]
    );

    avatar.mtxLocal.translateZ((cntrWalk.getOutput() * ƒ.Loop.timeFrameGame) / 1000);
    avatar.mtxLocal.translateX((1.5 * input2 * ƒ.Loop.timeFrameGame) / 1000);
  }

  function addTrees() {
    const trees: ƒ.Node = graph.getChildrenByName("Environment")[0].getChildrenByName("Trees")[0];

    for (let index = 0; index < 100; index++) {
      const position = ƒ.Random.default.getVector3(
        new ƒ.Vector3(29, 0, 29),
        new ƒ.Vector3(-29, 0, -29)
      );
      const roundedPosition = new ƒ.Vector3(
        Math.round(position.x),
        Math.round(position.y),
        Math.round(position.z)
      );

      if (!Tree.takenPositions.find((p) => p.equals(roundedPosition))) {
        trees.addChild(new Tree("Tree", roundedPosition));
      }
    }
  }

 
}
