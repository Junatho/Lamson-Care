import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

function getProductIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

async function populateProductDetails() {
    const productId = getProductIdFromURL();
    if (!productId) {
        console.error('No product ID found');
        return;
    }

    try {
        const productRef = doc(db, "products", productId);

        const docSnapshot = await getDoc(productRef);

        if (!docSnapshot.exists()) {
            console.error('Product not found');
            return;
        }

        const productData = docSnapshot.data();
        
        document.getElementById('breadcrumb-brand').textContent = productData.brand;
        document.getElementById('breadcrumb-name').textContent = productData.name;
        
        const name = document.getElementById('name');
        name.textContent = productData.name;
        name.className = "text-2xl sm:text-2xl md:text-2xl lg:text-2xl font-bold text-[#000]";

        const category = document.getElementById('category');
        const formattedCategories = productData.category.map(cat => {
            return `<a href="Category.html?category=${encodeURIComponent(cat)}" class="text-blue-700 hover:text-[#0e509a] hover:underline">${cat}</a>`;
        }).join(", ");

        category.innerHTML = `Kategori: ${formattedCategories}`;
        category.className = "font-bold text-base text-gray-700 pt-4";

        const brand = document.getElementById('brand');
        brand.innerHTML = `Brand: <a href="Brand.html?brand=${encodeURIComponent(productData.brand)}" class="text-blue-700 hover:text-[#0e509a] hover:underline">${productData.brand}</a>`;
        brand.className = "font-bold text-base text-gray-700 pt-1";

        const regNum = document.getElementById('registrationNumber');
        regNum.textContent = `Nomor Registrasi: ${productData.registrationNumber}`;
        regNum.className = "font-bold text-base text-gray-700 pt-1";

        const description = productData.details.productInfo.find(info => info.title === "Deskripsi Produk")?.description;
        const specification = productData.details.productInfo.find(info => info.title === "Spesifikasi")?.description;

        const desc = document.getElementById('description');
        desc.innerHTML = description || "";
        desc.className = "text-base text-gray-900 mt-2";

        const spec = document.getElementById('specification');
        spec.innerHTML = specification || "";
        spec.className = "text-base text-gray-900 pb-1";

        const mainImage = document.getElementById('mainImage');
        const thumbnailContainer = mainImage.parentElement.nextElementSibling;
        
        if (productData.images && productData.images.length > 0) {
            mainImage.src = productData.images[0];
            
            thumbnailContainer.innerHTML = productData.images
                .map(imgSrc => `
                    <img src="${imgSrc}" class="w-16 h-16 cursor-pointer border rounded-lg" 
                         onclick="changeImage(this)">
                `).join('');
        }

        const defaultLinks = {
        whatsapp: "https://wa.me/6281234567890",
        tokopedia: "https://www.tokopedia.com/pbm",
        shopee: "https://shopee.co.id/lamson_official"
        };

        const whatsappLink = document.getElementById("whatsapp-link");
        const tokopediaLink = document.getElementById("tokopedia-link");
        const shopeeLink = document.getElementById("shopee-link");

        const getSafeLink = (link, fallback) => {
        return link && link.trim() !== "" && link !== "N/A" ? link : fallback;
        };

        if (whatsappLink) {
        whatsappLink.href = getSafeLink(productData?.links?.whatsapp, defaultLinks.whatsapp);
        }

        if (tokopediaLink) {
        tokopediaLink.href = getSafeLink(productData?.links?.tokopedia, defaultLinks.tokopedia);
        }

        if (shopeeLink) {
        shopeeLink.href = getSafeLink(productData?.links?.shopee, defaultLinks.shopee);
        }

        const encodedBrand = encodeURIComponent(productData.brand);
        document.getElementById('breadcrumb-brand').href = `Brand.html?brand=${encodedBrand}`;
        document.getElementById('breadcrumb-brand').textContent = productData.brand;

    } catch (error) {
        console.error('Error fetching product details:', error);
    }
}

    function handleImageModal() {
        const modal = document.getElementById('productImageModal');
        const modalImg = modal.querySelector('img');
        const mainImg = document.getElementById('mainImage');

        mainImg.onclick = function() {
            modalImg.src = this.src;
            modal.classList.remove('hidden');
        };

        modal.querySelector('button').onclick = function() {
            modal.classList.add('hidden');
        };
    }

        function changeImage(img) {
            document.getElementById('mainImage').src = img.src;

            const modalImage = document.querySelector('#productImageModal img');
            if (modalImage) modalImage.src = img.src;
        }

        function openModal() {
            const modal = document.getElementById('productImageModal');
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';

            const mainImageSrc = document.getElementById('mainImage').src;
            const modalImage = document.querySelector('#productImageModal img');
            if (modalImage) modalImage.src = mainImageSrc;
        }

        function closeModal() {
            const modal = document.getElementById('productImageModal');
            modal.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }

        document.getElementById('productImageModal').addEventListener('click', function(e) {
            const img = this.querySelector('img');
            if (!img.contains(e.target)) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function (e) {
            const modal = document.getElementById('productImageModal');
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });

    document.addEventListener("DOMContentLoaded", function () {
        const carousel = document.getElementById("carouselContainer");
        const prevButton = document.getElementById("carouselPrev");
        const nextButton = document.getElementById("carouselNext");

        let index = 0;
        const items = document.querySelectorAll(".carousel-item");
        const totalItems = items.length;
        let isMobile = window.innerWidth < 768;
        let itemsPerView = isMobile ? 1 : 3;

        function updateCarousel() {
            const productWidth = carousel.clientWidth / itemsPerView;
            const translateX = -(index * productWidth) + "px";
            carousel.style.transition = "transform 0.3s ease-in-out";
            carousel.style.transform = "translateX(" + translateX + ")";

            if (!isMobile) {
                prevButton.classList.toggle("opacity-30", index === 0);
                nextButton.classList.toggle("opacity-30", index >= totalItems - itemsPerView);
            }
        }

        function toggleButtonVisibility() {
            isMobile = window.innerWidth < 768;
            itemsPerView = isMobile ? 1 : 3;

            if (isMobile) {
                prevButton.classList.add("hidden");
                nextButton.classList.add("hidden");
                carousel.style.transform = "";
            } else {
                prevButton.classList.remove("hidden");
                nextButton.classList.remove("hidden");
                updateCarousel();
            }
        }

        nextButton.addEventListener("click", function () {
            if (index < totalItems - itemsPerView) {
                index++;
                updateCarousel();
            }
        });

        prevButton.addEventListener("click", function () {
            if (index > 0) {
                index--;
                updateCarousel();
            }
        });

        toggleButtonVisibility();
        updateCarousel();

        window.addEventListener("resize", function () {
            index = 0;
            toggleButtonVisibility();
        });
    });

    document.addEventListener('DOMContentLoaded', () => {
        populateProductDetails();
        handleImageModal();
    });