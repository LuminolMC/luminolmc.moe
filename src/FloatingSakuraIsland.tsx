import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

const FloatingSakuraIsland: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // --- Configuration ---
    const VOXEL_SIZE = 1;
    const ISLAND_RADIUS = 18;
    const TREE_HEIGHT = 16;

    // --- Season Configuration ---
    const SEASONS = [
      {
        // Spring (0.0)
        t: 0.0,
        top: "#fce7f3",
        bottom: "#e0f2fe",
        fog: "#f8fafc",
        sun: "#fffdf0",
        sunInt: 2.2,
        ambInt: 0.6,
        hemiSky: "#e0f7fa",
        hemiGround: "#9ccc65",
        palette: {
          GRASS_TOP: "#9ccc65",
          GRASS_SIDE: "#7cb342",
          DIRT: "#8d6e63",
          STONE_LIGHT: "#d7ccc8",
          STONE_DARK: "#a1887f",
          TRUNK: "#6d4c41",
          LEAVES_1: "#fff0f5",
          LEAVES_2: "#ffe4e1",
          LEAVES_3: "#ffb7c5",
          WATER: "#4dd0e1",
          PARTICLE: "#ffb7c5",
        },
      },
      {
        // Summer (0.25)
        t: 0.25,
        top: "#7dd3fc",
        bottom: "#f0f9ff",
        fog: "#e0f2fe",
        sun: "#ffffff",
        sunInt: 2.8,
        ambInt: 0.7,
        hemiSky: "#bae6fd",
        hemiGround: "#4caf50",
        palette: {
          GRASS_TOP: "#8bc34a",
          GRASS_SIDE: "#689f38",
          DIRT: "#795548",
          STONE_LIGHT: "#cfd8dc",
          STONE_DARK: "#90a4ae",
          TRUNK: "#5d4037",
          LEAVES_1: "#dcedc8",
          LEAVES_2: "#aed581",
          LEAVES_3: "#8bc34a",
          WATER: "#29b6f6",
          PARTICLE: "#8bc34a",
        },
      },
      {
        // Autumn (0.5)
        t: 0.5,
        top: "#fdba74",
        bottom: "#fef08a",
        fog: "#ffedd5",
        sun: "#fff7ed",
        sunInt: 2.0,
        ambInt: 0.5,
        hemiSky: "#fed7aa",
        hemiGround: "#d4e157",
        palette: {
          GRASS_TOP: "#d4e157",
          GRASS_SIDE: "#afb42b",
          DIRT: "#8d6e63",
          STONE_LIGHT: "#d7ccc8",
          STONE_DARK: "#a1887f",
          TRUNK: "#5d4037",
          LEAVES_1: "#ffb74d",
          LEAVES_2: "#ff8a65",
          LEAVES_3: "#d84315",
          WATER: "#4fc3f7",
          PARTICLE: "#ff8a65",
        },
      },
      {
        // Winter (0.75)
        t: 0.75,
        top: "#cbd5e1",
        bottom: "#f1f5f9",
        fog: "#f8fafc",
        sun: "#f8fafc",
        sunInt: 1.5,
        ambInt: 0.8,
        hemiSky: "#e2e8f0",
        hemiGround: "#cbd5e1",
        palette: {
          GRASS_TOP: "#f8fafc",
          GRASS_SIDE: "#e2e8f0",
          DIRT: "#a1887f",
          STONE_LIGHT: "#e2e8f0",
          STONE_DARK: "#cbd5e1",
          TRUNK: "#4e342e",
          LEAVES_1: "#ffffff",
          LEAVES_2: "#f1f5f9",
          LEAVES_3: "#e2e8f0",
          WATER: "#b3e5fc",
          PARTICLE: "#ffffff",
        },
      },
      {
        // Spring (1.0)
        t: 1.0,
        top: "#fce7f3",
        bottom: "#e0f2fe",
        fog: "#f8fafc",
        sun: "#fffdf0",
        sunInt: 2.2,
        ambInt: 0.6,
        hemiSky: "#e0f7fa",
        hemiGround: "#9ccc65",
        palette: {
          GRASS_TOP: "#9ccc65",
          GRASS_SIDE: "#7cb342",
          DIRT: "#8d6e63",
          STONE_LIGHT: "#d7ccc8",
          STONE_DARK: "#a1887f",
          TRUNK: "#6d4c41",
          LEAVES_1: "#fff0f5",
          LEAVES_2: "#ffe4e1",
          LEAVES_3: "#ffb7c5",
          WATER: "#4dd0e1",
          PARTICLE: "#ffb7c5",
        },
      },
    ];

    const PALETTE = {
      GRASS_TOP: "GRASS_TOP",
      GRASS_SIDE: "GRASS_SIDE",
      DIRT: "DIRT",
      STONE_LIGHT: "STONE_LIGHT",
      STONE_DARK: "STONE_DARK",
      TRUNK: "TRUNK",
      LEAVES_1: "LEAVES_1",
      LEAVES_2: "LEAVES_2",
      LEAVES_3: "LEAVES_3",
      WATER: "WATER",
      WATER_FOAM: "WATER_FOAM",
    };

    // --- Setup Scene ---
    const scene = new THREE.Scene();

    // Transparent background to blend with the page's light theme
    // The page has a soft background, so we make the scene transparent
    // and add a very soft, warm fog to blend the edges.
    scene.background = null;
    scene.fog = new THREE.FogExp2(0xf8fafc, 0.008); // Very soft, airy white-blue fog

    // Clear any existing canvases (React StrictMode fix)
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight || 1,
      0.1,
      1000,
    );
    // Position camera to frame the island perfectly in the full footer without cutting off the tree
    // Moved camera and target UP to shift the tree DOWN on the screen
    // Moved camera and target LEFT to shift the tree RIGHT on the screen
    camera.position.set(-14, 24, 55);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    // Default size fallback if clientWidth is 0
    const width = mountRef.current.clientWidth || window.innerWidth;
    const height = mountRef.current.clientHeight || 300;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimize for high DPI but cap at 2

    // Enable physically correct lighting and better tone mapping for vibrant colors
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9; // Lower exposure to fix the "too bright" issue

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false; // Disable spinning as requested
    controls.enableZoom = false; // Disable zoom to keep it as a background element
    controls.enablePan = false;
    // Shift the camera target to center the tree and island
    controls.target.set(-14, 11, 0);

    // --- Lighting ---
    // Vibrant, saturated afternoon lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Softened ambient
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xe0f7fa, 0x9ccc65, 0.5); // Soft cyan and green
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffdf0, 2.2); // Gentle summer sun (not blinding)
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048; // High-res shadows for crispness
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 150;
    sunLight.shadow.camera.left = -50;
    sunLight.shadow.camera.right = 50;
    sunLight.shadow.camera.top = 50;
    sunLight.shadow.camera.bottom = -50;
    sunLight.shadow.bias = -0.0005; // Reduce shadow acne
    scene.add(sunLight);

    // Backlight for softness and rim lighting
    const backLight = new THREE.DirectionalLight(0xe0f7fa, 0.8); // Very soft cyan reflection
    backLight.position.set(-40, 30, -40);
    scene.add(backLight);

    // --- Voxel Logic ---
    const voxels: { x: number; y: number; z: number; type: string }[] = [];

    function addVoxel(x: number, y: number, z: number, type: string) {
      voxels.push({ x, y, z, type });
    }

    const dist = (x1: number, z1: number, x2: number, z2: number) =>
      Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2);

    // --- Procedural Generation ---
    const simplex = new SimplexNoise();

    // 1. The Island
    for (let x = -ISLAND_RADIUS; x <= ISLAND_RADIUS; x++) {
      for (let z = -ISLAND_RADIUS; z <= ISLAND_RADIUS; z++) {
        const d = dist(0, 0, x, z);

        if (d < ISLAND_RADIUS - 1) {
          const surfaceHeight = Math.floor(simplex.noise(x * 0.1, z * 0.1) * 2);
          let depth = Math.floor((ISLAND_RADIUS - d) * 1.2);
          depth += Math.floor(simplex.noise(x * 0.2, z * 0.2) * 4);

          let isRiver = false;
          if (x > 2 && x < 6 && z > 0) {
            depth -= 1;
            isRiver = true;
          }

          for (let y = surfaceHeight; y >= surfaceHeight - depth; y--) {
            let color;
            if (isRiver && y === surfaceHeight) {
              continue;
            } else if (isRiver && y === surfaceHeight - 1) {
              color = PALETTE.STONE_DARK;
            } else if (y === surfaceHeight) {
              color =
                Math.random() > 0.8 ? PALETTE.GRASS_TOP : PALETTE.GRASS_SIDE;
              if (Math.random() > 0.98)
                addVoxel(x, y + 1, z, PALETTE.STONE_LIGHT);
            } else if (y > surfaceHeight - 3) {
              color = PALETTE.DIRT;
            } else {
              color =
                Math.random() > 0.5 ? PALETTE.STONE_LIGHT : PALETTE.STONE_DARK;
            }

            if (x > 2 && x < 6 && z > ISLAND_RADIUS - 3) {
              // Gap for waterfall
            } else {
              addVoxel(x, y, z, color);
            }
          }
        }
      }
    }

    // 2. The Tree
    const trunkX = -4;
    const trunkZ = -2;

    for (let y = 0; y < TREE_HEIGHT; y++) {
      let offX = Math.sin(y * 0.3) * 2;
      let offZ = Math.cos(y * 0.2) * 2;
      let thickness = y < 4 ? 2 : 1;

      for (let tx = -thickness; tx <= thickness; tx++) {
        for (let tz = -thickness; tz <= thickness; tz++) {
          if (tx * tx + tz * tz <= thickness * thickness + 0.5) {
            addVoxel(
              trunkX + offX + tx,
              y + 1,
              trunkZ + offZ + tz,
              PALETTE.TRUNK,
            );
          }
        }
      }

      if (y > 6 && y % 3 === 0) {
        let branchLen = 4 + Math.random() * 4;
        let dirX = Math.random() - 0.5;
        let dirZ = Math.random() - 0.5;
        for (let b = 1; b < branchLen; b++) {
          addVoxel(
            trunkX + offX + dirX * b * 2,
            y + 1 + b,
            trunkZ + offZ + dirZ * b * 2,
            PALETTE.TRUNK,
          );
        }
      }
    }

    // Canopy (Cherry Blossoms) - Optimized to be a bit fuller but less noisy
    const canopyCenters = [
      { x: trunkX, y: TREE_HEIGHT + 2, z: trunkZ, r: 9 },
      { x: trunkX + 6, y: TREE_HEIGHT - 1, z: trunkZ + 3, r: 7 },
      { x: trunkX - 6, y: TREE_HEIGHT, z: trunkZ - 3, r: 7 },
      { x: trunkX, y: TREE_HEIGHT + 5, z: trunkZ - 5, r: 6 },
      { x: trunkX + 3, y: TREE_HEIGHT + 1, z: trunkZ + 6, r: 7 },
      { x: trunkX - 4, y: TREE_HEIGHT + 3, z: trunkZ + 4, r: 6 },
      { x: trunkX + 4, y: TREE_HEIGHT + 4, z: trunkZ - 3, r: 6 },
    ];

    canopyCenters.forEach((sphere) => {
      for (let x = -sphere.r; x <= sphere.r; x++) {
        for (let y = -sphere.r; y <= sphere.r; y++) {
          for (let z = -sphere.r; z <= sphere.r; z++) {
            if (x * x + y * y + z * z <= sphere.r * sphere.r) {
              // Make it slightly more dense for a lush look
              if (Math.random() > 0.15) {
                const worldX = sphere.x + x;
                const worldY = sphere.y + y;
                const worldZ = sphere.z + z;

                const rand = Math.random();
                let col = PALETTE.LEAVES_1;
                if (rand < 0.5) col = PALETTE.LEAVES_2;
                else if (rand < 0.8) col = PALETTE.LEAVES_3;

                addVoxel(worldX, worldY, worldZ, col);
              }
            }
          }
        }
      }
    });

    // 3. Floating Rocks
    const floatingRocks = [
      { x: 15, y: -5, z: 10, s: 2 },
      { x: -18, y: -2, z: 5, s: 1.5 },
      { x: 5, y: -15, z: -10, s: 3 },
    ];

    floatingRocks.forEach((rock) => {
      for (let x = -rock.s; x <= rock.s; x++) {
        for (let y = -rock.s; y <= rock.s; y++) {
          for (let z = -rock.s; z <= rock.s; z++) {
            if (x * x + y * y + z * z <= rock.s * rock.s + Math.random()) {
              addVoxel(rock.x + x, rock.y + y, rock.z + z, PALETTE.STONE_DARK);
            }
          }
        }
      }
    });

    // --- Rendering the Static Voxels ---
    const geometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.7, // Slightly shinier for more pop
      metalness: 0.0,
    });

    const instancedMesh = new THREE.InstancedMesh(
      geometry,
      material,
      voxels.length,
    );
    instancedMesh.castShadow = true;
    instancedMesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    const color = new THREE.Color();

    voxels.forEach((voxel, i) => {
      dummy.position.set(voxel.x, voxel.y, voxel.z);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(i, dummy.matrix);
      const palette0 = SEASONS[0].palette as Record<string, string>;
      const initialHex = palette0[voxel.type] ?? "#ffffff";
      instancedMesh.setColorAt(i, color.set(initialHex));
    });

    scene.add(instancedMesh);

    // --- Animated Elements ---

    // 1. Waterfall
    const waterCount = 150;
    const waterGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
    const waterMat = new THREE.MeshStandardMaterial({
      color: SEASONS[0].palette.WATER,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1,
    });
    const waterfallMesh = new THREE.InstancedMesh(
      waterGeo,
      waterMat,
      waterCount,
    );
    scene.add(waterfallMesh);

    const waterParticles: any[] = [];
    for (let i = 0; i < waterCount; i++) {
      waterParticles.push({
        x: 3 + Math.random() * 3,
        y: 0 + Math.random(),
        z: 10 + Math.random() * 5,
        speed: 0.08 + Math.random() * 0.15, // Slower, lazier flow
        offset: Math.random() * 100,
        state: "river",
      });
    }

    // 2. Falling Petals
    const petalCount = 300; // More petals for a summer breeze effect
    const petalGeo = new THREE.BoxGeometry(0.3, 0.1, 0.3); // Flatter petals
    const petalMat = new THREE.MeshBasicMaterial({
      color: SEASONS[0].palette.PARTICLE,
    });
    const petalMesh = new THREE.InstancedMesh(petalGeo, petalMat, petalCount);
    scene.add(petalMesh);

    const petals: any[] = [];
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: (Math.random() - 0.5) * 40,
        y: 10 + Math.random() * 20,
        z: (Math.random() - 0.5) * 40,
        speedY: 0.02 + Math.random() * 0.03, // Slightly faster fall
        speedX: (Math.random() - 0.5) * 0.05, // More horizontal drift (breeze)
        speedZ: (Math.random() - 0.5) * 0.05,
        rotSpeed: (Math.random() - 0.5) * 0.04,
      });
    }

    // --- Season Cycle Setup ---
    const color1 = new THREE.Color();
    const color2 = new THREE.Color();

    function lerpColorHex(hex1: string, hex2: string, alpha: number) {
      color1.set(hex1);
      color2.set(hex2);
      return "#" + color1.lerp(color2, alpha).getHexString();
    }

    function lerpColorObj(
      hex1: string,
      hex2: string,
      alpha: number,
      targetObj: THREE.Color,
    ) {
      color1.set(hex1);
      color2.set(hex2);
      targetObj.copy(color1.lerp(color2, alpha));
    }

    function lerpScalar(v1: number, v2: number, alpha: number) {
      return v1 + (v2 - v1) * alpha;
    }

    // 3. Snow (Visible in Winter)
    const snowGeo = new THREE.BufferGeometry();
    const snowCount = 400;
    const snowPos = new Float32Array(snowCount * 3);
    for (let i = 0; i < snowCount * 3; i++) {
      snowPos[i] = (Math.random() - 0.5) * 150;
      if (i % 3 === 1) snowPos[i] += 40; // Push up into the sky
      if (i % 3 === 2) snowPos[i] -= 20; // Push back
    }
    snowGeo.setAttribute("position", new THREE.BufferAttribute(snowPos, 3));
    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.6,
      transparent: true,
      opacity: 0,
    });
    const snow = new THREE.Points(snowGeo, snowMat);
    scene.add(snow);

    // --- Animation Loop ---
    const clock = new THREE.Clock();
    let animationFrameId: number;

    function animate() {
      animationFrameId = requestAnimationFrame(animate);

      const time = clock.getElapsedTime();

      // --- Season Cycle Logic ---
      const cycleDuration = 60; // 60 seconds per year
      const t = (time % cycleDuration) / cycleDuration;

      let startFrame = SEASONS[0];
      let endFrame = SEASONS[1];
      let alpha = 0;

      for (let i = 0; i < SEASONS.length - 1; i++) {
        if (t >= SEASONS[i].t && t <= SEASONS[i + 1].t) {
          startFrame = SEASONS[i];
          endFrame = SEASONS[i + 1];
          alpha = (t - startFrame.t) / (endFrame.t - startFrame.t);
          break;
        }
      }

      // Apply colors and intensities
      if (scene.fog)
        lerpColorObj(
          startFrame.fog,
          endFrame.fog,
          alpha,
          (scene.fog as THREE.FogExp2).color,
        );
      lerpColorObj(startFrame.sun, endFrame.sun, alpha, sunLight.color);
      sunLight.intensity = lerpScalar(
        startFrame.sunInt,
        endFrame.sunInt,
        alpha,
      );
      ambientLight.intensity = lerpScalar(
        startFrame.ambInt,
        endFrame.ambInt,
        alpha,
      );
      lerpColorObj(
        startFrame.hemiSky,
        endFrame.hemiSky,
        alpha,
        hemiLight.color,
      );
      lerpColorObj(
        startFrame.hemiGround,
        endFrame.hemiGround,
        alpha,
        hemiLight.groundColor,
      );

      // Update voxel colors
      const startPalette = startFrame.palette as Record<string, string>;
      const endPalette = endFrame.palette as Record<string, string>;

      voxels.forEach((voxel, i) => {
        const hex1 = startPalette[voxel.type] ?? "#ffffff";
        const hex2 = endPalette[voxel.type] ?? "#ffffff";
        color1.set(hex1);
        color2.set(hex2);
        instancedMesh.setColorAt(i, color1.lerp(color2, alpha));
      });
      instancedMesh.instanceColor!.needsUpdate = true;

      // Update water color
      const waterHex1 = startFrame.palette.WATER;
      const waterHex2 = endFrame.palette.WATER;
      color1.set(waterHex1);
      color2.set(waterHex2);
      waterMat.color.copy(color1.lerp(color2, alpha));

      // Update particle color
      const particleHex1 = startFrame.palette.PARTICLE;
      const particleHex2 = endFrame.palette.PARTICLE;
      color1.set(particleHex1);
      color2.set(particleHex2);
      petalMat.color.copy(color1.lerp(color2, alpha));

      // Update background
      if (mountRef.current) {
        const bgTop = lerpColorHex(startFrame.top, endFrame.top, alpha);
        const bgBottom = lerpColorHex(
          startFrame.bottom,
          endFrame.bottom,
          alpha,
        );
        mountRef.current.style.background = `linear-gradient(to bottom, var(--color-bg-page) 0%, ${bgTop} 20%, ${bgBottom} 100%)`;
      }

      // Update snow
      let snowOpacity = 0;
      if (t > 0.6 && t < 0.9) {
        // Winter is around 0.75
        snowOpacity = Math.sin(((t - 0.6) / 0.3) * Math.PI); // Smooth fade in/out
      }
      snowMat.opacity = snowOpacity;

      if (snowOpacity > 0) {
        const positions = snow.geometry.attributes.position
          .array as Float32Array;
        for (let i = 1; i < snowCount * 3; i += 3) {
          positions[i] -= 0.05; // fall down
          if (positions[i] < -20) positions[i] = 40;
        }
        snow.geometry.attributes.position.needsUpdate = true;
      }

      controls.update();

      // 1. Animate Island Floating - extremely slow, lazy bobbing
      instancedMesh.position.y = Math.sin(time * 0.2) * 0.6;
      waterfallMesh.position.y = instancedMesh.position.y;

      // 2. Animate Waterfall
      waterParticles.forEach((p, i) => {
        if (p.state === "river") {
          p.z += p.speed;
          p.y = 0;
          p.y += Math.sin(time * 3 + p.offset) * 0.1;

          if (p.z > 13) {
            p.state = "falling";
          }
        } else if (p.state === "falling") {
          p.y -= 0.3;
          p.z += 0.04;

          if (p.y < -25) {
            p.state = "river";
            p.z = 0;
            p.x = 3 + Math.random() * 3;
            p.y = 0;
          }
        }

        dummy.position.set(p.x, p.y, p.z);
        dummy.scale.setScalar(1);
        if (p.state === "falling") dummy.scale.y = 2;

        dummy.updateMatrix();
        waterfallMesh.setMatrixAt(i, dummy.matrix);
      });
      waterfallMesh.instanceMatrix.needsUpdate = true;

      // 3. Animate Petals
      petals.forEach((p, i) => {
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(time * 0.5 + p.y) * 0.03; // Lazy wind
        p.z += p.speedZ + Math.cos(time * 0.5 + p.y) * 0.03;

        if (p.y < -30) {
          p.y = 25;
          p.x = (Math.random() - 0.5) * 30;
          p.z = (Math.random() - 0.5) * 30;
        }

        dummy.position.set(p.x, p.y, p.z);
        dummy.rotation.set(
          time * p.rotSpeed,
          time * p.rotSpeed,
          time * p.rotSpeed,
        );
        dummy.scale.setScalar(1);
        dummy.updateMatrix();
        petalMesh.setMatrixAt(i, dummy.matrix);
      });
      petalMesh.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);
    }

    animate();

    // Handle Resize using ResizeObserver
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
        }
      }
    });
    resizeObserver.observe(mountRef.current);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current && renderer.domElement) {
        try {
          mountRef.current.removeChild(renderer.domElement);
        } catch (e) {
          // Ignore if already removed
        }
      }
      renderer.dispose();
    };
  }, []);

  return React.createElement("div", {
    ref: mountRef,
    className: "absolute inset-0 z-0 pointer-events-none",
    style: {
      // Blends smoothly from the page background into a very soft, airy summer sky
      background:
        "linear-gradient(to bottom, var(--color-bg-page) 0%, #f8fafc 30%, #e0f2fe 70%, #bae6fd 100%)",
    },
  });
};

export default FloatingSakuraIsland;
