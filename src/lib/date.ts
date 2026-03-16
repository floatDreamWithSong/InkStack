const BLOG_DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
	year: "numeric",
	month: "long",
	day: "numeric",
	timeZone: "UTC",
});

export function formatPublishedDate(publishedAt?: string) {
	if (!publishedAt) return null;

	const timestamp = Date.parse(publishedAt);
	if (Number.isNaN(timestamp)) {
		return publishedAt;
	}

	return BLOG_DATE_FORMATTER.format(new Date(timestamp));
}
