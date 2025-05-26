import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

function getArticleIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("id");
}

document.addEventListener("DOMContentLoaded", async () => {
  const articleId = getArticleIdFromUrl();

  if (articleId) {
    await renderArticle(articleId);
  } else {
    const container = document.getElementById("article-grid");
    if (!container) {
      console.warn("No element with id 'article-grid' found.");
      return;
    }
    container.innerHTML = "";

    try {
      const querySnapshot = await getDocs(collection(db, "articles"));
      if (querySnapshot.empty) {
        container.innerHTML = `<p class="col-span-full text-left text-md">Tidak ada artikel tersedia saat ini.</p>`;
        return;
      }

      querySnapshot.forEach(doc => {
        const article = doc.data();
        const id = doc.id;
        const title = article.title || article.sectionsData?.[0]?.name || "Tanpa Judul";
        const meta = article.meta || "–";
        const image = article.coverImage || "default_article_cover.jpg";

        const card = `
          <a href="viewArticle.html?id=${id}" class="flex flex-col bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:bg-[#c7daf4] transition duration-300">
            <img src="${image}" alt="Cover" class="rounded-lg mb-4 h-32 sm:h-40 lg:h-40 w-auto object-cover">
            <h3 class="text-base sm:text-lg font-semibold text-[#0e509a] mb-1">${title}</h3>
            <p class="text-sm text-gray-600">oleh ${meta}</p>
          </a>
        `;

        container.insertAdjacentHTML("beforeend", card);
      });

    } catch (err) {
      console.error("Error loading articles:", err);
      container.innerHTML = `<p class="col-span-full text-center">Gagal memuat artikel.</p>`;
    }
  }
});

async function renderArticle(articleId) {
  try {
    const docRef = doc(db, "articles", articleId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      document.getElementById("article-title").textContent = "Artikel tidak ditemukan.";
      return;
    }

    const article = docSnap.data();

    const lastUpdated = article.lastUpdated?.toDate?.();
    const createdAt = article.createdAt?.toDate?.();
    const displayDate = lastUpdated || createdAt;

    const formattedDate = displayDate
      ? displayDate.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "–";

    document.getElementById("article-title").textContent = article.title || "Tanpa Judul";
    const author = article.meta || "–";

    let metaLine = `oleh ${author} | ${formattedDate}`;

    if (article.productLink && article.productLink.trim() !== "") {
      metaLine += ` | <a href="${article.productLink}" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Info Produk</a>`;
    }

    document.getElementById("article-meta").innerHTML = metaLine;

    const img = document.getElementById("article-cover");
    img.src = article.coverImage || "/icons/Lamson.png";

    const contentContainer = document.getElementById("article-content");
    const tocContainer = document.getElementById("toc-links");

    if (!Array.isArray(article.sectionsData) || article.sectionsData.length === 0) {
      contentContainer.innerHTML = "<p class='text-gray-500'>Konten belum tersedia.</p>";
      return;
    }

    article.sectionsData.forEach((section, index) => {
      const sectionTitle = section?.name?.trim() || `${index + 1}`;
      const numberedTOC = `${index + 1}. ${sectionTitle}`;

      const slug = sectionTitle.toLowerCase().replace(/[^\w]+/g, "-");
      const sectionId = `${index + 1}-${slug}`;
      const sectionContent = section?.content || "";

      const sectionHTML = `
        <section id="${sectionId}">
          <h2 class="text-2xl font-semibold text-black pt-4 mb-6">${sectionTitle}</h2>
          <div class="quill-content">${sectionContent}</div>
        </section>
      `;
      contentContainer.insertAdjacentHTML("beforeend", sectionHTML);

      tocContainer.insertAdjacentHTML("beforeend", `
        <li><a href="#${sectionId}" class="hover:underline">${numberedTOC}</a></li>
      `);
    });
      } catch (error) {
        console.error("Error loading article:", error);
        document.getElementById("article-title").textContent = "Terjadi kesalahan saat memuat artikel.";
      }
    }