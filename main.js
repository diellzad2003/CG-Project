import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { booksData } from './bookData.js';


/* ---------------- SCENE ---------------- */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);
scene.fog = new THREE.Fog(0x1a1a1a, 25, 60);

/* ---------------- CAMERA ---------------- */
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 3, 12);

/* ---------------- RENDERER ---------------- */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.autoUpdate = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

/* ---------------- TEXTURE LOADER ---------------- */
const texLoader = new THREE.TextureLoader();

/* ---------------- GLTF LOADER ---------------- */
const gltfLoader = new GLTFLoader();


/* ---------------- ENV MAP (HDR) ---------------- */
const pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

new RGBELoader()
  .load('/hdr/studio.hdr', function (texture) {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture;
    scene.environment = envMap; // ← THIS FIXES THE CHAIRS
    // scene.background = envMap; // optional if you want visible background
    texture.dispose();
    pmremGenerator.dispose();
  });


  /*Books*/
  class Book {
  constructor(title, author, price, color = 0xffffff) {
    this.title = title;
    this.author = author;
    this.price = price;

  const geometry = new THREE.BoxGeometry(0.14, 0.20, 0.035);
 // width, height, depth
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.6,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    this.mesh.userData = {
      clickable: true,
      title: title,
      author: author,
      price: price
    };
  }
}

/* ---------------- LIGHTING ---------------- */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const ceilingLight = new THREE.PointLight(0xffcc88, 2.5, 25);
ceilingLight.position.set(0, 8, 0);
ceilingLight.castShadow = false;
scene.add(ceilingLight);

const spotlight1 = new THREE.SpotLight(0xffffff, 3, 30, Math.PI / 6, 0.3);
spotlight1.position.set(-8, 8, -5);
spotlight1.target.position.set(-8, 0, -5);
spotlight1.castShadow = false;
scene.add(spotlight1);
scene.add(spotlight1.target);

const spotlight2 = new THREE.SpotLight(0xffffff, 3, 30, Math.PI / 6, 0.3);
spotlight2.position.set(8, 8, -5);
spotlight2.target.position.set(8, 0, -5);
spotlight2.castShadow = false;
scene.add(spotlight2);
scene.add(spotlight2.target);

const cafeLight = new THREE.PointLight(0xffaa66, 2.0, 20);
cafeLight.position.set(0, 5, 0);
cafeLight.castShadow = true;
scene.add(cafeLight);

const fillLight = new THREE.PointLight(0xffffff, 1.2, 20);
fillLight.position.set(0, 4, 10);
scene.add(fillLight);
/* ---------------- FLOOR  ---------------- */



// Load the diffuse texture for the floor
const floorTexture = texLoader.load('/textures/floor/oak_veneer_01_diff_2k.jpg', (texture) => {
  texture.encoding = THREE.sRGBEncoding;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(6, 6); // Adjust how many times the texture repeats across the floor
});



const floorMaterial = new THREE.MeshStandardMaterial({
  map: floorTexture,
  roughness: 0.9,
  metalness: 0,
});


// Create a flat plane for the floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 30), // width x height
  floorMaterial
);

// Rotate to lie flat on the XZ plane
floor.rotation.x = -Math.PI / 2;
floor.position.set(0, 0, 6); // adjust Z if needed
floor.receiveShadow = true;

scene.add(floor);



/* ---------------- BACK WALL ---------------- */
const backWall = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 10), // width, height
  new THREE.MeshStandardMaterial({
    color: 0xd9b99b,
    roughness: 0.8
  })
);
backWall.position.set(0, 5, -4); // ← RIGHT BEHIND BAR
backWall.receiveShadow = true;
scene.add(backWall);

/* ---------------- LEFT WALL ---------------- */
const leftWall = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 10), // width, height
  new THREE.MeshStandardMaterial({
    color: 0xd9b99b,
    roughness: 0.8
  })
);
leftWall.position.set(-15, 5, 6); // left side
leftWall.rotation.y = Math.PI / 2; // rotate to face inward
leftWall.receiveShadow = true;
scene.add(leftWall);

