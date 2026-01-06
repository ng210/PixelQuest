import Game from './game.js'

const game = new Game('viewport', 0.5, 64, 48);
game.setRendererType('DOM');
await game.loadLevel('./assets/level1.ascii')

// splash screen, start gombbal

game.start();