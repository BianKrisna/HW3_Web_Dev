import { useNavigate } from "react-router-dom";

const GEN_OPTIONS = [
	{ id: 0, name: "Gen 1 (Kanto)" },
	{ id: 1, name: "Gen 2 (Johto)" },
	{ id: 2, name: "Gen 3 (Hoenn)" },
	{ id: 3, name: "Gen 4 (Sinnoh)" },
	{ id: 4, name: "Gen 5 (Unova)" }
];

function SearchForm({
	searchQuery,
	setSearchQuery,
	selectedGen,
	setSelectedGen,
	favoritesOnly,
	setFavoritesOnly,
	totalFavs
}) {
	const navigate = useNavigate();

	function handleRandom() {
		const randomId = Math.floor(Math.random() * 649) + 1;
		navigate(`/pokemon/${randomId}`);
	}

	return (
		<div className="controls-panel">
			<div className="search-bar-row">
				<div className="search-input-wrapper">
					<svg className="search-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
						<circle cx="11" cy="11" r="8" />
						<line x1="21" y1="21" x2="16.65" y2="16.65" />
					</svg>
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by name or #ID (e.g. Gengar, 94)..."
						className="search-input"
					/>
					{searchQuery && (
						<button
							type="button"
							className="clear-btn"
							onClick={() => setSearchQuery("")}
							aria-label="Clear search"
						>
							×
						</button>
					)}
				</div>

				<button
					type="button"
					className="btn-action btn-random"
					onClick={handleRandom}
					title="Pick random Pokémon"
				>
					🎲 Random
				</button>
			</div>

			<div className="filter-chips-row">
				<div className="gen-selector">
					{GEN_OPTIONS.map((g, idx) => (
						<button
							key={g.id}
							type="button"
							className={`chip-btn ${selectedGen === idx ? "active" : ""}`}
							onClick={() => setSelectedGen(idx)}
						>
							{g.name}
						</button>
					))}
				</div>

				<button
					type="button"
					className={`chip-btn fav-toggle-chip ${favoritesOnly ? "active" : ""}`}
					onClick={() => setFavoritesOnly(!favoritesOnly)}
				>
					★ Favorites ({totalFavs})
				</button>
			</div>
		</div>
	);
}

export default SearchForm;
