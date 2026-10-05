import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { capitalize } from "../utils.js";

const GEN_RANGES = [
	{ label: "All Gens", offset: 0, limit: 151 },
	{ label: "Gen I (Kanto)", offset: 0, limit: 151 },
	{ label: "Gen II (Johto)", offset: 151, limit: 100 },
	{ label: "Gen III (Hoenn)", offset: 251, limit: 135 },
	{ label: "Gen IV (Sinnoh)", offset: 386, limit: 107 },
	{ label: "Gen V (Unova)", offset: 493, limit: 156 }
];

function PokemonList({ searchQuery, selectedGen, favoritesOnly, favorites, onToggleFavorite }) {
	const [pokemons, setPokemons] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		let isCurrent = true;

		async function loadPokemons() {
			setIsLoading(true);
			setError(null);

			try {
				const gen = GEN_RANGES[selectedGen] || GEN_RANGES[0];
				const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${gen.limit}&offset=${gen.offset}`);

				if (!response.ok) {
					throw new Error(`Status ${response.status}`);
				}

				const data = await response.json();

				if (isCurrent) {
					const items = data.results.map((p, idx) => {
						const id = gen.offset + idx + 1;
						return {
							name: p.name,
							id,
							sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
							thumb: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
						};
					});
					setPokemons(items);
				}
			} catch (err) {
				if (isCurrent) setError(err.message);
			} finally {
				if (isCurrent) setIsLoading(false);
			}
		}

		loadPokemons();

		return () => {
			isCurrent = false;
		};
	}, [selectedGen]);

	// Filter
	const filtered = pokemons.filter((p) => {
		const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || String(p.id).includes(searchQuery);
		const matchesFav = !favoritesOnly || favorites.includes(p.id);
		return matchesQuery && matchesFav;
	});

	if (isLoading) {
		return (
			<div className="grid-skeleton">
				{Array.from({ length: 12 }).map((_, i) => (
					<div key={i} className="card-skeleton shimmer" />
				))}
			</div>
		);
	}

	if (error) {
		return (
			<div className="status-box error">
				<p>Failed to load Dex: {error}</p>
			</div>
		);
	}

	if (filtered.length === 0) {
		return (
			<div className="status-box empty">
				<p className="status-title">No Pokémon Found</p>
				<p className="status-sub">Try changing search query or filters.</p>
			</div>
		);
	}

	return (
		<div className="pokemon-grid">
			{filtered.map((pokemon) => {
				const isFav = favorites.includes(pokemon.id);
				return (
					<div key={pokemon.id} className="pokemon-card-wrap">
						<Link
							to={`/pokemon/${pokemon.name}`}
							className="pokemon-card"
						>
							<div className="card-header">
								<span className="dex-number">#{String(pokemon.id).padStart(3, "0")}</span>
							</div>
							<div className="card-media">
								<img
									src={pokemon.sprite}
									alt={pokemon.name}
									className="pokemon-img"
									loading="lazy"
									onError={(e) => {
										e.currentTarget.src = pokemon.thumb;
									}}
								/>
							</div>
							<div className="card-body">
								<h3 className="pokemon-card-name">{capitalize(pokemon.name)}</h3>
							</div>
						</Link>
						<button
							type="button"
							className={`fav-btn ${isFav ? "active" : ""}`}
							aria-label="Toggle favorite"
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								onToggleFavorite(pokemon.id);
							}}
						>
							★
						</button>
					</div>
				);
			})}
		</div>
	);
}

export default PokemonList;
