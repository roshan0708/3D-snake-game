let WIDTH = window.innerWidth, HEIGHT = window.innerHeight;
let aspectRatio = WIDTH / HEIGHT;
let renderer = new THREE.WebGLRenderer({ antialias: true }), camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000), scene = new THREE.Scene();
let controls = new THREE.OrbitControls(camera, renderer.domElement);
let clock = new THREE.Clock(), text = document.createElement("div"), paragraph = document.createElement("p");
controls.enableKeys = false;

let mov = 5;
let delta = 1 / mov;
let tetha = 0.0, edgeSize = 20, padding = 0.15;
let cubeSize = edgeSize + (edgeSize - 1) * padding;
let halfCubeSize = cubeSize / 2;

let background_color = 0xb2eadc, body_color = 0x2dd3e5, head_color = 0x125db9, score = 0;

let lightPos = [new THREE.Vector3(0, 50, 20), new THREE.Vector3(0, 15, -20), new THREE.Vector3(-20, 15, 20), new THREE.Vector3(20, -15, 0)];

let end = false, keysQueue = [];

let snake = [], apple;
let cube = new THREE.BoxGeometry(1, 1, 1);
let gameCube = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
let direction = new THREE.Vector3(1, 0, 0);


scene.background = new THREE.Color(background_color);

camera.position.z = 30;
camera.position.y = 30;

cube.center();

function init() {

    renderer.setSize(WIDTH, HEIGHT);
    document.body.appendChild(renderer.domElement);

    lightPos.forEach(function (v) {
        let light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(v.x, v.y, v.z);
        scene.add(light)
    });

    for (let i = 0; i < 5; i++) {
        let snakeCubeMaterial = new THREE.MeshPhongMaterial({ color: (i == 4) ? head_color : body_color });
        snake.push(new Cube(new THREE.Vector3((i + i * padding) - halfCubeSize + 0.5, 0.5 + padding / 2, 0.5 + padding / 2), snakeCubeMaterial, scene));
    }

    let appleCubeMaterial = new THREE.MeshPhongMaterial({ color: 0xc62828 });
    apple = new Cube(spawnAppleVector(), appleCubeMaterial, scene);
    let edgesMaterial = new THREE.LineBasicMaterial({ color: 0x000 });
    new Cube(new THREE.Vector3(0, 0, 0), edgesMaterial, scene, gameCube, true).setPosition(0, 0, 0);

    text.style.position = "absolute";
    text.style.width = 200;
    text.style.height = 100;
    text.innerHTML = "Score: " + score;
    text.style.top = 20 + "px";
    text.style.left = 20 + "px";
    text.style.fontSize = 50 + "px";
    paragraph.innerHTML = "Controls - 'w' for Vertically Up, 's' for Vertically Down and Basic Arrow Controls";
    paragraph.style.fontSize = 20 + "px";
    text.appendChild(paragraph);
    document.body.appendChild(text);

    clock.startTime = 0.0;
    render();
}

function restart() {
    while (snake.length > 5) scene.remove(snake.shift().mesh);

    for (let i = 0; i < snake.length; i++) {
        snake[i].setPosition((i + i * padding) - halfCubeSize + 0.5, 0.5 + padding / 2, 0.5 + padding / 2);
    }
    end = false;
    direction = new THREE.Vector3(1, 0, 0);
    text.innerHTML = "Score: " + 0;
    score = 0;
}

document.onload = init();


function spawnAppleVector() {
    let x = randInRange(0, edgeSize - 1), y = randInRange(0, edgeSize - 1), z = randInRange(0, edgeSize - 1);
    return new THREE.Vector3(x + x * padding - halfCubeSize + 0.5, y + y * padding - halfCubeSize + 0.5, z + z * padding - halfCubeSize + 0.5);
}

function Cube(vec, material, scene, geometry, renderWireframe) {
    this.geometry = typeof geometry === 'undefined' ? cube : geometry;
    this.mesh = new THREE.Mesh(this.geometry, material);

    if (typeof renderWireframe === 'undefined' || !renderWireframe) {
        this.mesh.position.set(vec.x, vec.y, vec.z);
        scene.add(this.mesh);
    }
    else {
        let edges = new THREE.EdgesGeometry(this.mesh.geometry);
        scene.add(new THREE.LineSegments(edges, material));
    }

    this.setPosition = function (vec) {
        this.mesh.position.set(vec.x, vec.y, vec.z);
    };
}

function randInRange(a, b) {
    return a + Math.floor((b - a) * Math.random());
}

function render() {
    requestAnimationFrame(render);

    tetha += clock.getDelta();

    if (tetha > delta) {
        let tail = snake.shift();
        let head = snake[snake.length - 1];

        head.mesh.material.color.setHex(body_color);
        tail.mesh.material.color.setHex(head_color);

        direction = keysQueue.length > 0 ? keysQueue.pop(0) : direction;
        let newPosition = new THREE.Vector3(head.mesh.position.x + direction.x + Math.sign(direction.x) * padding, head.mesh.position.y + direction.y + Math.sign(direction.y) * padding, head.mesh.position.z + direction.z + Math.sign(direction.z) * padding);
        tail.setPosition(newPosition);

        snake.push(tail);
        head = tail;

        for (let i = snake.length - 2; i > -1; i--) {
            if (head.mesh.position.distanceTo(snake[i].mesh.position) < 1) {
                end = true;
                break;
            }
        }

        if (end) {
            restart();
        }
        if (head.mesh.position.distanceTo(apple.mesh.position) < 1) {
            apple.setPosition(spawnAppleVector());
            text.innerHTML = "Score: " + (++score);

            snake.unshift(new Cube(new THREE.Vector3(snake[0].mesh.position.x, snake[0].mesh.position.y, snake[0].mesh.position.z), new THREE.MeshPhongMaterial({ color: 0x388e3c }), scene));

        }

        if (head.mesh.position.x < -halfCubeSize) {
            head.mesh.position.x = halfCubeSize - 0.5;
        }
        else if (head.mesh.position.x > halfCubeSize) {
            head.mesh.position.x = -halfCubeSize + 0.5;
        }
        else if (head.mesh.position.y < -halfCubeSize) {
            head.mesh.position.y = halfCubeSize - 0.5;
        }
        else if (head.mesh.position.y > halfCubeSize) {
            head.mesh.position.y = -halfCubeSize + 0.5;
        }
        else if (head.mesh.position.z < -halfCubeSize) {
            head.mesh.position.z = halfCubeSize - 0.5;
        }
        else if (head.mesh.position.z > halfCubeSize) {
            head.mesh.position.z = -halfCubeSize + 0.5;
        }

        tetha = 0;
    }

    renderer.render(scene, camera);
}

document.addEventListener("keydown", function (e) {
    switch (e.key) {
        case 'w':
            keysQueue.push(new THREE.Vector3(0, 1, 0));
            break;
        case 's':
            keysQueue.push(new THREE.Vector3(0, -1, 0));
            break;
        case "ArrowDown":
            keysQueue.push(new THREE.Vector3(0, 0, 1));
            break;
        case "ArrowUp":
            keysQueue.push(new THREE.Vector3(0, 0, -1));
            break;
        case "ArrowLeft":
            keysQueue.push(new THREE.Vector3(-1, 0, 0));
            break;
        case "ArrowRight":
            keysQueue.push(new THREE.Vector3(1, 0, 0));
            break;
    }
});