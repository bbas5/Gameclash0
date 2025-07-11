// تهيئة المشهد
let scene, camera, renderer, controls;
let gameActive = false;
let gameTime = CONFIG.GAME_DURATION;
let elixir = CONFIG.ELIXIR_MAX;
let selectedCard = null;
let currentCards = [];
let units = [];
let towers = [];
let spells = [];
let grid = [];
let gameInterval;
let elixirInterval;
let botInterval;

// تهيئة Three.js
function init() {
    // إنشاء المشهد
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); // لون السماء
    
    // إنشاء الكاميرا
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 30, 30);
    camera.lookAt(0, 0, 0);
    
    // إنشاء العارض
    renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('game-canvas'), antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    
    // التحكم بالكاميرا
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.minDistance = 20;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;
    
    // إضافة الإضاءة
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    
    // إنشاء الأرضية
    createGround();
    
    // إنشاء الشبكة
    createGrid();
    
    // إنشاء الأبراج
    createTowers();
    
    // تحميل البطاقات
    loadCards();
    
    // إضافة مستمعات الأحداث
    setupEventListeners();
    
    // بدء التصيير
    animate();
    
    // تعديل حجم العرض عند تغيير حجم النافذة
    window.addEventListener('resize', onWindowResize);
}

// إنشاء الأرضية
function createGround() {
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load(ASSET_PATHS.TEXTURES.GROUND);
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(CONFIG.GRID_WIDTH / 2, CONFIG.GRID_HEIGHT / 2);
    
    const groundGeometry = new THREE.PlaneGeometry(CONFIG.GRID_WIDTH * CONFIG.GRID_SIZE, CONFIG.GRID_HEIGHT * CONFIG.GRID_SIZE);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: groundTexture,
        side: THREE.DoubleSide
    });
    
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
}

// إنشاء الشبكة
function createGrid() {
    const gridHelper = new THREE.GridHelper(
        CONFIG.GRID_WIDTH * CONFIG.GRID_SIZE, 
        CONFIG.GRID_WIDTH, 
        0x555555, 
        0x333333
    );
    scene.add(gridHelper);
    
    // إنشاء مصفوفة الشبكة
    for (let x = 0; x < CONFIG.GRID_WIDTH; x++) {
        grid[x] = [];
        for (let z = 0; z < CONFIG.GRID_HEIGHT; z++) {
            grid[x][z] = {
                occupied: false,
                object: null,
                type: null // 'unit', 'tower', 'spell'
            };
        }
    }
}

// إنشاء الأبراج
function createTowers() {
    const loader = new THREE.GLTFLoader();
    
    // الأبراج الرئيسية
    loader.load(ASSET_PATHS.TOWERS.MAIN, (gltf) => {
        // برج اللاعب
        const playerTower = gltf.scene.clone();
        playerTower.position.set(0, 0, -CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE + 5);
        playerTower.scale.set(2, 2, 2);
        scene.add(playerTower);
        towers.push({
            object: playerTower,
            hp: CONFIG.MAIN_TOWER_HP,
            side: 'player',
            type: 'main'
        });
        
        // برج العدو
        const enemyTower = gltf.scene.clone();
        enemyTower.position.set(0, 0, CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE - 5);
        enemyTower.rotation.y = Math.PI;
        enemyTower.scale.set(2, 2, 2);
        scene.add(enemyTower);
        towers.push({
            object: enemyTower,
            hp: CONFIG.MAIN_TOWER_HP,
            side: 'enemy',
            type: 'main'
        });
    });
    
    // الأبراج الجانبية
    loader.load(ASSET_PATHS.TOWERS.SIDE, (gltf) => {
        // أبراج اللاعب
        for (let i = -1; i <= 1; i += 2) {
            const tower = gltf.scene.clone();
            tower.position.set(i * 5, 0, -CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE + 10);
            tower.scale.set(1.5, 1.5, 1.5);
            scene.add(tower);
            towers.push({
                object: tower,
                hp: CONFIG.TOWER_HP,
                side: 'player',
                type: 'side',
                lane: i > 0 ? 'right' : 'left'
            });
        }
        
        // أبراج العدو
        for (let i = -1; i <= 1; i += 2) {
            const tower = gltf.scene.clone();
            tower.position.set(i * 5, 0, CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE - 10);
            tower.rotation.y = Math.PI;
            tower.scale.set(1.5, 1.5, 1.5);
            scene.add(tower);
            towers.push({
                object: tower,
                hp: CONFIG.TOWER_HP,
                side: 'enemy',
                type: 'side',
                lane: i > 0 ? 'right' : 'left'
            });
        }
    });
}

