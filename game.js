class Game2048 {
    constructor() {
        this.grid = [];
        this.size = 4;
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('bestScore') || '0');
        this.won = false;
        this.over = false;
        this.history = []; // 게임 상태 히스토리 저장
        this.init();
    }

    init() {
        this.createGrid();
        this.updateBestScore();
        this.addRandomTile();
        this.addRandomTile();
        this.saveState(); // 초기 상태 저장
        this.updateDisplay();
        this.setupKeyboard();
        this.setupTouch(); // 터치 제스처 설정
        this.setupUndoButton();
    }

    createGrid() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        const container = document.getElementById('grid-container');
        container.innerHTML = '';
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                container.appendChild(cell);
            }
        }
    }

    addRandomTile() {
        const emptyCells = [];
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    emptyCells.push({ row: i, col: j });
                }
            }
        }

        if (emptyCells.length > 0) {
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            this.grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    updateDisplay() {
        const container = document.getElementById('grid-container');
        const cells = container.querySelectorAll('.grid-cell');
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const value = this.grid[row][col];
            
            cell.innerHTML = '';
            if (value !== 0) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${value}`;
                tile.textContent = value;
                cell.appendChild(tile);
            }
        });

        document.getElementById('score').textContent = this.score;
    }

    move(direction) {
        if (this.over) return false;

        // 이동 전 상태 저장
        this.saveState();

        const previousGrid = this.grid.map(row => [...row]);
        let moved = false;

        switch (direction) {
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
        }

        if (moved) {
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameState();
        } else {
            // 이동이 없었으면 저장한 상태를 제거 (히스토리에서 마지막 항목 제거)
            this.history.pop();
        }

        return moved;
    }

    moveLeft() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = 0; j < row.length; j++) {
                if (j < row.length - 1 && row[j] === row[j + 1]) {
                    newRow.push(row[j] * 2);
                    this.score += row[j] * 2;
                    j++;
                } else {
                    newRow.push(row[j]);
                }
            }
            
            while (newRow.length < this.size) {
                newRow.push(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveRight() {
        let moved = false;
        for (let i = 0; i < this.size; i++) {
            const row = this.grid[i].filter(val => val !== 0);
            const newRow = [];
            
            for (let j = row.length - 1; j >= 0; j--) {
                if (j > 0 && row[j] === row[j - 1]) {
                    newRow.unshift(row[j] * 2);
                    this.score += row[j] * 2;
                    j--;
                } else {
                    newRow.unshift(row[j]);
                }
            }
            
            while (newRow.length < this.size) {
                newRow.unshift(0);
            }
            
            if (JSON.stringify(this.grid[i]) !== JSON.stringify(newRow)) {
                moved = true;
            }
            this.grid[i] = newRow;
        }
        return moved;
    }

    moveUp() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const newColumn = [];
            for (let i = 0; i < column.length; i++) {
                if (i < column.length - 1 && column[i] === column[i + 1]) {
                    newColumn.push(column[i] * 2);
                    this.score += column[i] * 2;
                    i++;
                } else {
                    newColumn.push(column[i]);
                }
            }
            
            while (newColumn.length < this.size) {
                newColumn.push(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    moveDown() {
        let moved = false;
        for (let j = 0; j < this.size; j++) {
            const column = [];
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== 0) {
                    column.push(this.grid[i][j]);
                }
            }
            
            const newColumn = [];
            for (let i = column.length - 1; i >= 0; i--) {
                if (i > 0 && column[i] === column[i - 1]) {
                    newColumn.unshift(column[i] * 2);
                    this.score += column[i] * 2;
                    i--;
                } else {
                    newColumn.unshift(column[i]);
                }
            }
            
            while (newColumn.length < this.size) {
                newColumn.unshift(0);
            }
            
            for (let i = 0; i < this.size; i++) {
                if (this.grid[i][j] !== newColumn[i]) {
                    moved = true;
                }
                this.grid[i][j] = newColumn[i];
            }
        }
        return moved;
    }

    checkGameState() {
        // 2048 달성 확인
        if (!this.won) {
            for (let i = 0; i < this.size; i++) {
                for (let j = 0; j < this.size; j++) {
                    if (this.grid[i][j] === 2048) {
                        this.won = true;
                        document.getElementById('game-won').classList.add('show');
                        return;
                    }
                }
            }
        }

        // 게임 오버 확인
        if (this.isGameOver()) {
            this.over = true;
            document.getElementById('game-over').classList.add('show');
        }
    }

    isGameOver() {
        // 빈 칸이 있는지 확인
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.grid[i][j] === 0) {
                    return false;
                }
            }
        }

        // 인접한 타일이 같은지 확인
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const current = this.grid[i][j];
                if (
                    (i < this.size - 1 && this.grid[i + 1][j] === current) ||
                    (j < this.size - 1 && this.grid[i][j + 1] === current)
                ) {
                    return false;
                }
            }
        }

        return true;
    }

    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            // 게임 오버 상태에서도 뒤로 무르기는 가능
            if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                this.undo();
                return;
            }

            if (this.over && !this.won) return;

            switch (e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.move('left');
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.move('right');
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.move('up');
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.move('down');
                    break;
            }

            // 최고 점수 업데이트
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore.toString());
                this.updateBestScore();
            }

            // 이동 후 undo 버튼 상태 업데이트
            this.updateUndoButton();
        });
    }

    setupTouch() {
        let touchStartX = null;
        let touchStartY = null;
        let touchEndX = null;
        let touchEndY = null;
        const minSwipeDistance = 30; // 최소 스와이프 거리

        const gameContainer = document.getElementById('grid-container');
        
        gameContainer.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });

        gameContainer.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe();
        }, { passive: true });

        this.handleSwipe = () => {
            if (!touchStartX || !touchStartY || !touchEndX || !touchEndY) return;

            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // 게임 오버 상태에서는 뒤로 무르기만 가능
            if (this.over && !this.won) return;

            // 수평 스와이프가 더 크면 좌우 이동
            if (absDeltaX > absDeltaY && absDeltaX > minSwipeDistance) {
                if (deltaX > 0) {
                    this.move('right');
                } else {
                    this.move('left');
                }
            }
            // 수직 스와이프가 더 크면 상하 이동
            else if (absDeltaY > absDeltaX && absDeltaY > minSwipeDistance) {
                if (deltaY > 0) {
                    this.move('down');
                } else {
                    this.move('up');
                }
            }

            // 최고 점수 업데이트
            if (this.score > this.bestScore) {
                this.bestScore = this.score;
                localStorage.setItem('bestScore', this.bestScore.toString());
                this.updateBestScore();
            }

            // 이동 후 undo 버튼 상태 업데이트
            this.updateUndoButton();

            // 터치 좌표 초기화
            touchStartX = null;
            touchStartY = null;
            touchEndX = null;
            touchEndY = null;
        };
    }

    updateBestScore() {
        document.getElementById('best-score').textContent = this.bestScore;
    }

    saveState() {
        // 현재 게임 상태를 깊은 복사로 저장
        const state = {
            grid: this.grid.map(row => [...row]),
            score: this.score,
            won: this.won,
            over: this.over
        };
        this.history.push(state);
        
        // 히스토리 크기 제한 (메모리 관리)
        if (this.history.length > 50) {
            this.history.shift();
        }
    }

    undo() {
        // 히스토리가 없거나 초기 상태만 있으면 무를 수 없음
        if (this.history.length <= 1) {
            return false;
        }

        // 마지막 상태 제거 (현재 상태)
        this.history.pop();
        
        // 이전 상태로 복원
        const previousState = this.history[this.history.length - 1];
        this.grid = previousState.grid.map(row => [...row]);
        this.score = previousState.score;
        this.won = previousState.won;
        this.over = previousState.over;

        // 항상 팝업을 먼저 닫고, 복원된 상태에 따라 다시 표시
        document.getElementById('game-over').classList.remove('show');
        document.getElementById('game-won').classList.remove('show');

        // 복원된 상태가 게임 오버나 승리 상태라면 다시 표시
        if (this.over) {
            document.getElementById('game-over').classList.add('show');
        }
        if (this.won) {
            document.getElementById('game-won').classList.add('show');
        }

        this.updateDisplay();
        this.updateUndoButton();
        return true;
    }

    updateUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            // 히스토리가 1개 이하면 버튼 비활성화
            if (this.history.length <= 1) {
                undoBtn.disabled = true;
                undoBtn.style.opacity = '0.5';
            } else {
                undoBtn.disabled = false;
                undoBtn.style.opacity = '1';
            }
        }
    }

    setupUndoButton() {
        const undoBtn = document.getElementById('undo-btn');
        if (undoBtn) {
            undoBtn.addEventListener('click', () => {
                this.undo();
            });
            this.updateUndoButton();
        }
    }

    newGame() {
        this.grid = Array(this.size).fill(null).map(() => Array(this.size).fill(0));
        this.score = 0;
        this.won = false;
        this.over = false;
        this.history = []; // 히스토리 초기화
        document.getElementById('game-over').classList.remove('show');
        document.getElementById('game-won').classList.remove('show');
        this.addRandomTile();
        this.addRandomTile();
        this.saveState(); // 초기 상태 저장
        this.updateDisplay();
        this.updateUndoButton();
    }

    continueGame() {
        this.won = false;
        document.getElementById('game-won').classList.remove('show');
        this.updateUndoButton();
    }
}

// 게임 시작
const game = new Game2048();
