<script lang="ts">
	import { page } from "$app/state";
	import { onMount } from "svelte";
	import { Sun, Moon } from "lucide-svelte";
	import { theme } from "$lib/theme.svelte";
	import "../app.css";

	let { children, data } = $props();

	let isMobileMenuOpen = $state(false);

	const isAdmin = $derived(page.url.pathname.startsWith("/admin"));

	onMount(() => {
		theme.init();
	});

	function toggleMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}
</script>

<svelte:head>
	<link rel="icon" href="/favicon.svg" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
		rel="stylesheet"
	/>
	<title>Chelvyn Kleden | Portfolio</title>
	<meta
		name="description"
		content="Portfolio Blasius Chelvyn Kera Kleden - Fullstack Developer & Odoo Expert. Spesialis dalam membangun aplikasi web modern yang responsif dan berdampak."
	/>
	<meta
		name="keywords"
		content="BLASIUS CHELVYN KERA KLEDEN, Kleden kelvin, kelvin kleden, chelvyn Kleden, Fullstack Developer, Odoo Indonesia, Web Developer, Svelte Indonesia"
	/>
	<meta name="author" content="Blasius Chelvyn Kera Kleden" />

	<!-- Open Graph / Social Media -->
	<meta property="og:type" content="website" />
	<meta property="og:title" content="Chelvyn Kleden | Portfolio" />
	<meta
		property="og:description"
		content="Portfolio Blasius Chelvyn Kera Kleden - Fullstack Developer & Odoo Expert."
	/>
	<meta property="og:site_name" content="Chelvyn Kleden Portfolio" />
</svelte:head>

{#if !isAdmin}
	<header class="header">
		<div class="container nav-container">
			<div class="logo">CK<span>.</span></div>

			<button
				class="mobile-toggle"
				onclick={toggleMenu}
				aria-label="Toggle Menu"
			>
				<span class={isMobileMenuOpen ? "open" : ""}></span>
				<span class={isMobileMenuOpen ? "open" : ""}></span>
				<span class={isMobileMenuOpen ? "open" : ""}></span>
			</button>

			<nav class="nav-links {isMobileMenuOpen ? 'show' : ''}">
				<ul>
					<li>
						<a
							href="/#home"
							onclick={() => (isMobileMenuOpen = false)}>Home</a
						>
					</li>
					<li>
						<a
							href="/#about"
							onclick={() => (isMobileMenuOpen = false)}>About</a
						>
					</li>
					<li>
						<a
							href="/projects"
							onclick={() => (isMobileMenuOpen = false)}
							>Projects</a
						>
					</li>
					<li>
						<a
							href="#contact"
							class="btn btn-primary btn-sm"
							onclick={() => (isMobileMenuOpen = false)}>Kontak</a
						>
					</li>
					<li>
						<button
							class="theme-toggle"
							onclick={() => theme.toggle()}
							aria-label="Toggle Dark Mode"
						>
							{#if theme.isDark}
								<Sun size={20} />
							{:else}
								<Moon size={20} />
							{/if}
						</button>
					</li>
				</ul>
			</nav>
		</div>
	</header>
{/if}

<main>
	{@render children()}
</main>

{#if !isAdmin}
	<footer class="footer">
		<div class="container">
			<div class="footer-content">
				<div class="footer-logo">CK<span>.</span></div>
				<div class="footer-links">
					<a
						href={data.settings?.github || "https://github.com"}
						target="_blank"
						rel="noopener noreferrer">GitHub</a
					>
					<a
						href={data.settings?.linkedin || "https://linkedin.com"}
						target="_blank"
						rel="noopener noreferrer">LinkedIn</a
					>
					<a
						href={data.settings?.twitter || "https://twitter.com"}
						target="_blank"
						rel="noopener noreferrer">Twitter</a
					>
				</div>
				<p class="copyright">
					&copy; 2026 Chelvyn Kleden. Membangun solusi digital yang
					bermakna.
				</p>
			</div>
		</div>
	</footer>
{/if}

<style>
	.header {
		position: sticky;
		top: 0;
		background: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		z-index: 1000;
		z-index: 1000;
		border-bottom: 1px solid var(--border);
		transition:
			background-color 0.3s,
			border-color 0.3s;
	}

	:global(.dark) .header {
		background: rgba(2, 6, 23, 0.9);
	}

	.nav-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 4.5rem;
	}

	.logo {
		font-size: 1.5rem;
		font-weight: 800;
		color: var(--text-main);
		z-index: 1100;
	}

	.logo span {
		color: var(--primary);
	}

	.nav-links {
		display: flex;
		align-items: center;
	}

	.nav-links ul {
		display: flex;
		align-items: center;
		gap: 2.5rem;
		list-style: none;
	}

	.nav-links a {
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--text-muted);
		text-decoration: none;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: var(--primary);
	}

	.nav-links a.btn {
		color: white;
	}

	.btn-sm {
		padding: 0.5rem 1.25rem;
		font-size: 0.875rem;
	}

	/* Mobile Toggle Button */
	.mobile-toggle {
		display: none;
		flex-direction: column;
		justify-content: space-between;
		width: 24px;
		height: 18px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		z-index: 1100;
	}

	.mobile-toggle span {
		width: 100%;
		height: 2px;
		background-color: var(--text-main);
		transition: all 0.3s;
		border-radius: 2px;
	}

	.mobile-toggle span.open:nth-child(1) {
		transform: translateY(8px) rotate(45deg);
	}
	.mobile-toggle span.open:nth-child(2) {
		opacity: 0;
	}
	.mobile-toggle span.open:nth-child(3) {
		transform: translateY(-8px) rotate(-45deg);
	}

	/* Tablet/Mobile styles */
	@media (max-width: 768px) {
		.mobile-toggle {
			display: flex;
		}

		.nav-links {
			position: fixed;
			top: 0;
			right: -100%;
			width: 80%;
			max-width: 300px;
			height: 100vh;
			background: var(--bg-card);
			flex-direction: column;
			justify-content: center;
			padding: 2rem;
			box-shadow: -10px 0 30px rgba(0, 0, 0, 0.05);
			transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		}

		.nav-links.show {
			right: 0;
		}

		.nav-links ul {
			flex-direction: column;
			gap: 2rem;
			width: 100%;
		}

		.nav-links a {
			font-size: 1.25rem;
			width: 100%;
			display: block;
			text-align: center;
		}
	}

	.footer {
		padding: 4rem 0;
		background: var(--bg-soft);
		border-top: 1px solid var(--border);
	}

	.footer-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1.5rem;
	}

	.footer-logo {
		font-size: 1.25rem;
		font-weight: 800;
	}

	.footer-logo span {
		color: var(--primary);
	}

	.footer-links {
		display: flex;
		gap: 2rem;
	}

	.footer-links a {
		color: var(--text-muted);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
	}

	.footer-links a:hover {
		color: var(--primary);
	}

	.copyright {
		color: var(--text-muted);
		font-size: 0.8125rem;
		text-align: center;
	}

	.theme-toggle {
		background: transparent;
		border: 1px solid var(--border);
		color: var(--text-muted);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.5rem;
		border-radius: 0.5rem;
		transition: all 0.2s;
	}

	.theme-toggle:hover {
		color: var(--primary);
		border-color: var(--primary);
		background: var(--bg-soft);
	}
</style>
