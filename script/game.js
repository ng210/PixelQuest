import { clamp } from './utils.js';

import InputHandler from './inputhandler.js'
import SoundManager from './soundmanager.js'
import UIManager from './uimanager.js'

import Entity from './entity.js'
import Platform from './platform.js'
import Coin from './entities/coin.js'
import Door from './entities/door.js'
import Button from './entities/button.js'
import Player from './player.js'

/* =================================================
   Egyszerű DIV-alapú platformer — OOP szerkezet
   Fő osztályok:
    - Entity (alap)
    - Player, Platform, Coin, Button, Door
    - InputHandler
    - SoundManager
    - Game (motor)
   ================================================= */

/* ---------- Game motor/menedzser ---------- */
export default class Game {
    constructor() {
        this.viewport = document.getElementById('viewport');
        this.worldEl = document.getElementById('world');
        this.worldWidth = 1600; this.worldHeight = 900; // játéktér méret
        this.input = new InputHandler();
        this.sounds = new SoundManager();
        this.ui = new UIManager();

        this.entities = [];
        this.platforms = [];
        this.coins = [];
        this.buttons = [];
        this.door = null;

        this.player = null;
        this.playerStart = { x: 80, y: 320 };

        this.lastTime = 0;
        this.running = false;
        this.cameraX = 0;

        this._makeLevel();
        this._bindUI();
        this.ui.setState('Ready');
    }

    _bindUI() {
        document.getElementById('btn-reset').addEventListener('click', () => this.reset());
    }

    _makeLevel() {
        // töröld a világot ha újraindulunk
        this.worldEl.innerHTML = '';
        this.platforms = []; this.coins = []; this.buttons = []; this.door = null;

        // egyszerű pálya: talaj és lebegő platformok
        // talaj
        const ground = new Platform(this, 0, 420, 1600, 64, false);
        ground.el.style.background = 'linear-gradient(#7b4f2f,#5f3a27)';
        this.platforms.push(ground);

        // egy pár lebegő platform
        this.platforms.push(new Platform(this, 120, 300));
        this.platforms.push(new Platform(this, 340, 240));
        this.platforms.push(new Platform(this, 600, 180));
        this.platforms.push(new Platform(this, 860, 240, 160, 28, true, [{ x: 860, y: 240 }, { x: 1100, y: 240 }], 60));
        this.platforms.push(new Platform(this, 1240, 300));

        // player
        this.player = new Player(this, this.playerStart.x, this.playerStart.y);

        // Pixel (segítő robot) lebeg a player mellett
        this.pixel = new Entity(this, this.player.x + 56, this.player.y - 20, 40, 40, 'pixel');
        this.pixel.el.innerText = 'PIX';

        // érmék
        this.coins.push(new Coin(this, 140, 260));
        this.coins.push(new Coin(this, 360, 200));
        this.coins.push(new Coin(this, 620, 140));
        this.coins.push(new Coin(this, 900, 200));
        this.coins.push(new Coin(this, 1260, 260));
        // push into world elements arrays for global update
        // gomb, ami nyit egy kaput (bemutató)
        const btn = new Button(this, 700, 360, () => {
            // lenyomva: kinyitjuk a kaput ha elég érme van, vagy a kapu ellenőrzi
            if (this.door) this.door.tryOpen(this.player.coins);
        });
        this.buttons.push(btn);

        // door - pálya végén
        this.door = new Door(this, 1440, 320, 5); // 5 érme kell a nyitáshoz
        this.worldEl.appendChild(this.door.el);

        // adjuk hozzá a platformokat DOM végrehajlás után (már készültek)
        for (const p of this.platforms) { /* már hozzáadtuk konstruktorban */ }

        // játékUI alapok
        this.ui.updateCoins(0);
        this.ui.updateLives(this.player.lives);

        // gyűjtemények rendezése a frissítéshez
        // (platforms, coins, buttons már vannak)
    }

    start() {
        this.running = true;
        this.ui.setState('Running');
        this.lastTime = performance.now();
        requestAnimationFrame(t => this.loop(t));
    }

    reset() {
        // újraalkotjuk a pályát
        this._makeLevel();
        this.cameraX = 0;
        this.ui.setState('Reset');
    }

    loop(timestamp) {
        if (!this.running) { this.lastTime = timestamp; requestAnimationFrame(t => this.loop(t)); return; }
        const dt = Math.min(0.05, (timestamp - this.lastTime) / 1000);
        this.update(dt);
        this.render();
        this.lastTime = timestamp;
        requestAnimationFrame(t => this.loop(t));
    }

    update(dt) {
        // frissítjük minden entitást
        this.player.update(dt);

        // pixel (segítő) követi a playert (egyszerű)
        this.pixel.x = this.player.x + 56;
        this.pixel.y = this.player.y - 20;
        this.pixel.updateDom();

        for (const p of this.platforms) p.update(dt);
        for (const c of this.coins) c.update(dt);
        for (const b of this.buttons) b.update(dt);
        // kapu: ha elég érme, automatikusan nyithat is (példa)
        if (this.door) this.door.tryOpen(this.player.coins);

        // kamera: kövesse a játékost (csúszó kameramegoldás)
        const centerX = this.player.x + this.player.w / 2;
        const vpW = parseInt(getComputedStyle(this.viewport).width) / (getComputedStyle(document.documentElement).getPropertyValue('--scale') || 1);
        // egyszerű clamp a világ végeire
        let targetCam = clamp(centerX - vpW / 2, 0, this.worldWidth - vpW);
        // egyszerű lerp smoothing
        this.cameraX += (targetCam - this.cameraX) * Math.min(1, 8 * dt);
        // alkalmazzuk a camera transzformot a world elemre
        this.worldEl.style.transform = `translate(${-this.cameraX}px, 0)`;
    }

    render() {
        // Update UI vagy extra logika ha kell
    }

    gameOver() {
        this.running = false;
        this.ui.setState('Game Over');
        alert('Vesztettél! Újra?');
        this.reset();
    }

    win() {
        this.running = false;
        this.ui.setState('Kijutottál! Győzelem!');
        alert('Gratulálok! Kijutottál a pályáról!');
        // itt lehet videófelvételt indítani vagy megállítani
    }
}