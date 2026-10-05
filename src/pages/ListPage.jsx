import { useState, useEffect } from "react";
import SearchForm from "../components/SearchForm.jsx";
import PokemonList from "../components/PokemonList.jsx";

const STORAGE_KEY = "pokedex_favorites";

function ListPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedGen, setSelectedGen] = useState(0);
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [favorites, setFavorites] = useState(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
		} catch {
			// ignore storage errors
		}
	}, [favorites]);

	function handleToggleFavorite(id) {
		setFavorites((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
		);
	}

	return (
		<div className="list-page-container">
			<SearchForm
				searchQuery={searchQuery}
				setSearchQuery={setSearchQuery}
				selectedGen={selectedGen}
				setSelectedGen={setSelectedGen}
				favoritesOnly={favoritesOnly}
				setFavoritesOnly={setFavoritesOnly}
				totalFavs={favorites.length}
			/>

			<PokemonList
				searchQuery={searchQuery}
				selectedGen={selectedGen}
				favoritesOnly={favoritesOnly}
				favorites={favorites}
				onToggleFavorite={handleToggleFavorite}
			/>
		</div>
	);
}

export default ListPage;
