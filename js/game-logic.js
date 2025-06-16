// 遊戲邏輯模組 - 處理核心遊戲機制
class GameLogic {
    constructor(uiManager) {
        this.uiManager = uiManager;
        this.reset();
    }
    
    /**
     * 重置遊戲狀態到初始值
     */
    reset() {
        this.balance = GAME_CONFIG.INITIAL_BALANCE;
        this.accumulatedPrize = 0;
        this.currentLevel = 1;
        this.currentBet = GAME_CONFIG.MIN_BET;
        this.gameState = GAME_STATE.WAITING;
        this.bombPosition = -1;
        this.selectedCell = -1;
        
        // 生成當前層的炸彈位置
        this.generateBombPosition();
        
        // 更新 UI
        this.updateUI();
    }
    
    /**
     * 生成炸彈位置（隨機）
     */
    generateBombPosition() {
        this.bombPosition = Math.floor(Math.random() * GAME_CONFIG.GRID_SIZE);
        
        // 調試模式下顯示炸彈位置
        if (GAME_CONFIG.DEBUG.SHOW_BOMB_POSITION) {
            console.log(`當前層 ${this.currentLevel} 的炸彈位置: ${this.bombPosition}`);
        }
    }
    
    /**
     * 玩家選擇格子
     * @param {number} cellIndex - 選擇的格子索引 (0-5)
     */
    selectCell(cellIndex) {
        // 檢查遊戲狀態是否允許選擇
        if (this.gameState !== GAME_STATE.WAITING) {
            return false;
        }
        
        // 檢查下注金額是否足夠
        if (this.currentBet > this.balance + this.accumulatedPrize) {
            this.uiManager.showStatusMessage('資金不足！', 2000, '#FF5722');
            return false;
        }
        
        this.selectedCell = cellIndex;
        this.gameState = GAME_STATE.SELECTING;
        this.uiManager.updateButtonStates(this.gameState);
        
        // 延遲顯示結果以增加緊張感
        setTimeout(() => {
            this.revealCell(cellIndex);
        }, 500);
        
        return true;
    }
    
    /**
     * 顯示格子結果
     * @param {number} cellIndex - 格子索引
     */
    revealCell(cellIndex) {
        this.gameState = GAME_STATE.REVEALING;
        
        if (cellIndex === this.bombPosition) {
            // 選中炸彈 - 遊戲失敗
            this.handleBombHit();
        } else {
            // 安全通過 - 進入下一層
            this.handleSafeWin();
        }
    }
    
    /**
     * 處理炸彈爆炸
     */
    handleBombHit() {
        this.gameState = GAME_STATE.LOSE;
        
        // 清空累積獎金和本金
        this.accumulatedPrize = 0;
        this.balance = 0;
        
        // 顯示失敗訊息
        this.uiManager.showStatusMessage('💥 炸彈爆炸！遊戲結束！', 3000, '#FF5722');
        
        // 更新 UI
        this.updateUI();
        
        // 通知 3D 場景顯示炸彈動畫
        if (window.game3D) {
            window.game3D.showBombExplosion(this.selectedCell);
        }
    }
    
    /**
     * 處理安全勝利
     */
    handleSafeWin() {
        this.gameState = GAME_STATE.WIN;
        
        // 計算當層獎金: bet × (1 + 1/6)
        const layerPrize = Math.floor(this.currentBet * GAME_CONFIG.WIN_MULTIPLIER);
        this.accumulatedPrize += layerPrize;
        
        // 進入下一層
        this.currentLevel++;
        this.generateBombPosition();
        
        // 顯示勝利訊息
        this.uiManager.showStatusMessage(
            `✅ 安全通過！獎金 +$${layerPrize.toLocaleString()}`, 
            2000, 
            '#4CAF50'
        );
        
        // 更新 UI
        this.updateUI();
        
        // 通知 3D 場景顯示勝利動畫
        if (window.game3D) {
            window.game3D.showSafeWin(this.selectedCell);
            
            // 延遲重置格子以準備下一層
            setTimeout(() => {
                window.game3D.prepareNextLevel();
                this.gameState = GAME_STATE.WAITING;
                this.uiManager.updateButtonStates(this.gameState);
            }, 1500);
        }
    }
    
    /**
     * 設置下注金額
     * @param {number} amount - 下注金額
     */
    setBetAmount(amount) {
        if (amount >= GAME_CONFIG.MIN_BET && amount <= GAME_CONFIG.MAX_BET) {
            this.currentBet = amount;
        }
    }
    
    /**
     * 領取獎金
     */
    claimPrize() {
        if (this.accumulatedPrize > 0) {
            this.balance += this.accumulatedPrize;
            const claimedAmount = this.accumulatedPrize;
            this.accumulatedPrize = 0;
            this.currentLevel = 1;
            
            // 顯示領獎訊息
            this.uiManager.showStatusMessage(
                `🏆 成功領獎 $${claimedAmount.toLocaleString()}！`, 
                2000, 
                '#FFD700'
            );
            
            // 重新開始新一輪
            this.startNewRound();
        } else {
            this.uiManager.showStatusMessage('沒有可領取的獎金！', 1500, '#FF9800');
        }
    }
    
    /**
     * 開始新一輪遊戲
     */
    startNewRound() {
        this.currentLevel = 1;
        this.accumulatedPrize = 0;
        this.generateBombPosition();
        this.gameState = GAME_STATE.WAITING;
        
        this.updateUI();
        
        // 重置 3D 場景
        if (window.game3D) {
            window.game3D.resetGrid();
        }
    }
    
    /**
     * 開始新遊戲（用於遊戲結束後）
     */
    startNewGame() {
        this.balance = GAME_CONFIG.INITIAL_BALANCE;
        this.startNewRound();
        
        this.uiManager.showStatusMessage('🎮 新遊戲開始！', 1500, '#2196F3');
    }
    
    /**
     * 更新所有 UI 元素
     */
    updateUI() {
        this.uiManager.updateBalance(this.balance);
        this.uiManager.updateAccumulatedPrize(this.accumulatedPrize);
        this.uiManager.updateCurrentLevel(this.currentLevel);
        this.uiManager.updateBetAmount(this.currentBet);
        this.uiManager.updateButtonStates(this.gameState);
    }
    
    /**
     * 獲取當前遊戲狀態（用於調試）
     */
    getGameState() {
        return {
            balance: this.balance,
            accumulatedPrize: this.accumulatedPrize,
            currentLevel: this.currentLevel,
            currentBet: this.currentBet,
            gameState: this.gameState,
            bombPosition: this.bombPosition,
            selectedCell: this.selectedCell
        };
    }
}