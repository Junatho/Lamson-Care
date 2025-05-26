import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const selectedCategory = getQueryParam('category');

function toTitleCase(str) {
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

const breadcrumbSelectedCategory = document.getElementById('breadcrumb-selected-category');
if (breadcrumbSelectedCategory && selectedCategory) {
    breadcrumbSelectedCategory.textContent = toTitleCase(selectedCategory);
    breadcrumbSelectedCategory.href = `Category.html?category=${encodeURIComponent(selectedCategory)}`;
}

async function displayProductsByCategory(category) {
    try {
        const productsRef = collection(db, "products");
        const q = query(productsRef, where("category", "array-contains", category));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            document.getElementById("products-container").innerHTML = `<p class="text-left text-md w-full">Maaf, belum ada produk dari kategori "${category}".</p>`;
            return;
        }

        document.getElementById("category-name").textContent = toTitleCase(category);
        document.getElementById("products-container").innerHTML = '';

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productId = doc.id;
            const productImages = product.images || [];

            const formattedCategory = Array.isArray(product.category)
                ? product.category.join(', ')
                : (product.category || 'Kategori Tidak Diketahui');

            const formattedBrand = product.brand
                ? product.brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                : 'N/A';

            const productGrid = document.createElement('div');
            productGrid.className = "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

            const productCard = `
                <a href="Products.html?id=${productId}" class="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg border border-gray-200 group transition duration-300 transform hover:bg-[#c7daf4]">
                    <img src="${productImages[0] || 'default_image.jpg'}" alt="${product.name}" class="rounded-lg mb-4 h-32 sm:h-60 w-full object-cover">
                    <h3 class="text-md sm:text-2xl font-bold text-[#000000] self-start mb-2">${product.name}</h3>
                    <h3 class="text-sm sm:text-base md:text-lg text-gray-800 self-start pb-2">Brand: ${formattedBrand}</h3>
                    <h3 class="text-sm sm:text-base md:text-lg text-gray-600 self-start">${formattedCategory}</h3>
                </a>
            `;
            document.getElementById("products-container").innerHTML += productCard;
        });

    } catch (error) {
        document.getElementById("products-container").innerHTML = `<p class="text-center w-full">Gagal memuat produk. Coba sesaat lagi.</p>`;
    }
}

async function displayAllProducts() {
    try {
        const productsRef = collection(db, "products");
        const querySnapshot = await getDocs(productsRef);

        if (querySnapshot.empty) {
            document.getElementById("products-container").innerHTML = `<p class="text-left text-md w-full">Tidak ada produk tersedia saat ini.</p>`;
            return;
        }

        document.getElementById("category-name").textContent = "Semua Kategori";
        document.getElementById("products-container").innerHTML = '';

        querySnapshot.forEach((doc) => {
            const product = doc.data();
            const productId = doc.id;
            const productImages = product.images || [];

            const formattedCategory = Array.isArray(product.category)
                ? product.category.join(', ')
                : (product.category || 'Kategori Tidak Diketahui');

            const formattedBrand = product.brand
                ? product.brand.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
                : 'N/A';

            const productCard = `
                <a href="Products.html?id=${productId}" class="flex flex-col items-center bg-white p-4 rounded-lg shadow-lg border border-gray-200 group transition duration-300 transform hover:bg-[#c7daf4]">
                    <img src="${productImages[0] || 'default_image.jpg'}" alt="${product.name}" class="rounded-lg mb-4 h-32 sm:h-60 w-full object-cover">
                    <h3 class="text-md sm:text-2xl font-bold text-[#000000] self-start mb-2">${product.name}</h3>
                    <h3 class="text-sm sm:text-base md:text-lg text-gray-800 self-start pb-2">Brand: ${formattedBrand}</h3>
                    <h3 class="text-sm sm:text-base md:text-lg text-gray-600 self-start">${formattedCategory}</h3>
                </a>
            `;
            document.getElementById("products-container").innerHTML += productCard;
        });

    } catch (error) {
        document.getElementById("products-container").innerHTML = `<p class="text-center w-full">Gagal memuat semua produk. Silakan coba lagi.</p>`;
    }
}

if (selectedCategory) {
    displayProductsByCategory(selectedCategory);
} else {
    displayAllProducts();
}