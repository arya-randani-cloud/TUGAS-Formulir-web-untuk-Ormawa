// Ensure the container exists
const container = document.getElementById('canvas-container');

if (container && typeof THREE !== 'undefined') {
    // 1. Setup Scene, Camera, Renderer
    const scene = new THREE.Scene();

    // Transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 12);

    // 2. Add Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x3b5bdb, 2, 50); // Royal blue light
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x00f0ff, 1, 50); // Cyan light
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // 3. Create Placeholder Robotic Arm
    // Materials
    const carbonMaterial = new THREE.MeshStandardMaterial({
        color: 0x111111,
        roughness: 0.8,
        metalness: 0.5,
        wireframe: false
    });

    const ledMaterial = new THREE.MeshBasicMaterial({
        color: 0x3b5bdb // Glowing blue
    });

    // Arm Group
    const armGroup = new THREE.Group();
    scene.add(armGroup);

    // Base Joint (Shoulder)
    const shoulderGeo = new THREE.SphereGeometry(1, 32, 32);
    const shoulder = new THREE.Mesh(shoulderGeo, carbonMaterial);
    armGroup.add(shoulder);

    // Upper Arm
    const upperArmGeo = new THREE.CylinderGeometry(0.6, 0.4, 3, 32);
    const upperArm = new THREE.Mesh(upperArmGeo, carbonMaterial);
    upperArm.position.set(0, 1.5, 0);
    shoulder.add(upperArm);

    // LED Strip on Upper Arm
    const ledStripGeo1 = new THREE.CylinderGeometry(0.65, 0.45, 0.2, 32);
    const ledStrip1 = new THREE.Mesh(ledStripGeo1, ledMaterial);
    ledStrip1.position.set(0, 0, 0);
    upperArm.add(ledStrip1);

    // Elbow Joint
    const elbowGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const elbow = new THREE.Mesh(elbowGeo, carbonMaterial);
    elbow.position.set(0, 1.8, 0);
    upperArm.add(elbow);

    // Lower Arm
    const lowerArmGeo = new THREE.CylinderGeometry(0.4, 0.2, 3, 32);
    const lowerArm = new THREE.Mesh(lowerArmGeo, carbonMaterial);
    lowerArm.position.set(0, 1.5, 0);
    elbow.add(lowerArm);

    // LED Strip on Lower Arm
    const ledStripGeo2 = new THREE.CylinderGeometry(0.45, 0.25, 0.15, 32);
    const ledStrip2 = new THREE.Mesh(ledStripGeo2, ledMaterial);
    ledStrip2.position.set(0, 0.5, 0);
    lowerArm.add(ledStrip2);

    // Hand / Effector
    const handGeo = new THREE.BoxGeometry(0.8, 1, 0.8);
    const hand = new THREE.Mesh(handGeo, carbonMaterial);
    hand.position.set(0, 1.8, 0);
    lowerArm.add(hand);

    // Fingers
    const fingerGeo = new THREE.BoxGeometry(0.1, 0.8, 0.1);
    const finger1 = new THREE.Mesh(fingerGeo, carbonMaterial);
    finger1.position.set(0.3, 0.6, 0.3);
    hand.add(finger1);

    const finger2 = new THREE.Mesh(fingerGeo, carbonMaterial);
    finger2.position.set(-0.3, 0.6, 0.3);
    hand.add(finger2);

    const finger3 = new THREE.Mesh(fingerGeo, carbonMaterial);
    finger3.position.set(0, 0.6, -0.3);
    hand.add(finger3);

    // Add glowing core in hand
    const coreGeo = new THREE.SphereGeometry(0.3, 16, 16);
    const core = new THREE.Mesh(coreGeo, ledMaterial);
    core.position.set(0, 0.3, 0);
    hand.add(core);

    // Initial Pose
    armGroup.position.set(0, -2, 0);
    shoulder.rotation.z = Math.PI / 4;
    elbow.rotation.z = -Math.PI / 3;
    elbow.rotation.x = Math.PI / 6;

    // 4. Mouse Tracking & Animation
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        // Normalized mouse coordinates
        mouseX = (event.clientX - windowHalfX) * 0.005;
        mouseY = (event.clientY - windowHalfY) * 0.005;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Zero Gravity Floating Effect
        armGroup.position.y = -2 + Math.sin(time * 1.5) * 0.3;
        armGroup.position.x = Math.cos(time * 1.2) * 0.1;

        // Smooth Mouse Tracking
        targetX = mouseX * 2;
        targetY = mouseY * 2;

        // Rotate the base (shoulder) towards mouse horizontally
        shoulder.rotation.y += (targetX - shoulder.rotation.y) * 0.05;

        // Rotate the elbow slightly towards mouse vertically
        elbow.rotation.x += (targetY - elbow.rotation.x) * 0.05;

        // Slight self-rotation for aesthetics
        hand.rotation.y = Math.sin(time) * 0.5;

        renderer.render(scene, camera);
    }

    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
}
