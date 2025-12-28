import Game from './game.js'

const game = new Game('viewport', 0.4, 56, 42);
game.setRendererType('DOM');
await game.loadLevel('./assets/level1.ascii')

// splash screen, start gombbal

game.start();