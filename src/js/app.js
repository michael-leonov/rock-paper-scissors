import httpRequest from './http-request';

const app = document.querySelector('.app');
const backURL = 'https://skypro-rock-scissors-paper.herokuapp.com/';

export function renderLoginBlock(container) {
    const loginTitle = document.createElement('h1');
    loginTitle.textContent = 'Камень, ножницы, бумага';
    loginTitle.classList.add('login-title');

    const loginInput = document.createElement('input');
    loginInput.placeholder = 'Логин';
    loginInput.classList.add('login-input');

    const loginBtn = document.createElement('button');
    loginBtn.textContent = 'Введите логин';
    loginBtn.disabled = true;
    loginBtn.classList.add('login-btn', 'btn');

    loginInput.addEventListener('input', () => {
        loginInput.value !== ''
            ? ((loginBtn.disabled = false), (loginBtn.textContent = 'Войти'))
            : ((loginBtn.disabled = true),
              (loginBtn.textContent = 'Введите логин'));
    });

    loginBtn.addEventListener('click', () => {
        httpRequest({
            url: `${backURL}login?login=${loginInput.value}`,
            onSuccess: (data) => {
                window.application.token = data.token;

                httpRequest({
                    url: `${backURL}player-status?token=${window.application.token}`,
                    onSuccess: (data) => {
                        if (data['player-status'].status === 'lobby')
                            window.application.renderScreen('lobby-screen');

                        if (data['player-status'].status === 'game') {
                            window.application.gameId =
                                data['player-status'].game.id;

                            httpRequest({
                                url: `${backURL}game-status?token=${window.application.token}&id=${window.application.gameId}`,
                                onSuccess: (data) => {
                                    if (
                                        data['game-status'].status ===
                                        'waiting-for-start'
                                    )
                                        window.application.renderScreen(
                                            'game-waiting-screen'
                                        );
                                    else if (
                                        data['game-status'].status ===
                                        'waiting-for-your-move'
                                    )
                                        window.application.renderScreen(
                                            'game-move-screen'
                                        );
                                    else if (
                                        data['game-status'].status ===
                                        'waiting-for-enemy-move'
                                    )
                                        window.application.renderScreen(
                                            'enemy-game-move-screen'
                                        );
                                },
                            });
                        }
                    },
                });
            },
        });
    });

    container.appendChild(loginTitle);
    container.appendChild(loginInput);
    container.appendChild(loginBtn);
}

export function renderLoginScreen() {
    app.textContent = '';

    const loginScreen = document.createElement('div');
    loginScreen.classList.add('login-screen');
    app.appendChild(loginScreen);

    window.application.renderBlock('login-block', loginScreen);
}

export function renderLobbyBlock(container) {
    const lobbyTitle = document.createElement('h1');
    lobbyTitle.textContent = 'Лобби';
    lobbyTitle.classList.add('lobby-title');

    const lobbyListPlayers = document.createElement('ul');
    lobbyListPlayers.classList.add('lobby-list-players');

    function refreshLobby() {
        httpRequest({
            url: `${backURL}player-list`,
            onSuccess: (data) => {
                lobbyListPlayers.innerHTML = '';
                data.list.forEach((player) => {
                    lobbyListPlayers.insertAdjacentHTML(
                        'afterbegin',
                        `<li class="lobby-player">${player.login}</li>`
                    );
                });
            },
        });

        container.appendChild(lobbyTitle);
        container.appendChild(lobbyListPlayers);
    }

    window.application.timers.push(setInterval(refreshLobby, 1000));
}

export function renderLobbyBtn(container) {
    const lobbyBtn = document.createElement('button');
    lobbyBtn.textContent = 'Играть!';
    lobbyBtn.classList.add('lobby-btn', 'btn');

    lobbyBtn.addEventListener('click', () => {
        httpRequest({
            url: `${backURL}start?token=${window.application.token}`,
            onSuccess: (data) => {
                window.application.gameId = data['player-status'].game.id;
                window.application.renderScreen('game-waiting-screen');

                if (data.status === 'error') alert(data.message);
            },
        });
    });

    container.appendChild(lobbyBtn);
}

export function renderLobbyScreen() {
    app.textContent = '';

    const lobbyScreen = document.createElement('div');
    lobbyScreen.classList.add('lobby-screen');
    app.appendChild(lobbyScreen);

    window.application.renderBlock('lobby-block', lobbyScreen);
    window.application.renderBlock('lobby-btn', lobbyScreen);
}

export function renderGameWaitingBlock(container) {
    const gameWaitTitle = document.createElement('h1');
    gameWaitTitle.textContent = 'Ожидайте';
    gameWaitTitle.classList.add('game-waiting-title');

    container.appendChild(gameWaitTitle);
}

export function renderGameWaitingScreen() {
    app.textContent = '';

    const gameWaitingScreen = document.createElement('div');
    gameWaitingScreen.classList.add('game-waiting-screen');
    app.appendChild(gameWaitingScreen);

    window.application.renderBlock('game-waiting-block', gameWaitingScreen);
    window.application.timers.push(setInterval(waitingGame, 500));
}

