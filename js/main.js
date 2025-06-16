// 主程序模組 - 初始化和管理所有遊戲組件
class Game3D {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.layers = [];              // 存儲多層格子 [layer][cellIndex]
        this.currentLayerIndex = 0;    // 當前可互動層索引
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredCell = null;
        
        this.init();
    }
    
    /**
     * 初始化 Three.js 場景
     */
    init() {
        // 創建場景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        
        // 創建攝像機
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(
            GAME_CONFIG.SCENE.CAMERA_POSITION.x,
            GAME_CONFIG.SCENE.CAMERA_POSITION.y,
            GAME_CONFIG.SCENE.CAMERA_POSITION.z
        );
        
        // 創建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        const container = document.getElementById('game-container');
        container.appendChild(this.renderer.domElement);
        
        // 添加燈光
        this.setupLighting();
        
        // 創建格子網格
        this.createGrid();
        
        // 設置事件監聽器
        this.setupEventListeners();
        
        // 開始渲染循環
        this.animate();
    }
    
    /**
     * 設置燈光
     */
    setupLighting() {
        // 環境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 主方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // 點光源（增加動態感）
        const pointLight = new THREE.PointLight(0x4CAF50, 0.5, 100);
        pointLight.position.set(0, 5, 0);
        this.scene.add(pointLight);
    }
    
    /**
     * 創建多層格子網格
     */
    createGrid() {
        this.layers = [];
        const geometry = new THREE.BoxGeometry(
            GAME_CONFIG.CELL.SIZE, 
            GAME_CONFIG.CELL.HEIGHT, 
            GAME_CONFIG.CELL.SIZE
        );
        
        // 創建多層格子（當前層 + 下3層）
        for (let layerIndex = 0; layerIndex < GAME_CONFIG.SCENE.VISIBLE_LAYERS; layerIndex++) {
            const layerCells = [];
            
            // 計算層的 Z 位置（向後延伸）
            const layerZ = -layerIndex * GAME_CONFIG.SCENE.LAYER_SPACING;
            
            // 計算該層的透明度
            const opacity = layerIndex === 0 ? 
                GAME_CONFIG.CELL.CURRENT_OPACITY : 
                GAME_CONFIG.CELL.FUTURE_OPACITY - (layerIndex - 1) * GAME_CONFIG.SCENE.LAYER_DEPTH_FADE;
                
            // 該層的顏色
            const layerColor = layerIndex === 0 ? 
                GAME_CONFIG.CELL.DEFAULT_COLOR : 
                GAME_CONFIG.CELL.FUTURE_COLOR;
            
            // 創建該層的 6 個格子
            for (let i = 0; i < GAME_CONFIG.GRID_SIZE; i++) {
                const row = Math.floor(i / GAME_CONFIG.SCENE.GRID_COLS);
                const col = i % GAME_CONFIG.SCENE.GRID_COLS;
                
                // 計算格子位置
                const x = (col - 1) * GAME_CONFIG.SCENE.GRID_SPACING;
                const z = (row - 0.5) * GAME_CONFIG.SCENE.GRID_SPACING + layerZ;
                
                // 創建材質
                const material = new THREE.MeshStandardMaterial({
                    color: layerColor,
                    roughness: 0.3,
                    metalness: 0.1,
                    transparent: true,
                    opacity: Math.max(0.2, opacity)
                });
                
                // 創建格子
                const cell = new THREE.Mesh(geometry, material);
                cell.position.set(x, 0, z);
                cell.castShadow = layerIndex === 0; // 只有當前層投射陰影
                cell.receiveShadow = true;
                cell.userData = { 
                    index: i,
                    layerIndex: layerIndex,
                    state: CELL_STATE.HIDDEN,
                    originalY: 0,
                    originalColor: layerColor,
                    originalOpacity: Math.max(0.2, opacity),
                    isCurrentLayer: layerIndex === 0
                };
                
                this.scene.add(cell);
                layerCells.push(cell);
            }
            
            this.layers.push(layerCells);
        }
        
        // 添加層數標籤
        this.addLayerLabels();
    }
    
    /**
     * 添加層數標籤
     */
    addLayerLabels() {
        // 如果需要，這裡可以添加3D文字標籤顯示層數
        // 暫時使用console輸出提示多層已創建
        console.log(`✅ 已創建 ${GAME_CONFIG.SCENE.VISIBLE_LAYERS} 層格子網格`);
    }
    
    /**
     * 設置事件監聽器
     */
    setupEventListeners() {
        // 滑鼠移動事件
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
        
        // 滑鼠點擊事件
        this.renderer.domElement.addEventListener('click', (event) => {
            this.onMouseClick(event);
        });
        
        // 視窗大小調整事件
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }
    
    /**
     * 滑鼠移動處理
     */
    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // 射線檢測 - 只檢測當前層的格子
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const currentLayerCells = this.layers[this.currentLayerIndex] || [];
        const intersects = this.raycaster.intersectObjects(currentLayerCells);
        
        // 重置所有格子的懸停狀態
        if (this.hoveredCell) {
            this.hoveredCell.material.color.setHex(this.hoveredCell.userData.originalColor);
            this.hoveredCell = null;
        }
        
        // 設置懸停格子（只允許當前層）
        if (intersects.length > 0) {
            const cell = intersects[0].object;
            if (cell.userData.state === CELL_STATE.HIDDEN && cell.userData.isCurrentLayer) {
                this.hoveredCell = cell;
                cell.material.color.setHex(GAME_CONFIG.CELL.HOVER_COLOR);
                this.renderer.domElement.style.cursor = 'pointer';
            } else {
                this.renderer.domElement.style.cursor = 'default';
            }
        } else {
            this.renderer.domElement.style.cursor = 'default';
        }
    }
    
    /**
     * 滑鼠點擊處理
     */
    onMouseClick(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // 只允許點擊當前層
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const currentLayerCells = this.layers[this.currentLayerIndex] || [];
        const intersects = this.raycaster.intersectObjects(currentLayerCells);
        
        if (intersects.length > 0) {
            const cell = intersects[0].object;
            if (cell.userData.state === CELL_STATE.HIDDEN && cell.userData.isCurrentLayer) {
                // 通知遊戲邏輯處理選擇
                if (window.gameLogic) {
                    window.gameLogic.selectCell(cell.userData.index);
                }
            }
        }
    }
    
    /**
     * 視窗大小調整處理
     */
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    /**
     * 顯示炸彈爆炸動畫
     * @param {number} cellIndex - 格子索引
     */
    showBombExplosion(cellIndex) {
        const currentLayer = this.layers[this.currentLayerIndex];
        if (!currentLayer) return;
        
        const cell = currentLayer[cellIndex];
        cell.userData.state = CELL_STATE.BOMB;
        
        // 改變顏色為紅色
        cell.material.color.setHex(GAME_CONFIG.CELL.BOMB_COLOR);
        
        // 爆炸動畫
        this.animateExplosion(cell);
    }
    
    /**
     * 顯示安全勝利動畫
     * @param {number} cellIndex - 格子索引
     */
    showSafeWin(cellIndex) {
        const currentLayer = this.layers[this.currentLayerIndex];
        if (!currentLayer) return;
        
        const cell = currentLayer[cellIndex];
        cell.userData.state = CELL_STATE.SAFE;
        
        // 改變顏色為綠色
        cell.material.color.setHex(GAME_CONFIG.CELL.SAFE_COLOR);
        
        // 勝利動畫
        this.animateWin(cell);
    }
    
    /**
     * 爆炸動畫
     * @param {THREE.Mesh} cell - 格子對象
     */
    animateExplosion(cell) {
        const startTime = Date.now();
        const duration = GAME_CONFIG.ANIMATION.DURATION;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 震動效果
            const shake = Math.sin(progress * Math.PI * 10) * 0.1 * (1 - progress);
            cell.position.x = cell.position.x + (Math.random() - 0.5) * shake;
            cell.position.z = cell.position.z + (Math.random() - 0.5) * shake;
            
            // 縮放效果
            const scale = 1 + Math.sin(progress * Math.PI) * 0.3;
            cell.scale.set(scale, scale, scale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * 勝利動畫
     * @param {THREE.Mesh} cell - 格子對象
     */
    animateWin(cell) {
        const startTime = Date.now();
        const duration = GAME_CONFIG.ANIMATION.DURATION;
        const originalY = cell.userData.originalY;
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 彈跳效果
            const bounce = Math.sin(progress * Math.PI) * GAME_CONFIG.ANIMATION.BOUNCE_HEIGHT;
            cell.position.y = originalY + bounce;
            
            // 發光效果
            const glow = 0.5 + Math.sin(progress * Math.PI * 4) * 0.3;
            cell.material.emissive.setRGB(0, glow * 0.3, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                cell.position.y = originalY;
                cell.material.emissive.setRGB(0, 0, 0);
            }
        };
        
        animate();
    }
    
    /**
     * 準備下一層
     */
    prepareNextLevel() {
        this.advanceToNextLayer();
    }
    
    /**
     * 推進到下一層
     */
    advanceToNextLayer() {
        // 所有層向前移動一層的位置
        this.layers.forEach((layer, layerIndex) => {
            layer.forEach(cell => {
                // 移動到前一層的位置
                const newZ = cell.position.z + GAME_CONFIG.SCENE.LAYER_SPACING;
                cell.position.z = newZ;
                
                // 更新層級索引
                cell.userData.layerIndex = layerIndex - 1;
                cell.userData.isCurrentLayer = (layerIndex - 1) === 0;
                
                // 如果移動到當前層位置，重置狀態和樣式
                if (layerIndex === 1) {
                    // 原來的第2層變成新的當前層
                    cell.userData.state = CELL_STATE.HIDDEN;
                    cell.material.color.setHex(GAME_CONFIG.CELL.DEFAULT_COLOR);
                    cell.material.opacity = GAME_CONFIG.CELL.CURRENT_OPACITY;
                    cell.material.emissive.setRGB(0, 0, 0);
                    cell.position.y = cell.userData.originalY;
                    cell.scale.set(1, 1, 1);
                    cell.castShadow = true;
                }
            });
        });
        
        // 移除已經移動到前面的第一層
        const oldCurrentLayer = this.layers.shift();
        if (oldCurrentLayer) {
            oldCurrentLayer.forEach(cell => {
                this.scene.remove(cell);
            });
        }
        
        // 在最後添加新的一層
        this.addNewLayer();
        
        console.log(`✅ 推進到下一層，當前顯示層級: ${this.getCurrentDisplayLevels()}`);
    }
    
    /**
     * 添加新的一層到最後
     */
    addNewLayer() {
        const newLayerIndex = GAME_CONFIG.SCENE.VISIBLE_LAYERS - 1;
        const layerCells = [];
        
        // 計算新層的 Z 位置
        const layerZ = -newLayerIndex * GAME_CONFIG.SCENE.LAYER_SPACING;
        
        // 計算透明度
        const opacity = GAME_CONFIG.CELL.FUTURE_OPACITY - (newLayerIndex - 1) * GAME_CONFIG.SCENE.LAYER_DEPTH_FADE;
        
        const geometry = new THREE.BoxGeometry(
            GAME_CONFIG.CELL.SIZE, 
            GAME_CONFIG.CELL.HEIGHT, 
            GAME_CONFIG.CELL.SIZE
        );
        
        // 創建6個格子
        for (let i = 0; i < GAME_CONFIG.GRID_SIZE; i++) {
            const row = Math.floor(i / GAME_CONFIG.SCENE.GRID_COLS);
            const col = i % GAME_CONFIG.SCENE.GRID_COLS;
            
            const x = (col - 1) * GAME_CONFIG.SCENE.GRID_SPACING;
            const z = (row - 0.5) * GAME_CONFIG.SCENE.GRID_SPACING + layerZ;
            
            const material = new THREE.MeshStandardMaterial({
                color: GAME_CONFIG.CELL.FUTURE_COLOR,
                roughness: 0.3,
                metalness: 0.1,
                transparent: true,
                opacity: Math.max(0.2, opacity)
            });
            
            const cell = new THREE.Mesh(geometry, material);
            cell.position.set(x, 0, z);
            cell.castShadow = false;
            cell.receiveShadow = true;
            cell.userData = { 
                index: i,
                layerIndex: newLayerIndex,
                state: CELL_STATE.HIDDEN,
                originalY: 0,
                originalColor: GAME_CONFIG.CELL.FUTURE_COLOR,
                originalOpacity: Math.max(0.2, opacity),
                isCurrentLayer: false
            };
            
            this.scene.add(cell);
            layerCells.push(cell);
        }
        
        this.layers.push(layerCells);
    }
    
    /**
     * 重置所有層級（用於新遊戲）
     */
    resetGrid() {
        // 清除所有現有層級
        this.layers.forEach(layer => {
            layer.forEach(cell => {
                this.scene.remove(cell);
            });
        });
        
        this.layers = [];
        this.currentLayerIndex = 0;
        
        // 重新創建格子網格
        this.createGrid();
    }
    
    /**
     * 獲取當前顯示的層級範圍
     */
    getCurrentDisplayLevels() {
        if (!window.gameLogic) return "1-4";
        
        const currentLevel = window.gameLogic.currentLevel;
        return `${currentLevel}-${currentLevel + 3}`;
    }
    
    /**
     * 渲染循環
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // 相機輕微旋轉效果
        const time = Date.now() * 0.0005;
        this.camera.position.x = Math.cos(time) * 0.5;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
}

// 應用程序入口點
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 初始化無限層級博弈遊戲...');
    
    // 初始化各個模組
    window.uiManager = new UIManager();
    window.gameLogic = new GameLogic(window.uiManager);
    window.game3D = new Game3D();
    window.debugManager = new DebugManager();
    
    console.log('✅ 遊戲初始化完成！');
    console.log('💡 開啟瀏覽器控制台使用 gameDebug.help() 查看調試指令');
});