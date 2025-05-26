import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { firebaseConfig } from "./config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", function () {
  const submit = document.getElementById('submit');
  const LogOut = document.getElementById('LogOutButton');

  if (submit) {
    submit.addEventListener("click", function (event) {
      event.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
          alert('Logging in...');
          window.location.replace("adminDashboard.html");
        })
        .catch((error) => {
          alert(error.message);
        });
    });
  }

  if (LogOut) {
    LogOut.addEventListener("click", function (event) {
      event.preventDefault();
      signOut(auth)
        .then(() => {
          alert('Logging out...');
          window.location.replace("index.html");
        })
        .catch((error) => {
          alert(error.message);
        });
    });
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("User is signed in:", user.email || user.displayName);
  } else {
    console.log("No user is signed in.");
  }
});

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");

if (forgotPasswordBtn) {
  forgotPasswordBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;

    if (!email) {
      alert("Please enter your email address first.");
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent. Check your inbox.");
      })
      .catch((error) => {
        console.error("Error sending reset email:", error);
        alert(error.message);
      });
  });
}
