// Helper kecil dipakai bersama oleh semua komponen chart.
// Sengaja tanpa library chart eksternal: SVG mentah jauh lebih ringan
// (nol KB tambahan di bundle) dan render-nya instan tanpa proses hydration berat.

/** Angka ringkas: 1.284 -> "1.284", 12900 -> "12,9rb", 4200000 -> "4,2jt" */
export function compact(n: number): string {
	if (!Number.isFinite(n)) return '0';
	if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace('.', ',')}jt`;
	if (Math.abs(n) >= 10_000) return `${(n / 1_000).toFixed(1).replace('.', ',')}rb`;
	return n.toLocaleString('id-ID');
}

/** Skala sumbu Y ke angka "bulat" supaya tick-nya enak dibaca. */
export function niceMax(max: number): number {
	if (max <= 0) return 4;
	const pow = Math.pow(10, Math.floor(Math.log10(max)));
	const norm = max / pow;
	const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
	return step * pow;
}

/** Empat tick sumbu Y dari 0 sampai max. */
export function ticks(max: number, count = 4): number[] {
	return Array.from({ length: count + 1 }, (_, i) => Math.round((max / count) * i));
}

/**
 * Path kurva halus (Catmull-Rom -> Bezier). Dipakai untuk garis tren
 * supaya grafiknya terasa modern, bukan zigzag patah-patah.
 */
export function smoothPath(points: { x: number; y: number }[]): string {
	if (points.length === 0) return '';
	if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

	let d = `M ${points[0].x} ${points[0].y}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[i - 1] ?? points[i];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[i + 2] ?? p2;
		// Tension 6 = lengkungan lembut tanpa "overshoot" di atas titik data.
		const c1x = p1.x + (p2.x - p0.x) / 6;
		const c1y = p1.y + (p2.y - p0.y) / 6;
		const c2x = p2.x - (p3.x - p1.x) / 6;
		const c2y = p2.y - (p3.y - p1.y) / 6;
		d += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
	}
	return d;
}

/** Titik pada lingkaran — untuk donut chart. */
export function polar(cx: number, cy: number, r: number, angleDeg: number) {
	const rad = ((angleDeg - 90) * Math.PI) / 180;
	return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

/** Path satu potong donut (arc tebal) dari sudut start ke end. */
export function donutArc(
	cx: number,
	cy: number,
	rOuter: number,
	rInner: number,
	start: number,
	end: number
): string {
	// Lingkaran penuh tidak bisa digambar sebagai satu arc — sisakan celah mikro.
	const sweep = Math.min(end - start, 359.99);
	const e = start + sweep;
	const p1 = polar(cx, cy, rOuter, start);
	const p2 = polar(cx, cy, rOuter, e);
	const p3 = polar(cx, cy, rInner, e);
	const p4 = polar(cx, cy, rInner, start);
	const large = sweep > 180 ? 1 : 0;
	return [
		`M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
		`A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
		`L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
		`A ${rInner} ${rInner} 0 ${large} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
		'Z'
	].join(' ');
}

/** "2026-07-28" -> "28 Jul" */
export function shortDate(iso: string): string {
	const [, m, d] = iso.split('-');
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
	return `${Number(d)} ${months[Number(m) - 1] ?? ''}`;
}
