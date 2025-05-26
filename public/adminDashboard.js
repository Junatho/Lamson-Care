import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  const emailElement = document.getElementById('admin-email');

  onAuthStateChanged(auth, (user) => {
    if (user) {
      emailElement.textContent = user.email;
    } else {
      alert('Logging out...');
      window.location.replace('LoginPage.html');
    }
  });
});

document.getElementById("name").addEventListener("input", function () {
  this.value = this.value.charAt(0).toUpperCase() + this.value.slice(1);
});

const changeBtn = document.getElementById("change-password-btn");
const modal = document.getElementById("password-modal");
const cancelBtn = document.getElementById("cancel-password-btn");
const confirmBtn = document.getElementById("confirm-password-btn");
const message = document.getElementById("password-message");

const currentInput = document.getElementById("current-password");
const newInput = document.getElementById("new-password");
const confirmInput = document.getElementById("confirm-password");

function resetModal() {
  currentInput.value = "";
  newInput.value = "";
  confirmInput.value = "";
  message.classList.add("hidden");
  message.classList.remove("text-red-600", "text-green-600");
  message.textContent = "";
}

changeBtn.addEventListener("click", () => {
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
});

cancelBtn.addEventListener("click", () => {
  modal.classList.add("hidden");
  document.body.style.overflow = "auto";
  resetModal();
});

async function handlePasswordChange() {
  const currentPass = currentInput.value;
  const newPass = newInput.value;
  const confirmPass = confirmInput.value;

  // Clear old message classes
  message.classList.remove("text-red-600", "text-green-600");

  if (newPass !== confirmPass) {
    message.textContent = "Password baru tidak cocok.";
    message.classList.add("text-red-600");
    message.classList.remove("hidden");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    message.textContent = "Tidak ada pengguna yang login.";
    message.classList.add("text-red-600");
    message.classList.remove("hidden");
    return;
  }

  try {
    const credentials = EmailAuthProvider.credential(user.email, currentPass);
    await reauthenticateWithCredential(user, credentials);
    await updatePassword(user, newPass);

    // ✅ Refresh the user's session to prevent logout
    await user.reload();
    await auth.currentUser.getIdToken(true);

    console.log("✅ Password updated and session refreshed for user:", auth.currentUser?.email);

    message.textContent = "Password berhasil diperbarui.";
    message.classList.add("text-green-600");
    message.classList.remove("hidden");

    setTimeout(() => {
      modal.classList.add("hidden");
      document.body.style.overflow = "auto";
      resetModal();
    }, 1500);
  } catch (error) {
    message.textContent = "Gagal memperbarui password. Periksa password lama Anda.";
    message.classList.add("text-red-600");
    message.classList.remove("hidden");
    console.error("❌ Password update failed:", error);
  }
}

confirmBtn.addEventListener("click", handlePasswordChange);

modal.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handlePasswordChange();
});
