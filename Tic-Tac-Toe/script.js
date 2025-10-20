document.addEventListener('DOMContentLoaded', function() {
   
    const authContainer = document.getElementById('auth-container');
    const gameContainer = document.getElementById('game-container');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMessage = document.getElementById('auth-message');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const currentUserSpan = document.getElementById('current-user');
    const logoutBtn = document.getElementById('logout-btn');
    const singlePlayerBtn = document.getElementById('single-player-btn');
    const multiplayerBtn = document.getElementById('multiplayer-btn');
    const gameBoard = document.getElementById('game-board');
    const currentPlayerSpan = document.getElementById('current-player');
    const gameModeDisplay = document.getElementById('game-mode-display');
    const playerInfo = document.getElementById('player-info');
    const resetBtn = document.getElementById('reset-btn');
    const backBtn = document.getElementById('back-btn');
    const gameMessage = document.getElementById('game-message');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    const scoreDraw = document.getElementById('score-draw');
    const playerXLabel = document.getElementById('player-x-label');
    const playerOLabel = document.getElementById('player-o-label');
    const cells = document.querySelectorAll('.cell');
    
   
    let currentPlayer = 'X';
    let gameActive = true;
    let gameState = ['', '', '', '', '', '', '', '', ''];
    let gameMode = null;
    let currentUser = null;
    let isAITurn = false;
    

    let scores = {
        'X': 0,
        'O': 0,
        'draw': 0
    };
    
   
    let users = JSON.parse(localStorage.getItem('tictactoe_users')) || [
        { username: 'somesh', password: 'password123' },
        { username: 'player1', password: 'player1' },
        { username: 'player2', password: 'player2' }
    ];
    

    const winningConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
  
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);
    showRegisterBtn.addEventListener('click', () => toggleAuthForms('register'));
    showLoginBtn.addEventListener('click', () => toggleAuthForms('login'));
    logoutBtn.addEventListener('click', handleLogout);
    singlePlayerBtn.addEventListener('click', () => startGame('single'));
    multiplayerBtn.addEventListener('click', () => startGame('multi'));
    resetBtn.addEventListener('click', resetGame);
    backBtn.addEventListener('click', backToMenu);
    
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });
    
    function toggleAuthForms(form) {
        if (form === 'register') {
            loginSection.classList.add('hidden');
            registerSection.classList.remove('hidden');
        } else {
            registerSection.classList.add('hidden');
            loginSection.classList.remove('hidden');
        }
        clearMessage(authMessage);
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showMessage(authMessage, 'Please fill in all fields', 'error');
            return;
        }
        
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = username;
            currentUserSpan.textContent = currentUser;
            authContainer.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            showMessage(authMessage, 'Login successful!', 'success');
            
            const userScores = JSON.parse(localStorage.getItem(`tictactoe_scores_${username}`));
            if (userScores) {
                scores = userScores;
                updateScoreDisplay();
            }
        } else {
            showMessage(authMessage, 'Invalid username or password', 'error');
        }
        
        loginForm.reset();
    }
    
    function handleRegister(e) {
        e.preventDefault();
        
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (!username || !password || !confirmPassword) {
            showMessage(authMessage, 'Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showMessage(authMessage, 'Passwords do not match', 'error');
            return;
        }
        
        if (username.length < 3) {
            showMessage(authMessage, 'Username must be at least 3 characters', 'error');
            return;
        }
        
        if (password.length < 4) {
            showMessage(authMessage, 'Password must be at least 4 characters', 'error');
            return;
        }
        
        if (users.find(u => u.username === username)) {
            showMessage(authMessage, 'Username already exists', 'error');
            return;
        }
        
        users.push({ username, password });
        localStorage.setItem('tictactoe_users', JSON.stringify(users));
        
        showMessage(authMessage, 'Registration successful! Please login.', 'success');
        toggleAuthForms('login');
        registerForm.reset();
    }
    
    function handleLogout() {
        if (currentUser) {
            localStorage.setItem(`tictactoe_scores_${currentUser}`, JSON.stringify(scores));
        }
        
        currentUser = null;
        gameContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        resetGame();
        gameBoard.classList.add('hidden');
        toggleAuthForms('login');
        showMessage(authMessage, 'You have been logged out', 'info');
    }
    
    function startGame(mode) {
        gameMode = mode;
        isAITurn = false;
        
        if (mode === 'single') {
            gameModeDisplay.textContent = 'Me vs AI';
            playerInfo.textContent = 'You are X - Your turn first!';
            playerXLabel.textContent = 'You (X)';
            playerOLabel.textContent = 'AI (O)';
        } else {
            gameModeDisplay.textContent = 'Me vs Friend';
            playerInfo.textContent = 'Player 1 (X) starts first!';
            playerXLabel.textContent = 'Player 1 (X)';
            playerOLabel.textContent = 'Player 2 (O)';
        }
        
        gameBoard.classList.remove('hidden');
        resetGame();
    }
    
    function handleCellClick(e) {

        if (isAITurn || !gameActive) return;
        
        const clickedCell = e.target;
        const cellIndex = parseInt(clickedCell.getAttribute('data-index'));
        
        if (gameState[cellIndex] !== '') {
            return;
        }
        
        console.log('Player making move at index:', cellIndex);
        makeMove(cellIndex, currentPlayer);
        if (checkResult()) {
            return;
        }
        if (gameMode === 'single' && gameActive) {
            console.log('Triggering AI move');
            triggerAIMove();
        } else if (gameMode === 'multi') {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            currentPlayerSpan.textContent = currentPlayer;
            playerInfo.textContent = `Player ${currentPlayer}'s turn!`;
        }
    }
    
    function triggerAIMove() {
        isAITurn = true;
        playerInfo.textContent = 'AI is thinking...';
        gameBoard.classList.add('ai-thinking');
        
        console.log('AI thinking started');
        
        setTimeout(() => {
            console.log('AI making move now');
            makeAIMove();
            isAITurn = false;
            gameBoard.classList.remove('ai-thinking');
            console.log('AI thinking ended');
        }, 800);
    }
    
    function makeMove(index, player) {
        gameState[index] = player;
        const cell = document.querySelector(`.cell[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
        console.log(`Move made: ${player} at index ${index}`);
    }
    
    function makeAIMove() {
        if (!gameActive) {
            console.log('Game not active, skipping AI move');
            return;
        }
        
        console.log('AI finding move...');
        let move = findWinningMove('O');
        if (move === -1) {
            move = findWinningMove('X');
        }
        if (move === -1) {
            move = findRandomMove();
        }
        
        console.log('AI chosen move:', move);
        
        if (move !== -1) {
            makeMove(move, 'O');
            checkResult();
        } else {
            console.log('No valid move found for AI');
        }
    }
    
    function findWinningMove(player) {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            const values = [gameState[a], gameState[b], gameState[c]];
            
            let playerCount = 0;
            let emptyIndex = -1;
            let emptyCount = 0;
            
            for (let j = 0; j < values.length; j++) {
                if (values[j] === player) {
                    playerCount++;
                } else if (values[j] === '') {
                    emptyIndex = winningConditions[i][j];
                    emptyCount++;
                }
            }
            if (playerCount === 2 && emptyCount === 1) {
                console.log(`Found winning move for ${player} at index ${emptyIndex}`);
                return emptyIndex;
            }
        }
        return -1;
    }
    
    function findRandomMove() {
        const emptyCells = [];
        for (let i = 0; i < gameState.length; i++) {
            if (gameState[i] === '') {
                emptyCells.push(i);
            }
        }
        
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            console.log(`Random move chosen: ${emptyCells[randomIndex]}`);
            return emptyCells[randomIndex];
        }
        return -1;
    }
    
    function checkResult() {
        for (let i = 0; i < winningConditions.length; i++) {
            const [a, b, c] = winningConditions[i];
            if (gameState[a] !== '' && 
                gameState[a] === gameState[b] && 
                gameState[a] === gameState[c]) {
                
                gameActive = false;
                highlightWinningCells(winningConditions[i]);
                
                let winMessage = '';
                if (gameMode === 'single') {
                    winMessage = currentPlayer === 'X' ? 'You win!' : 'AI wins!';
                } else {
                    winMessage = `Player ${currentPlayer} wins!`;
                }
                
                showMessage(gameMessage, winMessage, 'success');
                scores[currentPlayer]++;
                updateScoreDisplay();
                saveScores();
                
                console.log(`Game won by ${currentPlayer}`);
                return true;
            }
        }
        if (!gameState.includes('')) {
            gameActive = false;
            showMessage(gameMessage, 'Game ended in a draw!', 'info');
            scores['draw']++;
            updateScoreDisplay();
            saveScores();
            
            console.log('Game ended in draw');
            return true;
        }
        
        console.log('Game continues');
        return false;
    }
    
    function highlightWinningCells(winningCombo) {
        winningCombo.forEach(index => {
            const cell = document.querySelector(`.cell[data-index="${index}"]`);
            cell.classList.add('winning-cell');
        });
    }
    
    function resetGame() {
        currentPlayer = 'X';
        gameActive = true;
        isAITurn = false;
        gameState = ['', '', '', '', '', '', '', '', ''];
        currentPlayerSpan.textContent = currentPlayer;
        clearMessage(gameMessage);
        
        if (gameMode === 'single') {
            playerInfo.textContent = 'You are X - Your turn first!';
        } else {
            playerInfo.textContent = 'Player 1 (X) starts first!';
        }
        
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('x', 'o', 'winning-cell');
        });
        
        gameBoard.classList.remove('ai-thinking');
        
        console.log('Game reset');
    }
    
    function backToMenu() {
        gameBoard.classList.add('hidden');
        resetGame();
    }
    
    function updateScoreDisplay() {
        scoreX.textContent = scores['X'];
        scoreO.textContent = scores['O'];
        scoreDraw.textContent = scores['draw'];
    }
    
    function saveScores() {
        if (currentUser) {
            localStorage.setItem(`tictactoe_scores_${currentUser}`, JSON.stringify(scores));
        }
    }
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `message ${type}`;
    }
    
    function clearMessage(element) {
        element.textContent = '';
        element.className = 'message';
    }
    
    updateScoreDisplay();
});