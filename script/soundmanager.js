/* ---------- Audio egyszerűen WebAudio használattal ---------- */
export default class SoundManager {
	constructor() {
		this.ctx = null;
		try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
	}
	tone(freq, length = 0.08, type = 'sine', when = 0) {
		if (!this.ctx) return;
		const o = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o.type = type;
		o.frequency.value = freq;
		o.connect(g); g.connect(this.ctx.destination);
		g.gain.value = 0.0001;
		const t = this.ctx.currentTime + when;
		g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
		o.start(t);
		g.gain.exponentialRampToValueAtTime(0.0001, t + length);
		o.stop(t + length + 0.02);
	}
	jump() { this.tone(600, 0.08, 'sine'); }
	coin() { this.tone(1200, 0.06, 'square'); this.tone(1600, 0.04, 'square', 0.02); }
	hit() { this.tone(120, 0.12, 'sawtooth'); }
}