import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDoc, addDoc, getDocs, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp, query, where, orderBy } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";
import { setupSidebarToggle, setupSearchPopup, setupScrollToTop } from "./commonUI.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

setupSidebarToggle();
setupSearchPopup();
setupScrollToTop();

let allArticles = [];
let CURRENT_ARTICLE_ID = null;
window.quillSections = [];
let modifySectionCounter = 0;
window.modifyQuillSections = [];
window.openModifyArticle   = openModifyArticle;
window.viewArticle         = viewArticle;
window.closeModifyArticle  = closeModifyArticle;

document.addEventListener("DOMContentLoaded", () => {
  loadArticles();
  document
    .getElementById("modify-article-form")
    .addEventListener("submit", handleModifySubmit);
  document
    .getElementById("add-modify-section-btn")
    .addEventListener("click", () => addModifyArticleSection());
})

function loadArticles() {
  const articleList = document.getElementById("article-list");
  onSnapshot(collection(db, "articles"), (snapshot) => {
    allArticles = snapshot.docs.map(docSnap => ({
      firestoreId: docSnap.id,
      ...docSnap.data()
    }));

    articleList.innerHTML = "";
    allArticles.forEach(article => {
        const title =
        article.title ||
        article.sectionsData?.[0]?.title ||
        article.sectionsData?.[0]?.name ||
        "Tanpa Judul";
        const link = article.productLink || "";
        const id = article.firestoreId;

            const card = `
            <div class="flex-none w-64 md:w-72 lg:w-80 snap-start p-4 bg-white border border-gray-300 rounded-lg shadow hover:shadow-lg hover:bg-[#c7daf4] transition-colors duration-300">
                <img src="${article.coverImage}" alt="Cover" class="w-full h-48 object-cover rounded" />
                <h3 class="mt-4 text-xl font-semibold h-14 line-clamp-2">${title}</h3>
                <p class="text-md text-gray-600 mt-1 mb-4">Penulis: ${article.meta || "-"}</p>
                <hr class="border-gray-300">
                ${
                link
                    ? `<button onclick="event.stopPropagation(); window.open('${link}','_blank')" class="mt-4 w-full flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm space-x-2">
                        <i class="fas fa-external-link-alt"></i>
                        <span>Lihat Produk</span>
                    </button>`
                    : `<div class="mt-4 w-full flex items-center justify-center text-gray-400 italic space-x-2">
                        <i class="fas fa-ban"></i>
                        <span>Link produk belum tersedia</span>
                    </div>`
                }
                <button onclick="event.stopPropagation(); openModifyArticle('${id}')" class="mt-2 w-full flex items-center justify-center bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm space-x-2">
                    <i class="fas fa-edit"></i>
                    <span>Ubah Artikel</span>
                </button>
                <button onclick="event.stopPropagation(); deleteArticle('${id}')" class="mt-2 w-full flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm space-x-2">
                    <i class="fas fa-trash"></i>
                    <span>Hapus Artikel</span>
                </button>
            </div>
            `;

        articleList.insertAdjacentHTML("beforeend", card);
        });
    }, err => console.error("Articles listener error:", err));
}

async function deleteArticle(articleId) {
  if (!confirm("Apakah Anda yakin ingin menghapus artikel ini?")) return;
  try {
    await deleteDoc(doc(db, "articles", articleId));
    alert("Artikel berhasil dihapus.");
  } catch (err) {
    alert("Gagal menghapus artikel: " + err.message);
  }
}
window.deleteArticle = deleteArticle;

function openModifyArticle(articleId) {
  CURRENT_ARTICLE_ID = articleId;
  const modal = document.getElementById("modify-article-modal");
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const article = allArticles.find(a => a.firestoreId === articleId);
  if (!article) return;

  document.querySelector('#modify-article-form input[name="title"]').value =
    article.title || "";
  document.querySelector('#modify-article-form input[name="meta"]').value =
    article.meta || "";
  document.querySelector('#modify-article-form input[name="productLink"]').value =
    article.productLink || "";
  document.querySelector('#modify-article-form input[name="coverImage"]').value =
    article.coverImage || "";

  populateModifySections(article.sectionsData || []);
}

function viewArticle(articleId) {
  localStorage.setItem("selectedArticleId", articleId);
  window.location.href = "ArticleDetail.html";
}

function closeModifyArticle() {
  document.getElementById("modify-article-modal").classList.add("hidden");
  document.body.style.overflow = "";
}