// تحميل البطاقات
function loadCards() {
    currentCards = getRandomCards();
    updateCardDisplay();
}

// تحديث عرض البطاقات
function updateCardDisplay() {
    const cardElements = document.querySelectorAll('.card');
    cardElements.forEach((cardEl, index) => {
        if (index < currentCards.length) {
            const card = currentCards[index];
            cardEl.style.display = 'block';
            cardEl.dataset.cardId = card.id;
            cardEl.querySelector('.card-cost').textContent = card.cost;
            
            // تحديث الصورة (هنا يمكنك استخدام مسار الصورة من كائن البطاقة)
            // cardEl.querySelector('img').src = card.modelPath;
        } else {
            cardEl.style.display = 'none';
        }
    });
}

// بدء اللعبة
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    gameTime = CONFIG.GAME_DURATION;
    elixir = CONFIG.ELIXIR_MAX;
    updateElixirDisplay();
    
    // بدء المؤقت
    gameInterval = setInterval(() => {
        gameTime--;
        updateTimerDisplay();
        
        if (gameTime <= 0) {
            endGame();
        }
    }, 1000);
    
    // تجديد الطاقة
    elixirInterval = setInterval(() => {
        if (elixir < CONFIG.ELIXIR_MAX) {
            elixir += CONFIG.ELIXIR_REGEN_RATE;
            updateElixirDisplay();
        }
    }, 1000 / CONFIG.ELIXIR_REGEN_RATE);
    
    // تحكم الخصم الآلي
    botInterval = setInterval(botPlay, 5000);
    
    document.getElementById('start-btn').disabled = true;
}

// إنهاء اللعبة
function endGame() {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(elixirInterval);
    clearInterval(botInterval);
    
    // تحديد الفائز
    let playerMainTower = towers.find(t => t.side === 'player' && t.type === 'main');
    let enemyMainTower = towers.find(t => t.side === 'enemy' && t.type === 'main');
    
    if (playerMainTower.hp <= 0 && enemyMainTower.hp <= 0) {
        alert("تعادل!");
    } else if (playerMainTower.hp <= 0) {
        alert("لقد خسرت!");
    } else if (enemyMainTower.hp <= 0) {
        alert("لقد فزت!");
    } else {
        alert("انتهى الوقت!");
    }
    
    document.getElementById('start-btn').disabled = false;
}

// إعادة تشغيل اللعبة
function restartGame() {
    // إزالة جميع الوحدات
    units.forEach(unit => {
        scene.remove(unit.object);
    });
    units = [];
    
    // إعادة تعيين الأبراج
    towers.forEach(tower => {
        if (tower.type === 'main') {
            tower.hp = CONFIG.MAIN_TOWER_HP;
        } else {
            tower.hp = CONFIG.TOWER_HP;
        }
    });
    
    // إعادة تعيين البطاقات
    loadCards();
    
    // إعادة تعيين الطاقة والوقت
    elixir = CONFIG.ELIXIR_MAX;
    updateElixirDisplay();
    
    // إذا كانت اللعبة نشطة، نوقف المؤقتات ونبدأ من جديد
    if (gameActive) {
        clearInterval(gameInterval);
        clearInterval(elixirInterval);
        clearInterval(botInterval);
        startGame();
    }
}