/* ---------------- RIGHT WALL ---------------- */
const rightWallTexture = texLoader.load('/textures/wall/window.jpg'); 
rightWallTexture.wrapS = rightWallTexture.wrapT = THREE.RepeatWrapping;
rightWallTexture.repeat.set(1, 1);

const rightWall = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 10),
  new THREE.MeshStandardMaterial({
    map: rightWallTexture,
    roughness: 0.8
  })
);
rightWall.position.set(15, 5, 6); // right side
rightWall.rotation.y = -Math.PI / 2; // rotate to face inward
rightWall.receiveShadow = true;
scene.add(rightWall);

const ceilingWall = new THREE.Mesh(
  new THREE.PlaneGeometry(30, 20), // width x depth
  new THREE.MeshStandardMaterial({
    color: 0x0a0a0a, // solid black
    roughness: 0.9,
    metalness: 0.1,
    side: THREE.FrontSide
  })
);
ceilingWall.position.set(0, 10, 6); // ceiling height
ceilingWall.rotation.x = Math.PI / 2; // make it horizontal
scene.add(ceilingWall);


/* ---------------- HANGING PLANKS ---------------- */
function createHangingPlanks() {
  const group = new THREE.Group();


  const plankMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5e0c3,  // light wood
    roughness: 0.7,
    metalness: 0.05
  });


  const plankCountX = 20;   // number along X
  const plankCountZ = 5;    // along Z (depth)
  const plankWidth = 0.3;   // wider planks
  const plankDepth = 0.2;
  const plankLengthMin = 1.5; // shorter planks
  const plankLengthMax = 3.0; 
  const ceilingY = 10;


  for (let i = 0; i < plankCountX; i++) {
    for (let j = 0; j < plankCountZ; j++) {
      const plankLength = plankLengthMin + Math.random() * (plankLengthMax - plankLengthMin);


      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(plankWidth, plankLength, plankDepth),
        plankMaterial
      );


      const startX = -15;
      const startZ = 0;


      plank.position.set(
        startX + i * 1.5 + (Math.random() - 0.5) * 0.5, // jitter X
        ceilingY - plankLength / 2,                      // hang down from ceiling
        startZ + j * 3 + (Math.random() - 0.5) * 1.0    // jitter Z
      );


      plank.castShadow = true;
      plank.receiveShadow = true;


      
      const light = new THREE.PointLight(0xffddaa, 0.6, 5);
      light.position.set(plank.position.x, ceilingY + 0.1, plank.position.z);
      group.add(light);


      group.add(plank);
    }
  }


  return group;
}


scene.add(createHangingPlanks());


/* ---------------- SHELF TEXTURES ---------------- */
const shelfTextures = {
  albedo: texLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_Albedo.png'),
  roughness: texLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_Roughness.png'),
  normal: texLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_normals(opengl).png')
};
shelfTextures.albedo.colorSpace = THREE.SRGBColorSpace;


/* ---------------- GLB TABLE (NEW) ---------------- */
function createGLBTable(x, z, rotation = 0) {
  const group = new THREE.Group();
  group.userData.tableTopY = 0.55; // height where objects should sit

  gltfLoader.load('/models/tables/uploads_files_3745265_Table.glb', (gltf) => {
    const table = gltf.scene;

    table.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material = new THREE.MeshStandardMaterial({
          color: 0x050505,
          roughness: 0.6,
          metalness: 0.2
        });
      }
    });

    table.scale.set(1.2, 1.35, 1.2);

    const box = new THREE.Box3().setFromObject(table);
    table.position.y -= box.min.y;

    group.add(table);
  });

  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  return group;
}

