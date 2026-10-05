import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { API_BASE_URL, STAT_NAMES } from "../config.js";
import { capitalize, getTypeColor, formatHeight, formatWeight } from "../utils.js";

function parseEvolutionChain(chainNode) {
	const result = [];

	function traverse(node) {
		if (!node) return;
		const id = node.species.url.split("/").filter(Boolean).pop();
		result.push({
			name: node.species.name,
			id: parseInt(id, 10),
			sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
		});

		if (node.evolves_to && node.evolves_to.length > 0) {
			node.evolves_to.forEach((next) => traverse(next));
		}
	}

	traverse(chainNode);
	return result;
}

function DetailPage() {
	const { name } = useParams();
	const navigate = useNavigate();
	const [pokemon, setPokemon] = useState(null);
	const [species, setSpecies] = useState(null);
	const [evolutionChain, setEvolutionChain] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [isShiny, setIsShiny] = useState(false);
	const [isFav, setIsFav] = useState(false);
	const [activeTab, setActiveTab] = useState("about");

	useEffect(() => {
		let isCurrent = true;

		async function loadPokemonDetails() {
			setIsLoading(true);
			setError(null);
			setPokemon(null);
			setSpecies(null);
			setEvolutionChain([]);
			setIsShiny(false);

			try {
				const pRes = await fetch(`${API_BASE_URL}/pokemon/${name.toLowerCase()}`);
				if (!pRes.ok) {
					throw new Error(`Pokemon "${name}" not found.`);
				}
				const pData = await pRes.json();

				if (!isCurrent) return;
				setPokemon(pData);

				try {
					const favs = JSON.parse(localStorage.getItem("pokedex_favorites") || "[]");
					setIsFav(favs.includes(pData.id));
				} catch {}

				const sRes = await fetch(pData.species.url);
				if (sRes.ok) {
					const sData = await sRes.json();
					if (!isCurrent) return;
					setSpecies(sData);

					if (sData.evolution_chain?.url) {
						const evoRes = await fetch(sData.evolution_chain.url);
						if (evoRes.ok) {
							const evoData = await evoRes.json();
							if (isCurrent) {
								const chain = parseEvolutionChain(evoData.chain);
								setEvolutionChain(chain);
							}
						}
					}
				}
			} catch (err) {
				if (isCurrent) setError(err.message);
			} finally {
				if (isCurrent) setIsLoading(false);
			}
		}

		loadPokemonDetails();

		return () => {
			isCurrent = false;
		};
	}, [name]);

	function handleToggleFavorite() {
		if (!pokemon) return;
		try {
			const favs = JSON.parse(localStorage.getItem("pokedex_favorites") || "[]");
			let newFavs;
			if (favs.includes(pokemon.id)) {
				newFavs = favs.filter((id) => id !== pokemon.id);
				setIsFav(false);
			} else {
				newFavs = [...favs, pokemon.id];
				setIsFav(true);
			}
			localStorage.setItem("pokedex_favorites", JSON.stringify(newFavs));
		} catch {}
	}

	if (isLoading) {
		return (
			<div className="detail-skeleton">
				<div className="skeleton-hero shimmer" />
				<div className="skeleton-body shimmer" />
			</div>
		);
	}

	if (error || !pokemon) {
		return (
			<div className="status-box error">
				<p>{error || "Failed to load details"}</p>
				<Link to="/" className="btn-nav-back">
					← Return to Dex
				</Link>
			</div>
		);
	}

	const primaryType = pokemon.types[0]?.type.name || "normal";
	const typeColor = getTypeColor(primaryType);

	const flavorEntry = species?.flavor_text_entries?.find(
		(f) => f.language.name === "en"
	);
	const flavorText = flavorEntry
		? flavorEntry.flavor_text.replace(/[\f\n\r\t]/g, " ")
		: "A mysterious Pokémon discovered in the wilderness.";

	const genusEntry = species?.genera?.find((g) => g.language.name === "en");
	const genus = genusEntry ? genusEntry.genus : "Pokémon";

	const artwork = isShiny
		? pokemon.sprites.other["official-artwork"].front_shiny || pokemon.sprites.front_shiny
		: pokemon.sprites.other["official-artwork"].front_default || pokemon.sprites.front_default;

	const totalStats = pokemon.stats.reduce((acc, s) => acc + s.base_stat, 0);

	return (
		<div className="detail-view" style={{ "--theme-color": typeColor }}>
			{/* Top nav */}
			<div className="detail-nav-bar">
				<Link to="/" className="btn-nav-back">
					<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
						<path d="M19 12H5M12 19l-7-7 7-7" />
					</svg>
					<span>Dex</span>
				</Link>

				<div className="nav-actions">
					<button
						type="button"
						className={`btn-icon ${isShiny ? "active" : ""}`}
						onClick={() => setIsShiny(!isShiny)}
						title="Toggle Shiny form"
					>
						✨ Shiny
					</button>

					<button
						type="button"
						className={`btn-icon fav-icon-btn ${isFav ? "active" : ""}`}
						onClick={handleToggleFavorite}
						title="Favorite"
					>
						★
					</button>
				</div>
			</div>

			{/* Hero showcase */}
			<div className="hero-showcase">
				<div className="hero-info">
					<span className="hero-id">#{String(pokemon.id).padStart(3, "0")}</span>
					<h1 className="hero-name">{capitalize(pokemon.name)}</h1>
					<p className="hero-genus">{genus}</p>

					<div className="types-badge-list">
						{pokemon.types.map((t) => (
							<span
								key={t.type.name}
								className="type-badge"
								style={{ backgroundColor: getTypeColor(t.type.name) }}
							>
								{capitalize(t.type.name)}
							</span>
						))}
					</div>
				</div>

				<div className="hero-visual">
					<div className="visual-glow" />
					<img
						src={artwork}
						alt={pokemon.name}
						className="hero-sprite floating"
					/>
				</div>
			</div>

			{/* Tabs & Content */}
			<div className="detail-panel">
				<div className="detail-tabs">
					<button
						type="button"
						className={`tab-btn ${activeTab === "about" ? "active" : ""}`}
						onClick={() => setActiveTab("about")}
					>
						About
					</button>
					<button
						type="button"
						className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
						onClick={() => setActiveTab("stats")}
					>
						Base Stats
					</button>
					<button
						type="button"
						className={`tab-btn ${activeTab === "evolutions" ? "active" : ""}`}
						onClick={() => setActiveTab("evolutions")}
					>
						Evolutions
					</button>
					<button
						type="button"
						className={`tab-btn ${activeTab === "moves" ? "active" : ""}`}
						onClick={() => setActiveTab("moves")}
					>
						Moves
					</button>
				</div>

				<div className="tab-content">
					{activeTab === "about" && (
						<div className="about-section">
							<p className="lore-text">"{flavorText}"</p>

							<div className="metrics-grid">
								<div className="metric-card">
									<span className="metric-label">Height</span>
									<span className="metric-val">{formatHeight(pokemon.height)}</span>
								</div>
								<div className="metric-card">
									<span className="metric-label">Weight</span>
									<span className="metric-val">{formatWeight(pokemon.weight)}</span>
								</div>
								<div className="metric-card">
									<span className="metric-label">Base EXP</span>
									<span className="metric-val">{pokemon.base_experience || "--"}</span>
								</div>
								<div className="metric-card">
									<span className="metric-label">Capture Rate</span>
									<span className="metric-val">{species?.capture_rate ? `${species.capture_rate} / 255` : "--"}</span>
								</div>
							</div>

							<div className="abilities-box">
								<h4>Abilities</h4>
								<div className="ability-chips">
									{pokemon.abilities.map((a) => (
										<span key={a.ability.name} className={`ability-chip ${a.is_hidden ? "hidden-ability" : ""}`}>
											{capitalize(a.ability.name.replace("-", " "))}
											{a.is_hidden && <small> (Hidden)</small>}
										</span>
									))}
								</div>
							</div>
						</div>
					)}

					{activeTab === "stats" && (
						<div className="stats-section">
							<div className="stats-bars">
								{pokemon.stats.map((st) => {
									const label = STAT_NAMES[st.stat.name] || st.stat.name.toUpperCase();
									const percent = Math.min(100, Math.round((st.base_stat / 255) * 100));
									return (
										<div key={st.stat.name} className="stat-row">
											<span className="stat-col-label">{label}</span>
											<span className="stat-col-val">{st.base_stat}</span>
											<div className="stat-track">
												<div
													className="stat-fill"
													style={{
														width: `${percent}%`,
														backgroundColor: typeColor
													}}
												/>
											</div>
										</div>
									);
								})}
							</div>

							<div className="stat-summary">
								<span className="stat-col-label">TOTAL</span>
								<span className="total-val">{totalStats}</span>
								<div className="total-desc">Overall power rating</div>
							</div>
						</div>
					)}

					{activeTab === "evolutions" && (
						<div className="evolutions-section">
							{evolutionChain.length <= 1 ? (
								<p className="no-evo">This Pokémon does not evolve.</p>
							) : (
								<div className="evo-chain-row">
									{evolutionChain.map((evo, i) => (
										<div key={evo.id} className="evo-step">
											<Link
												to={`/pokemon/${evo.name}`}
												className={`evo-card ${evo.id === pokemon.id ? "current" : ""}`}
											>
												<img src={evo.sprite} alt={evo.name} className="evo-img" />
												<span className="evo-name">{capitalize(evo.name)}</span>
												<span className="evo-id">#{String(evo.id).padStart(3, "0")}</span>
											</Link>
											{i < evolutionChain.length - 1 && (
												<span className="evo-arrow">➔</span>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					)}

					{activeTab === "moves" && (
						<div className="moves-section">
							<div className="moves-grid">
								{pokemon.moves.slice(0, 24).map((m) => (
									<div key={m.move.name} className="move-pill">
										{capitalize(m.move.name.replace(/-/g, " "))}
									</div>
								))}
							</div>
							{pokemon.moves.length > 24 && (
								<p className="moves-note">+{pokemon.moves.length - 24} more battle moves learned</p>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Pagination controls Prev/Next */}
			<div className="detail-pager">
				<button
					type="button"
					className="btn-pager"
					disabled={pokemon.id <= 1}
					onClick={() => navigate(`/pokemon/${pokemon.id - 1}`)}
				>
					← #{String(Math.max(1, pokemon.id - 1)).padStart(3, "0")}
				</button>

				<button
					type="button"
					className="btn-pager"
					onClick={() => navigate(`/pokemon/${pokemon.id + 1}`)}
				>
					#{String(pokemon.id + 1).padStart(3, "0")} →
				</button>
			</div>
		</div>
	);
}

export default DetailPage;
