// 遊戲配置文件 - 定義所有關鍵遊戲參數
const GAME_CONFIG = {
    // 遊戲基本設定
    INITIAL_BALANCE: 10000,        // 初始本金
    GRID_SIZE: 6,                  // 每層格子數量
    BOMB_COUNT: 1,                 // 每層炸彈數量
    
    // 下注設定
    MIN_BET: 100,                  // 最小下注額
    MAX_BET: 1000,                 // 最大下注額
    BET_STEP: 100,                 // 下注間距
    
    // 獎金計算
    WIN_MULTIPLIER: 1 + 1/6,       // 勝利倍數 (1 + 1/6)
    
    // 3D 場景設定
    SCENE: {
        CAMERA_POSITION: { x: 0, y: 5, z: 12 },
        GRID_SPACING: 1.5,         // 格子間距
        GRID_ROWS: 2,              // 格子排列：2行3列
        GRID_COLS: 3,
        LAYER_SPACING: 3,          // 層間距
        VISIBLE_LAYERS: 4,         // 顯示層數（當前層+下3層）
        LAYER_DEPTH_FADE: 0.3      // 下層透明度遞減係數
    },
    
    // 格子視覺設定
    CELL: {
        SIZE: 1,                   // 格子大小
        HEIGHT: 0.2,               // 格子高度
        SAFE_COLOR: 0x4CAF50,      // 安全格子顏色（綠色）
        BOMB_COLOR: 0xFF5722,      // 炸彈格子顏色（紅色）
        DEFAULT_COLOR: 0x2196F3,   // 預設格子顏色（藍色）
        HOVER_COLOR: 0xFFEB3B,     // 懸停顏色（黃色）
        FUTURE_COLOR: 0x9E9E9E,    // 未來層顏色（灰色）
        CURRENT_OPACITY: 1.0,      // 當前層透明度
        FUTURE_OPACITY: 0.6        // 未來層透明度
    },
    
    // 動畫設定
    ANIMATION: {
        DURATION: 1000,            // 動畫持續時間（毫秒）
        BOUNCE_HEIGHT: 0.5         // 彈跳高度
    },
    
    // 調試設定
    DEBUG: {
        ENABLED: false,            // 是否啟用調試模式
        SHOW_BOMB_POSITION: false  // 是否顯示炸彈位置
    }
};

// 遊戲狀態常數
const GAME_STATE = {
    WAITING: 'waiting',           // 等待玩家選擇
    SELECTING: 'selecting',       // 玩家選擇中
    REVEALING: 'revealing',       // 顯示結果
    WIN: 'win',                   // 勝利
    LOSE: 'lose',                 // 失敗
    GAME_OVER: 'gameOver'         // 遊戲結束
};

// 格子狀態常數
const CELL_STATE = {
    HIDDEN: 'hidden',             // 隱藏狀態
    SAFE: 'safe',                 // 安全格子
    BOMB: 'bomb',                 // 炸彈格子
    SELECTED: 'selected'          // 已選擇
};