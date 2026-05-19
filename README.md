# LeafScan

A high-precision, server-side Computer Vision pipeline built with Nuxt 3 and OpenCV.js. This application is designed to accurately measure the surface area of botanical specimens (leaves) and find shape-based similarities using advanced image processing algorithms.

## 🚀 Key Features

- **Document-Scanner Architecture:** Uses Canny Edge Detection and Contour Finding to detect an A4 paper in the frame, completely ignoring background noise (tables, carpets, shadows).
- **Perspective Warp (Flatbed Scanning):** Mathematically flattens the detected A4 paper into a perfect top-down view rectangle, eliminating perspective distortion caused by camera angles.
- **Flawless Area Calculation:** By using the standard dimensions of an A4 paper (21cm x 29.7cm) as a reference plane, the application calculates the exact real-world surface area of the leaf in `cm²` with extreme pixel accuracy.
- **Adaptive Thresholding:** Ignores heavy shadows and uneven lighting gradients on the paper to perfectly extract the leaf's contour.
- **Shape Similarity Matching (Hu Moments):** Calculates the 7 Hu Moments of the leaf's contour. These values are mathematically invariant to translation, scale, and rotation. The system uses these moments to find structurally similar leaves in the database, regardless of their physical size or how they were oriented in the photo.
- **Modern UI:** Built with Vue 3 and Tailwind CSS. Features a step-by-step visual pipeline debugger that streams the OpenCV processing steps directly to the browser via HTML5 Canvas.

## 🛠️ Technology Stack

- **Framework:** [Nuxt 4](https://nuxt.com/) (Vue 3)
- **Computer Vision:** [OpenCV.js](https://docs.opencv.org/4.x/d5/d10/tutorial_js_root.html) (running entirely server-side in Node.js)
- **Image Processing:** [Sharp](https://sharp.pixelplumbing.com/) (for extremely fast buffer manipulation)
- **Database:** PostgreSQL (managed via [Drizzle ORM](https://orm.drizzle.team/))
- **Styling:** Tailwind CSS

## 📋 How It Works (The 9-Step Pipeline)

When an image is uploaded, the backend executes the following Computer Vision pipeline:

1. **Original Image:** The raw uploaded photograph.
2. **Grayscale:** Converts the image from RGB to a single channel.
3. **Canny Edge Detection:** Highlights sharp boundaries with Gaussian blur to find the paper.
4. **Morphological Ops:** Closes gaps in the edge map.
5. **Paper Contour:** Finds the largest 4-point polygon (the A4 paper).
6. **Perspective Warp:** Top-down document flattening via Matrix Transformation.
7. **Warped Thresholding:** Applies Adaptive Gaussian Thresholding to handle shadows.
8. **Leaf Contour:** Isolates the leaf on the perfectly flat white background.
9. **Area Calculation:** Calculates the leaf's pixel ratio against the A4 paper's 623.7 cm² reference area.

## 💻 Installation & Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/leafscan-cv.git
    cd leafscan-cv
    ```

2. Install dependencies:

    ```bash
    pnpm install
    ```

3. Configure Database:
    - Create a `.env` file in the root directory.
    - Add your PostgreSQL connection string: `DATABASE_URL=postgres://user:pass@localhost:5432/db`
    - Push the schema: `pnpm drizzle-kit push:pg`

4. Run the development server:

    ```bash
    pnpm dev
    ```

5. Open `http://localhost:3000` in your browser.

## 📸 Usage Instructions

1. Place a standard **A4 paper** on a contrasting surface (e.g., a dark wooden table).
2. Place the leaf you want to measure directly **ON** the A4 paper.
3. Take a photo ensuring all 4 corners of the A4 paper are clearly visible in the frame.
4. Upload the photo to the application and watch the magic happen!
