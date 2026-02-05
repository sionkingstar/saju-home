# DESIGN.md: 사주명가 대운 만세력 (Premium Oriental)

## 1. Design Concept
- **Theme:** "Celestial Destiny" (천상의 운명)
- **Keywords:** Modern, Oriental, Mysterious, Premium, Trustworthy
- **Atmosphere:** Deep night sky, twinkling stars, golden fate lines. Not superstitious, but data-driven and elegant.

## 2. Color Palette
- **Primary (Night Sky):** `#0B1026` (Deep Navy) - Background
- **Secondary (Star Light):** `#D4AF37` (Champagne Gold) - Buttons, Highlights, Borders
- **Accent (Moonlight):** `#E2E8F0` (Off-white) - Text
- **Surface (Card):** `rgba(255, 255, 255, 0.05)` (Glassmorphism effect) - Content Cards
- **Gradient:** `linear-gradient(135deg, #0B1026 0%, #232d4b 100%)`

## 3. Typography
- **Headings:** 'Noto Serif KR', serif. (For a traditional, dignified look)
- **Body:** 'Pretendard' or 'Noto Sans KR', sans-serif. (For readability)

## 4. UI Components
### 4.1. Input Field
- Transparent background with Gold border bottom.
- Animated placeholder/label.
- Smooth transition on focus.

### 4.2. "Analyze" Button
- **Style:** Solid Gold (`#D4AF37`) background with dark text, or Ghost Gold border with glowing text.
- **Hover:** Gentle glow or subtle lift effect.

### 4.3. Result Cards (Manse-ryeol)
- **Design:** Glassmorphism cards.
- **Layout:** Grid system for the 4 Pillars (Year, Month, Day, Hour).
- **Kanji:** Large, bold serif font for the Chinese characters (Gapja).

## 5. User Journey
1.  **Landing:** "Discover your destiny." (Hero section with subtle star animation).
2.  **Input:** User enters Birth Date/Time/Gender.
3.  **Loading:** "Parsing the stars..." (Animation of constellations connecting).
4.  **Result:**
    -   Summary (Your Element).
    -   The 4 Pillars Table (Visualized).
    -   Call to Action: "Unlock deep analysis on Notion" (Premium Link).

## 6. Technical Stack
- **Frontend:** React (Vite)
- **Styling:** CSS Modules or Tailwind (based on preference, sticking to CSS Modules for clean custom styling).
- **Backend:** Existing Python Flask Server (`server.py`).
- **Connection:** Axios/Fetch to `localhost:5000`.