// تحكم الخصم الآلي
function botPlay() {
    if (!gameActive) return;
    
    // اختيار بطاقة عشوائية يمكن للخصم تحمل تكلفتها
    const affordableCards = [...CARDS.UNITS, ...CARDS.SPELLS].filter(card => card.cost <= elixir);
    if (affordableCards.length === 0) return;
    
    const randomCard = affordableCards[Math.floor(Math.random() * affordableCards.length)];
    const lane = ['left', 'middle', 'right'][Math.floor(Math.random() * 3)];
    
    // لعب البطاقة
    playCard(randomCard, lane, 'enemy');
}

// لعب بطاقة
function playCard(card, lane, side = 'player') {
    if (side === 'player' && (elixir < card.cost || !gameActive)) return;
    
    // خصم تكلفة البطاقة
    if (side === 'player') {
        elixir -= card.cost;
        updateElixirDisplay();
    }
    
    // تحديد موضع الوحدة/التعويذة
    let x, z;
    if (side === 'player') {
        z = -CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE + 5;
    } else {
        z = CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE - 5;
    }
    
    switch (lane) {
        case 'left': x = -5; break;
        case 'right': x = 5; break;
        default: x = 0; break;
    }
    
    // إنشاء الوحدة/التعويذة
    if (card.type === 'unit') {
        createUnit(card, x, z, side);
    } else if (card.type === 'spell') {
        createSpell(card, x, z, side);
    }
    
    // استبدال البطاقة المستخدمة (لللاعب فقط)
    if (side === 'player') {
        const cardIndex = currentCards.findIndex(c => c.id === card.id);
        if (cardIndex !== -1) {
            const newCards = getRandomCards(1);
            currentCards[cardIndex] = newCards[0];
            updateCardDisplay();
        }
    }
}

// إنشاء وحدة
function createUnit(cardData, x, z, side) {
    const loader = new THREE.GLTFLoader();
    loader.load(cardData.modelPath, (gltf) => {
        const unit = gltf.scene.clone();
        unit.position.set(x, 0, z);
        unit.scale.set(cardData.size, cardData.size, cardData.size);
        
        if (side === 'enemy') {
            unit.rotation.y = Math.PI; // مواجهة الاتجاه المعاكس
        }
        
        scene.add(unit);
        
        // إضافة الوحدة إلى المصفوفة
        units.push({
            object: unit,
            data: cardData,
            hp: cardData.hp,
            side: side,
            lane: x < 0 ? 'left' : x > 0 ? 'right' : 'middle',
            target: null,
            attackCooldown: 0
        });
    });
}

// إنشاء تعويذة
function createSpell(cardData, x, z, side) {
    // في الواقع، التعويذات سيكون لها تأثير فوري
    // هنا يمكنك إضافة تأثيرات بصرية للتعويذة
    
    // تطبيق تأثير التعويذة
    applySpellEffect(cardData, x, z, side);
}

// تطبيق تأثير التعويذة
function applySpellEffect(cardData, x, z, side) {
    const spellRadius = cardData.radius || 3;
    const affectedUnits = units.filter(unit => {
        const distance = Math.sqrt(
            Math.pow(unit.object.position.x - x, 2) + 
            Math.pow(unit.object.position.z - z, 2)
        );
        return distance <= spellRadius && unit.side !== side;
    });
    
    switch (cardData.id) {
        case 6: // كرة النار
            affectedUnits.forEach(unit => {
                unit.hp -= cardData.damage;
                if (unit.hp <= 0) {
                    removeUnit(unit);
                }
            });
            break;
            
        case 7: // تجميد
            affectedUnits.forEach(unit => {
                unit.frozen = true;
                setTimeout(() => {
                    unit.frozen = false;
                }, cardData.duration * 1000);
            });
            break;
            
        case 8: // تعزيز
            const friendlyUnits = units.filter(unit => unit.side === side && 
                Math.sqrt(
                    Math.pow(unit.object.position.x - x, 2) + 
                    Math.pow(unit.object.position.z - z, 2)
                ) <= spellRadius);
                
            friendlyUnits.forEach(unit => {
                unit.boosted = true;
                unit.boostEndTime = Date.now() + cardData.duration * 1000;
            });
            break;
            
        case 9: // عاصفة الظل
            // في الواقع، هذا سيؤثر على خصم اللاعب الحقيقي فقط
            if (side === 'player') {
                // هنا يمكنك تخفيض طاقة الخصم الآلي
            }
            break;
    }
    
    // يمكنك إضافة تأثيرات بصرية هنا
}

