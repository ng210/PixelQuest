import Game from './game.js'

const game = new Game();
await game.loadLevel('level1.json')

// splash screen, start gombbal

game.start();