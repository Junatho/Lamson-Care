import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

// Store your quill instances globally
const quillInstances = [];

document.querySelectorAll(".section-editor").forEach(editorEl => {
  const quill = new Quill(editorEl, {
    theme: 'snow',
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        ['link', 'image']
      ]
    }
  });
  quillInstances.push(quill);
});

// Submit button listener
document.getElementById("submit-article").addEventListener("click", async (e) => {
  e.preventDefault();

  const title = document.getElementById("article-title").value.trim();
  const meta = document.getElementById("article-meta").value.trim();
  const coverImage = document.getElementById("article-cover").value.trim();
  const productLink = document.getElementById("product-link").value.trim();

  const sectionTitles = document.querySelectorAll(".section-title-input");

  const sections = Array.from(sectionTitles).map((input, index) => ({
    name: input.value.trim(),
    content: quillInstances[index].root.innerHTML
  }));

  const articleData = {
    title,
    meta,
    coverImage,
    productLink,
    sections,
    createdAt: serverTimestamp()
  };

  try {
    await addDoc(collection(db, "articles"), articleData);
    alert("Artikel berhasil disimpan!");
    // Optionally reset the form or redirect
  } catch (error) {
    console.error("Error submitting article:", error);
    alert("Terjadi kesalahan saat menyimpan artikel.");
  }
});