async function handleModifySubmit(e) {
  e.preventDefault();
  if (!CURRENT_ARTICLE_ID) {
    return alert("Tidak ada artikel yang dipilih.");
  }

  const updated = {
    title: document.querySelector('#modify-article-form input[name="title"]').value,
    meta: document.querySelector('#modify-article-form input[name="meta"]').value,
    productLink: document.querySelector('#modify-article-form input[name="productLink"]').value,
    coverImage: document.querySelector('#modify-article-form input[name="coverImage"]').value,
    sectionsData: getModifiedSectionsFromQuill(),
    lastUpdated: serverTimestamp(),
  };

  try {
    await updateDoc(doc(db, "articles", CURRENT_ARTICLE_ID), updated);
    alert("Artikel berhasil diperbarui!");
    closeModifyArticle();
  } catch (err) {
    alert("Gagal memperbarui artikel: " + err.message);
  }
}

function clearModifySections() {
  const container = document.getElementById("modify-article-sections");
  container.innerHTML = "";
  window.modifyQuillSections = [];
  modifySectionCounter = 0;
}

function addModifyArticleSection(name = "", html = "") {
  const container = document.getElementById("modify-article-sections");
  const sid = `modify-section-${modifySectionCounter}`;
  const eid = `modify-editor-${modifySectionCounter}`;

  const tpl = `
    <div id="${sid}" class="bg-white p-4 border rounded shadow space-y-4 relative">
      <label class="block font-semibold">Nama Bagian</label>
      <input type="text" name="section-name" class="border p-2 w-full rounded"
             required value="${name}" />

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
  qi.root.innerHTML = html;

  window.modifyQuillSections.push({ id: sid, quill: qi });
  modifySectionCounter++;

  document
    .querySelector(`#${sid} .remove-section-btn`)
    .addEventListener("click", () => {
      document.getElementById(sid).remove();
      window.modifyQuillSections = window.modifyQuillSections.filter(x => x.id !== sid);
    });
}

function populateModifySections(sections) {
  clearModifySections();
  sections.forEach(sec => {
    addModifyArticleSection(sec.name || sec.title || "", sec.content || "");
  });
}

