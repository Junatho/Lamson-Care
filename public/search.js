import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

const urlParams = new URLSearchParams(window.location.search);
const searchQuery = urlParams.get('search')?.toLowerCase();

const searchResultsContainer = document.getElementById('searchResultsContainer');

getDocs(collection(db, 'products'))
  .then(snapshot => {
    const allProducts = [];

    snapshot.forEach(doc => {
      const product = doc.data();
      allProducts.push({ ...product, docId: doc.id });
    });

    const showProducts = (products, headingText = null) => {
      searchResultsContainer.innerHTML = '';

      if (headingText) {
        const searchTitle = document.createElement('h1');
        searchTitle.className = "text-2xl sm:text-3xl font-bold text-[#0e509a] mb-10";
        searchTitle.textContent = headingText;
        searchResultsContainer.appendChild(searchTitle);
      }

      const productGrid = document.createElement('div');
      productGrid.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4";

      products.forEach(product => {
        const productId = product.docId;
        const productImages = product.images || [];

        const formattedCategory = Array.isArray(product.category)
          ? product.category.join(', ')
          : (product.category || '');

        const formattedBrand = product.brand
          ? product.brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
          : 'Brand N/A';

        const productCard = `
            <a href="Products.html?id=${productId}" class="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg border border-gray-200 group transition duration-300 transform hover:bg-[#c7daf4]">
                <img src="${productImages[0] || 'default_image.jpg'}" alt="${product.name}" class="rounded-lg mb-4 h-32 sm:h-60 w-full object-cover">
                <h3 class="text-md sm:text-2xl font-bold text-[#000000] self-start mb-2">${product.name}</h3>
                <h3 class="text-sm sm:text-base md:text-lg text-gray-800 self-start pb-2">Brand: ${formattedBrand}</h3>
                <h3 class="text-sm sm:text-base md:text-lg text-gray-600 self-start">${formattedCategory}</h3>
            </a>
        `;

        productGrid.innerHTML += productCard;
      });

      searchResultsContainer.appendChild(productGrid);
    };

    if (!searchQuery || searchQuery.trim() === '') {
      const headingContainer = document.getElementById('search-title');
      headingContainer.innerHTML = `
        <h1 id="category-title" class="mb-8 text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold text-[#0e509a]">
          Semua Produk
        </h1>
      `;
      showProducts(allProducts);
      return;
    }

    const options = {
      includeScore: true,
      threshold: 0.3,
      minMatchCharLength: 3,
      useExtendedSearch: true,
      keys: [
        { name: 'name', weight: 0.5 },
        { name: 'brand', weight: 0.2 },
        { name: 'category', weight: 0.2 }
      ]
    };

    const searchWords = searchQuery
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(word => word.length >= 2 && /^[a-z0-9]+$/i.test(word));

    if (searchWords.length === 0) {
      searchResultsContainer.innerHTML = `<p class='text-lg text-center text-gray-500'>Maaf, tidak ada produk untuk kata kunci "${searchQuery}".</p>`;
      return;
    }

    let intermediateResults = allProducts;

    searchWords.forEach(word => {
      const fuseInstance = new Fuse(intermediateResults, options);
      const results = fuseInstance.search(word);
      intermediateResults = results.map(result => result.item);
    });

    const matchingProducts = intermediateResults;

    if (matchingProducts.length > 0) {
      showProducts(matchingProducts, `Hasil Pencarian untuk "${searchQuery}"`);
    } else {
      searchResultsContainer.innerHTML = `<p class='text-lg text-center text-gray-500'>Maaf, tidak ada produk untuk kata kunci "${searchQuery}".</p>`;
    }
  })
  .catch(error => {
    console.error("Tidak ada kata kunci pencarian.", error);
  });
