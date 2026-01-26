import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
    import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 25, 60);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    camera.position.set(0, 3, 12);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    document.body.appendChild(renderer.domElement);

    // Lighting - brighter overall
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const ceilingLight = new THREE.PointLight(0xffcc88, 2.5, 25);
    ceilingLight.position.set(0, 8, 0);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    const spotlight1 = new THREE.SpotLight(0xffffff, 3, 30, Math.PI / 6, 0.3);
    spotlight1.position.set(-8, 8, -5);
    spotlight1.target.position.set(-8, 0, -5);
    spotlight1.castShadow = true;
    scene.add(spotlight1);
    scene.add(spotlight1.target);

    const spotlight2 = new THREE.SpotLight(0xffffff, 3, 30, Math.PI / 6, 0.3);
    spotlight2.position.set(8, 8, -5);
    spotlight2.target.position.set(8, 0, -5);
    spotlight2.castShadow = true;
    scene.add(spotlight2);
    scene.add(spotlight2.target);

    const cafeLight = new THREE.PointLight(0xffaa66, 2.0, 20);
    cafeLight.position.set(0, 5, 0);
    cafeLight.castShadow = true;
    scene.add(cafeLight);

    // Floor with texture
    const textureLoader = new THREE.TextureLoader();
    const tileRepeat = 6;
    
    const colorMap = textureLoader.load('/textures/floor/Leather004_2K-JPG_Color.jpg');
    colorMap.encoding = THREE.sRGBEncoding;
    
    const normalMap = textureLoader.load('/textures/floor/Leather004_2K-JPG_NormalDX.jpg');
    
    [colorMap, normalMap].forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(tileRepeat, tileRepeat);
    });
    
    normalMap.flipY = true;
    
    const floorGeometry = new THREE.PlaneGeometry(50, 50);
    const floorMaterial = new THREE.MeshStandardMaterial({
      map: colorMap,
      normalMap: normalMap,
      roughness: 0.9,
      metalness: 0.0,
      color: new THREE.Color(0xffffff)
    });
    
    floorMaterial.color.multiplyScalar(1.2);
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Ceiling
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(50, 50),
      new THREE.MeshStandardMaterial({ 
        color: 0x0a0a0a,
        roughness: 0.9,
        side: THREE.DoubleSide
      })
    );
    ceiling.position.y = 10;
    ceiling.rotation.x = Math.PI / 2;
    scene.add(ceiling);

    // Ceiling installation - lines across the entire ceiling
    function createCeilingInstallation() {
      const group = new THREE.Group();
      const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b6f47, // Darker wood tone
        roughness: 0.7,
        metalness: 0.1
      });

      // Create wooden slats in parallel lines across the ceiling
      const numLines = 50; // Reduced number of lines to avoid shader errors
      const spacing = 1.0; // Spacing between slats
      const coverageWidth = 50; // Cover the full width
      
      for (let i = 0; i < numLines; i++) {
        const length = 0.8 + Math.random() * 2.0; // Varying lengths for visual interest
        const xPos = -coverageWidth / 2 + (i * spacing);
        
        // Create slats along the Z axis (running front to back)
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, length, 0.25),
          woodMaterial
        );
        
        slat.position.set(xPos, 10 - length / 2, 0); // Higher position
        slat.castShadow = true;
        
        group.add(slat);
      }
      
      // Add some variation - offset rows (reduced)
      for (let i = 0; i < 25; i++) {
        const length = 0.9 + Math.random() * 1.8;
        const xPos = -coverageWidth / 2 + (i * spacing * 2);
        const zOffset = 5 + Math.random() * 5;
        
        const slat = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, length, 0.25),
          woodMaterial
        );
        
        slat.position.set(xPos, 10 - length / 2, zOffset);
        slat.castShadow = true;
        
        group.add(slat);
        
        // Mirror on the other side
        const slat2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.25, length, 0.25),
          woodMaterial
        );
        
        slat2.position.set(xPos, 10 - length / 2, -zOffset);
        slat2.castShadow = true;
        
        group.add(slat2);
      }
      
      // Add lights coming through the ceiling slats (reduced to 6)
      for (let i = 0; i < 6; i++) {
        const xPos = -20 + (i * 8);
        const zPos = -10 + Math.random() * 20;
        
        const ceilingSpotlight = new THREE.SpotLight(0xffcc88, 1.5, 15, Math.PI / 8, 0.5);
        ceilingSpotlight.position.set(xPos, 10, zPos);
        ceilingSpotlight.target.position.set(xPos, 0, zPos);
        ceilingSpotlight.castShadow = true;
        
        group.add(ceilingSpotlight);
        group.add(ceilingSpotlight.target);
      }
      
      return group;
    }
    
    scene.add(createCeilingInstallation());

    // GLTFLoader for loading 3D models
    const gltfLoader = new GLTFLoader();

    // Load shelf textures (reusing textureLoader from above)
    const shelfTextures = {
      albedo: textureLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_Albedo.png'),
      roughness: textureLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_Roughness.png'),
      metalness: textureLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_Metallic.png'),
      ao: textureLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_AO.png'),
      normal: textureLoader.load('/models/shelves/shelves_model/texture/SchoolBagShelves_normals(opengl).png')
    };

    // Set correct color space for albedo
    shelfTextures.albedo.encoding = THREE.sRGBEncoding;

    // Function to create GLB bookshelf with textures
    function createGLBBookshelf(x, z, rotation = 0) {
      const shelfGroup = new THREE.Group();
      
      // Load the shelf GLB model
      gltfLoader.load(
        '/models/shelves/shelves_model/SchoolBagShelves.glb',
        (gltf) => {
          const shelf = gltf.scene;
          
          // Apply textures to all meshes in the shelf
          shelf.traverse((child) => {
            if (child.isMesh) {
              // Create material with all texture maps
              child.material = new THREE.MeshStandardMaterial({
                map: shelfTextures.albedo,
                roughnessMap: shelfTextures.roughness,
                metalnessMap: shelfTextures.metalness,
                aoMap: shelfTextures.ao,
                normalMap: shelfTextures.normal,
                roughness: 1.0,
                metalness: 1.0
              });
              
              // Enable shadows
              child.castShadow = true;
              child.receiveShadow = true;
              
              // If mesh has UV2 for AO map
              if (child.geometry.attributes.uv) {
                child.geometry.setAttribute('uv2', child.geometry.attributes.uv);
              }
            }
          });
          
          // Add the shelf to the group
          shelfGroup.add(shelf);
          
          // Now load books as children of this shelf
          loadBooksForShelf(shelfGroup, shelf);
        },
        (progress) => {
          console.log('Loading shelf: ' + (progress.loaded / progress.total * 100) + '%');
        },
        (error) => {
          console.error('Error loading shelf:', error);
          // Fallback to procedural shelf if GLB fails
          const fallbackShelf = createProceduralBookshelf(0, 0, 0);
          shelfGroup.add(fallbackShelf);
        }
      );
      
      shelfGroup.position.set(x, 0, z);
      shelfGroup.rotation.y = rotation;
      
      return shelfGroup;
    }

    // Function to load GLB books and attach them to shelf (parent-child relationship)
    function loadBooksForShelf(shelfGroup, shelfModel) {
      const bookPositions = [
        // Shelf 1 (bottom)
        { x: -1.5, y: 0.5, z: 0 },
        { x: -1.0, y: 0.5, z: 0 },
        { x: -0.5, y: 0.5, z: 0 },
        { x: 0.0, y: 0.5, z: 0 },
        { x: 0.5, y: 0.5, z: 0 },
        { x: 1.0, y: 0.5, z: 0 },
        { x: 1.5, y: 0.5, z: 0 },
        // Shelf 2
        { x: -1.5, y: 1.5, z: 0 },
        { x: -1.0, y: 1.5, z: 0 },
        { x: -0.5, y: 1.5, z: 0 },
        { x: 0.0, y: 1.5, z: 0 },
        { x: 0.5, y: 1.5, z: 0 },
        { x: 1.0, y: 1.5, z: 0 },
        { x: 1.5, y: 1.5, z: 0 },
        // Shelf 3
        { x: -1.5, y: 2.5, z: 0 },
        { x: -1.0, y: 2.5, z: 0 },
        { x: -0.5, y: 2.5, z: 0 },
        { x: 0.0, y: 2.5, z: 0 },
        { x: 0.5, y: 2.5, z: 0 },
        { x: 1.0, y: 2.5, z: 0 },
      ];

      bookPositions.forEach((pos, index) => {
        gltfLoader.load(
          '/models/books/book.glb', // Path to your book GLB
          (gltf) => {
            const book = gltf.scene;
            
            // Set book position relative to shelf
            book.position.set(pos.x, pos.y, pos.z);
            
            // Random rotation for variety
            book.rotation.y = (Math.random() - 0.5) * 0.1;
            
            // Random scale for variety
            const scale = 0.8 + Math.random() * 0.4;
            book.scale.set(scale, scale, scale);
            
            // Enable shadows
            book.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                
                // Add click interaction data
                child.userData = {
                  title: `Book ${Math.floor(Math.random() * 1000)}`,
                  author: ['Macedonian Author', 'International Writer', 'Classic Author'][Math.floor(Math.random() * 3)],
                  price: `${(299 + Math.random() * 500).toFixed(0)} MKD`,
                  clickable: true
                };
              }
            });
            
            // IMPORTANT: Add book as child of shelf (parent-child relationship)
            shelfModel.add(book);
          },
          undefined,
          (error) => {
            console.error('Error loading book:', error);
            // Fallback to procedural book if GLB fails
            const fallbackBook = createProceduralBook(pos);
            shelfModel.add(fallbackBook);
          }
        );
      });
    }

    // Fallback procedural book (if GLB doesn't load)
    function createProceduralBook(pos) {
      const bookColors = [
        0xff4444, 0x4444ff, 0x44ff44, 0xffaa00, 0xff00ff,
        0x00ffff, 0xff8800, 0x8800ff, 0x00ff88, 0xffff00
      ];
      
      const bookWidth = 0.12 + Math.random() * 0.1;
      const bookHeight = 0.5 + Math.random() * 0.2;
      const bookDepth = 0.6;
      
      const bookMaterial = new THREE.MeshStandardMaterial({
        color: bookColors[Math.floor(Math.random() * bookColors.length)],
        roughness: 0.5,
        metalness: 0.1
      });
      
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bookWidth, bookHeight, bookDepth),
        bookMaterial
      );
      
      book.position.set(pos.x, pos.y, pos.z);
      book.rotation.y = (Math.random() - 0.5) * 0.08;
      book.castShadow = true;
      book.userData = {
        title: `Book ${Math.floor(Math.random() * 1000)}`,
        author: ['Macedonian Author', 'International Writer', 'Classic Author'][Math.floor(Math.random() * 3)],
        price: `${(299 + Math.random() * 500).toFixed(0)} MKD`,
        clickable: true
      };
      
      return book;
    }

    // Fallback procedural bookshelf
    function createProceduralBookshelf(x, z, rotation) {
      const shelfGroup = new THREE.Group();
      
      const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.4,
        metalness: 0.3
      });
      
      const backing = new THREE.Mesh(
        new THREE.BoxGeometry(4, 4, 0.2),
        frameMaterial
      );
      backing.position.set(0, 2, -0.3);
      backing.castShadow = true;
      backing.receiveShadow = true;
      shelfGroup.add(backing);

      for (let i = 0; i < 4; i++) {
        const shelf = new THREE.Mesh(
          new THREE.BoxGeometry(4, 0.05, 0.8),
          frameMaterial
        );
        shelf.position.set(0, 0.5 + i * 1.0, 0);
        shelf.castShadow = true;
        shelf.receiveShadow = true;
        shelfGroup.add(shelf);
      }

      return shelfGroup;
    }



    // Add GLB bookshelves (these will load the models)
    scene.add(createGLBBookshelf(-15, -8, Math.PI / 2));
    scene.add(createGLBBookshelf(-15, 0, Math.PI / 2));
    scene.add(createGLBBookshelf(-15, 8, Math.PI / 2));

    // Café counter
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

    // Seating area
    function createSeatingArea() {
      const seatingGroup = new THREE.Group();
      
      const chairColors = [0xd4a574, 0x4a4a4a, 0xc97c5d, 0x6b8e23];
      const positions = [
        [-2, 0, -2], [2, 0, -2], [-2, 0, 2], [2, 0, 2],
        [0, 0, 0], [-3, 0, 0], [3, 0, 0]
      ];

      positions.forEach((pos, idx) => {
        const seat = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.1, 0.8),
          new THREE.MeshStandardMaterial({
            color: chairColors[idx % chairColors.length],
            roughness: 0.7,
            metalness: 0.2
          })
        );
        seat.position.set(pos[0], 0.5, pos[2]);
        seat.castShadow = true;
        seat.receiveShadow = true;
        seatingGroup.add(seat);

        const back = new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 0.6, 0.1),
          new THREE.MeshStandardMaterial({
            color: chairColors[idx % chairColors.length],
            roughness: 0.7
          })
        );
        back.position.set(pos[0], 0.8, pos[2] - 0.35);
        back.castShadow = true;
        seatingGroup.add(back);

        const legMaterial = new THREE.MeshStandardMaterial({
          color: 0x2a2a2a,
          roughness: 0.3,
          metalness: 0.8
        });

        const legPositions = [
          [pos[0] - 0.3, 0.25, pos[2] - 0.3],
          [pos[0] + 0.3, 0.25, pos[2] - 0.3],
          [pos[0] - 0.3, 0.25, pos[2] + 0.3],
          [pos[0] + 0.3, 0.25, pos[2] + 0.3]
        ];

        legPositions.forEach(legPos => {
          const leg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.04, 0.04, 0.5),
            legMaterial
          );
          leg.position.set(...legPos);
          leg.castShadow = true;
          seatingGroup.add(leg);
        });

        if (idx % 2 === 0 && idx < 4) {
          const table = new THREE.Mesh(
            new THREE.CylinderGeometry(0.4, 0.4, 0.05),
            new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              roughness: 0.2,
              metalness: 0.7
            })
          );
          table.position.set(pos[0] + 1.2, 0.5, pos[2]);
          table.castShadow = true;
          table.receiveShadow = true;
          seatingGroup.add(table);

          const tableBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.35, 0.4, 0.5),
            new THREE.MeshStandardMaterial({
              color: 0x2a2a2a,
              roughness: 0.3,
              metalness: 0.7
            })
          );
          tableBase.position.set(pos[0] + 1.2, 0.25, pos[2]);
          tableBase.castShadow = true;
          seatingGroup.add(tableBase);
        }
      });

      seatingGroup.position.set(2, 0, 8);
      return seatingGroup;
    }

    scene.add(createSeatingArea());

    // Neon sign - positioned behind the bar
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

      // Glow effect
      const glowLight = new THREE.PointLight(0xff0000, 2, 10);
      glowLight.position.set(0, 0, 0.5);
      neonGroup.add(glowLight);

      // Position behind the bar (bar is at 0,0,0, so put sign behind it)
      neonGroup.position.set(0, 3, -1.5);
      return neonGroup;
    }

    scene.add(createNeonSign());

    // Glass display case
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

    scene.add(createDisplayCase(15, 8));

    // OrbitControls for smooth camera control
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2; // Prevent going below ground
    controls.target.set(0, 2, 0);
    controls.update();

    // Mouse interaction
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

    // Book details functions
    window.showBookDetails = function(bookData) {
      document.getElementById('bookTitle').textContent = bookData.title;
      document.getElementById('bookAuthor').textContent = bookData.author;
      document.getElementById('bookPrice').textContent = bookData.price;
      document.getElementById('bookDetails').style.display = 'block';
    };

    window.closeBookDetails = function() {
      document.getElementById('bookDetails').style.display = 'none';
    };



    // Resize
    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animation
    let time = 0;

    function animate() {
      requestAnimationFrame(animate);
      time += 0.01;

      // Update controls
      controls.update();

      // Ceiling installation subtle animation
      scene.children.forEach(child => {
        if (child.children && child.children.length > 40) {
          child.rotation.y = Math.sin(time * 0.1) * 0.02;
        }
      });

      renderer.render(scene, camera);
    }

    animate();
    document.getElementById('loading').style.display = 'none';