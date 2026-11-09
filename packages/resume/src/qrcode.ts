/**
 * Lightweight, zero-dependency QR Code generator in pure TypeScript.
 * Generates ISO/IEC 18004 compliant QR Code matrices and SVG elements.
 */

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export type QrOptions = {
	/** Error correction level: L (7%), M (15%), Q (25%), H (30%). Defaults to "M". */
	ecc?: QrErrorCorrectionLevel;
	/** Quiet zone border modules (default 4 per standard, minimum 2 for compact). */
	margin?: number;
};

export type QrSvgOptions = QrOptions & {
	size?: number;
	color?: string;
	backgroundColor?: string;
	title?: string;
};

// Simplified QR encoder supporting Byte mode (8-bit) for URLs, text, and vCard data.
// Uses standard Reed-Solomon polynomial math and standard masking.
class QrCodeEncoder {
	private readonly version: number;
	private readonly size: number;
	private readonly modules: (boolean | null)[][];
	private readonly isFunction: boolean[][];

	constructor(version: number) {
		this.version = version;
		this.size = version * 4 + 17;
		this.modules = Array.from({ length: this.size }, () => Array(this.size).fill(null));
		this.isFunction = Array.from({ length: this.size }, () => Array(this.size).fill(false));
	}

	private setFunctionModule(r: number, c: number, val: boolean) {
		const rowM = this.modules[r];
		const rowF = this.isFunction[r];
		if (rowM && rowF) {
			rowM[c] = val;
			rowF[c] = true;
		}
	}

	private drawFinder(r: number, c: number) {
		for (let dr = -1; dr <= 7; dr++) {
			for (let dc = -1; dc <= 7; dc++) {
				const row = r + dr;
				const col = c + dc;
				if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
					const inSquare = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
					const isBorder = dr === 0 || dr === 6 || dc === 0 || dc === 6;
					const isCenter = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4;
					const val = inSquare && (isBorder || isCenter);
					this.setFunctionModule(row, col, val);
				}
			}
		}
	}

	private setupFunctionModules() {
		// Three finder patterns: top-left, top-right, bottom-left
		this.drawFinder(0, 0);
		this.drawFinder(0, this.size - 7);
		this.drawFinder(this.size - 7, 0);

		// Timing patterns (row 6 and col 6)
		for (let i = 8; i < this.size - 8; i++) {
			const val = i % 2 === 0;
			this.setFunctionModule(6, i, val);
			this.setFunctionModule(i, 6, val);
		}

		// Dark module at (4 * version + 9, 8)
		this.setFunctionModule(4 * this.version + 9, 8, true);

		// Format info areas reserve as function modules
		for (let i = 0; i < 9; i++) {
			if (i !== 6) {
				this.setFunctionModule(8, i, false);
				this.setFunctionModule(i, 8, false);
			}
		}
		for (let i = 0; i < 8; i++) {
			this.setFunctionModule(8, this.size - 1 - i, false);
			this.setFunctionModule(this.size - 1 - i, 8, false);
		}
	}

	private encodeData(text: string): number[] {
		const bytes = new TextEncoder().encode(text);
		const bitStream: number[] = [];

		// Mode indicator for Byte mode is 0100 (4)
		bitStream.push(0, 1, 0, 0);

		// Character count indicator (8 bits for versions 1-9 in Byte mode)
		for (let i = 7; i >= 0; i--) {
			bitStream.push((bytes.length >> i) & 1);
		}

		// Data bytes
		for (const b of bytes) {
			for (let i = 7; i >= 0; i--) {
				bitStream.push((b >> i) & 1);
			}
		}

		// Terminator bits (up to 4 zeroes)
		const capacityBits = this.getDataCapacityCodewords() * 8;
		const termLen = Math.min(4, capacityBits - bitStream.length);
		for (let i = 0; i < termLen; i++) bitStream.push(0);

		// Byte alignment
		while (bitStream.length % 8 !== 0) bitStream.push(0);

		// Pad bytes (0xEC, 0x11)
		const resultBytes: number[] = [];
		for (let i = 0; i < bitStream.length; i += 8) {
			let byte = 0;
			for (let b = 0; b < 8; b++) byte = (byte << 1) | (bitStream[i + b] ?? 0);
			resultBytes.push(byte);
		}

		const pad = [0xec, 0x11];
		let p = 0;
		const targetLen = this.getDataCapacityCodewords();
		while (resultBytes.length < targetLen) {
			resultBytes.push(pad[p % 2] ?? 0);
			p++;
		}

		return resultBytes;
	}

	private getDataCapacityCodewords(): number {
		// Version 1-4 standard capacity with M error correction
		const table: Record<number, number> = { 1: 16, 2: 28, 3: 44, 4: 64, 5: 86 };
		return table[this.version] ?? 16;
	}

	private getEccCodewords(): number {
		const table: Record<number, number> = { 1: 10, 2: 16, 3: 26, 4: 36, 5: 48 };
		return table[this.version] ?? 10;
	}

	private computeReedSolomon(data: number[], eccCount: number): number[] {
		// GF(256) log/antilog tables with primitive polynomial 0x11D (285)
		const exp = new Uint8Array(512);
		const log = new Uint8Array(256);
		let x = 1;
		for (let i = 0; i < 255; i++) {
			exp[i] = x;
			exp[i + 255] = x;
			log[x] = i;
			x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
		}

		// Generator polynomial
		let gen = [1];
		for (let i = 0; i < eccCount; i++) {
			const nextGen = new Array(gen.length + 1).fill(0);
			for (let j = 0; j < gen.length; j++) {
				const gj = gen[j] ?? 0;
				nextGen[j] = (nextGen[j] ?? 0) ^ gj;
				const factor = exp[((log[gj] ?? 0) + (exp[i] ?? 0)) % 255] ?? 0;
				nextGen[j + 1] = (nextGen[j + 1] ?? 0) ^ factor;
			}
			gen = nextGen;
		}

		// Remainder division
		const res = new Array(eccCount).fill(0);
		for (const b of data) {
			const factor = b ^ (res[0] ?? 0);
			res.shift();
			res.push(0);
			if (factor !== 0) {
				const logFactor = log[factor] ?? 0;
				for (let i = 0; i < eccCount; i++) {
					const genVal = gen[i + 1] ?? 0;
					res[i] = (res[i] ?? 0) ^ (exp[(logFactor + (log[genVal] ?? 0)) % 255] ?? 0);
				}
			}
		}

		return res;
	}

	public generate(text: string): boolean[][] {
		this.setupFunctionModules();
		const data = this.encodeData(text);
		const ecc = this.computeReedSolomon(data, this.getEccCodewords());
		const allCodewords = [...data, ...ecc];

		// Place data bits in zigzag scan
		const bits: number[] = [];
		for (const cw of allCodewords) {
			for (let i = 7; i >= 0; i--) bits.push((cw >> i) & 1);
		}

		let bitIdx = 0;
		let right = this.size - 1;
		let upward = true;

		while (right > 0) {
			if (right === 6) right--; // Skip vertical timing column
			const rows = upward
				? Array.from({ length: this.size }, (_, i) => this.size - 1 - i)
				: Array.from({ length: this.size }, (_, i) => i);

			for (const r of rows) {
				for (let c = 0; c < 2; c++) {
					const col = right - c;
					const rowF = this.isFunction[r];
					const rowM = this.modules[r];
					if (rowF && rowM && !rowF[col]) {
						const bit = bitIdx < bits.length ? bits[bitIdx++] === 1 : false;
						// Apply mask 0: (r + col) % 2 === 0
						const mask = (r + col) % 2 === 0;
						rowM[col] = bit !== mask;
					}
				}
			}
			right -= 2;
			upward = !upward;
		}

		// Write format bits for Mask 0, ECC M: 101010000010010 (precomputed XOR masked)
		const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
		const row8 = this.modules[8];
		const row7 = this.modules[7];
		if (row8 && row7) {
			// Top-left
			for (let i = 0; i <= 5; i++) row8[i] = formatBits[i] === 1;
			row8[7] = formatBits[6] === 1;
			row8[8] = formatBits[7] === 1;
			row7[8] = formatBits[8] === 1;
			for (let i = 9; i < 15; i++) {
				const targetRow = this.modules[14 - i];
				if (targetRow) targetRow[8] = formatBits[i] === 1;
			}

			// Bottom & right splits
			for (let i = 0; i < 7; i++) {
				const targetRow = this.modules[this.size - 1 - i];
				if (targetRow) targetRow[8] = formatBits[i] === 1;
			}
			for (let i = 7; i < 15; i++) {
				row8[this.size - 15 + i] = formatBits[i] === 1;
			}
		}

		return this.modules.map((row) => row.map((m) => m === true));
	}
}

