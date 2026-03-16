import { describe, expect, it } from "vitest";
import { formatPublishedDate } from "./date";

describe("formatPublishedDate", () => {
	it("formats date-only values in zh-CN with a fixed UTC timezone", () => {
		expect(formatPublishedDate("2024-08-15")).toBe("2024年8月15日");
	});

	it("formats full datetime values with UTC normalization", () => {
		expect(formatPublishedDate("2024-08-15T23:00:00-02:00")).toBe(
			"2024年8月16日",
		);
	});

	it("returns original value when parsing fails", () => {
		expect(formatPublishedDate("not-a-date")).toBe("not-a-date");
	});

	it("returns null when value is empty", () => {
		expect(formatPublishedDate()).toBeNull();
	});
});
