/**
 * 贪吃蛇游戏
 * 支持难度等级：简单、中等、困难、专家
 */

class SnakeGame {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');

    // UI 元素
    this.scoreElement = document.getElementById('score');
    this.highScoreElement = document.getElementById('highScore');
    this.speedElement = document.getElementById('speed');
    this.finalScoreElement = document.getElementById('finalScore');
    this.finalDifficultyElement = document.getElementById('finalDifficulty');
    this.gameOverScreen = document.getElementById('gameOver');
    this.pauseScreen = document.getElementById('pauseScreen');
    this.startScreen = document.getElementById('startScreen');

    // 游戏配置
    this.gridSize = 20;
    this.tileCount = this.canvas.width / this.gridSize;

    // 难度配置
    this.difficulties = {
      easy: { name: '简单', baseSpeed: 150, speedIncrement: 1, obstacles: 0, scoreMultiplier: 1 },
      medium: { name: '中等', baseSpeed: 100, speedIncrement: 2, obstacles: 3, scoreMultiplier: 1.5 },
      hard: { name: '困难', baseSpeed: 70, speedIncrement: 3, obstacles: 6, scoreMultiplier: 2 },
      expert: { name: '专家', baseSpeed: 50, speedIncrement: 4, obstacles: 10, scoreMultiplier: 3 }
    };

