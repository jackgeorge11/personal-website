import * as THREE from "three";
import "../style.scss";
import fragmentShader from "../shaders/fragment.glsl?raw";
import vertexShader from "../shaders/vertex.glsl?raw";
import brush from "../assets/brush.png";

function main() {
  const canvas = document.querySelector("#canvas");
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setClearColor = (0x000000, 1);

  let height = window.innerHeight;
  let width = window.innerWidth;
  let aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    (height * aspect) / -2,
    (height * aspect) / 2,
    height / 2,
    height / -2,
    -1000,
    1000
  );

  const swatch = document.querySelector(".swatch");
  const $swapButton = document.querySelector(".colorSwap");

  const scene = new THREE.Scene();
  const spazio = new THREE.Scene();

  const baseTexture = new THREE.WebGLRenderTarget(width, height, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
  });

  // PLANE

  let swapping = {
    isSwapping: false,
    frame: 0,
    frameMax: 60,
    destination: new THREE.Vector4(0.5, 0.5, 0.5, 1),
    gen: () => Math.round(Math.random() * 100) / 100,
    moreRings: true,
  };

  function colorSwap() {
    swapping.isSwapping = true;
    let w = swapping.gen();
    swapping.destination = new THREE.Vector4(
      swapping.gen(),
      swapping.gen(),
      swapping.gen(),
      w < 0.5 ? w + 0.5 : w
    );
    if (plane.material.uniforms.rings.value > 1) {
      swapping.moreRings = false;
    } else if (plane.material.uniforms.rings.value < -2) {
      swapping.moreRings = true;
    }
  }
  function easeInOutCubic(x) {
    return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  }

  function lerper(x) {
    plane.material.uniforms.colorSwap.value.x +=
      (swapping.destination.x - plane.material.uniforms.colorSwap.value.x) *
      easeInOutCubic(x);
    plane.material.uniforms.colorSwap.value.y +=
      (swapping.destination.y - plane.material.uniforms.colorSwap.value.y) *
      easeInOutCubic(x);
    plane.material.uniforms.colorSwap.value.z +=
      (swapping.destination.z - plane.material.uniforms.colorSwap.value.z) *
      easeInOutCubic(x);
    plane.material.uniforms.colorSwap.value.w +=
      (swapping.destination.w - plane.material.uniforms.colorSwap.value.w) *
      easeInOutCubic(x);
  }

  $swapButton.addEventListener("click", colorSwap, true);

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
    uDisplacement: { value: null },
    colorSwap: {
      value: new THREE.Vector4(0.4, 0.9, 0.1, 0.85),
    },
    rings: { value: 0.15 },
  };

  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
    })
  );

  spazio.add(plane);

  // RIPPLES
  const maxRipples = 100;
  const ripples = [];
  const rippleGeometry = new THREE.PlaneGeometry(64, 64, 1, 1);

  for (let i = 0; i < maxRipples; i++) {
    let m = new THREE.MeshBasicMaterial({
      map: new THREE.TextureLoader().load(brush),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
    });
    let ripple = new THREE.Mesh(rippleGeometry, m);
    ripple.visible = false;
    ripple.rotation.z = 2 * Math.PI * Math.random();
    scene.add(ripple);
    ripples.push(ripple);
  }

  let mouse = new THREE.Vector2(0, 0);
  let prevMouse = new THREE.Vector2(0, 0);
  let currentRipple = 0;
  function mouseEvents() {
    window.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX - width / 2;
      mouse.y = height / 2 - e.clientY;
    });
  }
  mouseEvents();
  function setNewRipple(x, y, i) {
    let ripple = ripples[i];
    ripple.visible = true;
    ripple.position.x = x;
    ripple.position.y = y;
    ripple.material.opacity = 0.5;
    ripple.scale.x = ripple.scale.y = 0.2;
  }
  function trackMousePos() {
    if (
      Math.abs(mouse.x - prevMouse.x) > 4 ||
      Math.abs(mouse.y - prevMouse.y) > 4
    ) {
      setNewRipple(mouse.x, mouse.y, currentRipple);
      currentRipple = (currentRipple + 1) % maxRipples;
    }

    prevMouse.x = mouse.x;
    prevMouse.y = mouse.y;
  }

  camera.position.z = 5;
  // controls.update();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const canvasWidth = canvas.clientWidth;
    const canvasHeight = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(canvasWidth, canvasHeight, false);
      width = canvasWidth;
      height - canvasHeight;
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;
    trackMousePos();
    ripples.forEach((r, i) => {
      if (r.visible) {
        r.scale.y = r.scale.x = 0.982 * r.scale.x + 0.108;
        r.rotation.z += 0.005 + 0.001 * (i % 50);
        r.material.opacity *= 0.96;

        if (r.material.opacity < 0.002) {
          r.visible = false;
        }
      }
    });

    if (swapping.isSwapping) {
      if (swapping.frame > swapping.frameMax) {
        swapping.isSwapping = false;
        swapping.frame = 0;
      } else {
        lerper(swapping.frame / swapping.frameMax);

        if (swapping.moreRings) {
          plane.material.uniforms.rings.value += easeInOutCubic(
            (swapping.frame / swapping.frameMax) * 0.15
          );
        } else {
          plane.material.uniforms.rings.value -= easeInOutCubic(
            (swapping.frame / swapping.frameMax) * 0.15
          );
        }
        swapping.frame += 1;
      }
    }

    uniforms.iResolution.value.set(canvas.width, canvas.height, 1);
    uniforms.iTime.value = time;

    resizeRendererToDisplaySize(renderer);

    renderer.setRenderTarget(baseTexture);
    renderer.render(scene, camera);
    plane.material.uniforms.uDisplacement.value = baseTexture.texture;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(spazio, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
