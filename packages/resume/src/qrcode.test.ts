import { describe, expect, it } from "vite-plus/test";
import { generateQrMatrix, generateQrSvg } from "./qrcode";

describe("generateQrMatrix", () => {
	it("generates a square boolean matrix with finder patterns", () => {
		const text = "https://dippergo.com/alex";
		const matrix = generateQrMatrix(text, { margin: 2 });

		expect(matrix.length).toBeGreaterThan(20);
		expect(matrix[0].length).toBe(matrix.length);

		// Top-left finder center should be filled
		// Margin 2 + finder offset 3 = row 5, col 5
		expect(matrix[5][5]).toBe(true);

		// Margin perimeter should be false
		expect(matrix[0][0]).toBe(false);
		expect(matrix[0][matrix.length - 1]).toBe(false);
	});

	it("adapts version size based on payload length", () => {
		const shortText = "hi";
		const longText = "https://dippergo.com/users/alex-morgan/senior-fullstack-resume-2026";

		const shortMatrix = generateQrMatrix(shortText, { margin: 0 });
		const longMatrix = generateQrMatrix(longText, { margin: 0 });

		expect(longMatrix.length).toBeGreaterThan(shortMatrix.length);
	});
});

describe("generateQrSvg", () => {
	it("produces valid standalone SVG element with custom colors and size", () => {
		const svg = generateQrSvg("https://dippergo.com", {
			size: 150,
			color: "#2563EB",
			backgroundColor: "#F8FAFC",
			title: "DipperGo Profile",
		});

		expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
		expect(svg).toContain('viewBox="0 0 150 150"');
		expect(svg).toContain('width="150"');
		expect(svg).toContain('height="150"');
		expect(svg).toContain("<title>DipperGo Profile</title>");
		expect(svg).toContain('fill="#F8FAFC"');
		expect(svg).toContain('fill="#2563EB"');
		expect(svg).toContain('path d="M');
	});
});
