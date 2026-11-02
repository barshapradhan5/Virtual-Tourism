import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Place, POI } from '../../types';
import { ambientSound } from '../../lib/audio';
import {
  Volume2, VolumeX, Eye, Compass, HelpCircle,
  Sparkles, X, ChevronRight, ArrowLeft
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../lib/api';

interface VirtualWorldProps {
  place: Place;
  onOpenGuide: (poiTitle?: string) => void;
}

export const VirtualWorld: React.FC<VirtualWorldProps> = ({ place, onOpenGuide }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const minimapCanvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  // State
  const [activePoi, setActivePoi] = useState<POI | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [quality, setQuality] = useState<'low' | 'med' | 'high'>('high');
  const [showControlsHelp, setShowControlsHelp] = useState(true);
  const [isPanoramaMode, setIsPanoramaMode] = useState(place.scene_mode === 'panorama');
  const [visitSessionId, setVisitSessionId] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  // Refs for animation loop
  const playerPosRef = useRef({ x: place.spawn_x || 0, y: 1.2, z: place.spawn_z || 12 });
  const playerRotationRef = useRef(0);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const isPointerDownRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: 0, phi: 0.35 });

  // Record visit session start on mount
  useEffect(() => {
    let sessionId: string | null = null;
    const startSession = async () => {
      try {
        const res = await api.post('/visits/', {
          place: place.id,
          device_info: `${navigator.platform} - ${navigator.userAgent.slice(0, 50)}`,
        });
        sessionId = res.data.id;
        setVisitSessionId(sessionId);
      } catch {
        // Continue exploration even if session API fails
      }
    };
    startSession();

    return () => {
      ambientSound.stop();
      if (sessionId) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        api.patch(`/visits/${sessionId}/`, { duration_s: duration }).catch(() => {});
      }
    };
  }, [place.id]);

  // Main Three.js Scene Setup
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(
      place.category?.slug.includes('beach') ? 0x07111a : 0x0a0f0d
    );
    scene.fog = new THREE.FogExp2(0x0a0f0d, 0.015);

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: quality !== 'low', powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === 'high' ? 2 : 1));
    renderer.shadowMap.enabled = quality === 'high';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xfff3e0, 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffecd2, 1.3);
    sunLight.position.set(25, 45, 20);
    if (quality === 'high') {
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 150;
      sunLight.shadow.camera.left = -30;
      sunLight.shadow.camera.right = 30;
      sunLight.shadow.camera.top = 30;
      sunLight.shadow.camera.bottom = -30;
    }
    scene.add(sunLight);

    // 3. Sky Dome
    let skyColor = 0x111e18;
    if (place.category?.slug.includes('beach') || place.slug.includes('havelock')) {
      skyColor = 0x1d3557; // coastal ocean azure
    } else if (place.slug === 'kedarnath-temple') {
      skyColor = 0x1c324f; // crisp high-altitude Himalayan sapphire
    } else if (place.slug === 'meenakshi-amman-temple') {
      skyColor = 0x1a1228; // atmospheric Madurai temple twilight
    } else if (place.slug === 'konark-sun-temple') {
      skyColor = 0x272430; // warm Kalinga solar twilight
    } else if (place.slug === 'jim-corbett' || place.slug === 'jim-corbett-national-park') {
      skyColor = 0x142b1f; // Sal forest misty dawn
    } else if (place.slug === 'kaziranga-national-park') {
      skyColor = 0x182c2f; // Brahmaputra floodplain morning haze
    } else if (place.slug === 'sundarbans-mangrove-forest' || place.slug === 'sundarbans-national-park') {
      skyColor = 0x15282d; // coastal mangrove delta mist
    } else if (place.slug === 'triund-trek') {
      skyColor = 0x162c47; // Dhauladhar crisp alpine sapphire
    } else if (place.slug === 'valley-of-flowers' || place.slug === 'valley-of-flowers-trek') {
      skyColor = 0x1b354f; // high-Himalayan botanical mist
    } else if (place.slug === 'kudremukh-peak-trek' || place.slug === 'kudremukh-trek') {
      skyColor = 0x152f38; // Western Ghats rolling cloud sky
    } else if (place.slug.includes('rishikesh')) {
      skyColor = 0x1a3344; // Himalayan river canyon sky
    } else if (place.slug.includes('netrani')) {
      skyColor = 0x0f2f45; // open marine Arabian sea sky
    }

    const skyGeo = new THREE.SphereGeometry(180, 32, 15);
    const skyMat = new THREE.MeshBasicMaterial({
      color: skyColor,
      side: THREE.BackSide,
    });
    const sky = new THREE.Mesh(skyGeo, skyMat);
    scene.add(sky);

    // 4. Ground Terrain
    const groundGeo = new THREE.PlaneGeometry(160, 160, 32, 32);
    let groundColor = 0x17281f; // forest green tint
    if (place.category?.slug.includes('beach') || place.slug.includes('havelock')) {
      groundColor = 0xc2a66e; // golden sand
    } else if (place.slug === 'kedarnath-temple') {
      groundColor = 0xd8e0ea; // snowy glacial moraine
    } else if (place.slug === 'meenakshi-amman-temple') {
      groundColor = 0x2d2825; // dark polished granite flagstones
    } else if (place.slug === 'konark-sun-temple') {
      groundColor = 0x9e7b54; // Odishan coastal sandstone
    } else if (place.category?.slug.includes('cultural') || place.slug.includes('hampi')) {
      groundColor = 0x6e5c46; // granite soil
    } else if (place.category?.slug.includes('monument')) {
      groundColor = 0x223027; // formal garden lawn
    } else if (place.slug.includes('triund')) {
      groundColor = 0x3d5a36; // high alpine meadow grass
    } else if (place.slug === 'valley-of-flowers' || place.slug === 'valley-of-flowers-trek') {
      groundColor = 0x245432; // lush wildflower alpine valley carpet
    } else if (place.slug === 'kudremukh-peak-trek' || place.slug === 'kudremukh-trek') {
      groundColor = 0x2e6632; // emerald shola grassland
    } else if (place.slug === 'jim-corbett' || place.slug === 'jim-corbett-national-park') {
      groundColor = 0x223820; // dense Sal forest loam
    } else if (place.slug === 'kaziranga-national-park') {
      groundColor = 0x304723; // fertile alluvial floodplain grassland
    } else if (place.slug === 'sundarbans-mangrove-forest' || place.slug === 'sundarbans-national-park') {
      groundColor = 0x1f2923; // tidal mangrove mudflat
    } else if (place.slug.includes('rishikesh')) {
      groundColor = 0x57534e; // Himalayan riverbed stones and canyon rock
    } else if (place.slug.includes('netrani')) {
      groundColor = 0x155e75; // deep marine coral reef bed
    }

    const groundMat = new THREE.MeshStandardMaterial({
      color: groundColor,
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Grid markings for architectural layout
    const grid = new THREE.GridHelper(160, 40, 0x1f5c3f, 0x12241b);
    grid.position.y = 0.02;
    scene.add(grid);

    // 5. Build Architectural Landmarks per Place
    const monumentsGroup = new THREE.Group();

    if (place.slug === 'konark-sun-temple') {
      // ------------------------------------------------------------------
      // KONARK SUN TEMPLE (Odisha): Surya's Chariot, 24 Sundial Wheels & 7 Horses
      // ------------------------------------------------------------------
      const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0x9e734c, roughness: 0.75 });
      const darkSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x755233, roughness: 0.85 });
      const goldFinialMat = new THREE.MeshStandardMaterial({ color: 0xd4a054, roughness: 0.4, metalness: 0.4 });

      // Massive Chariot Base Terrace Plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(26, 2.6, 22), sandstoneMat);
      plinth.position.set(0, 1.3, -8);
      plinth.castShadow = true;
      plinth.receiveShadow = true;
      monumentsGroup.add(plinth);

      // 24 Carved Astronomical Sundial Wheels (12 on each side)
      const wheelGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.45, 24);
      const hubGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.65, 12);
      for (let side = -1; side <= 1; side += 2) {
        for (let w = 0; w < 12; w++) {
          const wz = -17.5 + w * 1.7;
          const wheel = new THREE.Mesh(wheelGeo, darkSandstoneMat);
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(side * 13.3, 1.6, wz);
          wheel.castShadow = true;
          monumentsGroup.add(wheel);

          // Central carved hubcap
          const hub = new THREE.Mesh(hubGeo, sandstoneMat);
          hub.rotation.z = Math.PI / 2;
          hub.position.set(side * 13.3, 1.6, wz);
          monumentsGroup.add(hub);

          // 8 Primary Radial Spokes
          for (let sp = 0; sp < 8; sp++) {
            const spokeAngle = (sp * Math.PI) / 4;
            const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.12), sandstoneMat);
            spoke.position.set(
              side * 13.3,
              1.6 + Math.cos(spokeAngle) * 0.75,
              wz + Math.sin(spokeAngle) * 0.75
            );
            spoke.rotation.x = -spokeAngle;
            monumentsGroup.add(spoke);
          }
        }
      }

      // 7 Galloping War Horses in front pulling Surya's chariot
      const horseMat = new THREE.MeshStandardMaterial({ color: 0x8a623e, roughness: 0.8 });
      const horseOffsets = [-4.5, -3.0, -1.5, 0.0, 1.5, 3.0, 4.5];
      horseOffsets.forEach((hx, idx) => {
        const horse = new THREE.Group();
        horse.position.set(hx, 0, 4.5 + (idx % 2) * 1.5);

        // Body
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.1, 1.8), horseMat);
        torso.position.y = 1.3;
        horse.add(torso);

        // Rearing neck & head
        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.2, 0.6), horseMat);
        neck.position.set(0, 2.1, 0.7);
        neck.rotation.x = 0.35;
        horse.add(neck);

        // Legs
        for (let l = -1; l <= 1; l += 2) {
          const frontLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 1.2, 8), horseMat);
          frontLeg.position.set(l * 0.3, 0.7, 0.6);
          frontLeg.rotation.x = -0.4;
          horse.add(frontLeg);

          const backLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 1.0, 8), horseMat);
          backLeg.position.set(l * 0.3, 0.5, -0.6);
          horse.add(backLeg);
        }
        horse.castShadow = true;
        monumentsGroup.add(horse);
      });

      // The Monumental Jagamohana (Porch Assembly Hall)
      const jagamohana = new THREE.Group();
      jagamohana.position.set(0, 2.6, -9);

      // Base wall sanctum with vertical recesses
      const sanctum = new THREE.Mesh(new THREE.BoxGeometry(18, 6.0, 18), sandstoneMat);
      sanctum.position.y = 3.0;
      sanctum.castShadow = true;
      jagamohana.add(sanctum);

      // 3 Tiers of Stepped Pyramidal Roofs (Pidhas) with sculpted recesses (Kantis)
      for (let tier = 0; tier < 3; tier++) {
        const tierHeight = 2.4;
        const tierWidth = 16.5 - tier * 3.8;
        for (let step = 0; step < 4; step++) {
          const sWidth = tierWidth - step * 0.8;
          const sMesh = new THREE.Mesh(new THREE.BoxGeometry(sWidth, 0.6, sWidth), darkSandstoneMat);
          sMesh.position.y = 6.0 + tier * 3.2 + step * 0.6;
          sMesh.castShadow = true;
          jagamohana.add(sMesh);
        }
      }

      // Ribbed Amalaka Disc Crown (22m high)
      const amalaka = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.2, 1.4, 24), sandstoneMat);
      amalaka.position.y = 16.2;
      jagamohana.add(amalaka);

      // Golden Kalasha finial pot
      const kalasha = new THREE.Mesh(new THREE.ConeGeometry(1.2, 3.2, 12), goldFinialMat);
      kalasha.position.y = 18.5;
      jagamohana.add(kalasha);

      monumentsGroup.add(jagamohana);

      // Natya Mandir (Hall of Dance) Pavilion
      const natyaMandir = new THREE.Group();
      natyaMandir.position.set(0, 0, 10);

      const nPlinth = new THREE.Mesh(new THREE.BoxGeometry(14, 1.4, 12), sandstoneMat);
      nPlinth.position.y = 0.7;
      natyaMandir.add(nPlinth);

      // 16 Sculpted Odissi Dancing Pillars
      for (let px = -5; px <= 5; px += 3.3) {
        for (let pz = -4; pz <= 4; pz += 2.6) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 4.2, 12), darkSandstoneMat);
          col.position.set(px, 2.8, pz);
          col.castShadow = true;
          natyaMandir.add(col);

          // Capital bracket
          const cap = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.9), sandstoneMat);
          cap.position.set(px, 4.95, pz);
          natyaMandir.add(cap);
        }
      }

      // Cornice roof eaves
      const nRoof = new THREE.Mesh(new THREE.BoxGeometry(15, 0.7, 13), sandstoneMat);
      nRoof.position.y = 5.4;
      natyaMandir.add(nRoof);

      // Gajasimha Entrance Lions (Eastern Grand Staircase)
      for (let s = -1; s <= 1; s += 2) {
        const lion = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 2.0), darkSandstoneMat);
        lion.position.set(s * 7.5, 0.9, 14.5);
        lion.castShadow = true;
        natyaMandir.add(lion);
      }

      monumentsGroup.add(natyaMandir);

    } else if (place.slug === 'meenakshi-amman-temple') {
      // ------------------------------------------------------------------
      // MEENAKSHI AMMAN TEMPLE (Madurai): Multi-tiered Gopuram, Golden Lotus Tank & 1000 Pillar Hall
      // ------------------------------------------------------------------
      const graniteMat = new THREE.MeshStandardMaterial({ color: 0x3d3835, roughness: 0.9 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xe5a93c, roughness: 0.35, metalness: 0.6 });
      const tierColors = [0x0284c7, 0xe11d48, 0xd97706, 0x059669, 0xf1f5f9, 0x8b5cf6, 0xe11d48, 0xd97706, 0x0284c7];

      // Enclosing Temple Prakaram Walls
      const wallMat = new THREE.MeshStandardMaterial({ color: 0x48423d, roughness: 0.85 });
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(70, 5, 2), wallMat);
      backWall.position.set(0, 2.5, -28);
      monumentsGroup.add(backWall);

      const sideWallLeft = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 56), wallMat);
      sideWallLeft.position.set(-35, 2.5, 0);
      monumentsGroup.add(sideWallLeft);

      const sideWallRight = new THREE.Mesh(new THREE.BoxGeometry(2, 5, 56), wallMat);
      sideWallRight.position.set(35, 2.5, 0);
      monumentsGroup.add(sideWallRight);

      // The Soaring Southern Rajagopuram (Gateway Tower - 52m)
      const gopuram = new THREE.Group();
      gopuram.position.set(0, 0, 4);

      // Solid stone entrance base with central arched gateway passage
      const gBaseLeft = new THREE.Mesh(new THREE.BoxGeometry(5.0, 7.0, 9.0), graniteMat);
      gBaseLeft.position.set(-4.0, 3.5, 0);
      gopuram.add(gBaseLeft);

      const gBaseRight = new THREE.Mesh(new THREE.BoxGeometry(5.0, 7.0, 9.0), graniteMat);
      gBaseRight.position.set(4.0, 3.5, 0);
      gopuram.add(gBaseRight);

      // Gateway lintel arch
      const gLintel = new THREE.Mesh(new THREE.BoxGeometry(13.0, 1.8, 9.2), graniteMat);
      gLintel.position.set(0, 7.9, 0);
      gopuram.add(gLintel);

      // 9 Tiers of Vibrantly Painted Stucco Sculptures
      for (let t = 0; t < 9; t++) {
        const tWidth = 11.5 - t * 0.95;
        const tDepth = 8.2 - t * 0.65;
        const tMat = new THREE.MeshStandardMaterial({
          color: tierColors[t % tierColors.length],
          roughness: 0.65,
        });

        // Main tier core
        const tierMesh = new THREE.Mesh(new THREE.BoxGeometry(tWidth, 2.0, tDepth), tMat);
        tierMesh.position.set(0, 9.8 + t * 2.0, 0);
        tierMesh.castShadow = true;
        gopuram.add(tierMesh);

        // Flanking carved deity niche projections
        for (let side = -1; side <= 1; side += 2) {
          const niche = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.4, tDepth - 0.5), goldMat);
          niche.position.set(side * (tWidth / 2 + 0.25), 9.8 + t * 2.0, 0);
          gopuram.add(niche);
        }
      }

      // Barrel-Vaulted Sala Shikhara Crown
      const salaRoof = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 2.4, 4.2, 16, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.5 })
      );
      salaRoof.rotation.z = Math.PI / 2;
      salaRoof.rotation.x = -Math.PI / 2;
      salaRoof.position.set(0, 28.5, 0);
      gopuram.add(salaRoof);

      // Row of 7 Golden Kalasha finials at top
      for (let k = -3; k <= 3; k++) {
        const kFinial = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.2, 8), goldMat);
        kFinial.position.set(k * 0.6, 30.0, 0);
        gopuram.add(kFinial);
      }

      monumentsGroup.add(gopuram);

      // Potramarai Kulam (Golden Lotus Tank)
      const tank = new THREE.Group();
      tank.position.set(16, 0, -8);

      // Sunken stone stepped ghats
      for (let step = 0; step < 5; step++) {
        const stepW = 16 - step * 1.6;
        const stepD = 14 - step * 1.6;
        const stepRailing = new THREE.Mesh(
          new THREE.BoxGeometry(stepW, 0.35, stepD),
          graniteMat
        );
        stepRailing.position.y = 0.25 - step * 0.35;
        tank.add(stepRailing);
      }

      // Reflective emerald water plane
      const water = new THREE.Mesh(
        new THREE.PlaneGeometry(8.5, 7.5),
        new THREE.MeshStandardMaterial({ color: 0x113b2c, roughness: 0.1, metalness: 0.85 })
      );
      water.rotation.x = -Math.PI / 2;
      water.position.y = -1.3;
      tank.add(water);

      // Sculpted Golden Lotus emerging from the sacred waters
      const lotus = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.4, 0.9, 12), goldMat);
      lotus.position.y = -0.9;
      tank.add(lotus);

      const lotusPetal = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.2, 8), goldMat);
      lotusPetal.position.y = -0.3;
      tank.add(lotusPetal);

      monumentsGroup.add(tank);

      // Hall of a Thousand Pillars (Aayiram Kaal Mandapam)
      const hall = new THREE.Group();
      hall.position.set(-18, 0, -10);

      const hPlinth = new THREE.Mesh(new THREE.BoxGeometry(16, 0.8, 18), graniteMat);
      hPlinth.position.y = 0.4;
      hall.add(hPlinth);

      // Colonnade of carved Yali pillars
      for (let px = -6; px <= 6; px += 3) {
        for (let pz = -7; pz <= 7; pz += 3.5) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.5, 0.5), graniteMat);
          col.position.set(px, 2.65, pz);
          hall.add(col);

          // Sculpted Yali beast bracket
          const yali = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.2, 0.6), goldMat);
          yali.position.set(px, 3.2, pz + 0.35);
          hall.add(yali);
        }
      }

      const hRoof = new THREE.Mesh(new THREE.BoxGeometry(16.8, 0.6, 18.8), graniteMat);
      hRoof.position.y = 5.2;
      hall.add(hRoof);

      monumentsGroup.add(hall);

      // Golden Deepastambham (Flagstaff)
      const flagstaff = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.3, 14, 16),
        goldMat
      );
      flagstaff.position.set(0, 7.0, -5);
      monumentsGroup.add(flagstaff);

    } else if (place.slug === 'kedarnath-temple') {
      // ------------------------------------------------------------------
      // KEDARNATH TEMPLE (Uttarakhand): High Himalayan Cirque, Granite Jyotirlinga & Nandi
      // ------------------------------------------------------------------
      const greyStoneMat = new THREE.MeshStandardMaterial({ color: 0x5b616e, roughness: 0.95 });
      const darkSlateMat = new THREE.MeshStandardMaterial({ color: 0x373b45, roughness: 0.9 });
      const snowMat = new THREE.MeshStandardMaterial({ color: 0xedf2f7, roughness: 0.6 });
      const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4a054, roughness: 0.35, metalness: 0.7 });

      // Surrounding Glacial Peaks Amphitheatre (Mount Kedarnath, Kedar Dome)
      const peakPositions = [
        [-45, -40, 48], [-22, -50, 56], [0, -55, 62], [24, -48, 54], [46, -38, 46],
        [-52, -15, 38], [52, -12, 36], [-48, 15, 32], [48, 18, 30]
      ];
      peakPositions.forEach(([px, pz, pHeight]) => {
        const peak = new THREE.Group();
        peak.position.set(px, 0, pz);

        // Lower mountain rock base
        const rock = new THREE.Mesh(new THREE.ConeGeometry(18, pHeight * 0.7, 5), darkSlateMat);
        rock.position.y = (pHeight * 0.7) / 2;
        peak.add(rock);

        // Snow-capped summit pyramid
        const snowCap = new THREE.Mesh(new THREE.ConeGeometry(9.5, pHeight * 0.45, 5), snowMat);
        snowCap.position.y = pHeight * 0.75;
        peak.add(snowCap);

        monumentsGroup.add(peak);
      });

      // Mandakini Glacial Meltwater Stream Channel
      const stream = new THREE.Mesh(
        new THREE.PlaneGeometry(8, 90),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8 })
      );
      stream.rotation.x = -Math.PI / 2;
      stream.position.set(22, 0.03, 0);
      monumentsGroup.add(stream);

      // Elevated Megalithic Foundation Platform
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(18, 1.8, 26), greyStoneMat);
      plinth.position.set(0, 0.9, -6);
      plinth.receiveShadow = true;
      monumentsGroup.add(plinth);

      // Front Access Steps
      for (let st = 0; st < 6; st++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(8.0, 0.3, 0.8), darkSlateMat);
        step.position.set(0, st * 0.3, 7.3 + st * 0.6);
        monumentsGroup.add(step);
      }

      // Sabha Mandapa (Assembly Hall) with Low Pitched Roof
      const mandapa = new THREE.Mesh(new THREE.BoxGeometry(13.0, 6.0, 12.0), greyStoneMat);
      mandapa.position.set(0, 4.8, 1.0);
      mandapa.castShadow = true;
      monumentsGroup.add(mandapa);

      // Sloping slate pitched roof designed to shed Himalayan snow
      const mRoof = new THREE.Mesh(
        new THREE.ConeGeometry(9.5, 3.2, 4),
        darkSlateMat
      );
      mRoof.position.set(0, 9.4, 1.0);
      mRoof.rotation.y = Math.PI / 4;
      monumentsGroup.add(mRoof);

      // The Towering Garbhagriha Shikhara (Sanctum Spire - 16m)
      const shikhara = new THREE.Group();
      shikhara.position.set(0, 1.8, -11);

      // Stepped grey stone spire core
      for (let st = 0; st < 8; st++) {
        const sWidth = 10.5 - st * 0.9;
        const sBlock = new THREE.Mesh(new THREE.BoxGeometry(sWidth, 1.6, sWidth), greyStoneMat);
        sBlock.position.y = 0.8 + st * 1.5;
        sBlock.castShadow = true;
        shikhara.add(sBlock);
      }

      // Ribbed stone Amalaka disc cap
      const amalaka = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 3.0, 1.0, 16), darkSlateMat);
      amalaka.position.y = 13.2;
      shikhara.add(amalaka);

      // Sacred Golden Shiva Trishula (Trident) & Kalasha Finial
      const trishulShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8), brassMat);
      trishulShaft.position.y = 15.0;
      shikhara.add(trishulShaft);

      const trishulProng = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 8, 16, Math.PI), brassMat);
      trishulProng.position.y = 16.2;
      shikhara.add(trishulProng);

      monumentsGroup.add(shikhara);

      // Colossal Seated Black Granite Nandi Bull facing the sanctum
      const nandiGroup = new THREE.Group();
      nandiGroup.position.set(0, 0, 9);

      // Raised stone dais
      const nDais = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.7, 4.2), darkSlateMat);
      nDais.position.y = 0.35;
      nandiGroup.add(nDais);

      // Sculpted black stone bull body
      const nandiMat = new THREE.MeshStandardMaterial({ color: 0x1f2126, roughness: 0.85 });
      const nBody = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.3, 2.6), nandiMat);
      nBody.position.y = 1.35;
      nandiGroup.add(nBody);

      // Hump
      const nHump = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), nandiMat);
      nHump.position.set(0, 2.1, -0.4);
      nandiGroup.add(nHump);

      // Head facing temple door
      const nHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 1.1), nandiMat);
      nHead.position.set(0, 1.8, -1.4);
      nandiGroup.add(nHead);

      // Brass bell collar
      const nBell = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8), brassMat);
      nBell.position.set(0, 1.1, -1.2);
      nandiGroup.add(nBell);

      monumentsGroup.add(nandiGroup);

      // Sacred Shiva Trishula with Damru & Saffron Streamer Monument
      const courtyardTrishul = new THREE.Group();
      courtyardTrishul.position.set(-6, 0, 5);

      const tPole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 7.0, 8), brassMat);
      tPole.position.y = 3.5;
      courtyardTrishul.add(tPole);

      const tTop = new THREE.Mesh(new THREE.ConeGeometry(0.4, 1.2, 8), brassMat);
      tTop.position.y = 7.4;
      courtyardTrishul.add(tTop);

      // Damru
      const damru = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.1, 0.6, 8), brassMat);
      damru.position.y = 6.2;
      courtyardTrishul.add(damru);

      monumentsGroup.add(courtyardTrishul);

      // Fluttering Himalayan Prayer Flags along the pathway
      const flagColors = [0x3b82f6, 0xf8fafc, 0xef4444, 0x22c55e, 0xeab308];
      for (let mast = -1; mast <= 1; mast += 2) {
        const post = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.12, 5.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
        );
        post.position.set(mast * 10, 2.5, 12);
        monumentsGroup.add(post);

        // String of 5 prayer flags
        for (let f = 0; f < 5; f++) {
          const flag = new THREE.Mesh(
            new THREE.PlaneGeometry(0.7, 0.5),
            new THREE.MeshStandardMaterial({
              color: flagColors[f],
              side: THREE.DoubleSide,
              roughness: 0.7,
            })
          );
          flag.position.set(mast * (10 - f * 1.5), 4.6 - f * 0.15, 12);
          monumentsGroup.add(flag);
        }
      }

    } else if (place.slug === 'taj-mahal') {
      // ------------------------------------------------------------------
      // TAJ MAHAL (Agra): Makrana Marble Mausoleum, Bulbous Dome, 4 Minarets & Charbagh
      // ------------------------------------------------------------------
      const marbleMat = new THREE.MeshStandardMaterial({
        color: 0xf5f4ef,
        roughness: 0.18,
        metalness: 0.08,
      });
      const darkMarbleMat = new THREE.MeshStandardMaterial({
        color: 0xd8d6cc,
        roughness: 0.28,
      });
      const goldFinialMat = new THREE.MeshStandardMaterial({
        color: 0xd4a054,
        roughness: 0.35,
        metalness: 0.7,
      });

      // Elevated Grand Marble Terrace Plinth (32m x 32m)
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(32, 2.8, 32), marbleMat);
      plinth.position.set(0, 1.4, -14);
      plinth.receiveShadow = true;
      monumentsGroup.add(plinth);

      // Central Symmetrical Chamfered Tomb Structure
      const tombGroup = new THREE.Group();
      tombGroup.position.set(0, 2.8, -14);

      // Main cubic core
      const tombCore = new THREE.Mesh(new THREE.BoxGeometry(18, 12, 18), marbleMat);
      tombCore.position.y = 6;
      tombCore.castShadow = true;
      tombGroup.add(tombCore);

      // Monumental Recessed Pishtaq Arches (4 Cardinal Facades)
      const archFacings = [
        { rot: 0, z: 9.1 },
        { rot: Math.PI, z: -9.1 },
        { rot: Math.PI / 2, x: 9.1 },
        { rot: -Math.PI / 2, x: -9.1 },
      ];
      archFacings.forEach((f) => {
        const pishtaq = new THREE.Group();
        if (f.rot === 0 || f.rot === Math.PI) {
          pishtaq.position.set(0, 6, f.z);
        } else {
          pishtaq.position.set(f.x || 0, 6, 0);
        }
        pishtaq.rotation.y = f.rot;

        // Outer arch frame
        const archFrame = new THREE.Mesh(new THREE.BoxGeometry(9.0, 10.5, 0.4), darkMarbleMat);
        pishtaq.add(archFrame);

        // Vaulted archway void
        const archVoid = new THREE.Mesh(
          new THREE.BoxGeometry(6.0, 8.5, 1.8),
          new THREE.MeshStandardMaterial({ color: 0x1f1f24, roughness: 0.9 })
        );
        archVoid.position.z = -0.6;
        pishtaq.add(archVoid);

        tombGroup.add(pishtaq);
      });

      // High Cylindrical Drum beneath Dome
      const drum = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.2, 4.0, 32), marbleMat);
      drum.position.y = 14;
      tombGroup.add(drum);

      // The Soaring Bulbous Onion Dome (22m apex)
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(6.4, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.72),
        marbleMat
      );
      dome.position.y = 17;
      dome.castShadow = true;
      tombGroup.add(dome);

      // Inverted Lotus Crown & Golden Crescent Finial
      const lotusCrown = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 0.4, 1.2, 16), marbleMat);
      lotusCrown.position.y = 22.8;
      tombGroup.add(lotusCrown);

      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.5, 3.2, 12), goldFinialMat);
      finial.position.y = 24.8;
      tombGroup.add(finial);

      // 4 Domed Chhatris (Kiosks) surrounding the central dome
      const chhatriCoords = [
        [-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]
      ];
      chhatriCoords.forEach(([cx, cz]) => {
        const chhatri = new THREE.Group();
        chhatri.position.set(cx, 12, cz);

        // 8 Slender marble pillars
        for (let a = 0; a < 8; a++) {
          const angle = (a * Math.PI) / 4;
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 3.2, 8), marbleMat);
          col.position.set(Math.cos(angle) * 1.2, 1.6, Math.sin(angle) * 1.2);
          chhatri.add(col);
        }

        // Chhatri dome cupola
        const cDome = new THREE.Mesh(new THREE.SphereGeometry(1.4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), marbleMat);
        cDome.position.y = 3.2;
        chhatri.add(cDome);

        tombGroup.add(chhatri);
      });

      monumentsGroup.add(tombGroup);

      // Four Classical Tapering Minarets at the Plinth Corners
      const minaretCoords = [
        [-13.5, -27.5], [13.5, -27.5], [-13.5, -0.5], [13.5, -0.5]
      ];
      minaretCoords.forEach(([mx, mz]) => {
        const minaret = new THREE.Group();
        minaret.position.set(mx, 2.8, mz);

        // Octagonal base
        const mBase = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 2.0, 8), marbleMat);
        mBase.position.y = 1.0;
        minaret.add(mBase);

        // 3 Tapering Shaft Storeys with cantilevered balconies
        for (let st = 0; st < 3; st++) {
          const sHeight = 6.5;
          const rBottom = 1.4 - st * 0.15;
          const rTop = 1.25 - st * 0.15;
          const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(rTop, rBottom, sHeight, 16),
            marbleMat
          );
          shaft.position.y = 2.0 + st * sHeight + sHeight / 2;
          shaft.castShadow = true;
          minaret.add(shaft);

          // Projecting ring balcony
          const balc = new THREE.Mesh(
            new THREE.CylinderGeometry(rTop + 0.35, rTop + 0.35, 0.4, 16),
            darkMarbleMat
          );
          balc.position.y = 2.0 + (st + 1) * sHeight;
          minaret.add(balc);
        }

        // Crowning Chhatri Pavilion
        const capPillars = new THREE.Group();
        capPillars.position.y = 21.5;
        for (let p = 0; p < 8; p++) {
          const angle = (p * Math.PI) / 4;
          const pCol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 1.8, 8), marbleMat);
          pCol.position.set(Math.cos(angle) * 0.8, 0.9, Math.sin(angle) * 0.8);
          capPillars.add(pCol);
        }
        const mDome = new THREE.Mesh(
          new THREE.SphereGeometry(1.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          marbleMat
        );
        mDome.position.y = 1.8;
        capPillars.add(mDome);

        minaret.add(capPillars);
        monumentsGroup.add(minaret);
      });

      // Charbagh Formal Garden Waterways & Reflecting Pool
      const poolMat = new THREE.MeshStandardMaterial({
        color: 0x1a4855,
        roughness: 0.1,
        metalness: 0.9,
      });
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(7.0, 32.0), poolMat);
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(0, 0.05, 12);
      monumentsGroup.add(pool);

      // Marble Fountains along the reflecting channel
      for (let fn = 0; fn < 5; fn++) {
        const fountain = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.45, 0.5, 12),
          marbleMat
        );
        fountain.position.set(0, 0.3, -2 + fn * 6.5);
        monumentsGroup.add(fountain);
      }

      // Symmetrical Cypress Trees flanking the watercourse
      const cypressMat = new THREE.MeshStandardMaterial({ color: 0x14341e, roughness: 0.85 });
      for (let side = -1; side <= 1; side += 2) {
        for (let tree = 0; tree < 6; tree++) {
          const cyp = new THREE.Mesh(
            new THREE.ConeGeometry(0.9, 5.0, 8),
            cypressMat
          );
          cyp.position.set(side * 6.2, 2.5, -2 + tree * 5.0);
          cyp.castShadow = true;
          monumentsGroup.add(cyp);
        }
      }

    } else if (place.slug === 'red-fort-delhi') {
      // ------------------------------------------------------------------
      // RED FORT (LAL QILA - Delhi): Lahori Gate, Sandstone Ramparts, Chhatris & Diwan-i-Khas
      // ------------------------------------------------------------------
      const redSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x8a2f1b, roughness: 0.82 });
      const darkRedMat = new THREE.MeshStandardMaterial({ color: 0x6e2211, roughness: 0.88 });
      const whiteMarbleMat = new THREE.MeshStandardMaterial({ color: 0xf0efe8, roughness: 0.25 });
      const goldMat = new THREE.MeshStandardMaterial({ color: 0xd4a054, roughness: 0.4, metalness: 0.6 });

      // Massive Red Sandstone Curtain Wall Ramparts (54m wide x 14m high)
      const rampart = new THREE.Group();
      rampart.position.set(0, 0, -4);

      const mainWall = new THREE.Mesh(new THREE.BoxGeometry(54, 12, 6), redSandstoneMat);
      mainWall.position.y = 6;
      mainWall.castShadow = true;
      mainWall.receiveShadow = true;
      rampart.add(mainWall);

      // Crenellated Battlements (Kanguras) along the wall parapet
      for (let k = -26; k <= 26; k += 2.0) {
        const kangura = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 0.6), darkRedMat);
        kangura.position.set(k, 12.6, 2.8);
        rampart.add(kangura);
      }

      // Colossal Octagonal Bastion Towers flanking Lahori Gate
      const towerPositions = [-9.5, 9.5];
      towerPositions.forEach((tx) => {
        const tower = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.6, 16, 8), redSandstoneMat);
        tower.position.set(tx, 8, 2);
        tower.castShadow = true;
        rampart.add(tower);

        // Tower crenellations
        for (let ta = 0; ta < 8; ta++) {
          const angle = (ta * Math.PI) / 4;
          const cren = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 0.4), darkRedMat);
          cren.position.set(tx + Math.cos(angle) * 4.0, 16.5, 2 + Math.sin(angle) * 4.0);
          rampart.add(cren);
        }

        // Domed Pavilion atop Bastion
        const bDome = new THREE.Mesh(
          new THREE.SphereGeometry(2.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
          whiteMarbleMat
        );
        bDome.position.set(tx, 16, 2);
        rampart.add(bDome);
      });

      // The Monumental Lahori Gate Arched Portal
      const gateArch = new THREE.Mesh(new THREE.BoxGeometry(9.0, 8.5, 6.4), darkRedMat);
      gateArch.position.set(0, 4.25, 0);
      rampart.add(gateArch);

      // Arched entryway passage void
      const gateVoid = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 6.8, 7.0),
        new THREE.MeshBasicMaterial({ color: 0x0a0605 })
      );
      gateVoid.position.set(0, 3.4, 0);
      rampart.add(gateVoid);

      // Row of 7 White Marble Miniature Chhatris above the central gate parapet
      for (let c = -3; c <= 3; c++) {
        const chhatri = new THREE.Group();
        chhatri.position.set(c * 1.8, 12.6, 2.5);

        for (let p = 0; p < 4; p++) {
          const col = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 1.4, 6), whiteMarbleMat);
          col.position.set((p % 2 ? 0.35 : -0.35), 0.7, (p > 1 ? 0.35 : -0.35));
          chhatri.add(col);
        }
        const cRoof = new THREE.Mesh(
          new THREE.ConeGeometry(0.65, 0.7, 8),
          whiteMarbleMat
        );
        cRoof.position.y = 1.7;
        chhatri.add(cRoof);

        rampart.add(chhatri);
      }

      // National Flag Mast (Tricolour Stand)
      const flagMast = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 8.0, 8), goldMat);
      flagMast.position.set(0, 16.0, 2.5);
      rampart.add(flagMast);

      // Tricolour Indian Flag
      const saffronFlag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.35), new THREE.MeshBasicMaterial({ color: 0xff9933 }));
      saffronFlag.position.set(0.9, 19.5, 2.5);
      rampart.add(saffronFlag);
      const whiteFlag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.35), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      whiteFlag.position.set(0.9, 19.15, 2.5);
      rampart.add(whiteFlag);
      const greenFlag = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.35), new THREE.MeshBasicMaterial({ color: 0x138808 }));
      greenFlag.position.set(0.9, 18.8, 2.5);
      rampart.add(greenFlag);

      monumentsGroup.add(rampart);

      // Diwan-i-Khas (Hall of Private Audiences) in the Courtyard
      const diwanIKhas = new THREE.Group();
      diwanIKhas.position.set(0, 0, -18);

      // White marble terrace plinth
      const dPlinth = new THREE.Mesh(new THREE.BoxGeometry(16, 1.2, 14), whiteMarbleMat);
      dPlinth.position.y = 0.6;
      diwanIKhas.add(dPlinth);

      // Engraved Marble Columns & Cusped Arches
      for (let px = -6; px <= 6; px += 3) {
        for (let pz = -5; pz <= 5; pz += 3.3) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), whiteMarbleMat);
          col.position.set(px, 2.7, pz);
          diwanIKhas.add(col);

          const archHead = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.35, 0.9), goldMat);
          archHead.position.set(px, 4.85, pz);
          diwanIKhas.add(archHead);
        }
      }

      // Projecting Chhajja eave roof
      const dRoof = new THREE.Mesh(new THREE.BoxGeometry(17.4, 0.6, 15.4), whiteMarbleMat);
      dRoof.position.y = 5.2;
      diwanIKhas.add(dRoof);

      // Four Corner Marble Chhatris
      const dChhatriCoords = [
        [-7.5, -6.5], [7.5, -6.5], [-7.5, 6.5], [7.5, 6.5]
      ];
      dChhatriCoords.forEach(([cx, cz]) => {
        const dc = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1.6, 8), whiteMarbleMat);
        dc.position.set(cx, 6.2, cz);
        diwanIKhas.add(dc);
      });

      monumentsGroup.add(diwanIKhas);

      // Nahr-i-Bihisht (Canal of Paradise) Water Channel
      const nahrMat = new THREE.MeshStandardMaterial({ color: 0x1d6a78, roughness: 0.1, metalness: 0.8 });
      const nahr = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 22.0), nahrMat);
      nahr.rotation.x = -Math.PI / 2;
      nahr.position.set(0, 0.04, 10);
      monumentsGroup.add(nahr);

    } else if (place.slug === 'qutub-minar') {
      // ------------------------------------------------------------------
      // QUTUB MINAR (Delhi): 72.5m Fluted Tower, Corbelled Balconies & Gupta Iron Pillar
      // ------------------------------------------------------------------
      const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0x9c4228, roughness: 0.78 });
      const darkRedStoneMat = new THREE.MeshStandardMaterial({ color: 0x7a2d18, roughness: 0.85 });
      const marbleTrimMat = new THREE.MeshStandardMaterial({ color: 0xeae6dc, roughness: 0.35 });
      const ironMat = new THREE.MeshStandardMaterial({ color: 0x24272c, roughness: 0.92, metalness: 0.8 });

      // The Soaring 5-Tiered Fluted Minaret
      const minarGroup = new THREE.Group();
      minarGroup.position.set(0, 0, -6);

      // Broad octagonal stone plinth foundation
      const mPlinth = new THREE.Mesh(new THREE.CylinderGeometry(7.5, 8.2, 2.0, 8), darkRedStoneMat);
      mPlinth.position.y = 1.0;
      minarGroup.add(mPlinth);

      // Storey 1: 16m high, alternating circular and angular fluted ribs
      const s1Height = 14.0;
      const s1 = new THREE.Mesh(new THREE.CylinderGeometry(5.8, 7.0, s1Height, 24), sandstoneMat);
      s1.position.y = 2.0 + s1Height / 2;
      s1.castShadow = true;
      minarGroup.add(s1);

      // 4 Inscription bands wrapping around Storey 1
      for (let ib = 0; ib < 4; ib++) {
        const band = new THREE.Mesh(
          new THREE.CylinderGeometry(6.6 - ib * 0.25, 6.6 - ib * 0.25, 0.45, 24),
          darkRedStoneMat
        );
        band.position.y = 4.0 + ib * 2.8;
        minarGroup.add(band);
      }

      // First Corbelled Balcony with stalactite brackets (Muqarnas)
      const b1 = new THREE.Mesh(new THREE.CylinderGeometry(6.6, 5.6, 1.2, 24), darkRedStoneMat);
      b1.position.y = 2.0 + s1Height + 0.6;
      minarGroup.add(b1);

      // Storey 2: 11m high, circular rounded flutes
      const s2Height = 11.0;
      const s2 = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 5.5, s2Height, 20), sandstoneMat);
      s2.position.y = 2.0 + s1Height + 1.2 + s2Height / 2;
      s2.castShadow = true;
      minarGroup.add(s2);

      // Second Balcony
      const b2 = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 4.4, 1.0, 20), darkRedStoneMat);
      b2.position.y = 2.0 + s1Height + 1.2 + s2Height + 0.5;
      minarGroup.add(b2);

      // Storey 3: 8.5m high, angular sharp flutes
      const s3Height = 8.5;
      const s3 = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 4.4, s3Height, 16), sandstoneMat);
      s3.position.y = 2.0 + s1Height + 1.2 + s2Height + 1.0 + s3Height / 2;
      s3.castShadow = true;
      minarGroup.add(s3);

      // Third Balcony
      const b3 = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 3.4, 0.9, 16), darkRedStoneMat);
      b3.position.y = 2.0 + s1Height + 1.2 + s2Height + 1.0 + s3Height + 0.45;
      minarGroup.add(b3);

      // Storey 4 & 5: Clad in white marble and red sandstone bands
      const s4Height = 7.0;
      const s4 = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 3.4, s4Height, 16), marbleTrimMat);
      s4.position.y = 2.0 + s1Height + 1.2 + s2Height + 1.0 + s3Height + 0.9 + s4Height / 2;
      s4.castShadow = true;
      minarGroup.add(s4);

      const s5Height = 5.5;
      const s5 = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.7, s5Height, 16), marbleTrimMat);
      s5.position.y = 2.0 + s1Height + 1.2 + s2Height + 1.0 + s3Height + 0.9 + s4Height + s5Height / 2;
      s5.castShadow = true;
      minarGroup.add(s5);

      // Top Dome Cupola Finial
      const cupola = new THREE.Mesh(new THREE.SphereGeometry(1.6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), sandstoneMat);
      cupola.position.y = 2.0 + s1Height + 1.2 + s2Height + 1.0 + s3Height + 0.9 + s4Height + s5Height;
      minarGroup.add(cupola);

      monumentsGroup.add(minarGroup);

      // The 4th-Century Gupta Iron Pillar (Rust-free Metallurgical Wonder)
      const ironPillar = new THREE.Group();
      ironPillar.position.set(-8, 0, 4);

      // Raised circular stone base
      const ipBase = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, 0.6, 16), darkRedStoneMat);
      ipBase.position.y = 0.3;
      ironPillar.add(ipBase);

      // Forged iron shaft (7.2m high)
      const ipShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 7.2, 16), ironMat);
      ipShaft.position.y = 3.9;
      ipShaft.castShadow = true;
      ironPillar.add(ipShaft);

      // Bell capital and chakra finial
      const ipCap = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.22, 0.8, 12), ironMat);
      ipCap.position.y = 7.8;
      ironPillar.add(ipCap);

      monumentsGroup.add(ironPillar);

      // Alai Darwaza Gateway Arch (Alauddin Khalji - 1311 CE)
      const alaiDarwaza = new THREE.Group();
      alaiDarwaza.position.set(10, 0, 2);

      // Cubic red sandstone gatehouse
      const adGate = new THREE.Mesh(new THREE.BoxGeometry(10, 8, 8), sandstoneMat);
      adGate.position.y = 4;
      alaiDarwaza.add(adGate);

      // Horseshoe arched portal cutout
      const adArch = new THREE.Mesh(
        new THREE.BoxGeometry(4.5, 6.0, 8.4),
        new THREE.MeshBasicMaterial({ color: 0x080605 })
      );
      adArch.position.y = 3;
      alaiDarwaza.add(adArch);

      // Marble fringe bands & Dome
      const adBand = new THREE.Mesh(new THREE.BoxGeometry(10.2, 0.5, 8.2), marbleTrimMat);
      adBand.position.y = 7.8;
      alaiDarwaza.add(adBand);

      const adDome = new THREE.Mesh(
        new THREE.SphereGeometry(3.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        marbleTrimMat
      );
      adDome.position.y = 8;
      alaiDarwaza.add(adDome);

      monumentsGroup.add(alaiDarwaza);

      // Quwwat-ul-Islam Ancient Pillar Colonnades
      const colonnadeMat = new THREE.MeshStandardMaterial({ color: 0x7a624d, roughness: 0.9 });
      for (let px = -14; px <= -4; px += 2.5) {
        for (let pz = -12; pz <= -4; pz += 2.5) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.4, 3.8, 0.4), colonnadeMat);
          col.position.set(px, 1.9, pz);
          col.castShadow = true;
          monumentsGroup.add(col);
        }
      }

    } else if (place.slug === 'palolem-beach') {
      // ------------------------------------------------------------------
      // PALOLEM BEACH (Goa): Crescent Cove, Colorful Wooden Shacks & Palms
      // ------------------------------------------------------------------
      // Calm Arabian Sea Cove
      const oceanGeo = new THREE.PlaneGeometry(160, 70);
      const oceanMat = new THREE.MeshStandardMaterial({
        color: 0x1a8a99,
        roughness: 0.15,
        metalness: 0.75,
      });
      const ocean = new THREE.Mesh(oceanGeo, oceanMat);
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.set(0, 0.04, -28);
      monumentsGroup.add(ocean);

      // Surf shoreline wave foam
      const surfGeo = new THREE.PlaneGeometry(160, 2);
      const surfMat = new THREE.MeshBasicMaterial({ color: 0xe8ffff, transparent: true, opacity: 0.7 });
      const surf = new THREE.Mesh(surfGeo, surfMat);
      surf.rotation.x = -Math.PI / 2;
      surf.position.set(0, 0.05, 5.5);
      monumentsGroup.add(surf);

      // Monkey Island / Northern Rocky Headland
      const islandGroup = new THREE.Group();
      islandGroup.position.set(22, 0, -18);
      for (let r = 0; r < 14; r++) {
        const rockGeo = new THREE.DodecahedronGeometry(2.5 + (r % 3) * 1.2, 1);
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x3d352e, roughness: 0.9 });
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.position.set(-6 + (r % 4) * 4, 1.5 + Math.floor(r / 4) * 1.4, -6 + (r % 3) * 5);
        rock.scale.set(1.2, 0.9, 1.4);
        islandGroup.add(rock);
      }
      // Hilltop tropical vegetation
      const hillTree = new THREE.Mesh(
        new THREE.SphereGeometry(4.5, 12, 12),
        new THREE.MeshStandardMaterial({ color: 0x1f4e2f, roughness: 0.8 })
      );
      hillTree.position.set(0, 5.5, 0);
      islandGroup.add(hillTree);
      monumentsGroup.add(islandGroup);

      // Colorful Goan Wooden Beach Shacks
      const shackColors = [0x2e8b57, 0xd97706, 0x9b2c2c]; // Sea green, warm ochre, rustic terracotta
      const shackPositions = [
        { x: -14, z: 2, rot: 0.1, color: shackColors[0] },
        { x: -3, z: 1, rot: -0.05, color: shackColors[1] },
        { x: 9, z: 3, rot: -0.15, color: shackColors[2] }
      ];

      shackPositions.forEach((sp) => {
        const shack = new THREE.Group();
        shack.position.set(sp.x, 0, sp.z);
        shack.rotation.y = sp.rot;

        // Raised wooden stilt platform
        const platformGeo = new THREE.BoxGeometry(7, 0.4, 5.5);
        const platform = new THREE.Mesh(platformGeo, new THREE.MeshStandardMaterial({ color: 0x5a3d28, roughness: 0.8 }));
        platform.position.y = 0.2;
        shack.add(platform);

        // Wooden cabin walls
        const cabinGeo = new THREE.BoxGeometry(6.2, 2.8, 3.5);
        const cabin = new THREE.Mesh(cabinGeo, new THREE.MeshStandardMaterial({ color: sp.color, roughness: 0.7 }));
        cabin.position.set(0, 1.8, -0.6);
        shack.add(cabin);

        // Thatched overhanging palm roof
        const roofGeo = new THREE.ConeGeometry(5.2, 1.8, 4);
        const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: 0x7a5835, roughness: 0.9 }));
        roof.position.set(0, 3.8, -0.6);
        roof.rotation.y = Math.PI / 4;
        shack.add(roof);

        // Veranda railing & table
        const tableGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.7, 8);
        const table = new THREE.Mesh(tableGeo, new THREE.MeshStandardMaterial({ color: 0x4a3320 }));
        table.position.set(-1.2, 0.75, 1.5);
        shack.add(table);

        // Beach Sun Loungers with striped parasols
        const loungerGeo = new THREE.BoxGeometry(1.6, 0.25, 0.7);
        const lounger = new THREE.Mesh(loungerGeo, new THREE.MeshStandardMaterial({ color: 0x2b4c7e }));
        lounger.position.set(1.5, 0.3, 2.0);
        shack.add(lounger);

        const parasolPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), new THREE.MeshStandardMaterial({ color: 0xcccccc }));
        parasolPole.position.set(1.5, 1.1, 2.0);
        const parasolTop = new THREE.Mesh(new THREE.ConeGeometry(1.2, 0.4, 8), new THREE.MeshStandardMaterial({ color: 0xd97706 }));
        parasolTop.position.set(1.5, 2.2, 2.0);
        shack.add(parasolPole);
        shack.add(parasolTop);

        monumentsGroup.add(shack);
      });

      // Curved Coconut Palms along the crescent
      for (let i = 0; i < 20; i++) {
        const px = -35 + (i * 3.8);
        const pz = 7 + Math.sin(i * 0.4) * 4;
        const trunkGeo = new THREE.CylinderGeometry(0.18, 0.3, 7.0, 8);
        const trunk = new THREE.Mesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5a3d28 }));
        trunk.position.set(px, 3.5, pz);
        trunk.rotation.z = (i % 2 === 0 ? 0.15 : -0.12);
        monumentsGroup.add(trunk);

        const fronds = new THREE.Mesh(new THREE.ConeGeometry(3.0, 1.5, 8), new THREE.MeshStandardMaterial({ color: 0x256e3b }));
        fronds.position.set(px + (i % 2 === 0 ? 0.9 : -0.8), 7.2, pz);
        monumentsGroup.add(fronds);
      }

      // Traditional Goan wooden canoes on the shoreline
      const canoeGeo = new THREE.BoxGeometry(0.8, 0.5, 4.0);
      const canoe = new THREE.Mesh(canoeGeo, new THREE.MeshStandardMaterial({ color: 0x3d2716 }));
      canoe.position.set(-6, 0.3, 4.5);
      canoe.rotation.y = 0.4;
      monumentsGroup.add(canoe);

    } else if (place.slug === 'varkala-cliff-beach') {
      // ------------------------------------------------------------------
      // VARKALA CLIFF BEACH (Kerala): Red Laterite Cliffs & High Promenade
      // ------------------------------------------------------------------
      // Deep Arabian Sea
      const oceanGeo = new THREE.PlaneGeometry(160, 60);
      const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0a6c74, roughness: 0.12, metalness: 0.7 });
      const ocean = new THREE.Mesh(oceanGeo, oceanMat);
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.set(0, 0.04, -25);
      monumentsGroup.add(ocean);

      // The Massive Red Laterite Cliff Wall running across the back
      const cliffGroup = new THREE.Group();
      cliffGroup.position.set(0, 0, 16);

      // Multi-tiered red laterite rock face (12m high)
      for (let seg = 0; seg < 10; seg++) {
        const cx = -36 + seg * 8;
        // Cliff base (deep terracotta red)
        const baseBlock = new THREE.Mesh(
          new THREE.BoxGeometry(8.5, 6, 8),
          new THREE.MeshStandardMaterial({ color: 0x7c2115, roughness: 0.9 })
        );
        baseBlock.position.set(cx, 3, 0);
        cliffGroup.add(baseBlock);

        // Cliff upper tier (ochre red with erosion striations)
        const topBlock = new THREE.Mesh(
          new THREE.BoxGeometry(8.2, 6.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x9b3323, roughness: 0.85 })
        );
        topBlock.position.set(cx, 9, 0.3);
        cliffGroup.add(topBlock);

        // Green shrubbery crowning the cliff edge
        const shrub = new THREE.Mesh(
          new THREE.BoxGeometry(7.5, 0.6, 2.5),
          new THREE.MeshStandardMaterial({ color: 0x2d5a27 })
        );
        shrub.position.set(cx, 12.3, 0.5);
        cliffGroup.add(shrub);
      }

      // Cliff-Top Promenade Railing & Cafes at y = 12.0
      for (let c = -20; c <= 20; c += 16) {
        const cafe = new THREE.Group();
        cafe.position.set(c, 12.3, 2.5);

        // Cafe floor platform
        const deck = new THREE.Mesh(new THREE.BoxGeometry(10, 0.3, 5), new THREE.MeshStandardMaterial({ color: 0x4a3425 }));
        cafe.add(deck);

        // Bamboo stilts & cloth awning
        const awning = new THREE.Mesh(new THREE.BoxGeometry(9.6, 0.1, 4.6), new THREE.MeshStandardMaterial({ color: c === -20 ? 0xd97706 : 0xedebe4 }));
        awning.position.y = 2.8;
        cafe.add(awning);

        // Cafe tables
        const ctable = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.7, 8), new THREE.MeshStandardMaterial({ color: 0x302013 }));
        ctable.position.set(0, 0.45, 0);
        cafe.add(ctable);

        cliffGroup.add(cafe);
      }

      // Safety railing along the cliff edge
      const railing = new THREE.Mesh(new THREE.BoxGeometry(80, 0.9, 0.1), new THREE.MeshStandardMaterial({ color: 0x222222 }));
      railing.position.set(0, 12.7, -3.2);
      cliffGroup.add(railing);

      // Wooden Staircase descending from the cliff summit to the beach
      const stairGroup = new THREE.Group();
      stairGroup.position.set(-6, 0, 12);
      for (let s = 0; s < 18; s++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(3.0, 0.3, 0.7),
          new THREE.MeshStandardMaterial({ color: 0x5a3b22 })
        );
        step.position.set(0, s * 0.65, -s * 0.5);
        stairGroup.add(step);
      }
      cliffGroup.add(stairGroup);

      // Papanasam Mineral Spring Niche at the cliff base
      const springTrough = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.8, 2.0),
        new THREE.MeshStandardMaterial({ color: 0x2b4c52, roughness: 0.2 })
      );
      springTrough.position.set(4, 0.4, 11);
      cliffGroup.add(springTrough);

      monumentsGroup.add(cliffGroup);

    } else if (place.slug === 'marina-beach-chennai') {
      // ------------------------------------------------------------------
      // MARINA BEACH (Chennai): Vast Urban Sands, Red-White Lighthouse & Catamarans
      // ------------------------------------------------------------------
      // Open Bay of Bengal
      const oceanGeo = new THREE.PlaneGeometry(160, 60);
      const oceanMat = new THREE.MeshStandardMaterial({ color: 0x145369, roughness: 0.18, metalness: 0.7 });
      const ocean = new THREE.Mesh(oceanGeo, oceanMat);
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.set(0, 0.04, -32);
      monumentsGroup.add(ocean);

      // Seaside Paved Boulevard (Kamarajar Promenade)
      const promenadeGeo = new THREE.PlaneGeometry(160, 12);
      const promenade = new THREE.Mesh(
        promenadeGeo,
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 })
      );
      promenade.rotation.x = -Math.PI / 2;
      promenade.position.set(0, 0.06, 18);
      monumentsGroup.add(promenade);

      // Promenade ornamental twin-globe lamp posts
      for (let lp = -40; lp <= 40; lp += 16) {
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.12, 4.5, 8),
          new THREE.MeshStandardMaterial({ color: 0x0f172a })
        );
        pole.position.set(lp, 2.25, 18);
        const lampGlobe = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 12, 12),
          new THREE.MeshBasicMaterial({ color: 0xfff3d4 })
        );
        lampGlobe.position.set(lp, 4.6, 18);
        monumentsGroup.add(pole);
        monumentsGroup.add(lampGlobe);
      }

      // The Iconic Marina Lighthouse (Towering 32m Red & White Cylinder)
      const lighthouse = new THREE.Group();
      lighthouse.position.set(-18, 0, 14);

      // Octagonal base building
      const lBase = new THREE.Mesh(
        new THREE.CylinderGeometry(4.0, 4.4, 3.5, 8),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
      );
      lBase.position.y = 1.75;
      lighthouse.add(lBase);

      // Alternating Red & White Shaft Rings (5 distinct tiers)
      const ringHeights = 5.5;
      const ringColors = [0xb91c1c, 0xf8fafc, 0xb91c1c, 0xf8fafc, 0xb91c1c]; // Red, White, Red, White, Red
      for (let t = 0; t < 5; t++) {
        const ring = new THREE.Mesh(
          new THREE.CylinderGeometry(2.1 - t * 0.1, 2.3 - t * 0.1, ringHeights, 24),
          new THREE.MeshStandardMaterial({ color: ringColors[t], roughness: 0.4 })
        );
        ring.position.y = 3.5 + t * ringHeights + ringHeights / 2;
        ring.castShadow = true;
        lighthouse.add(ring);
      }

      // Observation Balcony Gallery
      const balcony = new THREE.Mesh(
        new THREE.CylinderGeometry(3.0, 3.0, 0.6, 24),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      balcony.position.y = 31.3;
      lighthouse.add(balcony);

      // Lantern Room Dome with glass & beacon
      const lanternGlass = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 1.9, 2.2, 16),
        new THREE.MeshBasicMaterial({ color: 0xfff176, transparent: true, opacity: 0.85 })
      );
      lanternGlass.position.y = 32.7;
      lighthouse.add(lanternGlass);

      const domeTop = new THREE.Mesh(
        new THREE.SphereGeometry(2.0, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c })
      );
      domeTop.position.y = 33.8;
      lighthouse.add(domeTop);

      monumentsGroup.add(lighthouse);

      // Traditional Coromandel Catamarans (Lashed log boats) on the sand
      const catamaranPositions = [
        { x: -5, z: 2, rot: 0.2 },
        { x: 5, z: -3, rot: -0.15 },
        { x: 14, z: 1, rot: 0.3 }
      ];
      catamaranPositions.forEach((cp) => {
        const boat = new THREE.Group();
        boat.position.set(cp.x, 0.3, cp.z);
        boat.rotation.y = cp.rot;

        // 3 tied logs
        for (let l = -1; l <= 1; l++) {
          const log = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.22, 5.0, 8),
            new THREE.MeshStandardMaterial({ color: 0x613f1e })
          );
          log.rotation.x = Math.PI / 2;
          log.position.x = l * 0.35;
          boat.add(log);
        }

        // Upright bamboo mast
        const mast = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.05, 4.0, 6),
          new THREE.MeshStandardMaterial({ color: 0x94723c })
        );
        mast.position.set(0, 2.0, 0);
        boat.add(mast);

        monumentsGroup.add(boat);
      });

      // Beach Food Kiosks & Sundal Carts
      const cartPositions = [
        { x: 2, z: 12, awning: 0xd97706 },
        { x: 12, z: 13, awning: 0x1d4ed8 },
        { x: -8, z: 11, awning: 0xb91c1c }
      ];
      cartPositions.forEach((cart) => {
        const cGroup = new THREE.Group();
        cGroup.position.set(cart.x, 0, cart.z);

        // Cart table
        const cBody = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.0, 1.4), new THREE.MeshStandardMaterial({ color: 0x5a3d28 }));
        cBody.position.y = 0.8;
        cGroup.add(cBody);

        // Wheels
        for (let w = -1; w <= 1; w += 2) {
          const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 12), new THREE.MeshStandardMaterial({ color: 0x222222 }));
          wheel.rotation.z = Math.PI / 2;
          wheel.position.set(w * 1.15, 0.4, 0);
          cGroup.add(wheel);
        }

        // Striped awning
        const cAwning = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 1.6), new THREE.MeshStandardMaterial({ color: cart.awning }));
        cAwning.position.y = 2.0;
        cGroup.add(cAwning);

        monumentsGroup.add(cGroup);
      });
    } else if (place.slug.includes('beach') || place.slug.includes('havelock')) {
      // Ocean Plane
      const oceanGeo = new THREE.PlaneGeometry(160, 60);
      const oceanMat = new THREE.MeshStandardMaterial({ color: 0x0077b6, roughness: 0.1, metalness: 0.6 });
      const ocean = new THREE.Mesh(oceanGeo, oceanMat);
      ocean.rotation.x = -Math.PI / 2;
      ocean.position.set(0, 0.04, -30);
      monumentsGroup.add(ocean);

      // Palm Trees
      for (let i = 0; i < 18; i++) {
        const px = -35 + Math.random() * 70;
        const pz = -5 + Math.random() * 25;
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 6, 8);
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3d28 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.set(px, 3, pz);
        trunk.rotation.z = (Math.random() - 0.5) * 0.2;
        monumentsGroup.add(trunk);

        const leavesGeo = new THREE.ConeGeometry(2.5, 1.8, 7);
        const leavesMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f });
        const leaves = new THREE.Mesh(leavesGeo, leavesMat);
        leaves.position.set(px, 6.2, pz);
        monumentsGroup.add(leaves);
      }
    } else if (place.slug === 'hampi') {
      // ------------------------------------------------------------------
      // HAMPI (Karnataka): The Boulder Kingdom & Vittala Stone Chariot
      // ------------------------------------------------------------------
      const graniteMat = new THREE.MeshStandardMaterial({ color: 0x7a6953, roughness: 0.85 });
      const darkGraniteMat = new THREE.MeshStandardMaterial({ color: 0x544738, roughness: 0.9 });

      // Granite Boulder Hills surrounding the complex
      const boulderPositions = [
        [-28, -22, 1.8], [-34, -14, 2.4], [-26, 4, 1.6], [-30, 20, 2.2],
        [26, -24, 2.0], [32, -12, 2.6], [28, 8, 1.9], [30, 22, 2.1],
        [-14, -34, 2.5], [12, -32, 2.3]
      ];
      boulderPositions.forEach(([bx, bz, scale]) => {
        const bGroup = new THREE.Group();
        bGroup.position.set(bx, 0, bz);
        for (let s = 0; s < 4; s++) {
          const bMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(2.5 * scale, 1), darkGraniteMat);
          bMesh.position.set((s % 2) * 2, s * 2.2 * scale, (s > 1 ? 2 : -2));
          bMesh.scale.set(1.1, 0.9, 1.2);
          bGroup.add(bMesh);
        }
        monumentsGroup.add(bGroup);
      });

      // Paved Temple Courtyard Flagstones
      const courtyard = new THREE.Mesh(
        new THREE.PlaneGeometry(60, 50),
        new THREE.MeshStandardMaterial({ color: 0x5c4d3c, roughness: 0.9 })
      );
      courtyard.rotation.x = -Math.PI / 2;
      courtyard.position.set(0, 0.03, -2);
      monumentsGroup.add(courtyard);

      // The Iconic Vittala Stone Chariot
      const chariot = new THREE.Group();
      chariot.position.set(0, 0, 0);

      // Chariot base plinth
      const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.4, 1.2, 5.0), graniteMat);
      plinth.position.y = 0.6;
      chariot.add(plinth);

      // 4 Carved Stone Wheels
      const wheelGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 20);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x483c2e, roughness: 0.7 });
      const wheelOffsets = [[-2.9, -1.8], [2.9, -1.8], [-2.9, 1.8], [2.9, 1.8]];
      wheelOffsets.forEach(([wx, wz]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(wx, 1.2, wz);
        chariot.add(wheel);

        // Floral hubcap
        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.5, 12), new THREE.MeshStandardMaterial({ color: 0x8a7458 }));
        hub.rotation.z = Math.PI / 2;
        hub.position.set(wx, 1.2, wz);
        chariot.add(hub);
      });

      // Two Stone Guardian Elephants in front of chariot ramp
      for (let e = -1; e <= 1; e += 2) {
        const elephant = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 1.6), darkGraniteMat);
        elephant.position.set(e * 1.2, 0.5, 3.2);
        chariot.add(elephant);
      }

      // Shrine Sanctum Body
      const sanctum = new THREE.Mesh(new THREE.BoxGeometry(4.8, 3.2, 3.8), graniteMat);
      sanctum.position.set(0, 2.8, 0);
      chariot.add(sanctum);

      // Two-tiered stepped Dravidian roof & Kalasha
      for (let t = 0; t < 3; t++) {
        const roofTier = new THREE.Mesh(
          new THREE.BoxGeometry(4.2 - t * 1.0, 0.8, 3.2 - t * 0.8),
          graniteMat
        );
        roofTier.position.set(0, 4.8 + t * 0.8, 0);
        chariot.add(roofTier);
      }
      const finial = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.0, 8), new THREE.MeshStandardMaterial({ color: 0xa8906a }));
      finial.position.set(0, 7.5, 0);
      chariot.add(finial);

      monumentsGroup.add(chariot);

      // Sangeetha Mandapa (Musical Pillar Pavilion)
      const mandapa = new THREE.Group();
      mandapa.position.set(-14, 0, -4);

      // Raised pavilion base
      const mPlinth = new THREE.Mesh(new THREE.BoxGeometry(14, 1.0, 12), graniteMat);
      mPlinth.position.y = 0.5;
      mandapa.add(mPlinth);

      // 16 Musical Pillars Colonnade
      for (let px = -5; px <= 5; px += 3.3) {
        for (let pz = -4; pz <= 4; pz += 2.6) {
          // Central pillar
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.5, 4.2, 0.5), darkGraniteMat);
          col.position.set(px, 3.1, pz);
          mandapa.add(col);

          // Attached slender musical colonnettes
          for (let ac = 0; ac < 4; ac++) {
            const angle = (ac * Math.PI) / 2;
            const subCol = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4.0, 8), graniteMat);
            subCol.position.set(px + Math.cos(angle) * 0.35, 3.0, pz + Math.sin(angle) * 0.35);
            mandapa.add(subCol);
          }
        }
      }

      // Pavilion stone roof eaves (Chhajja)
      const mRoof = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.6, 13.2), darkGraniteMat);
      mRoof.position.y = 5.4;
      mandapa.add(mRoof);

      monumentsGroup.add(mandapa);

    } else if (place.slug === 'ajanta-and-ellora-caves') {
      // ------------------------------------------------------------------
      // AJANTA & ELLORA CAVES (Maharashtra): Monolithic Basalt Excavation & Kailasa Temple
      // ------------------------------------------------------------------
      const basaltMat = new THREE.MeshStandardMaterial({ color: 0x2e2f33, roughness: 0.95 });
      const darkRockMat = new THREE.MeshStandardMaterial({ color: 0x222326, roughness: 0.98 });
      const carvedStoneMat = new THREE.MeshStandardMaterial({ color: 0x42444a, roughness: 0.85 });

      // Massive U-shaped volcanic basalt canyon quarry surrounding the site (16m high)
      const canyonGroup = new THREE.Group();
      // Rear cliff face
      const rearCliff = new THREE.Mesh(new THREE.BoxGeometry(90, 18, 14), darkRockMat);
      rearCliff.position.set(0, 9, -24);
      canyonGroup.add(rearCliff);

      // Left & Right cliff walls
      const leftCliff = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 60), darkRockMat);
      leftCliff.position.set(-36, 9, 2);
      canyonGroup.add(leftCliff);

      const rightCliff = new THREE.Mesh(new THREE.BoxGeometry(14, 18, 60), darkRockMat);
      rightCliff.position.set(36, 9, 2);
      canyonGroup.add(rightCliff);

      // Rock-Cut Cave Portals carved into the rear cliff
      const cavePortals = [-20, 0, 20];
      cavePortals.forEach((cx) => {
        // Arched horse-shoe chaitya entrance
        const portal = new THREE.Mesh(
          new THREE.TorusGeometry(3.0, 0.6, 8, 16, Math.PI),
          carvedStoneMat
        );
        portal.position.set(cx, 4.0, -16.8);
        canyonGroup.add(portal);

        // Dark interior void
        const caveVoid = new THREE.Mesh(
          new THREE.BoxGeometry(5.0, 5.0, 3.0),
          new THREE.MeshBasicMaterial({ color: 0x050507 })
        );
        caveVoid.position.set(cx, 2.5, -17.5);
        canyonGroup.add(caveVoid);

        // Flanking carved rock columns
        for (let side = -1; side <= 1; side += 2) {
          const col = new THREE.Mesh(new THREE.BoxGeometry(0.7, 5.0, 0.7), carvedStoneMat);
          col.position.set(cx + side * 2.8, 2.5, -16.6);
          canyonGroup.add(col);
        }
      });

      monumentsGroup.add(canyonGroup);

      // The Monolithic Kailasa Temple (Carved top-down from living mountain)
      const kailasa = new THREE.Group();
      kailasa.position.set(0, 0, -4);

      // Colossal Plinth with Elephant friezes
      const kPlinth = new THREE.Mesh(new THREE.BoxGeometry(16, 3.5, 20), basaltMat);
      kPlinth.position.y = 1.75;
      kailasa.add(kPlinth);

      // Sculpted Guardian Elephants along plinth sides
      for (let el = -1; el <= 1; el += 2) {
        for (let ed = -6; ed <= 6; ed += 4) {
          const elephant = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.4, 1.8), carvedStoneMat);
          elephant.position.set(el * 8.4, 1.2, ed);
          kailasa.add(elephant);
        }
      }

      // Main Vimana (3-tiered Dravidian stepped pyramid tower)
      for (let vt = 0; vt < 4; vt++) {
        const vTier = new THREE.Mesh(
          new THREE.BoxGeometry(12 - vt * 2.2, 2.6, 12 - vt * 2.2),
          carvedStoneMat
        );
        vTier.position.set(0, 4.8 + vt * 2.6, -2);
        kailasa.add(vTier);
      }

      // Octagonal dome crown (Shikhara)
      const kDome = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.2, 2.2, 8), carvedStoneMat);
      kDome.position.set(0, 15.5, -2);
      kailasa.add(kDome);

      const kKalasha = new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.8, 8), basaltMat);
      kKalasha.position.set(0, 17.5, -2);
      kailasa.add(kKalasha);

      // Nandi Mandapa (Two-Storey Front Pavilion)
      const nandiPavilion = new THREE.Mesh(new THREE.BoxGeometry(6.5, 6.0, 6.5), carvedStoneMat);
      nandiPavilion.position.set(0, 3.0, 9);
      kailasa.add(nandiPavilion);

      // Two Monumental Free-Standing Victory Pillars (Dhvajastambhas)
      const pillarPositions = [-9.5, 9.5];
      pillarPositions.forEach((px) => {
        const pillar = new THREE.Group();
        pillar.position.set(px, 0, 7);

        // Square carved base
        const pBase = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.5, 2.2), basaltMat);
        pBase.position.y = 1.25;
        pillar.add(pBase);

        // Tapering 14-meter column shaft
        const pShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 1.0, 12, 16), carvedStoneMat);
        pShaft.position.y = 8.5;
        pillar.add(pShaft);

        // Sculpted capital finial
        const pCap = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2, 0), basaltMat);
        pCap.position.y = 15.0;
        pillar.add(pCap);

        kailasa.add(pillar);
      });

      monumentsGroup.add(kailasa);

    } else if (place.slug === 'khajuraho-monuments') {
      // ------------------------------------------------------------------
      // KHAJURAHO (Madhya Pradesh): Nagara Sandstone Spire & Kandariya Mahadeva
      // ------------------------------------------------------------------
      const sandstoneMat = new THREE.MeshStandardMaterial({ color: 0xbe8c56, roughness: 0.65 });
      const darkSandstoneMat = new THREE.MeshStandardMaterial({ color: 0x9e6f3b, roughness: 0.75 });
      const goldAmalakaMat = new THREE.MeshStandardMaterial({ color: 0xd4a054, roughness: 0.5, metalness: 0.2 });

      // High Jagati Sandstone Platform
      const jagati = new THREE.Group();
      jagati.position.set(0, 0, -6);

      const jPlinth = new THREE.Mesh(new THREE.BoxGeometry(22, 2.4, 28), sandstoneMat);
      jPlinth.position.y = 1.2;
      jagati.add(jPlinth);

      // Grand Entrance Staircase
      for (let st = 0; st < 8; st++) {
        const step = new THREE.Mesh(
          new THREE.BoxGeometry(7.0, 0.3, 0.8),
          darkSandstoneMat
        );
        step.position.set(0, st * 0.3, 14.4 + st * 0.6);
        jagati.add(step);
      }

      // Sculptured Horizontal Frieze Bands along the platform
      for (let fb = 0; fb < 3; fb++) {
        const frieze = new THREE.Mesh(new THREE.BoxGeometry(22.3, 0.3, 28.3), darkSandstoneMat);
        frieze.position.y = 0.5 + fb * 0.7;
        jagati.add(frieze);
      }

      // Three Cascading Pyramidal Mandapa Roofs (Ardha -> Mandapa -> Mahamandapa)
      const mandapas = [
        { z: 8, width: 7, height: 6, tiers: 4 },
        { z: 3, width: 9, height: 9, tiers: 5 },
        { z: -2, width: 11, height: 12, tiers: 6 },
      ];
      mandapas.forEach((m) => {
        for (let mt = 0; mt < m.tiers; mt++) {
          const roofGeo = new THREE.ConeGeometry(m.width - mt * 1.1, 1.8, 4);
          const roof = new THREE.Mesh(roofGeo, sandstoneMat);
          roof.position.set(0, 2.4 + mt * 1.6, m.z);
          roof.rotation.y = Math.PI / 4;
          jagati.add(roof);
        }
      });

      // The Soaring Kandariya Mahadeva Shikhara (Mountain Peak Spire - 24m)
      const shikharaGroup = new THREE.Group();
      shikharaGroup.position.set(0, 2.4, -9);

      // Main curvilinear spire core
      const mainSpire = new THREE.Mesh(
        new THREE.CylinderGeometry(2.2, 5.8, 18, 16),
        sandstoneMat
      );
      mainSpire.position.y = 9.0;
      shikharaGroup.add(mainSpire);

      // 12 Miniature Cluster Spires (Urushringas) ascending around the main spire
      for (let u = 0; u < 12; u++) {
        const angle = (u * Math.PI * 2) / 12;
        const radius = 4.2 - (u % 3) * 0.5;
        const uHeight = 7.0 + (u % 3) * 2.5;

        const uSpire = new THREE.Mesh(
          new THREE.ConeGeometry(1.2, uHeight, 8),
          darkSandstoneMat
        );
        uSpire.position.set(Math.cos(angle) * radius, uHeight / 2, Math.sin(angle) * radius);
        shikharaGroup.add(uSpire);
      }

      // Ribbed Amalaka Disc Crown atop the Shikhara
      const amalaka = new THREE.Mesh(
        new THREE.CylinderGeometry(2.8, 3.2, 1.2, 24),
        goldAmalakaMat
      );
      amalaka.position.y = 18.6;
      shikharaGroup.add(amalaka);

      // Golden Kalasha Finial
      const kalasha = new THREE.Mesh(
        new THREE.ConeGeometry(0.8, 2.2, 12),
        goldAmalakaMat
      );
      kalasha.position.y = 20.2;
      shikharaGroup.add(kalasha);

      jagati.add(shikharaGroup);

      // Subsidiary Corner Shrine (Panchayatana layout)
      const subShrine = new THREE.Group();
      subShrine.position.set(8.5, 0, 10);
      const sPlinth = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 4), sandstoneMat);
      sPlinth.position.y = 0.75;
      subShrine.add(sPlinth);

      const sSpire = new THREE.Mesh(new THREE.ConeGeometry(2.2, 7.0, 4), sandstoneMat);
      sSpire.position.y = 5.0;
      sSpire.rotation.y = Math.PI / 4;
      subShrine.add(sSpire);

      jagati.add(subShrine);

      monumentsGroup.add(jagati);

    } else if (place.slug === 'jim-corbett' || place.slug === 'jim-corbett-national-park') {
      // ------------------------------------------------------------------
      // JIM CORBETT (Uttarakhand): Shivalik Hills, Ramganga River, Sal Forest & Safari Gypsy
      // ------------------------------------------------------------------
      const salCanopyMat = new THREE.MeshStandardMaterial({ color: 0x184d28, roughness: 0.85 });
      const salTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3b32, roughness: 0.9 });
      const riverWaterMat = new THREE.MeshStandardMaterial({ color: 0x1f6e8c, roughness: 0.15, metalness: 0.75 });
      const gravelMat = new THREE.MeshStandardMaterial({ color: 0x8a857b, roughness: 0.95 });
      const woodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });

      // Rolling Shivalik Foothill Ridges in Northern Background
      const foothillCoords = [
        [-40, -42, 32], [-15, -48, 38], [15, -45, 35], [42, -40, 30]
      ];
      foothillCoords.forEach(([fx, fz, fHeight]) => {
        const hill = new THREE.Mesh(
          new THREE.ConeGeometry(24, fHeight, 6),
          new THREE.MeshStandardMaterial({ color: 0x1a3321, roughness: 0.95 })
        );
        hill.position.set(fx, fHeight / 2, fz);
        monumentsGroup.add(hill);
      });

      // Ramganga Mountain River Channel traversing the reserve
      const river = new THREE.Mesh(new THREE.PlaneGeometry(16, 90), riverWaterMat);
      river.rotation.x = -Math.PI / 2;
      river.position.set(18, 0.04, -5);
      monumentsGroup.add(river);

      // River Gravel Sandbanks & Basking Gharial Crocodile
      const sandbar = new THREE.Mesh(new THREE.PlaneGeometry(10, 35), gravelMat);
      sandbar.rotation.x = -Math.PI / 2;
      sandbar.position.set(18, 0.05, 5);
      monumentsGroup.add(sandbar);

      // Basking Gharial
      const gharial = new THREE.Group();
      gharial.position.set(18, 0.2, 5);
      const gBody = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 2.8), new THREE.MeshStandardMaterial({ color: 0x3d4738, roughness: 0.9 }));
      gharial.add(gBody);
      const gSnout = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 1.4, 8), new THREE.MeshStandardMaterial({ color: 0x2d3629, roughness: 0.9 }));
      gSnout.rotation.x = Math.PI / 2;
      gSnout.position.set(0, 0.05, 1.8);
      gharial.add(gSnout);
      monumentsGroup.add(gharial);

      // Mature Sal Forest (Shorea robusta) Colonnade of Trees
      const treePositions = [
        [-24, -22], [-28, -8], [-22, 6], [-26, 20],
        [-12, -26], [-16, -14], [-14, 16], [-10, 24],
        [4, -28], [2, -18], [32, -18], [34, 12]
      ];
      treePositions.forEach(([tx, tz]) => {
        const salTree = new THREE.Group();
        salTree.position.set(tx, 0, tz);

        // Tall straight Sal trunk (9m)
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.55, 9.0, 10), salTrunkMat);
        trunk.position.y = 4.5;
        trunk.castShadow = true;
        salTree.add(trunk);

        // Broad tiered forest foliage canopy
        for (let l = 0; l < 3; l++) {
          const canopy = new THREE.Mesh(
            new THREE.SphereGeometry(3.2 - l * 0.6, 10, 10),
            salCanopyMat
          );
          canopy.position.y = 8.0 + l * 2.0;
          canopy.scale.set(1.2, 0.8, 1.1);
          canopy.castShadow = true;
          salTree.add(canopy);
        }
        monumentsGroup.add(salTree);
      });

      // Dhikala Grassland Stilt Observation Watchtower
      const watchtower = new THREE.Group();
      watchtower.position.set(-6, 0, 4);

      // 4 Heavy timber stilts
      for (let sx = -1; sx <= 1; sx += 2) {
        for (let sz = -1; sz <= 1; sz += 2) {
          const stilt = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 7.5, 8), woodMat);
          stilt.position.set(sx * 2.2, 3.75, sz * 2.2);
          stilt.castShadow = true;
          watchtower.add(stilt);
        }
      }

      // Wooden observation deck platform
      const deck = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.35, 5.4), woodMat);
      deck.position.y = 7.5;
      watchtower.add(deck);

      // Safety railing
      const rail = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.9, 5.2), new THREE.MeshStandardMaterial({ color: 0x422d21, wireframe: true }));
      rail.position.y = 8.1;
      watchtower.add(rail);

      // Thatched pyramidal canopy roof
      const wRoof = new THREE.Mesh(
        new THREE.ConeGeometry(4.2, 2.2, 4),
        new THREE.MeshStandardMaterial({ color: 0x6e5233, roughness: 0.95 })
      );
      wRoof.position.y = 9.8;
      wRoof.rotation.y = Math.PI / 4;
      watchtower.add(wRoof);

      monumentsGroup.add(watchtower);

      // Open 4x4 Safari Gypsy Vehicle
      const gypsy = new THREE.Group();
      gypsy.position.set(-4, 0, 14);

      // Forest green chassis
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6 });
      const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 4.2), bodyMat);
      chassis.position.y = 1.0;
      gypsy.add(chassis);

      // 4 Knobby off-road wheels
      const tireMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.9 });
      const wheelOffsets = [[-1.2, -1.3], [1.2, -1.3], [-1.2, 1.3], [1.2, 1.3]];
      wheelOffsets.forEach(([wx, wz]) => {
        const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.35, 12), tireMat);
        tire.rotation.z = Math.PI / 2;
        tire.position.set(wx, 0.45, wz);
        gypsy.add(tire);
      });

      // Black safari tubular roll-bars
      const rollBarMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.5 });
      const barFront = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.12), rollBarMat);
      barFront.position.set(0, 2.1, 0.2);
      gypsy.add(barFront);

      const barRear = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.4, 0.12), rollBarMat);
      barRear.position.set(0, 2.1, -1.6);
      gypsy.add(barRear);

      monumentsGroup.add(gypsy);

      // Royal Bengal Tiger Prowling the Meadow Edge
      const tiger = new THREE.Group();
      tiger.position.set(-16, 0, -2);
      const tigerMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });
      const tBody = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 2.2), tigerMat);
      tBody.position.y = 0.9;
      tiger.add(tBody);

      const tHead = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.6, 0.7), tigerMat);
      tHead.position.set(0, 1.2, 1.3);
      tiger.add(tHead);

      const tTail = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 1.2, 8), tigerMat);
      tTail.position.set(0, 1.1, -1.4);
      tTail.rotation.x = -0.5;
      tiger.add(tTail);
      monumentsGroup.add(tiger);

    } else if (place.slug === 'kaziranga-national-park') {
      // ------------------------------------------------------------------
      // KAZIRANGA (Assam): Brahmaputra Floodplain, Great One-Horned Rhino & Elephant Grass
      // ------------------------------------------------------------------
      const marshMat = new THREE.MeshStandardMaterial({ color: 0x1a4542, roughness: 0.1, metalness: 0.8 });
      const grassMat1 = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.9 });
      const grassMat2 = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 });
      const rhinoSkinMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
      const hornMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });

      // Wetland Lagoon / Marsh Beel
      const marsh = new THREE.Mesh(new THREE.PlaneGeometry(42, 28), marshMat);
      marsh.rotation.x = -Math.PI / 2;
      marsh.position.set(-6, 0.04, -8);
      monumentsGroup.add(marsh);

      // Water Lily Pads on the marsh
      for (let l = 0; l < 18; l++) {
        const pad = new THREE.Mesh(
          new THREE.CylinderGeometry(0.6, 0.6, 0.05, 8),
          new THREE.MeshStandardMaterial({ color: 0x15803d })
        );
        pad.position.set(-18 + (l % 6) * 5, 0.06, -18 + Math.floor(l / 6) * 7);
        monumentsGroup.add(pad);
      }

      // Towering Elephant Grass Groves (3.5m tall reeds)
      const reedCoords = [
        [-24, -20], [-20, 10], [-26, 4], [-18, 18],
        [8, -22], [14, -14], [22, -6], [18, 12], [24, 20],
        [-4, 16], [4, 18]
      ];
      reedCoords.forEach(([rx, rz]) => {
        const grove = new THREE.Group();
        grove.position.set(rx, 0, rz);
        for (let r = 0; r < 9; r++) {
          const rHeight = 3.2 + (r % 3) * 0.7;
          const reed = new THREE.Mesh(
            new THREE.CylinderGeometry(0.06, 0.1, rHeight, 6),
            r % 2 ? grassMat1 : grassMat2
          );
          reed.position.set(
            (r % 3 - 1) * 0.6,
            rHeight / 2,
            (Math.floor(r / 3) - 1) * 0.6
          );
          reed.rotation.z = ((r - 4) * 0.05);
          grove.add(reed);
        }
        monumentsGroup.add(grove);
      });

      // The Great Indian One-Horned Rhinoceros (Armored Hide & Nasal Horn)
      const rhino = new THREE.Group();
      rhino.position.set(-4, 0, -4);

      // Massive armored torso
      const rTorso = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 2.8), rhinoSkinMat);
      rTorso.position.y = 1.35;
      rTorso.castShadow = true;
      rhino.add(rTorso);

      // Shoulder & flank armor plates (characteristic folds)
      const rShoulderPlate = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.45, 0.7), rhinoSkinMat);
      rShoulderPlate.position.set(0, 1.4, 0.7);
      rhino.add(rShoulderPlate);

      const rRearPlate = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.45, 0.7), rhinoSkinMat);
      rRearPlate.position.set(0, 1.4, -0.7);
      rhino.add(rRearPlate);

      // Heavy muscular legs
      for (let lx = -1; lx <= 1; lx += 2) {
        for (let lz = -1; lz <= 1; lz += 2) {
          const rLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 1.0, 8), rhinoSkinMat);
          rLeg.position.set(lx * 0.65, 0.5, lz * 0.95);
          rhino.add(rLeg);
        }
      }

      // Low heavy head with distinct single nasal horn
      const rHead = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.3), rhinoSkinMat);
      rHead.position.set(0, 1.1, 1.9);
      rhino.add(rHead);

      const rHorn = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.75, 8), hornMat);
      rHorn.position.set(0, 1.7, 2.3);
      rHorn.rotation.x = -0.4;
      rhino.add(rHorn);

      monumentsGroup.add(rhino);

      // Domesticated Patrol Elephant with Safari Howdah
      const elephant = new THREE.Group();
      elephant.position.set(8, 0, 4);

      const eMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.9 });
      const eBody = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.0, 3.4), eMat);
      eBody.position.y = 2.4;
      eBody.castShadow = true;
      elephant.add(eBody);

      // 4 Pillar legs
      for (let ex = -1; ex <= 1; ex += 2) {
        for (let ez = -1; ez <= 1; ez += 2) {
          const eLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, 1.8, 8), eMat);
          eLeg.position.set(ex * 0.8, 0.9, ez * 1.1);
          elephant.add(eLeg);
        }
      }

      // Head & curved trunk
      const eHead = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.4, 1.4), eMat);
      eHead.position.set(0, 3.0, 2.1);
      elephant.add(eHead);

      const eTrunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.25, 2.0, 8), eMat);
      eTrunk.position.set(0, 1.8, 2.8);
      eTrunk.rotation.x = 0.25;
      elephant.add(eTrunk);

      // Wooden Safari Howdah on back
      const howdah = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.8, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 })
      );
      howdah.position.set(0, 3.8, 0.1);
      elephant.add(howdah);

      monumentsGroup.add(elephant);

      // Kohora Wooden Wildlife Observation Watchtower
      const kTower = new THREE.Group();
      kTower.position.set(16, 0, -8);

      for (let px = -1; px <= 1; px += 2) {
        for (let pz = -1; pz <= 1; pz += 2) {
          const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 8.0, 8), new THREE.MeshStandardMaterial({ color: 0x5c4033 }));
          leg.position.set(px * 2.2, 4.0, pz * 2.2);
          kTower.add(leg);
        }
      }

      const kDeck = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.35, 5.2), new THREE.MeshStandardMaterial({ color: 0x785338 }));
      kDeck.position.y = 8.0;
      kTower.add(kDeck);

      const kRoof = new THREE.Mesh(
        new THREE.ConeGeometry(4.0, 2.0, 4),
        new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
      );
      kRoof.position.y = 10.2;
      kRoof.rotation.y = Math.PI / 4;
      kTower.add(kRoof);

      monumentsGroup.add(kTower);

    } else if (place.slug === 'sundarbans-mangrove-forest' || place.slug === 'sundarbans-national-park') {
      // ------------------------------------------------------------------
      // SUNDARBANS (West Bengal): Tidal Mangrove Estuary, Sundari Trees & Safari Boat
      // ------------------------------------------------------------------
      const creekMat = new THREE.MeshStandardMaterial({ color: 0x0f3638, roughness: 0.15, metalness: 0.85 });
      const mudMat = new THREE.MeshStandardMaterial({ color: 0x222a24, roughness: 0.98 });
      const mangroveLeafMat = new THREE.MeshStandardMaterial({ color: 0x064e3b, roughness: 0.85 });
      const woodBoatMat = new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.8 });

      // S-Curving Tidal Saltwater Creek
      const creek = new THREE.Mesh(new THREE.PlaneGeometry(22, 90), creekMat);
      creek.rotation.x = -Math.PI / 2;
      creek.position.set(-6, 0.04, 0);
      monumentsGroup.add(creek);

      // Intertidal Mudflat Bank
      const mudflat = new THREE.Mesh(new THREE.PlaneGeometry(16, 90), mudMat);
      mudflat.rotation.x = -Math.PI / 2;
      mudflat.position.set(10, 0.05, 0);
      monumentsGroup.add(mudflat);

      // Pneumatophores (Hundreds of vertical breathing roots sticking out of the mud)
      const pneuGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.55, 6);
      const pneuMat = new THREE.MeshStandardMaterial({ color: 0x3d3527, roughness: 0.95 });
      for (let p = 0; p < 45; p++) {
        const pneu = new THREE.Mesh(pneuGeo, pneuMat);
        pneu.position.set(4 + (p % 9) * 1.2, 0.3, -20 + Math.floor(p / 9) * 9 + (p % 3) * 0.5);
        monumentsGroup.add(pneu);
      }

      // Dense Sundari (Heritiera fomes) Mangrove Trees with Arching Stilt Roots
      const mangroveCoords = [
        [-24, -22], [-22, -6], [-26, 12], [-20, 24],
        [20, -24], [24, -10], [22, 8], [26, 22]
      ];
      mangroveCoords.forEach(([mx, mz]) => {
        const tree = new THREE.Group();
        tree.position.set(mx, 0, mz);

        // Stilt root cluster
        for (let r = 0; r < 5; r++) {
          const angle = (r * Math.PI * 2) / 5;
          const root = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.12, 2.2, 6),
            new THREE.MeshStandardMaterial({ color: 0x3e2716, roughness: 0.9 })
          );
          root.position.set(Math.cos(angle) * 0.9, 1.0, Math.sin(angle) * 0.9);
          root.rotation.z = Math.cos(angle) * 0.35;
          root.rotation.x = Math.sin(angle) * 0.35;
          tree.add(root);
        }

        // Trunk & Umbrella Foliage
        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.35, 5.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x3e2716, roughness: 0.9 })
        );
        trunk.position.y = 3.5;
        tree.add(trunk);

        const crown = new THREE.Mesh(
          new THREE.SphereGeometry(3.6, 10, 8),
          mangroveLeafMat
        );
        crown.position.y = 6.2;
        crown.scale.set(1.4, 0.7, 1.3);
        crown.castShadow = true;
        tree.add(crown);

        monumentsGroup.add(tree);
      });

      // Traditional Sundarbans Safari Boat (Nauka / Bhotbhoti)
      const boat = new THREE.Group();
      boat.position.set(-6, 0.2, 8);

      // Curved boat hull
      const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.0, 7.5), woodBoatMat);
      hull.position.y = 0.5;
      boat.add(hull);

      // Pointed bow
      const bow = new THREE.Mesh(
        new THREE.ConeGeometry(1.2, 2.0, 4),
        woodBoatMat
      );
      bow.rotation.x = -Math.PI / 2;
      bow.position.set(0, 0.5, 4.5);
      boat.add(bow);

      // Woven arched bamboo cabin canopy
      const canopy = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.2, 3.8, 12, 1, false, 0, Math.PI),
        new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.9 })
      );
      canopy.rotation.z = Math.PI / 2;
      canopy.rotation.y = -Math.PI / 2;
      canopy.position.set(0, 1.6, -0.5);
      boat.add(canopy);

      monumentsGroup.add(boat);

      // Sajnekhali Elevated Wooden Mangrove Watchtower & Caged Boardwalk
      const sTower = new THREE.Group();
      sTower.position.set(16, 0, -4);

      // Raised boardwalk walkway
      const boardwalk = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.3, 26),
        new THREE.MeshStandardMaterial({ color: 0x573b22, roughness: 0.9 })
      );
      boardwalk.position.set(0, 1.8, 8);
      sTower.add(boardwalk);

      // Boardwalk support pilings
      for (let b = 0; b < 6; b++) {
        for (let side = -1; side <= 1; side += 2) {
          const pile = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 6), new THREE.MeshStandardMaterial({ color: 0x3d2715 }));
          pile.position.set(side * 1.3, 0.9, -2 + b * 4);
          sTower.add(pile);
        }
      }

      // Two-storey forest observation post
      const tDeck = new THREE.Mesh(
        new THREE.BoxGeometry(6.0, 0.4, 6.0),
        new THREE.MeshStandardMaterial({ color: 0x573b22, roughness: 0.9 })
      );
      tDeck.position.y = 7.5;
      sTower.add(tDeck);

      const tRoof = new THREE.Mesh(
        new THREE.ConeGeometry(4.8, 2.2, 4),
        new THREE.MeshStandardMaterial({ color: 0x223328, roughness: 0.9 })
      );
      tRoof.position.y = 9.8;
      tRoof.rotation.y = Math.PI / 4;
      sTower.add(tRoof);

      monumentsGroup.add(sTower);

    } else if (place.slug === 'triund-trek') {
      // ------------------------------------------------------------------
      // TRIUND TREK (Himachal Pradesh): Dhauladhar Sheer Mun Peak, Ridge Tents & Magic View Cafe
      // ------------------------------------------------------------------
      const graniteCliffMat = new THREE.MeshStandardMaterial({ color: 0x22262e, roughness: 0.95 });
      const snowCouloirMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.65 });
      const woodShackMat = new THREE.MeshStandardMaterial({ color: 0x5c4738, roughness: 0.9 });
      const tinRoofMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.6 });

      // Sheer Dhauladhar Granite Mountain Wall (Mun Peak - 55m high directly in front)
      const dhauladharGroup = new THREE.Group();
      dhauladharGroup.position.set(0, 0, -32);

      const peakCoords = [
        [-35, 28, 48], [-14, 34, 58], [12, 32, 54], [34, 26, 46],
        [-24, 22, 42], [0, 36, 62], [22, 24, 44]
      ];
      peakCoords.forEach(([px, py, pHeight]) => {
        const peak = new THREE.Mesh(new THREE.ConeGeometry(18, pHeight, 5), graniteCliffMat);
        peak.position.set(px, py, 0);
        dhauladharGroup.add(peak);

        // Snow-filled couloirs & glacier ridges
        const snowVein = new THREE.Mesh(new THREE.ConeGeometry(8, pHeight * 0.6, 4), snowCouloirMat);
        snowVein.position.set(px, py + pHeight * 0.22, 1.2);
        dhauladharGroup.add(snowVein);
      });
      monumentsGroup.add(dhauladharGroup);

      // Kangra Valley Drop-off Horizon on Southern Edge
      const valleyMist = new THREE.Mesh(
        new THREE.PlaneGeometry(160, 25),
        new THREE.MeshBasicMaterial({ color: 0x1a2e3b, transparent: true, opacity: 0.6 })
      );
      valleyMist.rotation.x = -Math.PI / 2;
      valleyMist.position.set(0, -1.0, 24);
      monumentsGroup.add(valleyMist);

      // Triund Ridge Campsite: Ring of Colorful Geodesic Tents
      const tentColors = [0xf97316, 0x0284c7, 0xeab308, 0x10b981, 0xec4899];
      const tentPositions = [
        [-8, 0, 8], [-4, 0, 11], [3, 0, 10], [8, 0, 7], [-12, 0, 5]
      ];
      tentPositions.forEach(([tx, ty, tz], idx) => {
        const tent = new THREE.Group();
        tent.position.set(tx, ty, tz);

        const tentMat = new THREE.MeshStandardMaterial({
          color: tentColors[idx % tentColors.length],
          roughness: 0.6,
        });
        const tentDome = new THREE.Mesh(
          new THREE.SphereGeometry(1.6, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2),
          tentMat
        );
        tentDome.scale.set(1.1, 0.9, 1.3);
        tent.add(tentDome);

        // Entrance flap
        const flap = new THREE.Mesh(
          new THREE.ConeGeometry(0.7, 1.2, 4),
          new THREE.MeshStandardMaterial({ color: 0x1f2937 })
        );
        flap.position.set(0, 0.6, 1.3);
        flap.rotation.y = Math.PI / 4;
        tent.add(flap);

        monumentsGroup.add(tent);
      });

      // Magic View Cafe Trail Shack
      const cafe = new THREE.Group();
      cafe.position.set(-16, 0, 2);

      const cWalls = new THREE.Mesh(new THREE.BoxGeometry(6.5, 3.2, 5.0), woodShackMat);
      cWalls.position.y = 1.6;
      cWalls.castShadow = true;
      cafe.add(cWalls);

      // Slanted corrugated tin roof
      const cRoof = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.25, 5.8), tinRoofMat);
      cRoof.position.y = 3.3;
      cRoof.rotation.x = 0.12;
      cafe.add(cRoof);

      // Outdoor wooden tea benches
      const bench = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.5, 0.8), woodShackMat);
      bench.position.set(0, 0.25, 3.4);
      cafe.add(bench);

      monumentsGroup.add(cafe);

      // Gaddi Shepherd Stone Cairn with Prayer Flags
      const cairn = new THREE.Group();
      cairn.position.set(6, 0, 1);

      for (let s = 0; s < 5; s++) {
        const stone = new THREE.Mesh(
          new THREE.CylinderGeometry(1.4 - s * 0.25, 1.7 - s * 0.25, 0.45, 8),
          new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 })
        );
        stone.position.y = 0.25 + s * 0.45;
        cairn.add(stone);
      }

      // Prayer Flag Pole
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.5, 6), woodShackMat);
      flagPole.position.y = 2.5;
      cairn.add(flagPole);

      // Fluttering flags
      const flagColors = [0x3b82f6, 0xf8fafc, 0xef4444, 0x22c55e, 0xeab308];
      for (let f = 0; f < 5; f++) {
        const flag = new THREE.Mesh(
          new THREE.PlaneGeometry(0.5, 0.35),
          new THREE.MeshStandardMaterial({ color: flagColors[f], side: THREE.DoubleSide })
        );
        flag.position.set(0.35, 4.2 - f * 0.4, 0);
        cairn.add(flag);
      }
      monumentsGroup.add(cairn);

    } else if (place.slug === 'valley-of-flowers' || place.slug === 'valley-of-flowers-trek') {
      // ------------------------------------------------------------------
      // VALLEY OF FLOWERS (Uttarakhand): Alpine Wildflower Meadow, Pushpawati River & Peaks
      // ------------------------------------------------------------------
      const streamWaterMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.15, metalness: 0.85 });
      const boulderMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.95 });
      const bridgeWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });

      // Glacial Snow Peaks Enclosing the Valley (Rataban & Gauri Parbat - 50m)
      const valleyWalls = [
        [-45, -28, 48], [-18, -38, 56], [16, -35, 52], [42, -26, 46],
        [-38, 30, 44], [-12, 36, 50], [18, 34, 48], [40, 28, 42]
      ];
      valleyWalls.forEach(([vx, vz, vh]) => {
        const vPeak = new THREE.Mesh(
          new THREE.ConeGeometry(22, vh, 5),
          new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
        );
        vPeak.position.set(vx, vh / 2, vz);
        monumentsGroup.add(vPeak);

        const vSnow = new THREE.Mesh(
          new THREE.ConeGeometry(12, vh * 0.4, 5),
          new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 })
        );
        vSnow.position.set(vx, vh * 0.8, vz);
        monumentsGroup.add(vSnow);
      });

      // Pushpawati Mountain Torrent Torrent
      const river = new THREE.Mesh(new THREE.PlaneGeometry(12, 90), streamWaterMat);
      river.rotation.x = -Math.PI / 2;
      river.position.set(-8, 0.04, 0);
      monumentsGroup.add(river);

      // River Granite Boulders
      for (let b = 0; b < 16; b++) {
        const boulder = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.8 + (b % 3) * 0.5, 1),
          boulderMat
        );
        boulder.position.set(-11 + (b % 4) * 2, 0.4, -25 + b * 3.5);
        boulder.scale.set(1.2, 0.7, 1.4);
        monumentsGroup.add(boulder);
      }

      // Rustic Wooden Log Footbridge
      const footbridge = new THREE.Group();
      footbridge.position.set(-8, 0.5, 4);

      for (let side = -1; side <= 1; side += 2) {
        const girder = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.28, 14, 8), bridgeWoodMat);
        girder.rotation.z = Math.PI / 2;
        girder.position.set(0, 0.5, side * 1.2);
        footbridge.add(girder);
      }

      // Cross timber planks
      for (let pl = -6; pl <= 6; pl += 0.8) {
        const plank = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.15, 2.8), bridgeWoodMat);
        plank.position.set(pl, 0.75, 0);
        footbridge.add(plank);
      }
      monumentsGroup.add(footbridge);

      // Carpet of Alpine Wildflowers (Brahma Kamal, Blue Poppies, Golden Anemones, Purple Lilies)
      const flowerColors = [
        0xecfccb, // Brahma Kamal pale chartreuse
        0x38bdf8, // Blue Poppy sky-blue
        0xfacc15, // Golden Anemone yellow
        0xc084fc, // Himalayan Geranium purple
        0xf43f5e, // Alpine Rose pink
      ];
      for (let fl = 0; fl < 70; fl++) {
        const flower = new THREE.Group();
        const fx = 4 + (fl % 8) * 3.5 + (fl % 3) * 0.7;
        const fz = -28 + Math.floor(fl / 8) * 6.5 + (fl % 4) * 0.5;
        flower.position.set(fx, 0, fz);

        // Slender green stem
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.04, 0.04, 0.7, 6),
          new THREE.MeshStandardMaterial({ color: 0x15803d })
        );
        stem.position.y = 0.35;
        flower.add(stem);

        // Petal blossom head
        const petalMat = new THREE.MeshStandardMaterial({
          color: flowerColors[fl % flowerColors.length],
          roughness: 0.5,
        });
        const blossom = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.3, 6), petalMat);
        blossom.position.y = 0.75;
        blossom.rotation.x = Math.PI;
        flower.add(blossom);

        monumentsGroup.add(flower);
      }

      // Joan Margaret Legge Memorial Gravestone
      const memorial = new THREE.Group();
      memorial.position.set(12, 0, -6);

      const memBase = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.5, 1.8), boulderMat);
      memBase.position.y = 0.25;
      memorial.add(memBase);

      const memHeadstone = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.0, 0.4), boulderMat);
      memHeadstone.position.set(0, 1.3, -0.4);
      memorial.add(memHeadstone);

      monumentsGroup.add(memorial);

    } else if (place.slug === 'kudremukh-peak-trek' || place.slug === 'kudremukh-trek') {
      // ------------------------------------------------------------------
      // KUDREMUKH (Karnataka): Horse-Face Mountain Peak, Emerald Shola Grassland & Lobo's House
      // ------------------------------------------------------------------
      const sholaGrassMat = new THREE.MeshStandardMaterial({ color: 0x226b34, roughness: 0.9 });
      const darkSholaMat = new THREE.MeshStandardMaterial({ color: 0x164e28, roughness: 0.95 });
      const streamMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.1, metalness: 0.8 });
      const shelterWoodMat = new THREE.MeshStandardMaterial({ color: 0x604028, roughness: 0.9 });

      // Iconic Horse-Face Peak Ridge (Kudre-mukh profile - 38m high)
      const horseRidge = new THREE.Group();
      horseRidge.position.set(0, 0, -26);

      // Mountain body
      const mtnBody = new THREE.Mesh(new THREE.ConeGeometry(32, 38, 7), sholaGrassMat);
      mtnBody.position.y = 19;
      horseRidge.add(mtnBody);

      // The distinctive horse snout / head spur projection
      const horseHead = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 16), sholaGrassMat);
      horseHead.position.set(-6, 26, 4);
      horseHead.rotation.x = 0.35;
      horseHead.rotation.y = -0.25;
      horseRidge.add(horseHead);

      const horseMuzzle = new THREE.Mesh(new THREE.ConeGeometry(5, 10, 5), sholaGrassMat);
      horseMuzzle.position.set(-9, 28, 10);
      horseMuzzle.rotation.x = Math.PI / 2;
      horseRidge.add(horseMuzzle);

      monumentsGroup.add(horseRidge);

      // Undulating Rolling Emerald Shola Grassland Ridges
      const sholaHills = [
        [-32, -8, 22], [32, -6, 24], [-24, 14, 18], [26, 16, 20]
      ];
      sholaHills.forEach(([hx, hz, hh]) => {
        const hill = new THREE.Mesh(new THREE.SphereGeometry(18, 16, 12), sholaGrassMat);
        hill.position.set(hx, hh - 12, hz);
        hill.scale.set(1.4, 0.7, 1.2);
        monumentsGroup.add(hill);
      });

      // Dense Shola Forest Patches in Valley Depressions
      const forestPatches = [
        [-14, -10], [14, -8], [-8, 10], [10, 12]
      ];
      forestPatches.forEach(([px, pz]) => {
        const sholaWoods = new THREE.Mesh(
          new THREE.SphereGeometry(4.8, 12, 10),
          darkSholaMat
        );
        sholaWoods.position.set(px, 1.8, pz);
        sholaWoods.scale.set(1.5, 0.6, 1.3);
        monumentsGroup.add(sholaWoods);
      });

      // Crystal Mountain Shola Brook
      const brook = new THREE.Mesh(new THREE.PlaneGeometry(6, 90), streamMat);
      brook.rotation.x = -Math.PI / 2;
      brook.position.set(-16, 0.04, 0);
      monumentsGroup.add(brook);

      // Lobo's Historic Trekker House & Shelter
      const loboHouse = new THREE.Group();
      loboHouse.position.set(8, 0, 4);

      const hBase = new THREE.Mesh(new THREE.BoxGeometry(7.5, 3.2, 5.5), shelterWoodMat);
      hBase.position.y = 1.6;
      hBase.castShadow = true;
      loboHouse.add(hBase);

      // Mangalore terracotta tile roof
      const hRoof = new THREE.Mesh(
        new THREE.ConeGeometry(5.2, 2.2, 4),
        new THREE.MeshStandardMaterial({ color: 0x993d1f, roughness: 0.85 })
      );
      hRoof.position.y = 4.2;
      hRoof.rotation.y = Math.PI / 4;
      loboHouse.add(hRoof);

      // Front veranda porch
      const porch = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.3, 1.8), shelterWoodMat);
      porch.position.set(0, 0.15, 3.2);
      loboHouse.add(porch);

      monumentsGroup.add(loboHouse);

      // Kudremukh Summit Trail Marker (1,894m)
      const trailMarker = new THREE.Group();
      trailMarker.position.set(2, 0, 8);

      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.14, 2.4, 8),
        new THREE.MeshStandardMaterial({ color: 0x44403c })
      );
      post.position.y = 1.2;
      trailMarker.add(post);

      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.6, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xd97706 })
      );
      signBoard.position.set(0, 2.1, 0);
      trailMarker.add(signBoard);

      monumentsGroup.add(trailMarker);

    } else if (place.slug === 'havelock-island') {
      // ------------------------------------------------------------------
      // HAVELOCK ISLAND (Swaraj Dweep - Andamans): Turquoise Sea, Coral Reef & Dive Pontoon
      // ------------------------------------------------------------------
      const turquoiseWaterMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.88,
      });
      const coralSandMat = new THREE.MeshStandardMaterial({ color: 0xfef3c7, roughness: 0.9 });
      const jungleMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.85 });

      // Translucent Andaman Ocean Lagoon
      const lagoon = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), turquoiseWaterMat);
      lagoon.rotation.x = -Math.PI / 2;
      lagoon.position.set(0, 0.04, -15);
      monumentsGroup.add(lagoon);

      // Radhanagar White Coral Sand Beach
      const beach = new THREE.Mesh(new THREE.PlaneGeometry(160, 24), coralSandMat);
      beach.rotation.x = -Math.PI / 2;
      beach.position.set(0, 0.05, 20);
      monumentsGroup.add(beach);

      // Tropical Padauk & Coconut Jungle Canopy Backdrop
      for (let p = 0; p < 14; p++) {
        const palm = new THREE.Group();
        palm.position.set(-65 + p * 10, 0, 26 + (p % 2) * 3);

        const trunk = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.28, 8.0, 8),
          new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 })
        );
        trunk.position.y = 4.0;
        trunk.rotation.z = (p % 2 ? 0.12 : -0.12);
        palm.add(trunk);

        const crown = new THREE.Mesh(new THREE.SphereGeometry(2.4, 8, 8), jungleMat);
        crown.position.y = 8.0;
        crown.scale.set(1.4, 0.5, 1.4);
        palm.add(crown);

        monumentsGroup.add(palm);
      }

      // Elephant Beach Submerged Coral Reef Formations
      const coralColors = [0xf43f5e, 0xc084fc, 0xfde047, 0x38bdf8, 0x4ade80];
      const reefCoords = [
        [-18, -12], [-12, -22], [-4, -14], [8, -20], [16, -10], [22, -18]
      ];
      reefCoords.forEach(([cx, cz], idx) => {
        const coralHead = new THREE.Group();
        coralHead.position.set(cx, 0.2, cz);

        // Base coral mound
        const baseMound = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1.6, 1),
          new THREE.MeshStandardMaterial({ color: coralColors[idx % coralColors.length], roughness: 0.85 })
        );
        baseMound.scale.set(1.4, 0.7, 1.2);
        coralHead.add(baseMound);

        // Branching staghorn coral projections
        for (let b = 0; b < 6; b++) {
          const angle = (b * Math.PI) / 3;
          const branch = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.14, 1.2, 6),
            new THREE.MeshStandardMaterial({ color: coralColors[(idx + b) % coralColors.length], roughness: 0.7 })
          );
          branch.position.set(Math.cos(angle) * 0.9, 1.0, Math.sin(angle) * 0.9);
          branch.rotation.z = Math.cos(angle) * 0.4;
          branch.rotation.x = Math.sin(angle) * 0.4;
          coralHead.add(branch);
        }
        monumentsGroup.add(coralHead);
      });

      // Gliding Green Sea Turtle
      const turtle = new THREE.Group();
      turtle.position.set(-6, 0.35, -12);

      const tShell = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 10, 8),
        new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.8 })
      );
      tShell.scale.set(1.1, 0.4, 1.4);
      turtle.add(tShell);

      // Flippers
      for (let side = -1; side <= 1; side += 2) {
        const flipper = new THREE.Mesh(
          new THREE.BoxGeometry(0.9, 0.08, 0.5),
          new THREE.MeshStandardMaterial({ color: 0x4d7c0f })
        );
        flipper.position.set(side * 1.0, 0, 0.4);
        flipper.rotation.z = side * -0.2;
        turtle.add(flipper);
      }
      monumentsGroup.add(turtle);

      // Floating Scuba Dive Pontoon Platform
      const pontoon = new THREE.Group();
      pontoon.position.set(4, 0.1, -4);

      const deck = new THREE.Mesh(
        new THREE.BoxGeometry(7.0, 0.4, 5.0),
        new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.85 })
      );
      deck.position.y = 0.3;
      pontoon.add(deck);

      // Scuba cylinder rack
      for (let t = 0; t < 6; t++) {
        const tank = new THREE.Mesh(
          new THREE.CylinderGeometry(0.12, 0.12, 0.9, 8),
          new THREE.MeshStandardMaterial({ color: t % 2 ? 0xfacc15 : 0xe2e8f0, metalness: 0.8, roughness: 0.3 })
        );
        tank.position.set(-2.2 + t * 0.85, 0.95, -1.8);
        pontoon.add(tank);
      }

      // Red-and-White Scuba Diver Down Flag
      const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 3.2, 6), new THREE.MeshStandardMaterial({ color: 0x1f2937 }));
      flagPole.position.set(3.0, 1.8, -2.0);
      pontoon.add(flagPole);

      const dFlag = new THREE.Mesh(
        new THREE.PlaneGeometry(1.0, 0.7),
        new THREE.MeshStandardMaterial({ color: 0xdc2626, side: THREE.DoubleSide })
      );
      dFlag.position.set(3.5, 3.0, -2.0);
      pontoon.add(dFlag);

      monumentsGroup.add(pontoon);

    } else if (place.slug === 'rishikesh-white-water-rafting' || place.slug === 'rishikesh-river-rafting') {
      // ------------------------------------------------------------------
      // RISHIKESH (Uttarakhand): Himalayan Ganga Canyon, Roller Coaster Rapids & Raft
      // ------------------------------------------------------------------
      const canyonRockMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.95 });
      const riverWaterMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, roughness: 0.1, metalness: 0.75 });
      const foamMat = new THREE.MeshBasicMaterial({ color: 0xf0fdfa, transparent: true, opacity: 0.85 });

      // Steep Himalayan Limestone Gorge Canyon Walls (28m high cliffs flanking both sides)
      const leftCliff = new THREE.Mesh(new THREE.BoxGeometry(22, 28, 90), canyonRockMat);
      leftCliff.position.set(-36, 14, 0);
      monumentsGroup.add(leftCliff);

      const rightCliff = new THREE.Mesh(new THREE.BoxGeometry(22, 28, 90), canyonRockMat);
      rightCliff.position.set(36, 14, 0);
      monumentsGroup.add(rightCliff);

      // Churning Emerald Mountain River Ganga Channel
      const ganga = new THREE.Mesh(new THREE.PlaneGeometry(38, 90), riverWaterMat);
      ganga.rotation.x = -Math.PI / 2;
      ganga.position.set(0, 0.04, 0);
      monumentsGroup.add(ganga);

      // Roller Coaster Class III+ Foaming Rapids Crests
      for (let r = 0; r < 5; r++) {
        const rapid = new THREE.Mesh(new THREE.PlaneGeometry(28, 4), foamMat);
        rapid.rotation.x = -Math.PI / 2;
        rapid.position.set(0, 0.12, -24 + r * 11);
        monumentsGroup.add(rapid);
      }

      // Foaming Drop Rocks in the middle of rapids
      for (let ro = 0; ro < 6; ro++) {
        const dropRock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(1.4 + (ro % 2) * 0.6, 1),
          canyonRockMat
        );
        dropRock.position.set(-8 + (ro % 3) * 8, 0.6, -18 + ro * 7);
        monumentsGroup.add(dropRock);
      }

      // Inflatable Whitewater River Raft (High-visibility Red & Yellow)
      const raft = new THREE.Group();
      raft.position.set(0, 0.35, 2);

      const raftMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.5 });
      const yellowMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });

      // Outer inflatable pontoon collar
      const mainTube = new THREE.Mesh(
        new THREE.TorusGeometry(2.2, 0.45, 12, 24),
        raftMat
      );
      mainTube.rotation.x = Math.PI / 2;
      mainTube.scale.set(0.7, 1.5, 1.0);
      raft.add(mainTube);

      // Cross thwart seating tubes
      for (let th = -1; th <= 1; th++) {
        const thwart = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 2.2, 8),
          yellowMat
        );
        thwart.rotation.z = Math.PI / 2;
        thwart.position.set(0, 0.1, th * 1.4);
        raft.add(thwart);
      }

      // 6 Synchronized Paddles
      for (let side = -1; side <= 1; side += 2) {
        for (let p = -1; p <= 1; p++) {
          const paddle = new THREE.Group();
          paddle.position.set(side * 1.6, 0.5, p * 1.3);

          const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 1.8, 6),
            new THREE.MeshStandardMaterial({ color: 0x1f2937 })
          );
          shaft.rotation.z = side * 0.45;
          paddle.add(shaft);

          const blade = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.6, 0.04),
            yellowMat
          );
          blade.position.set(side * 0.5, -0.6, 0);
          paddle.add(blade);

          raft.add(paddle);
        }
      }
      monumentsGroup.add(raft);

      // Shivpuri White Sand Riverbank Launch Beach
      const beach = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 40),
        new THREE.MeshStandardMaterial({ color: 0xd4d4d8, roughness: 0.9 })
      );
      beach.rotation.x = -Math.PI / 2;
      beach.position.set(16, 0.05, 18);
      monumentsGroup.add(beach);

      // Stacked spare kayaks and lifejackets on beach
      for (let k = 0; k < 3; k++) {
        const kayak = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.35, 3.2),
          new THREE.MeshStandardMaterial({ color: k % 2 ? 0xf97316 : 0x0284c7 })
        );
        kayak.position.set(16 + k * 1.2, 0.3 + k * 0.25, 20);
        monumentsGroup.add(kayak);
      }

    } else if (place.slug === 'netrani-island-scuba' || place.slug === 'netrani-island') {
      // ------------------------------------------------------------------
      // NETRANI ISLAND (Karnataka): Heart-Shaped Rock Pinnacle, Whale Shark & Manta Ray
      // ------------------------------------------------------------------
      const deepOceanMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        roughness: 0.1,
        metalness: 0.85,
        transparent: true,
        opacity: 0.9,
      });
      const basaltRockMat = new THREE.MeshStandardMaterial({ color: 0x262626, roughness: 0.95 });
      const creatureMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.7 });

      // Deep Arabian Sea Water Column
      const sea = new THREE.Mesh(new THREE.PlaneGeometry(160, 90), deepOceanMat);
      sea.rotation.x = -Math.PI / 2;
      sea.position.set(0, 0.04, -5);
      monumentsGroup.add(sea);

      // Rugged Heart-Shaped Volcanic Rock Pinnacle of Netrani (24m high)
      const pinnacle = new THREE.Group();
      pinnacle.position.set(0, 0, -22);

      const mainRock = new THREE.Mesh(new THREE.ConeGeometry(22, 26, 6), basaltRockMat);
      mainRock.position.y = 13;
      mainRock.scale.set(1.4, 1.0, 1.1);
      pinnacle.add(mainRock);

      // Twin summit crags forming the heart profile
      const cragLeft = new THREE.Mesh(new THREE.ConeGeometry(8, 12, 5), basaltRockMat);
      cragLeft.position.set(-6, 22, 0);
      pinnacle.add(cragLeft);

      const cragRight = new THREE.Mesh(new THREE.ConeGeometry(8, 12, 5), basaltRockMat);
      cragRight.position.set(6, 22, 0);
      pinnacle.add(cragRight);

      monumentsGroup.add(pinnacle);

      // Cruising Gentle Giant: Whale Shark (7m long)
      const whaleShark = new THREE.Group();
      whaleShark.position.set(-14, 0.4, -6);

      const wsBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.2, 5.5, 12),
        creatureMat
      );
      wsBody.rotation.x = Math.PI / 2;
      whaleShark.add(wsBody);

      // Broad flat filter-feeding head
      const wsHead = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.4), creatureMat);
      wsHead.position.set(0, 0, 3.2);
      whaleShark.add(wsHead);

      // Dorsal Fin
      const wsFin = new THREE.Mesh(new THREE.ConeGeometry(0.6, 1.2, 4), creatureMat);
      wsFin.position.set(0, 1.0, -0.4);
      wsFin.rotation.x = -0.3;
      whaleShark.add(wsFin);

      // Crescent Caudal Tail
      const wsTail = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.0, 1.2), creatureMat);
      wsTail.position.set(0, 0, -3.2);
      whaleShark.add(wsTail);

      monumentsGroup.add(whaleShark);

      // Soaring Giant Manta Ray Gliding above the Pinnacle Reef
      const mantaRay = new THREE.Group();
      mantaRay.position.set(12, 0.6, 2);

      // Wide diamond wingspan
      const mWings = new THREE.Mesh(
        new THREE.ConeGeometry(2.8, 0.4, 4),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 })
      );
      mWings.scale.set(1.6, 1.0, 0.8);
      mantaRay.add(mWings);

      // Whip tail
      const mTail = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.06, 2.5, 6),
        new THREE.MeshStandardMaterial({ color: 0x0f172a })
      );
      mTail.position.set(0, 0, -1.6);
      mTail.rotation.x = Math.PI / 2;
      mantaRay.add(mTail);

      monumentsGroup.add(mantaRay);

      // Offshore Scuba Dive Charter Boat
      const diveBoat = new THREE.Group();
      diveBoat.position.set(8, 0.2, 14);

      const boatHull = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 1.2, 9.0),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 })
      );
      boatHull.position.y = 0.6;
      diveBoat.add(boatHull);

      // Sunshade canopy
      const bCanopy = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.1, 5.0),
        new THREE.MeshStandardMaterial({ color: 0x0284c7 })
      );
      bCanopy.position.set(0, 2.2, -0.5);
      diveBoat.add(bCanopy);

      // Stern dive ladder into the water
      const ladder = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 1.6, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.9 })
      );
      ladder.position.set(0, 0.2, -4.6);
      diveBoat.add(ladder);

      monumentsGroup.add(diveBoat);

    } else {
      const baseGeo = new THREE.CylinderGeometry(8, 8.5, 1.2, 32);
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x8a7d6b, roughness: 0.8 });
      const base = new THREE.Mesh(baseGeo, baseMat);
      base.position.set(0, 0.6, -8);
      base.receiveShadow = true;
      monumentsGroup.add(base);

      // Central Dome / Pavilion
      const domeGeo = new THREE.SphereGeometry(4, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
      const domeMat = new THREE.MeshStandardMaterial({ color: 0xb59975, roughness: 0.6 });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(0, 5, -8);
      dome.castShadow = true;
      monumentsGroup.add(dome);

      // Perimeter Pillars
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const px = Math.cos(angle) * 6;
        const pz = -8 + Math.sin(angle) * 6;
        const pGeo = new THREE.CylinderGeometry(0.35, 0.4, 4.5, 12);
        const pillar = new THREE.Mesh(pGeo, baseMat);
        pillar.position.set(px, 2.85, pz);
        pillar.castShadow = true;
        monumentsGroup.add(pillar);
      }
    }

    scene.add(monumentsGroup);

    // 6. Interactive 3D POI Beacons
    const poiBeacons: { poi: POI; mesh: THREE.Group }[] = [];
    (place.pois || []).forEach((poi) => {
      const beaconGroup = new THREE.Group();
      beaconGroup.position.set(poi.pos_x, poi.pos_y, poi.pos_z);

      // Glowing light pillar
      const beamGeo = new THREE.CylinderGeometry(0.12, 0.12, 6, 12);
      const beamMat = new THREE.MeshBasicMaterial({
        color: 0x8c6bc8,
        transparent: true,
        opacity: 0.65,
      });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.y = 3;
      beaconGroup.add(beam);

      // Pulsing Base Ring
      const ringGeo = new THREE.RingGeometry(0.8, 1.1, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x8c6bc8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.75,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.05;
      beaconGroup.add(ring);

      // Floating Crystal Diamond
      const crystalGeo = new THREE.OctahedronGeometry(0.65);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xa63a55,
        emissive: 0x7a1f36,
        roughness: 0.2,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 2.5;
      beaconGroup.add(crystal);

      scene.add(beaconGroup);
      poiBeacons.push({ poi, mesh: beaconGroup });
    });

    // 7. Third-Person Avatar (Stylized Voyager)
    const avatar = new THREE.Group();
    avatar.position.set(playerPosRef.current.x, 0, playerPosRef.current.z);

    // Body Capsule
    const bodyGeo = new THREE.CylinderGeometry(0.4, 0.35, 1.4, 16);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f5c3f, roughness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.9;
    body.castShadow = true;
    avatar.add(body);

    // Glowing core
    const coreGeo = new THREE.SphereGeometry(0.18, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x8c6bc8 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.set(0, 1.0, 0.3);
    avatar.add(core);

    // Head
    const headGeo = new THREE.SphereGeometry(0.32, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({ color: 0xded8ce, roughness: 0.5 });
    const head = new THREE.Mesh(headGeo, headMat);
    head.position.y = 1.85;
    avatar.add(head);

    scene.add(avatar);

    // 8. Event Handlers (Keyboard & Mouse Look)
    const onKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      isPointerDownRef.current = true;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      previousPointerPositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!isPointerDownRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - previousPointerPositionRef.current.x;
      const deltaY = clientY - previousPointerPositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.006;
      cameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(1.2, cameraAngleRef.current.phi + deltaY * 0.006)
      );

      previousPointerPositionRef.current = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      isPointerDownRef.current = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    container.addEventListener('mousedown', onPointerDown);
    container.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchstart', onPointerDown);
    container.addEventListener('touchmove', onPointerMove);
    window.addEventListener('touchend', onPointerUp);

    // 9. Resize Listener
    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    // 10. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // Keyboard movement calculations
      let moveX = 0;
      let moveZ = 0;
      if (keysRef.current['KeyW'] || keysRef.current['ArrowUp']) moveZ -= 1;
      if (keysRef.current['KeyS'] || keysRef.current['ArrowDown']) moveZ += 1;
      if (keysRef.current['KeyA'] || keysRef.current['ArrowLeft']) moveX -= 1;
      if (keysRef.current['KeyD'] || keysRef.current['ArrowRight']) moveX += 1;

      if (moveX !== 0 || moveZ !== 0) {
        const moveVec = new THREE.Vector2(moveX, moveZ).normalize();
        const speed = keysRef.current['ShiftLeft'] ? 9.0 : 5.5;

        // Apply camera relative rotation
        const forward = new THREE.Vector3(
          -Math.sin(cameraAngleRef.current.theta),
          0,
          -Math.cos(cameraAngleRef.current.theta)
        );
        const right = new THREE.Vector3(
          Math.cos(cameraAngleRef.current.theta),
          0,
          -Math.sin(cameraAngleRef.current.theta)
        );

        const direction = new THREE.Vector3()
          .addScaledVector(forward, -moveVec.y)
          .addScaledVector(right, moveVec.x)
          .normalize();

        playerPosRef.current.x += direction.x * speed * delta;
        playerPosRef.current.z += direction.z * speed * delta;

        // Scene boundaries (-70 to 70)
        playerPosRef.current.x = Math.max(-70, Math.min(70, playerPosRef.current.x));
        playerPosRef.current.z = Math.max(-70, Math.min(70, playerPosRef.current.z));

        // Rotate avatar toward movement direction
        const targetRot = Math.atan2(direction.x, direction.z);
        playerRotationRef.current = targetRot;
      }

      // Update avatar position and rotation
      avatar.position.x = playerPosRef.current.x;
      avatar.position.z = playerPosRef.current.z;
      avatar.rotation.y = playerRotationRef.current;

      // Third-person camera follow
      const camDist = 6.0;
      const camHeight = camDist * Math.sin(cameraAngleRef.current.phi);
      const camHorizontal = camDist * Math.cos(cameraAngleRef.current.phi);

      camera.position.x = playerPosRef.current.x + camHorizontal * Math.sin(cameraAngleRef.current.theta);
      camera.position.y = 1.8 + camHeight;
      camera.position.z = playerPosRef.current.z + camHorizontal * Math.cos(cameraAngleRef.current.theta);
      camera.lookAt(playerPosRef.current.x, 1.8, playerPosRef.current.z);

      // Animate POI Beacons & Detect Proximity
      let closestPoi: POI | null = null;
      let closestDist = Infinity;

      poiBeacons.forEach(({ poi, mesh }) => {
        // Subtle floating rotation
        const crystal = mesh.children[2];
        if (crystal) {
          crystal.rotation.y = time * 1.5;
          crystal.position.y = 2.5 + Math.sin(time * 2 + poi.pos_x) * 0.2;
        }

        // Distance check
        const dx = playerPosRef.current.x - poi.pos_x;
        const dz = playerPosRef.current.z - poi.pos_z;
        const dist = Math.sqrt(dx * dx + dz * dz);

        if (dist < poi.radius && dist < closestDist) {
          closestPoi = poi;
          closestDist = dist;
        }
      });

      setActivePoi(closestPoi);

      // Render 3D Scene
      renderer.render(scene, camera);

      // Render Top-Down Minimap Canvas
      if (minimapCanvasRef.current) {
        const miniCtx = minimapCanvasRef.current.getContext('2d');
        if (miniCtx) {
          const mw = minimapCanvasRef.current.width;
          const mh = minimapCanvasRef.current.height;
          miniCtx.clearRect(0, 0, mw, mh);

          // Background
          miniCtx.fillStyle = '#0a0f0d';
          miniCtx.fillRect(0, 0, mw, mh);

          // Boundary border
          miniCtx.strokeStyle = 'rgba(143, 191, 159, 0.3)';
          miniCtx.lineWidth = 1;
          miniCtx.strokeRect(4, 4, mw - 8, mh - 8);

          // Map scale: map 140x140 meters to mw x mh
          const mapToCanvas = (wx: number, wz: number) => {
            const mx = ((wx + 70) / 140) * mw;
            const my = ((wz + 70) / 140) * mh;
            return { x: mx, y: my };
          };

          // Draw POIs
          (place.pois || []).forEach((p) => {
            const pt = mapToCanvas(p.pos_x, p.pos_z);
            miniCtx.fillStyle = '#8c6bc8';
            miniCtx.beginPath();
            miniCtx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
            miniCtx.fill();
          });

          // Draw Player
          const playerPt = mapToCanvas(playerPosRef.current.x, playerPosRef.current.z);
          miniCtx.fillStyle = '#a63a55';
          miniCtx.beginPath();
          miniCtx.arc(playerPt.x, playerPt.y, 5, 0, Math.PI * 2);
          miniCtx.fill();

          // Heading direction line
          miniCtx.strokeStyle = '#ded8ce';
          miniCtx.lineWidth = 1.5;
          miniCtx.beginPath();
          miniCtx.moveTo(playerPt.x, playerPt.y);
          miniCtx.lineTo(
            playerPt.x - Math.sin(cameraAngleRef.current.theta) * 12,
            playerPt.y - Math.cos(cameraAngleRef.current.theta) * 12
          );
          miniCtx.stroke();
        }
      }
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeEventListener('mousedown', onPointerDown);
      container.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchstart', onPointerDown);
      container.removeEventListener('touchmove', onPointerMove);
      window.removeEventListener('touchend', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [place, quality]);

  // Audio Toggle
  const handleToggleAudio = () => {
    let type: 'temple' | 'beach' | 'mountain' = 'temple';
    if (place.category?.slug.includes('beach') || place.slug.includes('havelock')) {
      type = 'beach';
    } else if (place.category?.slug.includes('trekking')) {
      type = 'mountain';
    }
    const playing = ambientSound.toggle(type);
    setAudioPlaying(playing);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-void select-none">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Navigation Bar */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        {/* Back Link & Destination Title */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <button
            onClick={() => navigate(`/place/${place.slug}`)}
            className="glass-panel p-2.5 rounded-xl text-ink-main hover:text-sage-300 hover:border-sage-300/40 flex items-center gap-1.5 shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Exit Tour</span>
          </button>

          <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-forest-400 animate-ping" />
            <h2 className="text-sm font-bold text-ink-main">{place.name}</h2>
            <span className="text-xs text-sage-300 hidden md:inline">({place.state?.name})</span>
          </div>
        </div>

        {/* Action Controls (Audio, Guide, Quality) */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Ambient Sound Button */}
          <button
            onClick={handleToggleAudio}
            className={`glass-panel p-2.5 rounded-xl transition-colors ${
              audioPlaying ? 'border-forest-400 text-forest-300 shadow-glow-forest' : 'text-ink-muted hover:text-ink-main'
            }`}
            title={audioPlaying ? 'Mute ambient sound' : 'Play ambient audio'}
          >
            {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* AI Guide Trigger */}
          <button
            onClick={() => onOpenGuide(activePoi?.title)}
            className="btn-wine text-xs py-2 px-3.5 flex items-center gap-1.5 shadow-glow-wine"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Guide</span>
          </button>

          {/* Help Toggle */}
          <button
            onClick={() => setShowControlsHelp(!showControlsHelp)}
            className="glass-panel p-2.5 rounded-xl text-ink-muted hover:text-ink-main"
            title="Controls guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Minimap (Bottom Left) */}
      <div className="absolute bottom-6 left-6 z-30 pointer-events-auto hidden sm:block">
        <div className="glass-panel p-2 rounded-xl border-sage-300/20 bg-surface/90 shadow-2xl">
          <div className="flex items-center justify-between pb-1.5 px-1 text-[10px] text-sage-300 font-semibold tracking-wider uppercase">
            <span>Radar Minimap</span>
            <Compass className="w-3 h-3 text-royal-400" />
          </div>
          <canvas
            ref={minimapCanvasRef}
            width={120}
            height={120}
            className="rounded-lg border border-sage-300/10"
          />
        </div>
      </div>

      {/* Controls Hint Card */}
      {showControlsHelp && (
        <div className="absolute top-16 right-4 z-30 pointer-events-auto glass-panel p-4 rounded-xl border-sage-300/20 max-w-xs shadow-2xl bg-surface/90">
          <div className="flex items-center justify-between pb-2 border-b border-sage-300/10 mb-2">
            <span className="text-xs font-bold text-ink-main">Walkthrough Controls</span>
            <button
              onClick={() => setShowControlsHelp(false)}
              className="text-ink-muted hover:text-ink-main"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 text-[11px] text-ink-muted">
            <p className="flex justify-between">
              <span className="text-ink-main font-medium">W / A / S / D or Arrows:</span>
              <span>Move Character</span>
            </p>
            <p className="flex justify-between">
              <span className="text-ink-main font-medium">Click + Drag:</span>
              <span>Look & Orbit Camera</span>
            </p>
            <p className="flex justify-between">
              <span className="text-ink-main font-medium">Hold Shift:</span>
              <span>Sprint</span>
            </p>
            <p className="flex justify-between">
              <span className="text-ink-main font-medium">Walk to Beacons:</span>
              <span>Discover Historical POIs</span>
            </p>
          </div>
        </div>
      )}

      {/* Proximity POI Discovery Card Modal (Bottom Center) */}
      {activePoi && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-[90%] sm:w-[480px] glass-panel p-5 rounded-2xl border-royal-400/40 bg-surface/95 shadow-glow animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 text-royal-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Point of Interest</span>
            </div>
            <button
              onClick={() => onOpenGuide(activePoi.title)}
              className="text-xs text-sage-300 hover:text-ink-main flex items-center gap-1 font-medium transition-colors"
            >
              <span>Ask AI Guide</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <h3 className="mt-1 text-base font-bold text-ink-main">{activePoi.title}</h3>
          <p className="mt-2 text-xs text-ink-muted leading-relaxed max-h-24 overflow-y-auto">
            {activePoi.body}
          </p>

          <div className="mt-3 pt-3 border-t border-sage-300/10 flex items-center justify-between text-[11px] text-sage-300">
            <span>Approach distance: {activePoi.radius}m</span>
            <button
              onClick={() => onOpenGuide(activePoi.title)}
              className="btn-wine text-xs py-1 px-3"
            >
              Chat About This Landmark
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

