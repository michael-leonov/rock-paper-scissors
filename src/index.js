/* eslint-disable no-unused-vars */
/* eslint-disable no-prototype-builtins */
import './styles/style.scss';
import * as app from './js/app';

window.application = {
    blocks: {},
    screens: {},
    renderScreen: function (screenName) {
        if (!this.screens.hasOwnProperty(screenName)) {
            console.log('Нечего рендерить(экран)');
            return;
        }

        this.timers.forEach((timer) => {
            clearInterval(timer);
        });

        this.timers = [];

        this.screens[screenName]();
    },
    renderBlock: function (blockName, container) {
        if (!this.blocks.hasOwnProperty(blockName)) {
            console.log('Нечего рендерить(блок)');
            return;
        }
        this.blocks[blockName](container);
    },
    timers: [],
    token: null,
    gameId: null,
};

window.application.screens['login-screen'] = app.renderLoginScreen;
window.application.blocks['login-block'] = app.renderLoginBlock;

window.application.screens['lobby-screen'] = app.renderLobbyScreen;
window.application.blocks['lobby-block'] = app.renderLobbyBlock;
window.application.blocks['lobby-btn'] = app.renderLobbyBtn;

window.application.screens['game-waiting-screen'] = app.renderGameWaitingScreen;
window.application.blocks['game-waiting-block'] = app.renderGameWaitingBlock;

window.application.blocks['game-move-block'] = app.renderGameMoveBlock;
window.application.screens['game-move-screen'] = app.renderGameMoveScreen;

window.application.blocks['enemy-game-move-block'] =
    app.renderEnemyMoveWaitingBlock;
window.application.screens['enemy-game-move-screen'] =
    app.renderEnemyMoveWaitingScreen;

window.application.blocks['win-game-block'] = app.renderWinBlock;
window.application.blocks['go-to-lobby'] = app.renderGoToLobbyBtn;
window.application.screens['win-screen'] = app.renderWinScreen;

window.application.blocks['lose-game-block'] = app.renderLoseBlock;
window.application.screens['lose-screen'] = app.renderLoseScreen;

app.renderLoginScreen();
