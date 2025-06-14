import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let sectionCounter = 0;

function addNewArticleSection() {
  const sid = `section-${sectionCounter}`;
  const eid = `editor-${sectionCounter}`;
  const container = document.getElementById("article-sections");

  if (!container) return;

  const tpl = `
    <div id="${sid}" class="bg-white p-4 border rounded shadow space-y-4 relative">
      <label class="block font-semibold">Nama Bagian</label>
      <input type="text" name="section-name"
             class="border p-2 w-full rounded" required
             placeholder="Contoh: Pendahuluan" />

      <label class="block font-semibold">Isi Konten</label>
      <div id="${eid}" class="h-48 bg-white"></div>

      <button type="button"
              class="remove-section-btn bg-red-600 text-white px-3 py-1 rounded
                     hover:bg-red-700 absolute top-0 right-2">
        🗑
      </button>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", tpl);

  const qi = new Quill(`#${eid}`, {
    theme: "snow",
    modules: { toolbar: [["bold", "italic", "underline", "link"]] },
  });

  window.quillSections.push({ id: sid, quill: qi });
  sectionCounter++;

  document.querySelector(`#${sid} .remove-section-btn`).addEventListener("click", () => {
      document.getElementById(sid).remove();
      window.quillSections = window.quillSections.filter(x => x.id !== sid);
    });
}

function getSectionsFromQuill() {
    if (!window.quillSections) {
        return [];
    }
    return window.quillSections.map(({ id, quill }) => {
        const nameInput = document.querySelector(`#${id} input[name="section-name"]`);
        const name = nameInput ? nameInput.value.trim() : "";
        const content = quill.root.innerHTML;
        return { name, content };
    });
}

function resetAddArticleForm() {
    const form = document.getElementById("add-article-form");
    if (form) {
        form.reset();
    }
    const container = document.getElementById("article-sections");
    if (container) {
        container.innerHTML = "";
    }

    window.quillSections = [];
    sectionCounter = 0;

    addNewArticleSection();
}

// Setup page on load
document.addEventListener("DOMContentLoaded", () => {
    setupSidebarToggle();
    setupSearchPopup();
    setupScrollToTop();
    addNewArticleSection();

    document.getElementById("submit-article").addEventListener("click", async (e) => {
        e.preventDefault();

        const title = document.getElementById("article-title").value.trim();
        const meta = document.getElementById("article-meta").value.trim();
        const coverImage = document.getElementById("article-cover").value.trim();
        const productLink = document.getElementById("product-link").value.trim();
        const sectionsData = getSectionsFromQuill();

        if (!title || !coverImage) {
            return alert("Harap mengisi semua bagian form.");
        }

        const articleData = {
            title,
            meta,
            coverImage,
            productLink,
            sectionsData,
            createdAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "articles"), articleData);
            alert("Artikel berhasil disimpan!");
            resetAddArticleForm();
        } catch (error) {
            console.error("Error submitting article:", error);
            alert("Terjadi kesalahan saat menyimpan artikel.");
        }
    });

    const clearBtn = document.getElementById("clear-article-form-btn");
    if(clearBtn) {
        clearBtn.addEventListener("click", resetAddArticleForm);
    }

    const addSectionBtn = document.getElementById("add-section-btn");
    if (addSectionBtn) {
        addSectionBtn.addEventListener("click", addNewArticleSection);
    }
});