import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, doc, getDocs, getDoc, query, where } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function initializeCarousel() {
  const carousel = document.getElementById("carouselContainer");
  const prevButton = document.getElementById("carouselPrev");
  const nextButton = document.getElementById("carouselNext");

  let index = 0;
  const items = document.querySelectorAll(".carousel-item");
  const totalItems = items.length;

  let isMobile = window.innerWidth < 768;
  let isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
  let itemsPerView = isMobile ? 1 : (isTablet ? 2 : 3);

  function updateCarousel() {
    if (isMobile) {
      carousel.style.transform = "none";
      return;
    }

    const productWidth = carousel.clientWidth / itemsPerView;
    carousel.style.transition = "transform 0.3s ease-in-out";
    carousel.style.transform = `translateX(${-index * productWidth}px)`;

    prevButton.classList.toggle("opacity-30", index === 0);
    nextButton.classList.toggle("opacity-30", index >= totalItems - itemsPerView);
  }

  nextButton.addEventListener("click", () => {
    if (!isMobile && index < totalItems - itemsPerView) {
      index++;
      updateCarousel();
    }
  });

  prevButton.addEventListener("click", () => {
    if (!isMobile && index > 0) {
      index--;
      updateCarousel();
    }
  });

  window.addEventListener("resize", () => {
    isMobile = window.innerWidth < 768;
    isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
    itemsPerView = isMobile ? 1 : (isTablet ? 2 : 3);
    index = 0;
    updateCarousel();
  });

  updateCarousel();
}

async function loadRandomProducts() {
  try {
    const q = query(
      collection(db, "products"),
      where("recommended", "==", true)
    );
    const snap = await getDocs(q);

    const products = [];
    snap.forEach(docSnap => {
      const d = docSnap.data();
      products.push({
        id: docSnap.id,
        category: d.category,
        title:    d.name,
        images:   d.images?.[0],
        brand:    d.brand
      });
    });

    if (!products.length) {
      console.log("No recommended products found.");
      return;
    }

    const selected = shuffle(products).slice(0, 6);
    const container = document.getElementById("carouselContainer");
    container.innerHTML = "";

    selected.forEach(p => {
      const cat = Array.isArray(p.category) ? p.category.join(", ") : p.category || "";
      const br  = p.brand
        ? p.brand.split(" ")
             .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
             .join(" ")
        : "N/A";

      container.innerHTML += `
        <a href="Products.html?id=${p.id}" class="carousel-item snap-center shrink-0 w-[70%] sm:w-1/2 lg:w-1/3 p-4 rounded-md hover:bg-[#c7daf4]">
          <img src="${p.images || 'images/Lamson.png'}" alt="${p.title}"
               class="rounded-lg mb-4 border border-gray-300 h-50 sm:h-60 w-full object-cover">
          <h3 class="text-lg font-bold mb-2">${p.title}</h3>
          <p class="text-sm text-gray-800 pb-2">Brand: ${br}</p>
          <p class="text-sm text-gray-600">${cat}</p>
        </a>
      `;
    });

    initializeCarousel();

  } catch (err) {
    console.error("Error loading recommended products:", err);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  loadRandomProducts();
});