function addBooksToShelf(shelfRoot, shelfMeshOrScene, opts = {}) {
  const {
    rows = 3,
    cols = 8,
    padding = new THREE.Vector3(0.12, 0.10, 0.10),
    frontIsMaxZ = true,

   
    yLift = 0.02,
    rowLift = 0.12,        // EXTRA vertical lift inside each shelf band
    yPosInCell = 0.55,     // 0 = bottom of band, 1 = top of band

    
    density = 1.0,         // 1.0 = every slot, 0.7 = some empty, 1.3 = extra books
    extraChance = 0.55,    // chance to add a 2nd book in same slot (depth offset)
    stackChance = 0.25,    

    // sizing
    baseScale = 2.5,
    tilt = 0.25
  } = opts;

  shelfRoot.updateMatrixWorld(true);
  const worldBox = new THREE.Box3().setFromObject(shelfMeshOrScene);

  // Convert world box -> shelfRoot local box
  const inv = shelfRoot.matrixWorld.clone().invert();
  const pts = [
    new THREE.Vector3(worldBox.min.x, worldBox.min.y, worldBox.min.z),
    new THREE.Vector3(worldBox.min.x, worldBox.min.y, worldBox.max.z),
    new THREE.Vector3(worldBox.min.x, worldBox.max.y, worldBox.min.z),
    new THREE.Vector3(worldBox.min.x, worldBox.max.y, worldBox.max.z),
    new THREE.Vector3(worldBox.max.x, worldBox.min.y, worldBox.min.z),
    new THREE.Vector3(worldBox.max.x, worldBox.max.y, worldBox.min.z),
    new THREE.Vector3(worldBox.max.x, worldBox.min.y, worldBox.max.z),
    new THREE.Vector3(worldBox.max.x, worldBox.max.y, worldBox.max.z),
  ].map(p => p.applyMatrix4(inv));

  const localBox = new THREE.Box3().setFromPoints(pts);

  const innerMin = localBox.min.clone().add(padding);
  const innerMax = localBox.max.clone().sub(padding);

  const innerW = innerMax.x - innerMin.x;
  const innerH = innerMax.y - innerMin.y;

  const cellW = innerW / cols;
  const cellH = innerH / rows;

  
  const old = shelfRoot.getObjectByName("BooksGroup");
  if (old) shelfRoot.remove(old);

  const booksGroup = new THREE.Group();
  booksGroup.name = "BooksGroup";
  shelfRoot.add(booksGroup);

  // probe for size
  const probeData = booksData[0];
  const probe = new Book(probeData.title, probeData.author, probeData.price, probeData.color);
  probe.mesh.scale.setScalar(baseScale);
  booksGroup.add(probe.mesh);
  booksGroup.updateMatrixWorld(true);

  const probeSize = new THREE.Box3().setFromObject(probe.mesh).getSize(new THREE.Vector3());
  booksGroup.remove(probe.mesh);

  const bookHalfH = probeSize.y / 2;
  const bookHalfD = probeSize.z / 2;
  const bookHalfW = probeSize.x / 2;

  // helper to spawn one upright book
  const spawnUpright = (data, x, y, z, scaleMul = 1.0, zJitter = 0) => {
    const book = new Book(data.title, data.author, data.price, data.color);
    book.mesh.scale.setScalar(baseScale * scaleMul);

    book.mesh.position.set(x, y, z + zJitter);
    book.mesh.rotation.y = (Math.random() - 0.5) * tilt;

    booksGroup.add(book.mesh);
  };

  // helper to spawn a horizontal stack book
  const spawnStack = (data, x, y, z) => {
    const book = new Book(data.title, data.author, data.price, data.color);
    book.mesh.scale.setScalar(baseScale * 1.05);

    // lay down
    book.mesh.rotation.z = Math.PI / 2;
    book.mesh.rotation.y = (Math.random() - 0.5) * 0.15;

    // sit on shelf band
    book.mesh.position.set(
      x,
      y - bookHalfH * 0.25,
      z
    );

    booksGroup.add(book.mesh);
  };

  
  const baseSlots = rows * cols;
  const extraCount = Math.max(0, Math.floor(baseSlots * (density - 1)));

  let idx = 0;

  for (let r = 0; r < rows; r++) {
   
    const yBandBottom = innerMin.y + r * cellH;
    const yBase = yBandBottom + (yPosInCell * cellH) - (cellH / 2) + bookHalfH + yLift + rowLift;

    for (let c = 0; c < cols; c++) {
      
      if (density < 1.0 && Math.random() > density) continue;

      const data = booksData[idx % booksData.length];
      idx++;

      const x = innerMin.x + (c + 0.5) * cellW;

      const zFront = frontIsMaxZ
        ? (innerMax.z - bookHalfD - 0.02)
        : (innerMin.z + bookHalfD + 0.02);

      
      spawnUpright(data, x, yBase, zFront, 1.0, 0);

      
      if (Math.random() < extraChance) {
        const data2 = booksData[idx % booksData.length];
        idx++;

        const zOffset = frontIsMaxZ ? -0.06 : 0.06; 
        const xOffset = (Math.random() - 0.5) * (bookHalfW * 0.35);

        spawnUpright(data2, x + xOffset, yBase, zFront, 0.97, zOffset);
      }

      
      if (Math.random() < stackChance) {
        const data3 = booksData[idx % booksData.length];
        idx++;

        const xStack = x + (Math.random() - 0.5) * (cellW * 0.25);
        const zStack = zFront + (frontIsMaxZ ? -0.03 : 0.03);
        spawnStack(data3, xStack, yBase, zStack);
      }
    }
  }

  
  for (let k = 0; k < extraCount; k++) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);

    const yBandBottom = innerMin.y + r * cellH;
    const yBase = yBandBottom + (yPosInCell * cellH) - (cellH / 2) + bookHalfH + yLift + rowLift;

    const x = innerMin.x + (c + 0.5) * cellW + (Math.random() - 0.5) * (cellW * 0.22);

    const zFront = frontIsMaxZ
      ? (innerMax.z - bookHalfD - 0.02)
      : (innerMin.z + bookHalfD + 0.02);

    const data = booksData[idx % booksData.length];
    idx++;

    const zOffset = frontIsMaxZ ? -0.08 : 0.08;
    spawnUpright(data, x, yBase, zFront, 0.95, zOffset);
  }
}


