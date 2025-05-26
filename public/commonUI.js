// commonUI.js
export function setupSidebarToggle() {
	const sidebarToggle = document.getElementById('sidebar-toggle');
	const closeSidebar = document.getElementById('close-sidebar');
	const sidebar = document.getElementById('sidebar');
	const overlay = document.getElementById('sidebar-overlay');

	if (sidebarToggle && closeSidebar && sidebar && overlay) {
		sidebarToggle.addEventListener('click', () => {
			sidebar.classList.remove('translate-x-full');
			overlay.classList.remove('hidden');
		});

		closeSidebar.addEventListener('click', () => {
			sidebar.classList.add('translate-x-full');
			overlay.classList.add('hidden');
		});

		overlay.addEventListener('click', () => {
			sidebar.classList.add('translate-x-full');
			overlay.classList.add('hidden');
		});
	}
}

export function setupSearchPopup() {
	document.addEventListener("DOMContentLoaded", () => {
		const searchToggle = document.getElementById("searchbar-toggle");
		const searchPopup = document.getElementById("searchPopup");
		const searchBox = document.getElementById("searchBox");
		const searchInput = document.getElementById("searchInput");
		const searchButton = document.getElementById("searchButton");

		if (!searchToggle || !searchPopup || !searchBox || !searchInput || !searchButton) return;

		const searchIcon = searchToggle.querySelector('i');
		let isSearchVisible = false;

		function setActive(isActive) {
			searchToggle.style.color = isActive ? '#dc2626' : '';
		}

		searchToggle.addEventListener('click', () => {
			const isActive = searchToggle.style.color === 'rgb(220, 38, 38)';
			setActive(!isActive);
		});

		document.addEventListener('click', (e) => {
			if (!searchToggle.contains(e.target)) {
				setActive(false);
			}
		});

		searchToggle.addEventListener('click', () => {
			isSearchVisible = !isSearchVisible;

			searchPopup.classList.toggle('hidden', !isSearchVisible);

			searchToggle.classList.toggle('text-gray-700', !isSearchVisible);
			searchToggle.classList.toggle('text-red-600', isSearchVisible);
			searchToggle.classList.toggle('hover:text-red-800', isSearchVisible);

			searchIcon.classList.toggle('fa-search', !isSearchVisible);
			searchIcon.classList.toggle('text-2xl', !isSearchVisible);
			searchIcon.classList.toggle('fa-times', isSearchVisible);
			searchIcon.classList.toggle('text-4xl', isSearchVisible);
		});

		document.addEventListener("click", (e) => {
			const clickedInside = searchBox.contains(e.target) || searchToggle.contains(e.target);
			if (isSearchVisible && !clickedInside) {
				isSearchVisible = false;
				searchPopup.classList.add("hidden");

				searchToggle.classList.remove("text-red-600", "hover:text-red-800");
				searchToggle.classList.add("text-gray-700");

				searchIcon.classList.remove("fa-times", "text-4xl");
				searchIcon.classList.add("fa-search", "text-2xl");
			}
		});

		document.addEventListener("keydown", (e) => {
			if (e.key === "Escape" && isSearchVisible) {
				isSearchVisible = false;
				searchPopup.classList.add("hidden");

				searchToggle.classList.remove("text-red-600", "hover:text-red-800");
				searchToggle.classList.add("text-gray-700",);

				searchIcon.classList.remove("fa-times", "text-4xl");
				searchIcon.classList.add("fa-search", "text-2xl");
			}
		});

		searchInput.addEventListener("keydown", function (e) {
			if (e.key === "Enter") {
				e.preventDefault();
				const query = e.target.value.trim();
				if (query) {
					window.location.href = `Search.html?search=${encodeURIComponent(query)}`;
				} else {
					alert("Tolong masukkan nama, merek, atau kategori produk.");
				}
			}
		});

		searchButton.addEventListener("click", (e) => {
			e.preventDefault();
			const query = searchInput.value.trim();
			if (query) {
				window.location.href = `Search.html?search=${encodeURIComponent(query)}`;
			} else {
				alert("Tolong masukkan nama, merek, atau kategori produk.");
			}
		});
	});
}

export function setupScrollToTop() {
	const scrollToTopButton = document.getElementById("scrollToTopButton");
	if (!scrollToTopButton) return;

	window.addEventListener("scroll", () => {
		if (window.scrollY > 300) {
			scrollToTopButton.classList.remove("hidden", "opacity-0");
			scrollToTopButton.classList.add("opacity-100");
		} else {
			scrollToTopButton.classList.remove("opacity-100");
			scrollToTopButton.classList.add("opacity-0");

			setTimeout(() => {
				if (window.scrollY <= 100) {
					scrollToTopButton.classList.add("hidden");
				}
			}, 300);
		}
	});

	scrollToTopButton.addEventListener("click", () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	});
}
