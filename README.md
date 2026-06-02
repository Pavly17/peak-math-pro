# Peak Math Pro 🧮✨

> The ultimate modern scientific and graphing calculator web application.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-1.0.0-success.svg)
![Vanilla JS](https://img.shields.io/badge/Tech-Vanilla%20JS-yellow.svg)

Peak Math Pro is a sleek, professional, and powerful web-based calculator designed for students, engineers, and math enthusiasts. It features a stunning glassmorphism UI, real-time math parsing, and advanced graphing capabilities.

## 🌟 Features

*   **Scientific Mode:** Complex numbers, trigonometry, logarithms, and standard mathematical functions.
*   **Graphing Mode:** Interactive 2D function plotting with zoom, pan, and coordinate tracing.
*   **Calculus Hub:** Symbolic differentiation and numeric integration.
*   **Linear Algebra:** Matrix operations including addition, multiplication, determinant, and inversion.
*   **Physics Constants:** Quick access to essential physical constants for rapid calculations.
*   **Beautiful UI:** Premium dark-mode interface with glassmorphism, responsive design, and smooth animations.

## 🚀 Tech Stack

*   **HTML5 / CSS3 / Vanilla JS** (No bundlers required, purely modular)
*   **[Math.js](https://mathjs.org/)**: For robust mathematical expression parsing and symbolic computation.
*   **[KaTeX](https://katex.org/)**: For beautiful, fast LaTeX math rendering in the browser.
*   **[Function Plot (D3)](https://mauriciopoppe.github.io/function-plot/)**: For 2D graphing and rendering.

## 📂 Project Structure

```
calc/
│
├── index.html       # Main application entry point
├── css/
│   └── style.css    # Premium UI styles, glassmorphism & animations
└── js/
    └── app.js       # Core logic, DOM manipulation & math handling
```

## 🛠️ Installation & Usage

Since this is a Vanilla JS application, no complex build steps are required.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/peak-math-pro.git
    ```
2.  **Navigate to the directory:**
    ```bash
    cd peak-math-pro
    ```
3.  **Run the application:**
    *   Simply open `index.html` in your favorite web browser.
    *   *Optional:* For the best experience (to avoid CORS issues with some local files if added later), run a local server:
        ```bash
        npx serve .
        # or
        python -m http.server 8000
        ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/yourusername/peak-math-pro/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
