class Minesweeper {
    constructor(rows = 10, cols = 10, mines = 10) {
        this.rows = rows;
        this.cols = cols;
        this.mines = mines;
        this.board = [];
        this.revealed = new Array(rows).fill(0).map(() => new Array(cols).fill(false));
        this.flags = new Array(rows).fill(0).map(() => new Array(cols).fill(false));
        this.gameOver = false;
        this.win = false;
        this.initializeBoard();
    }

    initializeBoard() {
        // 初始化空白棋盘
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = 0;
            }
        }

        // 随机放置地雷
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (this.board[row][col] !== -1) {
                this.board[row][col] = -1;
                minesPlaced++;
            }
        }

        // 计算每个格子周围的地雷数
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j] !== -1) {
                    this.board[i][j] = this.countAdjacentMines(i, j);
                }
            }
        }
    }

    countAdjacentMines(row, col) {
        let count = 0;
        for (let i = Math.max(0, row - 1); i <= Math.min(this.rows - 1, row + 1); i++) {
            for (let j = Math.max(0, col - 1); j <= Math.min(this.cols - 1, col + 1); j++) {
                if (this.board[i][j] === -1) {
                    count++;
                }
            }
        }
        return count;
    }

    revealCell(row, col) {
        if (this.gameOver || this.revealed[row][col] || this.flags[row][col]) return;

        this.revealed[row][col] = true;

        if (this.board[row][col] === -1) {
            this.gameOver = true;
            return;
        }

        if (this.board[row][col] === 0) {
            for (let i = Math.max(0, row - 1); i <= Math.min(this.rows - 1, row + 1); i++) {
                for (let j = Math.max(0, col - 1); j <= Math.min(this.cols - 1, col + 1); j++) {
                    this.revealCell(i, j);
                }
            }
        }

        // 检查是否获胜
        let unrevealedNonMineCells = 0;
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.revealed[i][j] && this.board[i][j] !== -1) {
                    unrevealedNonMineCells++;
                }
            }
        }
        if (unrevealedNonMineCells === 0) {
            this.gameOver = true;
            this.win = true;
        }
    }

    toggleFlag(row, col) {
        if (this.gameOver || this.revealed[row][col]) return;
        this.flags[row][col] = !this.flags[row][col];
    }
}

// 游戏初始化
function initGame() {
    const game = new Minesweeper();
    const boardElement = document.getElementById('game-board');
    const mineCountElement = document.getElementById('mine-count');
    const restartButton = document.getElementById('restart');

    boardElement.style.gridTemplateRows = `repeat(${game.rows}, 20px)`;
    boardElement.style.gridTemplateColumns = `repeat(${game.cols}, 20px)`;

    const cells = [];
    for (let i = 0; i < game.rows; i++) {
        cells[i] = [];
        for (let j = 0; j < game.cols; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            
            cell.addEventListener('click', () => {
                game.revealCell(i, j);
                updateBoard();
            });

            cell.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                game.toggleFlag(i, j);
                updateBoard();
            });

            boardElement.appendChild(cell);
            cells[i][j] = cell;
        }
    }

    function updateBoard() {
        mineCountElement.textContent = game.mines - 
            game.flags.flat().filter(Boolean).length;

        for (let i = 0; i < game.rows; i++) {
            for (let j = 0; j < game.cols; j++) {
                if (game.revealed[i][j]) {
                    cells[i][j].classList.add('revealed');
                    if (game.board[i][j] === -1) {
                        cells[i][j].textContent = '💣';
                    } else if (game.board[i][j] > 0) {
                        cells[i][j].textContent = game.board[i][j];
                    }
                } else if (game.flags[i][j]) {
                    cells[i][j].classList.add('flagged');
                    cells[i][j].textContent = '🚩';
                } else {
                    cells[i][j].classList.remove('revealed', 'flagged');
                    cells[i][j].textContent = '';
                }
            }
        }

        if (game.gameOver) {
            if (game.win) {
                alert('恭喜你，获胜了！');
            } else {
                alert('游戏结束，你踩到地雷了！');
            }
        }
    }

    restartButton.addEventListener('click', () => {
        boardElement.innerHTML = '';
        initGame();
    });

    updateBoard();
}

window.addEventListener('DOMContentLoaded', initGame);