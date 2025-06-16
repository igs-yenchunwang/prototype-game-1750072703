// 調試工具模組 - 提供遊戲調試和測試功能
class DebugManager {
    constructor() {
        this.isEnabled = GAME_CONFIG.DEBUG.ENABLED;
        
        if (this.isEnabled) {
            this.setupDebugCommands();
            console.log('🔧 調試模式已啟用');
            console.log('使用 game.debug.help() 查看可用指令');
        }
    }
    
    /**
     * 設置調試指令
     */
    setupDebugCommands() {
        // 將調試功能綁定到全局對象
        window.gameDebug = {
            help: this.showHelp.bind(this),
            state: this.showGameState.bind(this),
            setBomb: this.setBombPosition.bind(this),
            setLevel: this.setLevel.bind(this),
            addMoney: this.addMoney.bind(this),
            simulateWins: this.simulateWins.bind(this),
            testPrizeCalculation: this.testPrizeCalculation.bind(this),
            enableBombDisplay: this.enableBombDisplay.bind(this),
            disableBombDisplay: this.disableBombDisplay.bind(this)
        };
    }
    
    /**
     * 顯示幫助信息
     */
    showHelp() {
        console.log(`
🔧 調試指令幫助:
===================
gameDebug.help()                    - 顯示此幫助信息
gameDebug.state()                   - 顯示當前遊戲狀態
gameDebug.setBomb(position)         - 設置炸彈位置 (0-5)
gameDebug.setLevel(level)           - 設置當前層數
gameDebug.addMoney(amount)          - 增加本金
gameDebug.simulateWins(count)       - 模擬連續勝利
gameDebug.testPrizeCalculation()    - 測試獎金計算
gameDebug.enableBombDisplay()       - 啟用炸彈位置顯示
gameDebug.disableBombDisplay()      - 禁用炸彈位置顯示

範例:
gameDebug.setBomb(2)               - 將炸彈設置在位置 2
gameDebug.simulateWins(5)          - 模擬連續 5 次勝利
        `);
    }
    
    /**
     * 顯示當前遊戲狀態
     */
    showGameState() {
        if (!window.gameLogic) {
            console.error('遊戲邏輯未初始化');
            return;
        }
        
        const state = window.gameLogic.getGameState();
        console.table(state);
        console.log(`炸彈位置: ${state.bombPosition} (0-5)`);
    }
    
    /**
     * 設置炸彈位置
     * @param {number} position - 炸彈位置 (0-5)
     */
    setBombPosition(position) {
        if (!window.gameLogic) {
            console.error('遊戲邏輯未初始化');
            return;
        }
        
        if (position < 0 || position >= GAME_CONFIG.GRID_SIZE) {
            console.error(`無效位置: ${position}，應在 0-${GAME_CONFIG.GRID_SIZE - 1} 範圍內`);
            return;
        }
        
        window.gameLogic.bombPosition = position;
        console.log(`✅ 炸彈位置已設置為: ${position}`);
    }
    
    /**
     * 設置當前層數
     * @param {number} level - 層數
     */
    setLevel(level) {
        if (!window.gameLogic) {
            console.error('遊戲邏輯未初始化');
            return;
        }
        
        if (level < 1) {
            console.error('層數必須大於 0');
            return;
        }
        
        window.gameLogic.currentLevel = level;
        window.gameLogic.updateUI();
        console.log(`✅ 當前層數已設置為: ${level}`);
    }
    
    /**
     * 增加本金
     * @param {number} amount - 增加金額
     */
    addMoney(amount) {
        if (!window.gameLogic) {
            console.error('遊戲邏輯未初始化');
            return;
        }
        
        window.gameLogic.balance += amount;
        window.gameLogic.updateUI();
        console.log(`✅ 本金已增加 $${amount.toLocaleString()}`);
    }
    
    /**
     * 模擬連續勝利
     * @param {number} count - 勝利次數
     */
    simulateWins(count) {
        if (!window.gameLogic) {
            console.error('遊戲邏輯未初始化');
            return;
        }
        
        console.log(`🎮 開始模擬 ${count} 次連續勝利...`);
        
        const initialPrize = window.gameLogic.accumulatedPrize;
        let totalPrize = initialPrize;
        
        for (let i = 0; i < count; i++) {
            const layerPrize = Math.floor(window.gameLogic.currentBet * GAME_CONFIG.WIN_MULTIPLIER);
            totalPrize += layerPrize;
            window.gameLogic.currentLevel++;
            
            console.log(`第 ${i + 1} 次勝利 - 層數: ${window.gameLogic.currentLevel}, 獎金: +$${layerPrize}`);
        }
        
        window.gameLogic.accumulatedPrize = totalPrize;
        window.gameLogic.updateUI();
        
        console.log(`✅ 模擬完成！累積獎金: $${totalPrize.toLocaleString()}`);
    }
    
    /**
     * 測試獎金計算
     */
    testPrizeCalculation() {
        console.log('🧮 測試獎金計算公式...');
        
        const testBets = [100, 200, 500, 1000];
        const multiplier = GAME_CONFIG.WIN_MULTIPLIER;
        
        console.table(testBets.map(bet => ({
            '下注金額': `$${bet}`,
            '勝利倍數': multiplier.toFixed(4),
            '獎金': `$${Math.floor(bet * multiplier)}`,
            '公式': `${bet} × ${multiplier.toFixed(4)} = ${(bet * multiplier).toFixed(2)}`
        })));
    }
    
    /**
     * 啟用炸彈位置顯示
     */
    enableBombDisplay() {
        GAME_CONFIG.DEBUG.SHOW_BOMB_POSITION = true;
        console.log('✅ 炸彈位置顯示已啟用');
        
        // 顯示當前炸彈位置
        if (window.gameLogic) {
            console.log(`當前炸彈位置: ${window.gameLogic.bombPosition}`);
        }
    }
    
    /**
     * 禁用炸彈位置顯示
     */
    disableBombDisplay() {
        GAME_CONFIG.DEBUG.SHOW_BOMB_POSITION = false;
        console.log('✅ 炸彈位置顯示已禁用');
    }
    
    /**
     * 自動測試遊戲邏輯
     */
    autoTest() {
        console.log('🧪 開始自動測試...');
        
        // 測試獎金計算
        this.testPrizeCalculation();
        
        // 測試 10 層勝利的累積獎金
        console.log('\n📊 測試 10 層連續勝利的獎金累積:');
        
        let totalPrize = 0;
        const bet = 100;
        
        for (let level = 1; level <= 10; level++) {
            const layerPrize = Math.floor(bet * GAME_CONFIG.WIN_MULTIPLIER);
            totalPrize += layerPrize;
            
            if (level <= 5 || level === 10) {
                console.log(`層數 ${level}: 單層獎金 $${layerPrize}, 累積 $${totalPrize}`);
            } else if (level === 6) {
                console.log('...');
            }
        }
        
        const expectedTotal = Math.floor(bet * GAME_CONFIG.WIN_MULTIPLIER * 10);
        const actualFormula = `${bet} × ${GAME_CONFIG.WIN_MULTIPLIER.toFixed(4)} × 10 = ${expectedTotal}`;
        
        console.log(`\n✅ 期望總獎金: $${expectedTotal} (${actualFormula})`);
        console.log(`✅ 實際累積: $${totalPrize}`);
        console.log(`✅ 計算${totalPrize === expectedTotal ? '正確' : '錯誤'}！`);
    }
}