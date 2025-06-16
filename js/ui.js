// UI 管理模組 - 處理所有用戶界面互動與更新
class UIManager {
    constructor() {
        this.elements = {
            balance: document.getElementById('balance'),
            accumulatedPrize: document.getElementById('accumulated-prize'),
            currentLevel: document.getElementById('current-level'),
            visibleLayers: document.getElementById('visible-layers'),
            betAmount: document.getElementById('bet-amount'),
            betSlider: document.getElementById('bet-slider'),
            claimButton: document.getElementById('claim-button'),
            newGameButton: document.getElementById('new-game-button'),
            statusMessage: document.getElementById('status-message')
        };
        
        this.initializeEventListeners();
    }
    
    /**
     * 初始化事件監聽器
     */
    initializeEventListeners() {
        // BET 滑桿事件
        this.elements.betSlider.addEventListener('input', (e) => {
            const betAmount = parseInt(e.target.value);
            this.updateBetAmount(betAmount);
            
            // 通知遊戲邏輯模組更新下注金額
            if (window.gameLogic) {
                window.gameLogic.setBetAmount(betAmount);
            }
        });
        
        // 領獎按鈕事件
        this.elements.claimButton.addEventListener('click', () => {
            if (window.gameLogic) {
                window.gameLogic.claimPrize();
            }
        });
        
        // 重新開始按鈕事件
        this.elements.newGameButton.addEventListener('click', () => {
            if (window.gameLogic) {
                window.gameLogic.startNewGame();
            }
        });
    }
    
    /**
     * 更新本金顯示
     * @param {number} balance - 本金金額
     */
    updateBalance(balance) {
        this.elements.balance.textContent = balance.toLocaleString();
    }
    
    /**
     * 更新累積獎金顯示
     * @param {number} prize - 累積獎金
     */
    updateAccumulatedPrize(prize) {
        this.elements.accumulatedPrize.textContent = prize.toLocaleString();
        
        // 獎金數字跳動動畫
        this.animateNumber(this.elements.accumulatedPrize);
    }
    
    /**
     * 更新當前層數顯示
     * @param {number} level - 層數
     */
    updateCurrentLevel(level) {
        this.elements.currentLevel.textContent = level;
        
        // 更新顯示層級範圍
        this.updateVisibleLayers(level);
        
        // 層數更新動畫
        this.animateNumber(this.elements.currentLevel);
    }
    
    /**
     * 更新顯示層級範圍
     * @param {number} currentLevel - 當前層數
     */
    updateVisibleLayers(currentLevel) {
        const endLevel = currentLevel + 3;
        this.elements.visibleLayers.textContent = `${currentLevel}-${endLevel}`;
        
        // 顯示層級更新動畫
        this.animateNumber(this.elements.visibleLayers);
    }
    
    /**
     * 更新下注金額顯示
     * @param {number} amount - 下注金額
     */
    updateBetAmount(amount) {
        this.elements.betAmount.textContent = amount.toLocaleString();
        this.elements.betSlider.value = amount;
    }
    
    /**
     * 顯示狀態消息
     * @param {string} message - 消息內容
     * @param {number} duration - 顯示時間（毫秒）
     * @param {string} color - 消息顏色
     */
    showStatusMessage(message, duration = 2000, color = '#4CAF50') {
        this.elements.statusMessage.textContent = message;
        this.elements.statusMessage.style.color = color;
        this.elements.statusMessage.style.display = 'block';
        
        // 淡入效果
        this.elements.statusMessage.style.opacity = '0';
        this.elements.statusMessage.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.elements.statusMessage.style.transition = 'all 0.3s ease';
            this.elements.statusMessage.style.opacity = '1';
            this.elements.statusMessage.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 10);
        
        // 自動隱藏
        setTimeout(() => {
            this.hideStatusMessage();
        }, duration);
    }
    
    /**
     * 隱藏狀態消息
     */
    hideStatusMessage() {
        this.elements.statusMessage.style.transition = 'all 0.3s ease';
        this.elements.statusMessage.style.opacity = '0';
        this.elements.statusMessage.style.transform = 'translate(-50%, -50%) scale(0.8)';
        
        setTimeout(() => {
            this.elements.statusMessage.style.display = 'none';
        }, 300);
    }
    
    /**
     * 數字跳動動畫
     * @param {HTMLElement} element - 目標元素
     */
    animateNumber(element) {
        element.style.transition = 'all 0.2s ease';
        element.style.transform = 'scale(1.2)';
        element.style.color = '#FFD700';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
            element.style.color = '#4CAF50';
        }, 200);
    }
    
    /**
     * 更新按鈕狀態
     * @param {string} state - 遊戲狀態
     */
    updateButtonStates(state) {
        switch (state) {
            case GAME_STATE.WAITING:
                this.elements.claimButton.disabled = false;
                this.elements.claimButton.style.display = 'block';
                this.elements.newGameButton.style.display = 'none';
                this.elements.betSlider.disabled = false;
                break;
                
            case GAME_STATE.SELECTING:
            case GAME_STATE.REVEALING:
                this.elements.claimButton.disabled = true;
                this.elements.betSlider.disabled = true;
                break;
                
            case GAME_STATE.LOSE:
                this.elements.claimButton.style.display = 'none';
                this.elements.newGameButton.style.display = 'block';
                this.elements.betSlider.disabled = false;
                break;
                
            default:
                this.elements.claimButton.disabled = false;
                this.elements.betSlider.disabled = false;
                break;
        }
    }
    
    /**
     * 重置 UI 到初始狀態
     */
    reset() {
        this.updateBalance(GAME_CONFIG.INITIAL_BALANCE);
        this.updateAccumulatedPrize(0);
        this.updateCurrentLevel(1);
        this.updateBetAmount(GAME_CONFIG.MIN_BET);
        this.updateButtonStates(GAME_STATE.WAITING);
        this.hideStatusMessage();
    }
}