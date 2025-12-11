/* ---------- Audio egyszerűen WebAudio használattal ---------- */
export default class SoundManager {

static freqTable = {
	'C': 32.70, 'C#': 34.65, 'D': 36.71, 'D#': 38.89,
	'E': 41.20, 'F': 43.65, 'F#': 46.25,
	'G': 49.00, 'G#': 51.91, 'A': 55.00, 'A#': 58.27, 'H': 61.74 }

	constructor() {
		this.ctx = null;
		try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
	}
	tone(freq, length = 0.08, type = 'sine', when = 0) {
		if (!this.ctx) return;
		const o = this.ctx.createOscillator();
		const g = this.ctx.createGain();
		o.type = type;
		if (isNaN(freq)) {
			let tone = freq[0]
			let ix = 1
			if (freq[1] == '#') {
				tone += freq[1]
				ix++
			}
			let octave = parseInt(freq.slice(ix));
			freq = SoundManager.freqTable[tone]
			freq *= Math.pow(2, octave)
		}
		o.frequency.value = freq;
		o.connect(g); g.connect(this.ctx.destination);
		g.gain.value = 0.0001;
		const t = this.ctx.currentTime + when;
		g.gain.exponentialRampToValueAtTime(0.12, t + 0.01);
		o.start(t);
		g.gain.exponentialRampToValueAtTime(0.0001, t + length);
		o.stop(t + length + 0.02);
	}
	
	jump() {
		const dt = 80
		this.tone('C3', 0.1, 'triangle');
		setTimeout(() => this.tone('F3', 0.1, 'triangle'), dt);
		setTimeout(() => this.tone('C4', 0.2, 'triangle'), 2*dt);
	}
	
	coin() {
		const dt = 100
		this.tone('A2', 0.1, 'square');
		setTimeout(() => this.tone('A3', 0.4, 'square'), dt);
	}

	life() {
		const dt = 300
		this.tone('F3', 0.4, 'square');
		setTimeout(() => this.tone('A3', 0.4, 'square'), dt);
		setTimeout(() => this.tone('C4', 0.6, 'square'), dt);
	}
	
	hit() { this.tone('C2', 0.12, 'sawtooth'); }
	
	land() {
		this.tone(55, 0.05, 'square');
		this.tone(51, 0.2);
	}

	openGate() {
		const dt  = 60
		setTimeout(() => this.tone('C2', 0.08, 'square'), dt);
		setTimeout(() => this.tone('F2', 0.08, 'square'), 2*dt);
		setTimeout(() => this.tone('C3', 0.08, 'square'), 3*dt);
		setTimeout(() => this.tone('F3', 0.08, 'square'), 4*dt);
		setTimeout(() => this.tone('C4', 0.08, 'square'), 5*dt);
	}
}