function waitingGame() {
    httpRequest({
        url: `${backURL}game-status?token=${window.application.token}&id=${window.application.gameId}`,
        onSuccess: (data) => {
            if (data['game-status'].status !== 'waiting-for-start')
                window.application.renderScreen('game-move-screen');
        },
    });
}

export function renderGameMoveBlock(container) {
    const gameMoveTitle = document.createElement('h1');
    gameMoveTitle.textContent = 'Ходи';
    gameMoveTitle.classList.add('game-move-title');

    const rock = document.createElement('button');
    rock.textContent = 'Камень';
    rock.classList.add('btn-choice');
    rock.id = 'rock';

    const scissors = document.createElement('button');
    scissors.textContent = 'Ножницы';
    scissors.classList.add('btn-choice');
    scissors.id = 'scissors';

    const paper = document.createElement('button');
    paper.textContent = 'Бумага';
    paper.classList.add('btn-choice');
    paper.id = 'paper';

    container.appendChild(gameMoveTitle);
    container.appendChild(rock);
    container.appendChild(scissors);
    container.appendChild(paper);

    const ButtonsChoice = document.querySelectorAll('.btn-choice');

    ButtonsChoice.forEach((btnChoice) => {
        btnChoice.addEventListener('click', () => {
            requestChoice(btnChoice.id);
        });
    });
}

function requestChoice(yourChoice) {
    httpRequest({
        url: `${backURL}play?token=${window.application.token}&id=${window.application.gameId}&move=${yourChoice}`,
        onSuccess: (data) => {
            if (data['game-status'].status === 'waiting-for-enemy-move')
                window.application.renderScreen('enemy-game-move-screen');
            else if (data['game-status'].status === 'win')
                window.application.renderScreen('win-screen');
            else if (data['game-status'].status === 'lose')
                window.application.renderScreen('lose-screen');
            else if (data['game-status'].status === 'waiting-for-your-move')
                window.application.renderScreen('game-move-screen');
        },
    });
}

export function renderGameMoveScreen() {
    app.textContent = '';

    const gameMoveScreen = document.createElement('div');
    gameMoveScreen.classList.add('game-move-screen');
    app.appendChild(gameMoveScreen);

    window.application.renderBlock('game-move-block', gameMoveScreen);
}

export function renderEnemyMoveWaitingBlock(container) {
    const enemyWaitTitle = document.createElement('h1');
    enemyWaitTitle.text = 'Ждем хода соперника';

    container.appendChild(enemyWaitTitle);
}

export function renderEnemyMoveWaitingScreen() {
    app.textContent = '';

    const enemyGameMoveScreen = document.createElement('div');
    enemyGameMoveScreen.classList.add('enemy-move-screen');
    app.appendChild(enemyGameMoveScreen);

    window.application.renderBlock(
        'enemy-game-move-block',
        enemyGameMoveScreen
    );
    window.application.timers.push(setInterval(waitingStatusGame, 500));
}

function waitingStatusGame() {
    httpRequest({
        url: `${backURL}game-status?token=${window.application.token}&id=${window.application.gameId}`,
        onSuccess: (data) => {
            if (data['game-status'].status !== 'waiting-for-enemy-move') {
                if (data['game-status'].status === 'win')
                    window.application.renderScreen('win-screen');
                else if (data['game-status'].status === 'lose')
                    window.application.renderScreen('lose-screen');
                else if (data['game-status'].status === 'waiting-for-your-move')
                    window.application.renderScreen('game-move-screen');
            }
        },
    });
}

export function renderWinBlock(container) {
    const winTitle = document.createElement('h1');
    winTitle.textContent = 'Вы выйграли';

    container.appendChild(winTitle);
}

export function renderGoToLobbyBtn(container) {
    const goToLobbyBtn = document.createElement('button');
    goToLobbyBtn.textContent = 'Перейти в лобби';

    goToLobbyBtn.addEventListener('click', () => {
        window.application.renderScreen('lobby-screen');
    });

    container.appendChild(goToLobbyBtn);
}

export function renderWinScreen() {
    app.textContent = '';

    const winScreen = document.createElement('div');
    app.appendChild(winScreen);

    window.application.renderBlock('win-game-block', renderWinBlock);
    window.application.renderBlock('go-to-lobby', renderGoToLobbyBtn);
    window.application.renderBlock('lobby-btn', renderLobbyBtn);
}

export function renderLoseBlock(container) {
    const loseTitle = document.createElement('h1');
    loseTitle.textContent = 'Проиграли';

    container.appendChild(loseTitle);
}

export function renderLoseScreen() {
    app.textContent = '';

    const loseScreen = document.createElement('div');
    app.appendChild(loseScreen);

    window.application.renderBlock('lose-game-block', renderLoseBlock);
    window.application.renderBlock('go-to-lobby', renderGoToLobbyBtn);
    window.application.renderBlock('lobby-btn', renderLobbyBtn);
}
