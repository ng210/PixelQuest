/* ---------- Segédfüggvények ---------- */
// De jó lenne tudni, hogy két figura mikor ütközik!
// Megint egy kis matek: két téglalap mikor fedi egymást?
function rectsOverlap(rect1, rect2) {
	// az első téglalap koordinátái sorban: bal, jobb, felső, alsó
	let bal1 = rect1.x
	// A jobb oldal koordinátája = bal oldal koordinátája + téglalap szélessége
	let jobb1 = rect1.x + rect1.w
	let fent1 = rect1.y
	// Az alsó oldal koordinátája = a felső oldal koordinátája + téglalap magassága
	let lent1 = rect1.y + rect1.h
	// a másik téglalap koordinátái sorban: bal, jobb, felső, alsó
	let bal2 = rect2.x
	let jobb2 = rect2.x + rect2.w
	let fent2 = rect2.y
	let lent2 = rect2.y + rect2.h

	// NINCSEN fedés, ha
	// - az első téglalap jobb széle balra van a másik téglalap bal szélétől, vagy
	let c1 = jobb1 < bal2
	// - az első téglalap bal széle jobbra van a másik téglalap jobb szélétől, vagy
	let c2 = bal1 > jobb2
	// - az első téglalap alja feljebb van mint a másik téglalap alja, vagy
	let c3 = lent1 > fent2
	// - az első téglalap teteje lejebb van mint a másik téglalap teteje.
	let c4 = fent1 < lent2
	// Ha a fenti négy feltétel közül bármelyik teljesül, akkor már nincsen fedés.
	// Ezért a feltételeket "vagy kapcsolattal" kötjük össze, erre szolgál a || jel.
	let noOverlap = jobb1 < bal2 || bal1 > jobb2 || lent1 < fent2 || fent1 > lent2  
	// Állj, nekünk nem az kell, hogy fedjék egymást a téglalapok? Fent meg azt számoltuk
	// ki, hogy mikor NEM fedik egymást!
	// Ezért kell az eredmény ellenkezőjét továbbadnunk, ezt pedig a ! jel éri el.
	return !noOverlap
}

// Szükséges olykor egy értéket (v) egy legkisebb (min) és egy legnagyobb (max) érték között
// tartani. Tehát ne lehessen se kisebb a minimumnál, se nagyobb a maximumnál.
function clamp(v, min, max) {
	// Alapesetben az eredmény legyen a bemeneti v érték!
	let result = v
	// Ha a bemeneti v érték kisebb mint a megengedett legkisebb érték,
	if (v < min)
	// akkor az eredmény legyen a megengedett legkisebb érték!
		result = min
	// Ha a bemeneti v érték nagyobb mint a megengedett legnagyobb érték,
	else if (v > max)
	// akkor az eredmény legyen a megengedett legnagyobb érték!
		result = max
	
		return result
}

export { rectsOverlap, clamp }