// إزالة وحدة
function removeUnit(unit) {
    scene.remove(unit.object);
    units = units.filter(u => u !== unit);
}

// تحديث الوحدات
function updateUnits(deltaTime) {
    units.forEach(unit => {
        if (unit.frozen) return;
        
        // البحث عن هدف
        if (!unit.target || unit.target.hp <= 0) {
            findTarget(unit);
        }
        
        // إذا كان للوحدة هدف
        if (unit.target) {
            const distance = Math.sqrt(
                Math.pow(unit.object.position.x - unit.target.object.position.x, 2) + 
                Math.pow(unit.object.position.z - unit.target.object.position.z, 2)
            );
            
            // إذا كانت الوحدة في مدى الهجوم
            if (distance <= unit.data.range) {
                // الهجوم
                unit.attackCooldown -= deltaTime;
                if (unit.attackCooldown <= 0) {
                    attack(unit);
                    unit.attackCooldown = unit.data.attackSpeed;
                }
            } else {
                // التحرك نحو الهدف
                const direction = new THREE.Vector3(
                    unit.target.object.position.x - unit.object.position.x,
                    0,
                    unit.target.object.position.z - unit.object.position.z
                ).normalize();
                
                const speed = unit.data.movementSpeed * (unit.boosted ? 1.3 : 1) * deltaTime;
                unit.object.position.x += direction.x * speed;
                unit.object.position.z += direction.z * speed;
                
                // تدوير الوحدة لتواجه اتجاه الحركة
                unit.object.lookAt(
                    unit.object.position.x + direction.x,
                    unit.object.position.y,
                    unit.object.position.z + direction.z
                );
            }
        } else {
            // التحرك نحو البرج المعادي
            const targetZ = unit.side === 'player' ? 
                CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE - 5 : 
                -CONFIG.GRID_HEIGHT/2 * CONFIG.GRID_SIZE + 5;
                
            const direction = new THREE.Vector3(
                0 - unit.object.position.x,
                0,
                targetZ - unit.object.position.z
            ).normalize();
            
            const speed = unit.data.movementSpeed * (unit.boosted ? 1.3 : 1) * deltaTime;
            unit.object.position.x += direction.x * speed;
            unit.object.position.z += direction.z * speed;
            
            // تدوير الوحدة لتواجه اتجاه الحركة
            unit.object.lookAt(
                unit.object.position.x + direction.x,
                unit.object.position.y,
                unit.object.position.z + direction.z
            );
        }
        
        // التحقق من التعزيز المنتهي
        if (unit.boosted && unit.boostEndTime && Date.now() > unit.boostEndTime) {
            unit.boosted = false;
        }
    });
}

