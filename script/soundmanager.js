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

	static getFreq(freq) {
		if (isNaN(freq)) {
			let tone = freq[0]
			let octave = freq[1]
			if (freq[1] == '#') {
				tone += freq[1]
				octave = freq[2]
			}
			octave -= '0';
			freq = SoundManager.freqTable[tone]
			freq *= Math.pow(2, octave)
		}
		return freq
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
		o.frequency.linearRampToValueAtTime(freq, t + 0.01)
		g.gain.exponentialRampToValueAtTime(0.5, t + 0.01);
		o.start(t);
		g.gain.exponentialRampToValueAtTime(0.0001, t + length);
		o.stop(t + length + 0.02);
	}

	tone2(fre1, fre2, amp, rate = 1, wave = 'sine', length = 0.08, delay = 0) {
		if (!this.ctx) return
		const o = this.ctx.createOscillator()
		const g = this.ctx.createGain()
		const freq1 = SoundManager.getFreq(fre1)
		const freq2 = SoundManager.getFreq(fre2 ?? fre1)
		const t = this.ctx.currentTime + delay;
		o.type = wave
		o.frequency.value = freq1
		g.gain.value = amp
		//o.frequency.value = freq1;
		o.connect(g); g.connect(this.ctx.destination);

		o.frequency.linearRampToValueAtTime(freq1, t + 0.0001)
		g.gain.exponentialRampToValueAtTime(amp, t + 0.0001);
		o.start(t)
		o.frequency.linearRampToValueAtTime(freq2, t + length*rate)
		g.gain.exponentialRampToValueAtTime(0.0001, t + length);
		o.stop(t + length + 0.0002);
	}
	
	jump() {
		const len = 0.5
		this.tone2('C3', 'C4', 0.5, 1.0, 'triangle', len);
		this.tone2('C4', 'C5', 0.3, 1.0, 'triangle', len);
	}
	
	coin() {
		const len = 0.5
		const delay = 0.1
		this.tone2('C7', 'C5', 0.2, 0.01, 'square', len);
		this.tone2('E6', 'E4', 0.3, 0.01, 'square', len, delay);
		this.tone2('G6', 'G4', 0.5, 0.01, 'square', len, 1.02*delay);
	}

	life() {
		const len = 0.8
		let delay = 0.1
		let rate = 0.01
		let t = 0
		this.tone2('C4', 'C3', 0.3, rate, 'sawtooth', len, t)
		t += delay
		this.tone2('E4', 'E3', 0.3, rate, 'sawtooth', len, t)
		t += delay
		this.tone2('G4', 'G3', 0.3, rate, 'sawtooth', len, t)
		t += delay
		this.tone2('C4', 'E4', 0.2, rate, 'sawtooth', len, t)
		this.tone2('E4', 'G4', 0.2, rate, 'sawtooth', len, t)
		this.tone2('G4', 'C5', 0.3, rate, 'sawtooth', len, t)
		t += delay
		rate *= 3
		this.tone2('C4', 'E4', 0.2, rate, 'sawtooth', len, t)
		this.tone2('E4', 'G4', 0.2, rate, 'sawtooth', len, t)
		this.tone2('G4', 'C5', 0.3, rate, 'sawtooth', len, t)
	}
	
	hit() {
						 this.tone('C2', 0.12, 'sawtooth');
	}
	
	land() {
		const len = 0.2
		this.tone2(152, 100, 0.06, 0.05, 'square', 0.1*len);
		this.tone2(80, 60, 0.5, 0.6, 'triangle', len);
	}

	openGate() {
		let len = 0.04
		const delay = 0.06
		let t = 0
		let f = Math.pow(2, 2/12)
		let freq = SoundManager.getFreq('C2')
		for (let i=0; i<16; i++) {
			this.tone2(freq, 0.5*freq, 0.2, 0.04, 'square', len, t);
			this.tone2(freq, 0.5*freq, 0.4, 0.04, 'triangle', len, t);
			freq *= f
			t += delay
		}
		t += 0.2
		len = 0.8
		this.tone2('C4', 'C5', 0.2, 0.01, 'square', len, t);
		this.tone2('E3', 'E4', 0.4, 0.01, 'square', len, t);
		this.tone2('G3', 'G4', 0.3, 0.01, 'square', len, t);
	}
}