function createGLBBookshelf(x, z, rotation = 0) {
  const group = new THREE.Group();

  gltfLoader.load(
    '/models/shelves/shelves_model/SchoolBagShelves.glb',
    (gltf) => {
      const shelf = gltf.scene;

      shelf.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            map: shelfTextures.albedo,
            normalMap: shelfTextures.normal,
            roughnessMap: shelfTextures.roughness,
            roughness: 1.0,
            metalness: 0.0,
            color: new THREE.Color(0xd9b99b)
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      // Scale 
      shelf.scale.set(2, 2, 2);

      
      const box = new THREE.Box3().setFromObject(shelf);
      const center = box.getCenter(new THREE.Vector3());

      
      shelf.position.x += -center.x;
      shelf.position.z += -center.z;

      
      const box2 = new THREE.Box3().setFromObject(shelf);
      shelf.position.y += -box2.min.y;

      group.add(shelf);

      
      addBooksToShelf(group, shelf, {
        rows: 3,
        cols: 8,
        frontIsMaxZ: true, 
      });

      console.log("📚 Books added inside shelf");
    },
    undefined,
    (error) => console.error("❌ Shelf load error:", error)
  );

  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  return group;
}


/* ---------------- ADD SHELVES ---------------- */
scene.add(createGLBBookshelf(-13.8, 0, Math.PI / 2));
scene.add(createGLBBookshelf(-13.8, 8, Math.PI / 2));