// البحث عن هدف
function findTarget(unit) {
    // البحث عن أقرب وحدة معادية
    let closestEnemy = null;
    let closestDistance = Infinity;
    
    units.forEach(enemy => {
        if (enemy.side !== unit.side) {
            const distance = Math.sqrt(
                Math.pow(unit.object.position.x - enemy.object.position.x, 2) + 
                Math.pow(unit.object.position.z - enemy.object.position.z, 2)
            );
            
            if (distance < closestDistance) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        }
    });
    
    // إذا لم يتم العثور على وحدة معادية، استهدف البرج
    if (!closestEnemy) {
        const enemyTowers = towers.filter(tower => tower.side !== unit.side);
        if (enemyTowers.length > 0) {
            // استهداف البرج في نفس الممر إن أمكن
            const laneTower = enemyTowers.find(tower => 
                tower.type === 'side' && 
                ((unit.lane === 'left' && tower.lane === 'left') || 
                 (unit.lane === 'right' && tower.lane === 'right'))
            );
            
            if (laneTower) {
                unit.target = laneTower;
            } else {
                // استهداف أي برج جانبي
                const sideTower = enemyTowers.find(tower => tower.type === 'side');
                if (sideTower) {
                    unit.target = sideTower;
                } else {
                    // استهداف البرج الرئيسي
                    unit.target = enemyTowers.find(tower => tower.type === 'main');
                }
            }
        }
    } else {
        unit.target = closestEnemy;
    }
}

// الهجوم
function attack(unit) {
    if (!unit.target) return;
    
    // حساب الضرر مع التعزيز إذا كان موجودًا
    const damage = unit.data.damage * (unit.boosted ? 1.5 : 1);
    
    if (unit.target.hp) { // إذا كان الهدف برج
        unit.target.hp -= damage;
        
        if (unit.target.hp <= 0) {
            // إزالة البرج إذا تم تدميره
            scene.remove(unit.target.object);
            towers = towers.filter(t => t !== unit.target);
            unit.target = null;
        }
    } else { // إذا كان الهدف وحدة
        unit.target.hp -= damage;
        
        if (unit.target.hp <= 0) {
            removeUnit(unit.target);
            unit.target = null;
        }
    }
    
    // هنا يمكنك إضافة تأثيرات بصرية للهجوم
}

// تحديث عرض المؤقت
function updateTimerDisplay() {
    const minutes = Math.floor(gameTime / 60);
    const seconds = gameTime % 60;
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// تحديث عرض الطاقة
function updateElixirDisplay() {
    const elixirFill = document.getElementById('elixir-fill');
    const elixirCount = document.getElementById('elixir-count');
    
    const percentage = (elixir / CONFIG.ELIXIR_MAX) * 100;
    elixirFill.style.width = `${percentage}%`;
    elixirCount.textContent = Math.floor(elixir);
}

// إعداد مستمعات الأحداث
function setupEventListeners() {
    // النقر على البطاقات
    document.querySelectorAll('.card').forEach(card => {
        card.addEventListener('click', () => {
            if (!gameActive) return;
            
            const cardId = parseInt(card.dataset.cardId);
            selectedCard = [...CARDS.UNITS, ...CARDS.SPELLS].find(c => c.id === cardId);
            
            if (selectedCard && elixir >= selectedCard.cost) {
                // هنا يمكنك إضافة مؤشر لاختيار الممر
                // في هذا المثال، سنختار الممر الأوسط تلقائيًا
                playCard(selectedCard, 'middle');
                selectedCard = null;
            }
        });
    });
    
    // بدء المعركة
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // إعادة التشغيل
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    
    // النقر على الساحة لاختيار الممر (يمكن تطويره)
    renderer.domElement.addEventListener('click', (event) => {
        if (!selectedCard || !gameActive) return;
        
        // حساب موضع النقر على الساحة
        // (هذا يحتاج إلى تطوير أكثر دقة)
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        
        let lane;
        if (x < -0.33) {
            lane = 'left';
        } else if (x > 0.33) {
            lane = 'right';
        } else {
            lane = 'middle';
        }
        
        playCard(selectedCard, lane);
        selectedCard = null;
    });
}

// تعديل حجم العرض
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// دورة التصيير
let lastTime = 0;
function animate(time = 0) {
    requestAnimationFrame(animate);
    
    const deltaTime = (time - lastTime) / 1000; // التحويل إلى ثواني
    lastTime = time;
    
    controls.update();
    
    if (gameActive) {
        updateUnits(deltaTime);
    }
    
    renderer.render(scene, camera);
}

// تهيئة اللعبة عند تحميل الصفحة
window.onload = init;