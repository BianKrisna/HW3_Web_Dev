import { SPRITE_BASE_URL, ARTWORK_BASE_URL, TYPE_COLORS } from "./config.js";

export function getIdFromUrl(url) {
	if (!url) return "1";
	const parts = url.split("/").filter(Boolean);
	return parts[parts.length - 1];
}

export function capitalize(name) {
	if (!name) return "";
	return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getSpriteUrl(id) {
	return `${SPRITE_BASE_URL}/${id}.png`;
}

export function getArtworkUrl(id) {
	return `${ARTWORK_BASE_URL}/${id}.png`;
}

export function getTypeColor(type) {
	return TYPE_COLORS[type.toLowerCase()] || "#6B7280";
}

export function formatHeight(dm) {
	if (!dm && dm !== 0) return "--";
	const meters = dm / 10;
	const feet = (meters * 3.28084).toFixed(1);
	return `${meters.toFixed(1)}m (${feet}ft)`;
}

export function formatWeight(hg) {
	if (!hg && hg !== 0) return "--";
	const kg = hg / 10;
	const lbs = (kg * 2.20462).toFixed(1);
	return `${kg.toFixed(1)}kg (${lbs}lbs)`;
}