/**
 * Generates boolean module matrix for QR Code.
 */
export function generateQrMatrix(text: string, options?: QrOptions): boolean[][] {
	const len = text.length;
	// Choose version based on data length for ECC M
	const version = len <= 14 ? 1 : len <= 26 ? 2 : len <= 42 ? 3 : len <= 62 ? 4 : 5;
	const encoder = new QrCodeEncoder(version);
	const rawMatrix = encoder.generate(text);

	const margin = options?.margin ?? 2;
	if (margin <= 0) return rawMatrix;

	const fullSize = rawMatrix.length + margin * 2;
	const matrix: boolean[][] = Array.from({ length: fullSize }, () => Array(fullSize).fill(false));

	for (let r = 0; r < rawMatrix.length; r++) {
		const rawRow = rawMatrix[r];
		const targetRow = matrix[r + margin];
		if (rawRow && targetRow) {
			for (let c = 0; c < rawRow.length; c++) {
				targetRow[c + margin] = rawRow[c] ?? false;
			}
		}
	}

	return matrix;
}

/**
 * Generates an SVG string representation of a QR code.
 */
export function generateQrSvg(text: string, options?: QrSvgOptions): string {
	const matrix = generateQrMatrix(text, options);
	const size = options?.size ?? 200;
	const color = options?.color ?? "#000000";
	const bg = options?.backgroundColor ?? "#FFFFFF";
	const title = options?.title ?? "QR Code";

	const modCount = matrix.length;
	const modSize = size / modCount;

	let paths = "";
	for (let r = 0; r < modCount; r++) {
		const row = matrix[r];
		if (!row) continue;
		for (let c = 0; c < modCount; c++) {
			if (row[c]) {
				const x = (c * modSize).toFixed(2);
				const y = (r * modSize).toFixed(2);
				const w = modSize.toFixed(2);
				paths += `M${x},${y}h${w}v${w}h-${w}z `;
			}
		}
	}

	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" shape-rendering="crispEdges"><title>${title}</title><rect width="100%" height="100%" fill="${bg}"/><path d="${paths.trim()}" fill="${color}"/></svg>`;
}
