# Lamson Care Catalogue Website
Lamson Care showcases health-related products and articles. The website's layout is styled with Tailwind CSS for responsive viewing on any device. 
Through this website, users can search products by its category, brand, or name using Fuse.js's lightweight fuzzy-search library. Viewing detailed product info, along with multi-section articles are all dynamically pulled from Firestore. 
Admins have access to a private dashboard (secured with Firebase Auth) where they can add, edit, or delete products and articles in real time. 
Articles, product descriptions, and product specifications are managed using the Quill.js editor for flexible text formatting.

## 🌐 Live Demo
[Visit the Live Site](https://care-lamson.web.app)

## 📈 Web Features
- Admin login system with Firebase Authentication
- Dynamic product and article display from Firestore
- Fuse.js integration for searching products by category, brand, or name
- Quill.js integration for writing articles, product descriptions, and product specifications
- Product & article management via admin dashboard
- Fully responsive design using Tailwind CSS

## 🔧 General Info
- **Frontend:** HTML, Tailwind CSS, JavaScript
- **Backend:** Firebase Firestore, Firebase Auth, Firebase Hosting
- **Other Tools:** Quill.js, Fuse.js, FontAwesome, Freepik Flaticon

## ❗ Important Info
- Sensitive Firebase configuration files (such as `config.js`) contain **placeholder values** in this repository for security reasons. To run the project locally, please **create your own `config.js`** file and insert your Firebase credentials.
- Firebase deployment settings (`.firebaserc`) have been **intentionally excluded** to prevent accidental deployment. If you plan to deploy the project, please **set up and use your own Firebase project**.

**🔥 [Firebase Setup Documentation](https://firebase.google.com/docs/web/setup)**
