namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let avatar: ƒ.Node;
  let camera: ƒ.ComponentCamera;
  let graph: ƒ.Node;

  const speedRotY: number = -0.1;
  const speedRotX: number = 0.2;
  let rotationX: number = 0;
  let cntrWalk: ƒ.Control = new ƒ.Control("cntrWalk", 2, ƒ.CONTROL_TYPE.PROPORTIONAL, 300);

  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    graph = viewport.getBranch();
    avatar = graph.getChildrenByName("Avatar")[0];
    camera = avatar.getChild(0).getComponent(ƒ.ComponentCamera);
    viewport.camera = camera;

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
  }

  function hndPointerMove(_event: PointerEvent): void {
    //avatar.getComponent(ƒ.ComponentRigidbody).rotateBody(ƒ.Vector3.Y(_event.movementX * speedRotY))
    avatar.mtxLocal.rotateY(_event.movementX * speedRotY);

    rotationX += _event.movementY * speedRotX;
    rotationX = Math.min(60, Math.max(-60, rotationX));
    camera.mtxPivot.rotation = ƒ.Vector3.X(rotationX);
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
