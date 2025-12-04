import Game from './game.js'

/* ---------- Indítás ---------- */
const game = new Game();
document.addEventListener('keydown', e => {
	if (e.code === 'Enter') { // Enter indít
		if (!game.running) game.start();
	}
});
// automatikus start, vagy nyomd Enter-t
game.start();