/* ---------------- CAFÉ COUNTER ---------------- */
function createCafeCounter() {
  const counterGroup = new THREE.Group();

  const counterBody = new THREE.Mesh(
    new THREE.BoxGeometry(6, 1.2, 2),
    new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.3,
      metalness: 0.4
    })
  );
  counterBody.position.set(0, 0.6, 0);
  counterBody.castShadow = true;
  counterBody.receiveShadow = true;
  counterGroup.add(counterBody);

  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.1, 2.2),
    new THREE.MeshStandardMaterial({
      color: 0x8b6f47,
      roughness: 0.5,
      metalness: 0.2
    })
  );
  counterTop.position.set(0, 1.25, 0);
  counterTop.castShadow = true;
  counterTop.receiveShadow = true;
  counterGroup.add(counterTop);

  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(5, 0.1, 0.4),
      new THREE.MeshStandardMaterial({
        color: 0xc9a870,
        roughness: 0.6
      })
    );
    shelf.position.set(0, 2.5 + i * 0.8, -0.8);
    shelf.castShadow = true;
    counterGroup.add(shelf);

    for (let j = 0; j < 5; j++) {
      const item = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.4),
        new THREE.MeshStandardMaterial({
          color: [0x8b4513, 0x2f4f2f, 0x4a4a4a][Math.floor(Math.random() * 3)],
          roughness: 0.3,
          metalness: 0.5
        })
      );
      item.position.set(-2 + j * 1, 2.7 + i * 0.8, -0.8);
      item.castShadow = true;
      counterGroup.add(item);
    }
  }

  for (let i = 0; i < 3; i++) {
    const lampShade = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.4, 0.3, 8),
      new THREE.MeshStandardMaterial({
        color: 0xff8844,
        emissive: 0xff6622,
        emissiveIntensity: 0.5,
        roughness: 0.4
      })
    );
    lampShade.position.set(-2 + i * 2, 4.2, 0);
    counterGroup.add(lampShade);

    const light = new THREE.PointLight(0xffaa66, 0.8, 8);
    light.position.set(-2 + i * 2, 4, 0);
    light.castShadow = true;
    counterGroup.add(light);
  }

  counterGroup.position.set(0, 0, 0);
  return counterGroup;
}
scene.add(createCafeCounter());

/* ---------------- CHAIRS (UNCHANGED) ---------------- */
function createGLBChair(x, z, rotation = 0, color = null) {
  const group = new THREE.Group();

  gltfLoader.load('/models/chair/chair.glb', (gltf) => {
    const chair = gltf.scene;

    chair.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (color !== null) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.7,
            metalness: 0.2,
            side: THREE.DoubleSide
          });
        }
        
      }
    });

    chair.scale.set(2.2, 2.2, 2.2);
    const box = new THREE.Box3().setFromObject(chair);
    chair.position.y -= box.min.y;

    group.add(chair);
  });

  group.position.set(x, 0, z);
  group.rotation.y = rotation;
  return group;
}

function addChairToTable(tableGroup, offsetZ, rotationY, color = null) {
  gltfLoader.load('/models/chair/chair.glb', (gltf) => {
    const chair = gltf.scene;

    chair.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (color !== null) {
          child.material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(color),
            roughness: 0.7,
            metalness: 0.2
          });
        }
      }
    });

    chair.scale.set(2.2, 2.2, 2.2);

    const box = new THREE.Box3().setFromObject(chair);
    chair.position.y -= box.min.y;

    chair.position.z = offsetZ;    
    chair.rotation.y = rotationY;

    tableGroup.add(chair);
  });
}