function getModifiedSectionsFromQuill() {
  return window.modifyQuillSections.map(({ id, quill }) => {
    const name = document
      .querySelector(`#${id} input[name="section-name"]`)
      .value.trim();
    const content = quill.root.innerHTML;
    return { name, content };
  });
}

   document.addEventListener("DOMContentLoaded", async () => {
    const productForm = document.getElementById("add-product-form");
    const productList = document.getElementById("product-list");
    const submitBtn = document.getElementById("submit-btn");
    const confirmationCheckbox = document.getElementById("confirm-info");

    const descEditorContainer = document.getElementById('description-editor');
    if (descEditorContainer && window.Quill) {
        window.quillDescription = new Quill('#description-editor', {
            theme: 'snow',
            placeholder: 'Tulis deskripsi produk di sini…',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'link'],
                ]
            }
        });
    }

    const specEditorContainer = document.getElementById('specification-editor');
    if (specEditorContainer && window.Quill) {
        window.quillSpecification = new Quill('#specification-editor', {
            theme: 'snow',
            placeholder: 'Tulis spesifikasi produk di sini…',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline', 'link'],
                ]
            }
        });
    }

    let allProducts = [];
    
    async function getNextID() {
        const querySnapshot = await getDocs(collection(db, "products"));
        let usedIDs = querySnapshot.docs
        .map(doc => Number(doc.data().id))
        .sort((a, b) => a - b);
        
        let nextID = 1;
        for (let id of usedIDs) {
            if (id === nextID) nextID++;
            else break;
        }
        return nextID;
    }

    confirmationCheckbox?.addEventListener("change", () => {
        submitBtn.disabled = !confirmationCheckbox.checked;
    });

    productForm?.addEventListener("submit", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
    
        const name = document.getElementById("name").value.trim();
        const category = [...document.querySelectorAll('input[name="category"]:checked')].map(cb => cb.value);
        const brand = document.getElementById("brand").value.trim() || "N/A";
        const registrationNumber = document.getElementById("registrationNumber").value.trim();
        const description   = quillDescription.root.innerHTML.trim();
        const specification = quillSpecification.root.innerHTML.trim();

        const images = [
            document.getElementById("image1").value.trim(),
            document.getElementById("image2").value.trim(),
            document.getElementById("image3").value.trim()
        ];
        const links = {
            whatsapp: document.getElementById("whatsapp").value.trim() || "N/A",
            tokopedia: document.getElementById("tokopedia").value.trim() || "N/A",
            shopee: document.getElementById("shopee").value.trim() || "N/A"
        };
        const recommended = document.getElementById("recommended")?.checked || false;
    
        if (!name || category.length === 0 || !registrationNumber || !description || !specification || !images[0] || !images[1] || !links.whatsapp) {
            alert("Please fill in all required fields.");
            submitBtn.disabled = false;
            return;
        }
    
        const assignedID = await getNextID();
        await addDoc(collection(db, "products"), { 
            id: assignedID, 
            name, 
            category, 
            brand,
            registrationNumber,
            details: {
                productInfo: [
                    { title: "Deskripsi Produk", description },
                    { title: "Spesifikasi", description: specification },
                    { title: "Nomor Registrasi / Izin Edar Alkes", description: [registrationNumber] }
                ]
            },
            images,
            links,
            recommended
        });
    
        alert("Produk berhasil ditambahkan.");
        productForm.reset();
          if (window.quillDescription) {
              window.quillDescription.setText('');
          }
          if (window.quillSpecification) {
              window.quillSpecification.setText('');
          }
        confirmationCheckbox.checked = false; 
        submitBtn.disabled = false;
    });

    function loadProducts() {
        onSnapshot(collection(db, "products"), (snapshot) => { 
            allProducts = snapshot.docs.map(docSnap => {
                const product = docSnap.data();
                return {
                    ...product,
                    firestoreId: docSnap.id
                };
            });

            renderTable(allProducts);
            populateFilterOptions(allProducts);

            document.querySelectorAll(".delete-btn").forEach(button => {
                button.addEventListener("click", async (event) => {
                    const productId = event.target.dataset.id;
                    await deleteProduct(productId);
                });
            });

            document.querySelectorAll(".edit-btn").forEach(button => {
                button.addEventListener("click", (event) => {
                    const productId = event.target.dataset.id;
                    openModifyModal(productId);
                });
            });
        });
    }

    function escapeSingleQuotes(str) {
        return str.replace(/'/g, "\\'");
        }

    function renderTable(products) {
    productList.innerHTML = "";

    products.forEach(product => {
      const infoList = Array.isArray(product.details?.productInfo) ? product.details.productInfo : [];

      const description = infoList.find(info => info.title === "Deskripsi Produk")?.description || "N/A";
      const registrationNumber = infoList.find(info => info.title === "Nomor Registrasi / Izin Edar Alkes")?.description?.[0] || "N/A";
      const specification = infoList.find(info => info.title === "Spesifikasi")?.description || "N/A";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td class="border p-2 text-center w-[50px]">${product.id}</td>
            <td class="border p-2 w-[200px]">
                <div class="relative h-24 overflow-hidden">
                    <p id="name-${product.id}" class="text-sm line-clamp-4">${product.name}</p>
                </div>
                <button id="name-button-${product.id}" class="text-blue-500 font-bold text-xs underline"
                    onclick="openModal('${product.name}', 'Nama Produk', '&nbsp')">
                    View More
                </button>
            </td>
            <td class="border p-2 text-sm w-[150px]">
              ${Array.isArray(product.category) ? product.category.join(", ") : "-"}
            </td>
            <td class="border p-2 text-sm w-[100px]">${product.brand || "-"}</td>
            <td class="border p-2 text-sm w-[120px]">${registrationNumber}</td>
            <td class="border p-2 w-[250px] overflow-hidden">
                <div class="max-w-[200px] h-[80px] overflow-hidden">
                    <p id="desc-${product.id}" class="text-sm">${description}</p>
                </div>
                <button class="text-blue-500 font-bold text-xs underline" 
                    onclick="openModal('${escapeSingleQuotes(encodeURIComponent(product.name))}', 'Deskripsi Produk', '${escapeSingleQuotes(encodeURIComponent(description))}')">
                    View More
                </button>
            </td>
            <td class="border p-2 w-[250px] overflow-hidden">
                <div class="max-w-[200px] h-[80px] overflow-hidden">
                    <p id="spec-${product.id}" class="text-sm">${specification}</p>
                </div>
                <button class="text-blue-500 font-bold text-xs underline" 
                    onclick="openModal('${escapeSingleQuotes(encodeURIComponent(product.name))}', 'Spesifikasi Produk', '${escapeSingleQuotes(encodeURIComponent(specification))}')">
                    View More
                </button>
            </td>
            <td class="border p-2 text-center w-[100px]">
                <button class="text-blue-500 font-bold text-sm" 
                    onclick="openImageModal('${encodeURIComponent(product.name)}', '${encodeURIComponent(JSON.stringify(product.images))}')">
                    View Images
                </button>
            </td>
            <td class="border p-2 w-[180px]">
              ${product.links?.whatsapp && product.links.whatsapp !== "N/A"
                ? `<a href="${product.links.whatsapp}" target="_blank" class="text-[#25d366] font-bold">WhatsApp</a>`
                : `<span class="text-gray-400 italic block"></span>`}
                
              ${product.links?.tokopedia && product.links.tokopedia !== "N/A"
                ? `<a href="${product.links.tokopedia}" target="_blank" class="text-[#42b549] font-bold">Tokopedia</a>`
                : `<span class="text-gray-400 italic block"></span>`}
                
              ${product.links?.shopee && product.links.shopee !== "N/A"
                ? `<a href="${product.links.shopee}" target="_blank" class="text-[#ee4d2d] font-bold">Shopee</a>`
                : `<span class="text-gray-400 italic block"></span>`}
            </td>
            <td class="border p-2 text-center w-[100px]">
                ${product.recommended ? "✅ Iya" : "❌ Tidak"}
            </td>
            <td class="border p-2 text-center w-[120px]">
                <button class="bg-yellow-500 hover:bg-yellow-600 mb-2 text-white px-2 py-1 rounded edit-btn" data-id="${product.firestoreId}">Modify</button>
                <button class="bg-red-500 hover:bg-red-700 text-white px-2 py-1 rounded delete-btn" data-id="${product.firestoreId}">Delete</button>
            </td>
        `;
        productList.appendChild(row);
    });

    document.querySelectorAll(".delete-btn").forEach(button => {
        button.addEventListener("click", async (event) => {
            const productId = event.target.dataset.id;
            await deleteProduct(productId);
        });
    });

    document.querySelectorAll(".edit-btn").forEach(button => {
        button.addEventListener("click", (event) => {
            const productId = event.target.dataset.id;
            openModifyModal(productId);
        });
    });
}

const modifyDescContainer = document.getElementById('modify-description-editor');
if (modifyDescContainer && window.Quill) {
    window.quillModifyDescription = new Quill('#modify-description-editor', {
        theme: 'snow',
        placeholder: 'Tulis deskripsi produk di sini…',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'link'],
            ]
        }
    });
}

const modifySpecContainer = document.getElementById('modify-specification-editor');
if (modifySpecContainer && window.Quill) {
    window.quillModifySpecification = new Quill('#modify-specification-editor', {
        theme: 'snow',
        placeholder: 'Tulis spesifikasi produk di sini…',
        modules: {
            toolbar: [
                ['bold', 'italic', 'underline', 'link'],
            ]
        }
    });
}

    document.getElementById("filter-category")?.addEventListener("change", applyFilters);
    document.getElementById("filter-brand")?.addEventListener("change", applyFilters);
    document.getElementById("filter-name")?.addEventListener("input",  applyFilters);
    document.getElementById("reset-filters")?.addEventListener("click", () => {
    document.getElementById("filter-category").value = "";
    document.getElementById("filter-brand").value = "";
    document.getElementById("filter-name").value = "";
    renderTable(allProducts);
    });

    function applyFilters() {
        const categoryValue = document.getElementById("filter-category").value;
        const brandValue = document.getElementById("filter-brand").value.toLowerCase();
        const nameValue = document.getElementById("filter-name").value.toLowerCase();

        const filtered = allProducts.filter(p => {
            const matchesCategory = !categoryValue || (Array.isArray(p.category) ? p.category.includes(categoryValue) : p.category === categoryValue);
            const matchesBrand = !brandValue || (p.brand || "").toLowerCase().includes(brandValue);
            const matchesName = !nameValue || (p.name || "").toLowerCase().includes(nameValue);
            return matchesCategory && matchesBrand && matchesName;
        });

        renderTable(filtered);
    }

    function populateFilterOptions(products) {
        const categorySelect = document.getElementById("filter-category");
        const brandSelect = document.getElementById("filter-brand");

        const categories = new Set();
        const brands = new Set();

        products.forEach(p => {
            if (Array.isArray(p.category)) {
                p.category.forEach(cat => categories.add(cat));
            } else {
                categories.add(p.category);
            }

            if (p.brand) brands.add(p.brand);
        });

        categorySelect.innerHTML = '<option value="">-</option>' +
            Array.from(categories).sort().map(cat => `<option value="${cat}">${cat}</option>`).join("");

        brandSelect.innerHTML = '<option value="">-</option>' +
            Array.from(brands).sort().map(brand => `<option value="${brand}">${brand}</option>`).join("");
    }

    async function openImageModal(productName, imagesEncoded) {
        const images = JSON.parse(decodeURIComponent(imagesEncoded));
    
        const modal = document.getElementById("imageModal");
        const modalTitle = document.getElementById("modalTitle");
        const modalImages = document.getElementById("modalImages");
    
        modalTitle.innerText = `Images of ${decodeURIComponent(productName)}`;
        modalImages.innerHTML = images.length
            ? images.map(img => `<img src="${img}" class="w-32 h-32 object-cover border rounded mx-2">`).join('')
            : '<p class="text-gray-500">No images available</p>';
    
        modal.classList.remove("hidden");
    }
    
    window.openImageModal = openImageModal;

    async function deleteProduct(productId) {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", productId));
                alert("Product deleted successfully!");
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product.");
            }
        }
    }
        
async function openModifyModal(productId) {
  const modal               = document.getElementById("modifyModal");
  const wrapper             = document.getElementById("modifyModalContentWrapper");

  const nameInput           = document.getElementById("modify-name");
  const categoryCheckboxes  = document.querySelectorAll("#modifyModal input[name='category']");
  const brandInput          = document.getElementById("modify-brand");
  const regNumInput         = document.getElementById("modify-registrationNumber");
  const img1Input           = document.getElementById("modify-image1");
  const img2Input           = document.getElementById("modify-image2");
  const img3Input           = document.getElementById("modify-image3");
  const whatsappInput       = document.getElementById("modify-whatsapp");
  const tokopediaInput      = document.getElementById("modify-tokopedia");
  const shopeeInput         = document.getElementById("modify-shopee");
  const recCheckbox         = document.getElementById("modify-recommended");

  try {
    const snap = await getDoc(doc(db, "products", productId));
    if (!snap.exists()) {
      alert("Product not found!");
      return;
    }
    const product = snap.data();

    nameInput.value         = product.name                  || "";
      categoryCheckboxes.forEach(cb => {
    cb.checked = Array.isArray(product.category)
      ? product.category.includes(cb.value)
      : false;
  });
    brandInput.value        = product.brand                 || "";
    regNumInput.value       = product.registrationNumber    || "";
    img1Input.value         = product.images?.[0]           || "";
    img2Input.value         = product.images?.[1]           || "";
    img3Input.value         = product.images?.[2]           || "";
    whatsappInput.value     = product.links?.whatsapp       || "";
    tokopediaInput.value    = product.links?.tokopedia      || "";
    shopeeInput.value       = product.links?.shopee         || "";
    recCheckbox.checked     = !!product.recommended;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    setTimeout(() => {
      const h = wrapper.scrollHeight;
      wrapper.style.maxHeight = window.innerWidth < 768
        ? (h > 10  ? "40vh" : "auto")
        : (h > 200 ? "50vh" : "auto");
    }, 100);

    const productInfo = Array.isArray(product.details?.productInfo)
      ? product.details.productInfo
      : [];

    const descHTML = productInfo.find(i => i.title === "Deskripsi Produk")?.description || "";
    const specHTML = productInfo.find(i => i.title === "Spesifikasi")?.description || "";

    quillModifyDescription.root.innerHTML   = descHTML;
    quillModifySpecification.root.innerHTML = specHTML;

document.getElementById("save-modify-btn").onclick = async () => {
  const updatedCategories = Array.from(
    document.querySelectorAll("#modifyModal input[name='category']:checked")
  ).map(cb => cb.value);

  const updated = {
    name: nameInput.value.trim(),
    category: updatedCategories,
    brand: brandInput.value.trim() || "N/A",
    registrationNumber: regNumInput.value.trim(),
    details: {
      productInfo: [
        {
          title: "Deskripsi Produk",
          description: quillModifyDescription.root.innerHTML.trim()
        },
        {
          title: "Spesifikasi",
          description: quillModifySpecification.root.innerHTML.trim()
        },
        {
          title: "Nomor Registrasi / Izin Edar Alkes",
          description: [ regNumInput.value.trim() ]
        }
      ]
    },
    images: [
      img1Input.value.trim(),
      img2Input.value.trim(),
      img3Input.value.trim()
    ],
    links: {
      whatsapp: whatsappInput.value.trim(),
      tokopedia: tokopediaInput.value.trim(),
      shopee: shopeeInput.value.trim()
    },
    recommended: recCheckbox.checked
  };
      try {
        await updateDoc(doc(db, "products", productId), updated);
        alert("Product updated successfully!");
        closeModifyModal();
      } catch (err) {
        console.error(err);
        alert("Failed to update product.");
      }
    };
  }
  catch (e) {
    console.error(e);
    alert("Error loading product details.");
  }
}

    window.closeModifyModal = function () {
        const modal = document.getElementById("modifyModal");
        modal.classList.add("hidden");
        document.body.classList.remove("overflow-hidden"); 
    };
    
    loadProducts();
});