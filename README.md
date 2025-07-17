# DreamCheck

A **React** web application built with **Vite** for daily checklists and dream journaling. Users can sign in with Google (Firebase Authentication), maintain a checklist, and record/write their dream entries for each day. Data is stored in **Cloud Firestore** under each user’s account.

---

## 🚀 Features

* **Google Sign-In:** Secure authentication via Firebase Authentication.
* **Daily Checklist:** Prepopulated checklist items; check/uncheck to track daily habits.
* **Dream Journal:** Rich textarea to write and save daily dream logs.
* **Date Navigation:** Easily backtrack to past days or jump to today.
* **Persistent Routine:** Optional persistent routine list maintained across all dates.
* **Responsive UI:** Tailwind-based styling, mobile- and desktop-friendly.
* **Automatic Deployment:** CI/CD with GitHub Actions to GitHub Pages.

---

## 📦 Tech Stack

* **Vite** — Fast build tool and dev server
* **React** — UI component library
* **Firebase** — Authentication and Firestore database
* **Tailwind CSS** — Utility-first CSS framework
* **GitHub Actions** — Automated build & deploy to GitHub Pages

---

## 📑 Deployment

Uses GitHub Actions (`.github/workflows/pages.yml`) to build and deploy the app to [GitHub Pages](https://jqhz.github.io/DreamCheck/). The `build` step injects environment secrets into a `.env` file before bundling.

---

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## 📜 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

> Developed by **Jahzz** • [GitHub](https://github.com/jqhz) • [Firebase](https://firebase.google.com/) • [Vite](https://vitejs.dev/)