/* ---------------- SEATING: ONE TABLE PER CHAIR ---------------- */
function createCafeSeatingClustersDispersed() {
  const group = new THREE.Group();

 const clusterCenters = [
 
  { x: -12, z: 2 },
  { x: -12, z: 6 },


  { x: -7, z: 3 },
  { x: -7, z: 8 },

 
  { x: -1, z: 4 },
  { x: -1, z: 9 },

 
  { x: 6, z: 3 },
  { x: 6, z: 8 },

 
  { x: 12, z: 5 }
];

  clusterCenters.forEach(center => {
    const offsetX = (Math.random() - 0.5) * 1.5;
    const offsetZ = (Math.random() - 0.5) * 1.0;

    const x = center.x + offsetX;
    const z = center.z + offsetZ;

    const tableRotation = Math.random() * Math.PI * 2;

    const table = createGLBTable(x, z, tableRotation);
    group.add(table);

    addChairToTable(table, 1.0, Math.PI);

    addChairToTable(table, -1.0, 0, 0xffc0cb);
  });

  return group;
}


scene.add(createCafeSeatingClustersDispersed());

/* ---------------- NEON SIGN ---------------- */
function createNeonSign() {
  const neonGroup = new THREE.Group();

  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(4, 1.5, 0.1),
    new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 1.5,
      roughness: 0.2
    })
  );
  panel.position.set(0, 0, 0);
  neonGroup.add(panel);

  const glowLight = new THREE.PointLight(0xff0000, 2, 10);
  glowLight.position.set(0, 0, 0.5);
  neonGroup.add(glowLight);

  neonGroup.position.set(0, 3, -1.5);
  return neonGroup;
}
scene.add(createNeonSign());

/* ---------------- GLASS DISPLAY CASE ---------------- */
function createDisplayCase(x, z) {
  const caseGroup = new THREE.Group();

  const glassMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    roughness: 0.1,
    metalness: 0.9
  });

  const glassPanel = new THREE.Mesh(
    new THREE.BoxGeometry(2, 2, 2),
    glassMaterial
  );
  glassPanel.position.set(0, 1, 0);
  glassPanel.castShadow = true;
  glassPanel.receiveShadow = true;
  caseGroup.add(glassPanel);

  const frameMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.3,
    metalness: 0.8
  });

  const edges = [
    [0, 0, -1], [0, 0, 1], [0, 2, -1], [0, 2, 1],
    [-1, 1, 0], [1, 1, 0]
  ];

  edges.forEach(pos => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, pos[1] === 1 ? 2 : 0.05, pos[2] === 0 ? 2 : 0.05),
      frameMaterial
    );
    frame.position.set(pos[0], pos[1], pos[2]);
    frame.castShadow = true;
    caseGroup.add(frame);
  });

  caseGroup.position.set(x, 0, z);
  return caseGroup;
}

/* ---------------- BAR SIDE PILLARS ---------------- */
function createBarSidePillars() {
  const group = new THREE.Group();

  const pillarMat = new THREE.MeshStandardMaterial({
    color: 0x8b7357,
    roughness: 0.9,
    metalness: 0.05
  });

  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.6,
    metalness: 0.25
  });

  const speakerBodyMat = new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 0.5,
    metalness: 0.2
  });

  const grillMat = new THREE.MeshStandardMaterial({
    color: 0x1b1b1b,
    roughness: 0.9,
    metalness: 0.15
  });

  const logoMat = new THREE.MeshStandardMaterial({
    color: 0xd9b99b,
    roughness: 0.4,
    metalness: 0.2
  });

  const stripMat = new THREE.MeshStandardMaterial({
    color: 0xffb26a,
    emissive: 0xff7e2e,
    emissiveIntensity: 0.28,
    roughness: 0.6,
    metalness: 0.1
  });

  const height = 9.0;
  const yCenter = height / 2;

  function makeOnePillar(x) {
    const pillar = new THREE.Group();

    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.55, 0.35, 1.55),
      baseMat
    );
    base.position.set(0, 0.175, 0);
    base.castShadow = true;
    base.receiveShadow = true;
    pillar.add(base);

    const body = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, height, 1.2),
      pillarMat
    );
    body.position.set(0, yCenter, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    pillar.add(body);

    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(1.3, 0.25, 1.3),
      baseMat
    );
    cap.position.set(0, height + 0.125, 0);
    cap.castShadow = true;
    pillar.add(cap);

    const speakerY = height * 0.62;

    const speakerBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.72, 1.35, 0.38),
      speakerBodyMat
    );
    speakerBox.position.set(0, speakerY, 0.62);
    speakerBox.castShadow = true;
    pillar.add(speakerBox);

    const grill = new THREE.Mesh(
      new THREE.PlaneGeometry(0.62, 1.18),
      grillMat
    );
    grill.position.set(0, speakerY, 0.82);
    pillar.add(grill);

    const logoPlate = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.12),
      logoMat
    );
    logoPlate.position.set(0, speakerY - 0.82, 0.62);
    pillar.add(logoPlate);

    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(0.045, height * 0.65, 0.045),
      stripMat
    );
    strip.position.set(0.56, (height * 0.65) / 2 + 0.6, 0.56);
    pillar.add(strip);

    const uplight = new THREE.PointLight(0xffb07a, 0.25, 7);
    uplight.position.set(0.45, 0.25, 0.45);
    uplight.castShadow = false;
    pillar.add(uplight);

    pillar.position.set(x, 0, -2.8);
    return pillar;
  }

  group.add(makeOnePillar(-7.2));
  group.add(makeOnePillar(7.2));

  return group;
}
scene.add(createBarSidePillars());

