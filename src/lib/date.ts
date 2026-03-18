import dayjs from "dayjs";

export function formatPublishedDate(publishedAt?: string) {
	if (!publishedAt) return null;

	const timestamp = Date.parse(publishedAt);
	if (Number.isNaN(timestamp)) {
		return publishedAt;
	}

	return dayjs(timestamp).format("YYYY-MM-DD");
}
