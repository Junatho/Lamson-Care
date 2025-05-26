import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function getProductIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProductDetails() {
    const productId = getProductIdFromURL();

    if (!productId) {
        console.error("No product ID.");
        return;
    }

    const q = query(collection(db, "products"), where("id", "==", Number(productId))); 
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();

        const products = {
            id: data.assignedID,
            name: data.name,
            category: data.category,
            brand: data.brand,
            registrationNumber: data.registrationNumber,
            details: {
                productInfo: [
                    { title: "Deskripsi Produk", description: data.description },
                    { title: "Spesifikasi", description: data.specification },
                    { title: "Nomor Registrasi / Izin Edar Alkes", description: [data.registrationNumber] }
                ]
            },
            images: data.images || [],
            links: data.links || []
        };

        activities.push(products);
        console.log("products loaded:", products);
    } else {
        console.error("Product not found.");
    }
}

loadProductDetails();