function createBackBarShelf() {
  const group = new THREE.Group();

  group.position.set(0, 0, -3.45);

  const W = 12.8;
  const H = 5.4;
  const depth = 0.65;

  const frameT = 0.18;
  const dividerT = 0.08;
  const inset = 0.55;

  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x0c0c0c,
    roughness: 0.7,
    metalness: 0.2
  });

  const dividerMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a,
    roughness: 0.85,
    metalness: 0.1
  });

  const backPanelMat = new THREE.MeshStandardMaterial({
    color: 0x141414,
    roughness: 0.95,
    metalness: 0.0
  });

  const glowPanelMat = new THREE.MeshStandardMaterial({
    color: 0xffa45a,
    emissive: 0xff7e2e,
    emissiveIntensity: 0.28,
    roughness: 0.9,
    metalness: 0.0
  });

  const yMid = 3.45;

  const leftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(frameT, H, frameT),
    frameMat
  );
  leftFrame.position.set(-W / 2 + frameT / 2, yMid, 0);
  leftFrame.castShadow = true;
  group.add(leftFrame);

  const rightFrame = leftFrame.clone();
  rightFrame.position.x = W / 2 - frameT / 2;
  group.add(rightFrame);

  const topFrame = new THREE.Mesh(
    new THREE.BoxGeometry(W, frameT, frameT),
    frameMat
  );
  topFrame.position.set(0, yMid + H / 2 - frameT / 2, 0);
  topFrame.castShadow = true;
  group.add(topFrame);

  const bottomFrame = topFrame.clone();
  bottomFrame.position.y = yMid - H / 2 + frameT / 2;
  group.add(bottomFrame);

  const backPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.2, H - 0.2),
    backPanelMat
  );
  backPanel.position.set(0, yMid, -depth / 2);
  group.add(backPanel);

  const glowPanel = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 1.2, H - 1.2),
    glowPanelMat
  );
  glowPanel.position.set(0, yMid, -depth / 2 + 0.01);
  group.add(glowPanel);

  const cols = 5;
  const rows = 3;

  const innerW = W - inset * 2;
  const innerH = H - inset * 2;
  const cellW = innerW / cols;
  const cellH = innerH / rows;

  for (let c = 1; c < cols; c++) {
    const x = -innerW / 2 + c * cellW;
    const v = new THREE.Mesh(
      new THREE.BoxGeometry(dividerT, innerH, depth - 0.15),
      dividerMat
    );
    v.position.set(x, yMid, -0.08);
    v.castShadow = true;
    v.receiveShadow = true;
    group.add(v);
  }

  for (let r = 1; r < rows; r++) {
    const y = (yMid - innerH / 2) + r * cellH;
    const h = new THREE.Mesh(
      new THREE.BoxGeometry(innerW, dividerT, depth - 0.15),
      dividerMat
    );
    h.position.set(0, y, -0.08);
    h.castShadow = true;
    h.receiveShadow = true;
    group.add(h);
  }

  const warm = new THREE.PointLight(0xffa86a, 0.9, 12);
  warm.position.set(-3.8, yMid + 0.7, -0.1);
  warm.castShadow = false;
  group.add(warm);

  const warm2 = warm.clone();
  warm2.position.x = 3.8;
  group.add(warm2);

  return group;
}
scene.add(createBackBarShelf());

