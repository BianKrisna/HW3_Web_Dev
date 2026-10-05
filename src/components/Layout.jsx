import { Outlet, Link } from "react-router-dom";

function Layout() {
	return (
		<div className="app-shell">
			<header className="app-header">
				<div className="header-inner">
					<Link to="/" className="brand-logo">
						<div className="pokeball-icon">
							<div className="pokeball-top" />
							<div className="pokeball-center" />
							<div className="pokeball-bottom" />
						</div>
						<span className="brand-title">Poké<span className="brand-accent">Dex</span></span>
					</Link>
				</div>
			</header>

			<main className="main-content">
				<Outlet />
			</main>

			<footer className="app-footer">
				<p>PokéDex • Powered by PokéAPI</p>
			</footer>
		</div>
	);
}

export default Layout;
