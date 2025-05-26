import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

const brandsContainer = document.getElementById('brands-container');

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const selectedBrand = getQueryParam('brand')?.toLowerCase();
function toTitleCase(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const breadcrumbSelectedBrand = document.getElementById('breadcrumb-selected-brand');
if (breadcrumbSelectedBrand && selectedBrand) {
    breadcrumbSelectedBrand.textContent = toTitleCase(selectedBrand);
    breadcrumbSelectedBrand.href = `Brand.html?brand=${encodeURIComponent(selectedBrand)}`;
}

async function loadProductsByBrand() {
    try {
        const productsSnapshot = await getDocs(collection(db, 'products'));

        const brandsMap = {};

        productsSnapshot.forEach(doc => {
            const product = doc.data();
            const brand = (product.brand || "N/A").toLowerCase();

            if (!brandsMap[brand]) {
                brandsMap[brand] = [];
            }
            brandsMap[brand].push({
                ...product,
                docId: doc.id
            });
        });

        if (selectedBrand && !brandsMap[selectedBrand]) {
            brandsContainer.innerHTML = `<p class='text-center text-gray-500'>No products found for brand: ${toTitleCase(selectedBrand)}</p>`;
            return;
        }

        const brandsToRender = selectedBrand ? [selectedBrand] : Object.keys(brandsMap);

        if (brandsToRender.length === 0) {
            brandsContainer.innerHTML = "<p class='text-center text-gray-500'>No products found.</p>";
            return;
        }

        brandsToRender.forEach(brandKey => {
            const brandTitle = document.createElement('h2');
            brandTitle.className = "bg-[#c7daf4] uppercase p-4 rounded-xl text-2xl sm:text-3xl md:text-3xl font-semibold text-[#000CAC]";
            brandTitle.textContent = toTitleCase(brandKey);
            brandsContainer.appendChild(brandTitle);

            const productGrid = document.createElement('div');
            productGrid.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

            brandsMap[brandKey].forEach(product => {
                const productId = product.docId;
                const productImages = product.images || [];
                const formattedCategory = Array.isArray(product.category)
                    ? product.category.join(', ')
                    : (product.category || 'Kategori Tidak Diketahui');

                const formattedBrand = product.brand
                    ? product.brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                    : 'N/A';

                const productCard = document.createElement('a');
                productCard.href = `Products.html?id=${productId}`;
                productCard.className = "flex flex-col items-center bg-white p-4 rounded-lg shadow-lg border border-gray-200 group transition duration-300 transform hover:bg-[#c7daf4]";

                productCard.innerHTML = `
                    <img src="${productImages[0] || 'default_image.jpg'}" alt="${product.name}" class="rounded-lg mb-4 h-32 sm:h-60 w-full object-cover">
                    <h3 class="text-md sm:text-2xl font-bold text-[#000000] self-start mb-2">${product.name}</h3>
                    <h3 class="text-sm sm:text-base md:text-lg text-gray-800 self-start pb-2">Brand: ${formattedBrand}</h3>
                    <h3 class="text-sm sm:text-base md:text-lg text-gray-600 self-start">${formattedCategory}</h3>
                `;

                productGrid.appendChild(productCard);
            });

            brandsContainer.appendChild(productGrid);
        });

    } catch (error) {
        brandsContainer.innerHTML = "<p class='text-center text-red-500'>Failed to load products.</p>";
    }
}

loadProductsByBrand();