/* ---------------- CONTROLS ---------------- */
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2;
controls.target.set(0, 2, 0);
controls.update();

/* ---------------- RAYCASTER ---------------- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseClick(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  for (let intersect of intersects) {
    if (intersect.object.userData.clickable) {
      showBookDetails(intersect.object.userData);
      break;
    }
  }
}

window.addEventListener('click', onMouseClick);

/* ---------------- UPDATED BOOK MODAL FUNCTIONS ---------------- */

function colorToGradient(color) {

  const threeColor = typeof color === 'number' ? new THREE.Color(color) : color;
  
  // Get RGB values
  const r = Math.floor(threeColor.r * 255);
  const g = Math.floor(threeColor.g * 255);
  const b = Math.floor(threeColor.b * 255);
  
  // Create darker variations for gradient
  const dark1 = `rgb(${Math.floor(r * 0.6)}, ${Math.floor(g * 0.6)}, ${Math.floor(b * 0.6)})`;
  const dark2 = `rgb(${Math.floor(r * 0.3)}, ${Math.floor(g * 0.3)}, ${Math.floor(b * 0.3)})`;
  
  return `linear-gradient(135deg, rgb(${r}, ${g}, ${b}) 0%, ${dark1} 50%, ${dark2} 100%)`;
}

window.showBookDetails = function (bookData) {
  // Update book cover (left side)
  document.getElementById('bookCoverTitle').textContent = bookData.title;
  document.getElementById('bookCoverAuthor').textContent = bookData.author;
  
  // Update cover color based on book color
  const coverArt = document.querySelector('.book-cover-art');
  if (bookData.color) {
    coverArt.style.background = colorToGradient(bookData.color);
  }
  
  // Update details panel (right side)
  document.getElementById('bookTitle').textContent = bookData.title;
  document.getElementById('bookAuthor').textContent = bookData.author;
  document.getElementById('detailsPrice').textContent = bookData.price;
  
  // Show modal with animation
  const modal = document.getElementById('bookDetails');
  const backdrop = document.getElementById('bookDetails-backdrop');
  
  modal.style.display = 'block';
  backdrop.classList.add('show');
  
  // Trigger animation after display is set
  setTimeout(() => {
    modal.classList.add('show');
  }, 10);
};

window.closeBookDetails = function () {
  const modal = document.getElementById('bookDetails');
  const backdrop = document.getElementById('bookDetails-backdrop');
  
  // Remove show classes for animation
  modal.classList.remove('show');
  backdrop.classList.remove('show');
  
  // Hide after animation completes
  setTimeout(() => {
    modal.style.display = 'none';
  }, 400);
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeBookDetails();
  }
});

/* ---------------- RESIZE ---------------- */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});


let time = 0;

function animate() {
  requestAnimationFrame(animate);
  time += 0.01;

  controls.update();

  scene.children.forEach(child => {
    if (child.children && child.children.length > 40) {
      child.rotation.y = Math.sin(time * 0.1) * 0.02;
    }
  });

  renderer.render(scene, camera);
}

animate();
document.getElementById('loading').style.display = 'none';