    // 游戏状态
    this.currentDifficulty = 'medium';
    this.snake = [];
    this.food = {};
    this.obstacles = [];
    this.direction = { x: 0, y: 0 };
    this.nextDirection = { x: 0, y: 0 };
    this.score = 0;
    this.highScore = localStorage.getItem(`snakeHighScore_${this.currentDifficulty}`) || 0;
    this.gameLoop = null;
    this.currentSpeed = 100;
    this.isPaused = true;
    this.isGameOver = false;
    this.isStarted = false;
    this.baseSpeed = 100;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateHighScoreDisplay();
    this.showStartScreen();
    this.draw();
  }

  setupEventListeners() {
    // 键盘控制
    document.addEventListener('keydown', (e) => this.handleKeydown(e));

    // 难度按钮
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', () => this.changeDifficulty(btn.dataset.diff));
    });
  }

  handleKeydown(e) {
    // 防止方向键滚动页面
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault();
    }

    // 空格键开始/暂停
    if (e.keyCode === 32) {
      if (!this.isStarted) {
        this.start();
      } else if (!this.isGameOver) {
        this.togglePause();
      }
      return;
    }

    // 方向键控制（游戏进行中且未暂停）
    if (!this.isStarted || this.isPaused || this.isGameOver) return;

    switch(e.keyCode) {
      case 37: // 左
        if (this.direction.x !== 1) {
          this.nextDirection = { x: -1, y: 0 };
        }
        break;
      case 38: // 上
        if (this.direction.y !== 1) {
          this.nextDirection = { x: 0, y: -1 };
        }
        break;
      case 39: // 右
        if (this.direction.x !== -1) {
          this.nextDirection = { x: 1, y: 0 };
        }
        break;
      case 40: // 下
        if (this.direction.y !== -1) {
          this.nextDirection = { x: 0, y: 1 };
        }
        break;
    }
  }

  changeDifficulty(difficulty) {
    if (this.isStarted && !this.isGameOver) return; // 游戏进行中不能切换难度

    this.currentDifficulty = difficulty;

    // 更新按钮状态
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === difficulty);
    });

    // 更新最高分显示
    this.highScore = localStorage.getItem(`snakeHighScore_${difficulty}`) || 0;
    this.updateHighScoreDisplay();

    // 重置游戏
    this.reset();
  }

  updateHighScoreDisplay() {
    this.highScoreElement.textContent = this.highScore;
  }

  showStartScreen() {
    this.startScreen.style.display = 'flex';
    this.pauseScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
  }

  hideScreens() {
    this.startScreen.style.display = 'none';
    this.pauseScreen.style.display = 'none';
    this.gameOverScreen.style.display = 'none';
  }

  start() {
    if (this.isStarted) return;

    this.isStarted = true;
    this.isPaused = false;
    this.hideScreens();

    const config = this.difficulties[this.currentDifficulty];
    this.baseSpeed = config.baseSpeed;
    this.currentSpeed = config.baseSpeed;

    this.resetGameState();
    this.startGameLoop();
  }

  reset() {
    this.isStarted = false;
    this.isPaused = true;
    this.isGameOver = false;

    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    this.showStartScreen();
    this.resetGameState();
    this.draw();
  }

  restart() {
    this.reset();
    setTimeout(() => this.start(), 100);
  }

  resetGameState() {
    const config = this.difficulties[this.currentDifficulty];

    // 初始化蛇（从中间开始）
    const startX = Math.floor(this.tileCount / 2);
    const startY = Math.floor(this.tileCount / 2);
    this.snake = [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY }
    ];

    this.direction = { x: 1, y: 0 };
    this.nextDirection = { x: 1, y: 0 };
    this.score = 0;
    this.currentSpeed = config.baseSpeed;

    this.scoreElement.textContent = '0';
    this.speedElement.textContent = '1.0';

    // 生成障碍物
    this.generateObstacles(config.obstacles);

    // 放置食物
    this.placeFood();
  }

  generateObstacles(count) {
    this.obstacles = [];
    const startX = Math.floor(this.tileCount / 2);
    const startY = Math.floor(this.tileCount / 2);

    for (let i = 0; i < count; i++) {
      let obstacle;
      let attempts = 0;
      do {
        obstacle = {
          x: Math.floor(Math.random() * this.tileCount),
          y: Math.floor(Math.random() * this.tileCount)
        };
        attempts++;
      } while (
        attempts < 100 &&
        this.isNearSnakeStart(obstacle, startX, startY) ||
        this.isSnakeAt(obstacle.x, obstacle.y) ||
        this.isObstacleAt(obstacle.x, obstacle.y)
      );

      if (attempts < 100) {
        this.obstacles.push(obstacle);
      }
    }
  }

  isNearSnakeStart(pos, startX, startY) {
    return Math.abs(pos.x - startX) <= 3 && Math.abs(pos.y - startY) <= 3;
  }

  isObstacleAt(x, y) {
    return this.obstacles.some(obs => obs.x === x && obs.y === y);
  }

  placeFood() {
    do {
      this.food = {
        x: Math.floor(Math.random() * this.tileCount),
        y: Math.floor(Math.random() * this.tileCount)
      };
    } while (
      this.isSnakeAt(this.food.x, this.food.y) ||
      this.isObstacleAt(this.food.x, this.food.y)
    );
  }

  isSnakeAt(x, y) {
    return this.snake.some(segment => segment.x === x && segment.y === y);
  }

  startGameLoop() {
    if (this.gameLoop) clearInterval(this.gameLoop);
    this.gameLoop = setInterval(() => this.update(), this.currentSpeed);
  }

  update() {
    if (this.isPaused || this.isGameOver) return;

    this.direction = { ...this.nextDirection };

    const head = {
      x: this.snake[0].x + this.direction.x,
      y: this.snake[0].y + this.direction.y
    };

    // 碰撞检测 - 墙壁
    if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
      this.gameOver();
      return;
    }

    // 碰撞检测 - 自身
    if (this.isSnakeAt(head.x, head.y)) {
      this.gameOver();
      return;
    }

    // 碰撞检测 - 障碍物
    if (this.isObstacleAt(head.x, head.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    // 检查是否吃到食物
    if (head.x === this.food.x && head.y === this.food.y) {
      const config = this.difficulties[this.currentDifficulty];
      this.score += Math.floor(10 * config.scoreMultiplier);
      this.scoreElement.textContent = this.score;

      // 更新最高分
      if (this.score > this.highScore) {
        this.highScore = this.score;
        localStorage.setItem(`snakeHighScore_${this.currentDifficulty}`, this.highScore);
        this.updateHighScoreDisplay();
      }

      // 加速
      this.currentSpeed = Math.max(30, this.currentSpeed - config.speedIncrement);
      const speedMultiplier = (this.baseSpeed / this.currentSpeed).toFixed(1);
      this.speedElement.textContent = speedMultiplier;

      this.startGameLoop();
      this.placeFood();
    } else {
      this.snake.pop();
    }

    this.draw();
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    this.pauseScreen.style.display = this.isPaused ? 'flex' : 'none';
  }

  gameOver() {
    this.isGameOver = true;
    clearInterval(this.gameLoop);

    const config = this.difficulties[this.currentDifficulty];
    this.finalDifficultyElement.textContent = config.name;
    this.finalScoreElement.textContent = this.score;
    this.gameOverScreen.style.display = 'flex';
  }

  draw() {
    // 清空画布
    this.ctx.fillStyle = '#0d1117';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 绘制网格
    this.drawGrid();

    // 绘制障碍物
    this.drawObstacles();

    // 绘制蛇
    this.drawSnake();

    // 绘制食物
    this.drawFood();
  }

  drawGrid() {
    this.ctx.strokeStyle = 'rgba(78, 205, 196, 0.05)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.tileCount; i++) {
      const pos = i * this.gridSize;
      this.ctx.beginPath();
      this.ctx.moveTo(pos, 0);
      this.ctx.lineTo(pos, this.canvas.height);
      this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.moveTo(0, pos);
      this.ctx.lineTo(this.canvas.width, pos);
      this.ctx.stroke();
    }
  }

  drawObstacles() {
    this.obstacles.forEach(obs => {
      const x = obs.x * this.gridSize;
      const y = obs.y * this.gridSize;

      // 障碍物渐变
      const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
      gradient.addColorStop(0, '#ff416c');
      gradient.addColorStop(1, '#ff4b2b');

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);

      // 警告符号
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '12px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText('×', x + this.gridSize / 2, y + this.gridSize / 2);
    });
  }

  drawSnake() {
    this.snake.forEach((segment, index) => {
      const x = segment.x * this.gridSize;
      const y = segment.y * this.gridSize;

      if (index === 0) {
        // 蛇头
        this.drawSnakeHead(x, y);
      } else {
        // 蛇身
        this.drawSnakeBody(x, y, index);
      }
    });
  }

  drawSnakeHead(x, y) {
    const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
    gradient.addColorStop(0, '#4ecdc4');
    gradient.addColorStop(1, '#44a08d');

    this.ctx.fillStyle = gradient;
    this.roundRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2, 6);
    this.ctx.fill();

    // 蛇眼
    this.ctx.fillStyle = '#fff';
    const eyeSize = 4;
    const eyeOffset = 5;

    if (this.direction.x === 1) {
      this.ctx.beginPath();
      this.ctx.arc(x + 14, y + 6, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(x + 14, y + 14, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.direction.x === -1) {
      this.ctx.beginPath();
      this.ctx.arc(x + 6, y + 6, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(x + 6, y + 14, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
    } else if (this.direction.y === -1) {
      this.ctx.beginPath();
      this.ctx.arc(x + 6, y + 6, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(x + 14, y + 6, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
    } else {
      this.ctx.beginPath();
      this.ctx.arc(x + 6, y + 14, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.beginPath();
      this.ctx.arc(x + 14, y + 14, eyeSize, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawSnakeBody(x, y, index) {
    const alpha = Math.max(0.3, 1 - index * 0.05);
    const greenValue = Math.max(100, 200 - index * 8);

    this.ctx.fillStyle = `rgba(68, ${greenValue}, 141, ${alpha})`;
    this.roundRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4, 4);
    this.ctx.fill();
  }

  drawFood() {
    const x = this.food.x * this.gridSize;
    const y = this.food.y * this.gridSize;
    const centerX = x + this.gridSize / 2;
    const centerY = y + this.gridSize / 2;

    // 发光效果
    this.ctx.shadowColor = '#ff6b6b';
    this.ctx.shadowBlur = 15;

    // 食物渐变
    const gradient = this.ctx.createRadialGradient(
      centerX, centerY, 2,
      centerX, centerY, this.gridSize / 2 - 2
    );
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#ee5a5a');

    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, this.gridSize / 2 - 3, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowBlur = 0;
  }

  roundRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }
}

// 启动游戏
const game = new SnakeGame();
