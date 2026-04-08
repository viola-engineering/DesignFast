import {
  AgentLoop,
  createProvider,
  createDefaultRegistry,
  DatabaseImpl,
} from '@angycode/core';
import { createInterface } from 'node:readline';
import { readdirSync, existsSync } from 'node:fs';

// ─── Style Presets ──────────────────────────────────────────────────────────

const STYLES = {
  minimalist: {
    name: 'Minimalist',
    prompt: `Use a MINIMALIST style.
- Layout: single-column, max-width 720px, centered. NO multi-column grids. NO card grids. NO sidebars.
- Colors: muted palette only — off-white (#FAFAF9), warm grays, one single subtle accent color (muted sage or soft clay). NO vibrant colors. NO gradients.
- Typography: thin/light weight fonts (200–400). Large line-height (1.8+). Generous letter-spacing. One serif OR one clean sans-serif — never both.
- Spacing: extreme whitespace. Sections separated by 120px+ vertical space. Padding generous everywhere.
- Decorations: NONE. No icons, no emoji, no illustrations, no shadows, no borders, no rounded corners, no background shapes. Use only thin hairline <hr> dividers if needed.
- Buttons: text-only or minimal outlined. No filled buttons. No hover effects beyond subtle opacity change.
- Vibe: Dieter Rams. Japanese zen. "Less, but better." Every element must earn its place.`,
  },

  brutalist: {
    name: 'Brutalist',
    prompt: `Use a BRUTALIST style.
- Layout: asymmetric, intentionally "broken" grid. Overlapping elements. Off-center positioning. Use CSS Grid with unusual column spans. NO symmetry. NO conventional hero-features-pricing structure.
- Colors: stark black and white as base. ONE raw accent color (electric red, acid yellow, or cyan). High contrast. NO pastels. NO gradients.
- Typography: monospace font only (Courier, JetBrains Mono, or Space Mono). MASSIVE headlines (6rem+). Mix uppercase and lowercase deliberately. Tight letter-spacing on headers, wide on body.
- Borders: thick 3px+ solid black borders on everything. NO rounded corners anywhere (border-radius: 0). Visible box model.
- Decorations: raw, exposed structure. Show the grid. Use visible border outlines. Text can be rotated or positioned unusually.
- Buttons: rectangular, thick-bordered, monospace text. No hover animations — just invert colors on hover.
- Vibe: raw concrete, exposed pipes, 1990s web meets punk zine. Intentionally rough. Anti-design is the design.`,
  },

  glassmorphism: {
    name: 'Glassmorphism',
    prompt: `Use a GLASSMORPHISM style.
- Layout: centered, layered card panels floating over a colorful background. Content lives inside frosted glass containers. Max 2 columns. Overlapping layers create depth.
- Background: rich gradient mesh or blurred color blobs (use large CSS gradients with multiple color stops — purples, blues, pinks). This is the canvas behind the glass.
- Glass panels: background rgba(255,255,255,0.12), backdrop-filter: blur(16px), border: 1px solid rgba(255,255,255,0.2), subtle box-shadow. Semi-transparent cards floating over the colorful bg.
- Colors: white text on glass panels over dark/colorful backgrounds. Accent colors come from the background gradient bleeding through the glass.
- Typography: clean sans-serif (Inter, SF Pro style). Medium weight. High contrast white text.
- Spacing: generous padding inside glass panels (32px+). Cards have noticeable gaps between them.
- Decorations: floating blurred color orbs in the background. Subtle border glow on glass edges. NO sharp borders. Everything feels ethereal.
- Vibe: iOS/macOS frosted glass. Premium, layered, atmospheric. Depth through translucency.`,
  },

  corporate: {
    name: 'Corporate',
    prompt: `Use a CORPORATE / PROFESSIONAL style.
- Layout: structured 12-column grid. Clear visual hierarchy. Standard sections: nav, hero, features grid, social proof, CTA, footer. Predictable, trustworthy layout. Max-width 1200px.
- Colors: navy blue (#1E3A5F) as primary. White backgrounds. Light gray (#F8FAFC) alternate sections. One warm accent for CTAs (amber or green). NO neon. NO playful colors.
- Typography: professional sans-serif only (Inter, IBM Plex Sans, or similar). Weight 400 for body, 600-700 for headings. Standard sizes, nothing oversized.
- Grid: 2 or 3 column grids for features. Equal spacing. Aligned. Balanced. Everything on the grid.
- Elements: subtle shadows (shadow-sm). Rounded corners but conservative (rounded-lg max). Professional icons (describe them, use unicode symbols). Stat numbers with labels.
- Buttons: solid filled primary buttons (navy blue). White text. Standard sizing. Ghost/outlined secondary buttons.
- Trust signals: fake logos bar ("Trusted by"), testimonial cards with role/company, metric counters.
- Vibe: McKinsey, Stripe, enterprise SaaS. Inspires confidence. No personality — all professionalism.`,
  },

  playful: {
    name: 'Playful',
    prompt: `Use a PLAYFUL and COLORFUL style.
- Layout: irregular/asymmetric grid. Cards at slightly different sizes. Sections that break the grid intentionally. Bento-style layouts with mixed column spans. NOT a standard top-to-bottom flow.
- Colors: vibrant saturated palette — sunny yellow (#FFD93D), coral (#FF6B6B), mint (#06D6A0), sky blue (#4CC9F0), bubblegum pink (#FF70A6), grape purple (#7B2FBE). Use 4+ colors. Warm cream background (#FFF8EE).
- Typography: display font (Fredoka One, Baloo, or Poppins Black) for headings. Rounded body font (Nunito, Quicksand). Oversized headings (5rem+). Bold weights everywhere (700-900).
- Corners: extra rounded (border-radius 1.5rem–3rem). Pill-shaped buttons and tags.
- Decorations: floating emoji, animated elements (wiggle, bounce, float keyframes). Doodle-style squiggle underlines via SVG. Blob shapes in background. Stickers/badges aesthetic.
- Buttons: chunky 3D buttons with box-shadow press effect. Filled with bold colors. Large (py-4 px-8+).
- Interactions: hover lifts, card pop-in animations, bouncing icons.
- Vibe: Duolingo, Notion marketing site, kindergarten teacher meets modern web. Joyful, energetic, makes you smile.`,
  },

  darkLuxury: {
    name: 'Dark Luxury',
    prompt: `Use a DARK LUXURY style.
- Layout: full-width, full-bleed sections. NO max-width container — content goes edge to edge. Large hero taking 100vh. Generous vertical rhythm (100px+ between sections). Fewer sections, each with more breathing room.
- Colors: deep black background (#0A0A0A or #111111). Gold (#C9A84C) or champagne (#D4AF37) as accent. Cream/off-white (#F5F0E8) for body text. NO bright colors. NO blues. NO gradients unless very subtle dark-to-darker.
- Typography: elegant serif for headlines (Playfair Display, Cormorant Garamond). Thin sans-serif for body (200-300 weight). Large tracking on headings (letter-spacing: 0.15em+). UPPERCASE headings with extreme letter-spacing.
- Spacing: extravagant whitespace. Let content breathe. Single elements centered on screen with massive margins.
- Decorations: thin gold hairline dividers. Subtle gold borders (1px). NO shadows. NO blobs. NO emoji. Minimal — luxury is restraint.
- Images: large, cinematic aspect ratios. Dark overlays on any image areas.
- Buttons: outlined with gold border. Thin text. Uppercase. Wide letter-spacing. NO filled buttons.
- Vibe: Rolex, Aesop, luxury hotel website. Whispers, doesn't shout. Every pixel exudes premium.`,
  },

  editorial: {
    name: 'Editorial',
    prompt: `Use an EDITORIAL / MAGAZINE style.
- Layout: asymmetric multi-column grid inspired by print magazines. Mix wide and narrow columns. Pull quotes that break the grid. Full-bleed image areas next to narrow text columns. NOT a standard web layout.
- Colors: mostly black and white with ONE strong editorial accent (deep red #C41E3A, or electric blue #0057FF). Large areas of solid white or solid black.
- Typography: BOLD typographic hierarchy is the main design element. Huge serif headlines (Playfair Display, DM Serif, or Georgia) at 5-8rem. Small sans-serif body text. Mix italic and roman. Pull quotes in oversized italic serif.
- Grid: CSS Grid with deliberate asymmetry. 2-column layouts where text column is 1fr and image/accent column is 2fr or vice versa. Break the grid with full-width elements.
- Decorations: large typographic numbers for section numbering. Thin rule lines. Drop caps on paragraphs. NO icons. NO emoji. Let typography do the work.
- Whitespace: dramatic — large gaps between elements. Short text blocks with generous margins.
- Vibe: The New York Times Magazine, Bloomberg Businessweek, Monocle. Content-first, type-driven, sophisticated. The text IS the design.`,
  },

  retro: {
    name: 'Retro',
    prompt: `Use a RETRO / VINTAGE style.
- Layout: centered, max-width 960px. Stacked sections with decorative borders between them. Symmetrical, deliberate, slightly formal like a vintage poster.
- Colors: muted vintage palette — dusty rose (#D4A59A), olive green (#606C38), mustard (#DDA15E), faded navy (#283D3B), cream (#FEFAE0). NO neon. NO pure white — use cream/off-white.
- Typography: serif fonts for everything (Libre Baskerville, Lora, or Merriweather). Decorative display font for main headline only (Playfair Display or similar). Small caps for subheadings. Classic typographic details.
- Borders: decorative double-line borders. Ornamental dividers (use CSS border-style: double, or repeating patterns). Subtle texture feeling.
- Decorations: badge/emblem style elements (rounded bordered containers with text inside like "EST. 2024" or "★ PREMIUM ★"). Vintage label aesthetic. NO modern icons — use typographic symbols (★, •, ✦, ※).
- Buttons: bordered, uppercase, letter-spaced. Vintage label feel. Muted colors, not bold.
- Vibe: vintage apothecary label, 1960s magazine ad, letterpress print shop. Warm, nostalgic, crafted.`,
  },

  neobrutalism: {
    name: 'Neobrutalism',
    prompt: `Use a NEOBRUTALISM style.
- Layout: blocky, grid-based. Large chunky cards with hard borders. Slightly chaotic but intentional arrangement. Cards can be slightly rotated (1-2deg). Mix of sizes.
- Colors: bright saturated primaries — hot pink (#FF5ABE), electric blue (#3B82F6), acid lime (#B8FF29), bright orange (#FF7F11), pure white, pure black. NO pastels. NO muted tones. High contrast combos.
- Borders: thick black borders (3-4px) on EVERYTHING. Hard box shadows (offset 4px 4px 0px #000 — no blur). Every element looks like a sticker or cutout.
- Typography: bold sans-serif (900 weight). Large chunky text. Mix of sizes for visual rhythm. Can use a playful display font for headlines.
- Corners: small rounded corners (8px max) or none. NOT pill-shaped. Chunky, not smooth.
- Decorations: colored blocks as backgrounds. Elements look like physical stickers/stamps. Thick underlines. Star/asterisk decorations.
- Buttons: thick bordered, offset shadow, bold text. Bright colored fill. On hover: shadow disappears and button shifts down/right (press effect).
- Vibe: Figma marketing, Gumroad, modern zine aesthetic. Bold, in-your-face, unapologetic. Looks like a collage of colored paper cutouts.`,
  },

  organic: {
    name: 'Organic',
    prompt: `Use an ORGANIC / NATURAL style.
- Layout: flowing, single-column with occasional 2-column splits. Sections have soft wave or curve dividers (SVG curves between sections). Content feels like it flows downward naturally. Max-width 1000px.
- Colors: earth tones — warm sand (#E8DCC8), forest green (#2D5016), terracotta (#C67B4B), deep soil (#3E2723), soft sage (#A8B5A2), cream white (#FAF6F0). NO digital/tech colors. NO blues.
- Typography: humanist sans-serif (Lato, Nunito) or warm serif (Merriweather, Lora). Comfortable reading sizes. Medium weight. Generous line-height (1.7+). Text should feel hand-set, natural.
- Shapes: organic rounded shapes — asymmetric border-radius (60% 40% 55% 45% / 50% 60% 40% 50%). No sharp geometric shapes. Blobs, ovals, pebble shapes.
- Decorations: subtle leaf or branch SVG accents (described, use simple CSS shapes). Soft shadows (large blur, low opacity). Wave section dividers. NO hard lines.
- Spacing: comfortable, generous but not extreme. Feels like a well-designed book page.
- Buttons: soft rounded, earth-toned fills. Gentle hover transitions (0.3s ease). Warm, inviting.
- Vibe: Aesop, organic food brand, wellness spa. Calm, grounded, connected to nature. Makes you take a deep breath.`,
  },

  cyberpunk: {
    name: 'Cyberpunk',
    prompt: `Use a CYBERPUNK / NEON style.
- Layout: dashboard-like grid panels with thick borders and gaps. Asymmetric, dense, information-heavy. Mix wide and narrow panels. Some sections styled as "terminal windows" with title bars. NO conventional hero-features-pricing flow — make it feel like a HUD interface.
- Colors: deep dark background (#0A0A0F or #0D0221). Neon accent colors: cyan (#00F0FF), hot magenta (#FF00FF), electric green (#39FF14), neon pink (#FF2D6B). Use neon glow effects (box-shadow: 0 0 15px, 0 0 40px with neon colors). NO warm colors. NO pastels.
- Typography: monospace for UI labels (JetBrains Mono, Fira Code). Futuristic sans-serif for headlines (Orbitron, Rajdhani, or Exo 2). ALL CAPS for labels and section headers. Tight letter-spacing on body, wide on labels.
- Borders: 1px solid neon color borders on panels. Glowing border effect on hover. Corner accents (small L-shaped marks in corners of panels via ::before/::after).
- Decorations: scanline overlay (repeating-linear-gradient with thin semi-transparent lines). Animated glitch effect on hero text. Blinking cursor. Faux terminal prompts ("> system.ready"). Grid background pattern (subtle grid lines).
- Buttons: outlined with neon glow. On hover: background fills with neon color, glow intensifies. Monospace text. Uppercase.
- Vibe: Blade Runner, Cyberpunk 2077, hacker terminal meets neon Tokyo. Dark, electric, futuristic. The screen itself feels alive.`,
  },

  swiss: {
    name: 'Swiss / Bauhaus',
    prompt: `Use a SWISS / BAUHAUS / INTERNATIONAL TYPOGRAPHIC style.
- Layout: strict modular grid system. Use CSS Grid with precise mathematical columns (e.g., 12-column with content snapping to 4/8/12 spans). Asymmetric but CALCULATED balance — every element placed with mathematical intention. White background. Content blocks align to a visible underlying grid logic.
- Colors: PRIMARY colors only — red (#FF0000), blue (#0000FF), yellow (#FFD700), black (#000000), white (#FFFFFF). Use them sparingly and deliberately. Large blocks of solid primary color as section backgrounds. NO gradients. NO pastels. NO tertiary colors.
- Typography: Helvetica, Inter, or similar geometric sans-serif ONLY. Headlines in bold/black weight. Body in regular/light. Use a strict type scale (e.g., 12, 16, 24, 36, 48, 72px — nothing in between). NO serif fonts. NO decorative fonts.
- Grid: content MUST feel like it sits on a precise grid. Use visible structural elements — thin black rules, alignment guides. Asymmetric layouts where text occupies 1/3 and whitespace 2/3, or vice versa.
- Decorations: geometric shapes ONLY — circles, rectangles, lines. Used as compositional elements, not decoration. A large red circle. A yellow rectangle. A black diagonal line. These are structural, not ornamental.
- Buttons: rectangular, black background, white text. No rounded corners. No shadows. Just geometry.
- Vibe: Josef Müller-Brockmann, Jan Tschichold, Bauhaus school. Mathematical precision. The grid IS the design. Form follows function with zero ornamentation. Cold, precise, beautiful.`,
  },

  artDeco: {
    name: 'Art Deco',
    prompt: `Use an ART DECO style.
- Layout: centered and SYMMETRICAL. Content is framed within decorative borders. Tall, vertical proportions. Sections stacked with ornamental dividers between them. Max-width 1000px. Everything centered on a strong vertical axis.
- Colors: black (#1A1A1A) and gold (#D4AF37 or #C9A961) as primary combination. Cream (#FAF3E0) as background. Deep emerald (#1B4332) or navy (#1B2838) as occasional accent. NO bright or saturated modern colors.
- Typography: tall, condensed serif or display font for headlines (Playfair Display, Poiret One, or Cinzel). UPPERCASE with extreme letter-spacing (0.2em+) for headings. Art Deco is about VERTICAL letterforms — tall, narrow, elegant. Body text in clean serif (Cormorant, EB Garamond).
- Borders: thin gold lines used extensively. Double-line borders. Geometric border patterns (repeating lines, stepped patterns). Create decorative frames around sections using CSS borders and pseudo-elements.
- Decorations: fan/sunburst shapes (CSS conic-gradient or border tricks). Geometric patterns — chevrons, zigzags, stepped pyramids. Ornamental dividers between sections (horizontal rules with geometric centerpieces). Corner ornaments on cards.
- Buttons: outlined with gold border. Uppercase, wide letter-spacing. Thin, elegant. Gold fill on hover. NO rounded corners — sharp or slightly chamfered.
- Vibe: The Great Gatsby, 1920s Manhattan, Chrysler Building lobby. Geometric luxury. Ornamental but structured. Every decorative element follows geometric rules — no organic curves, no randomness.`,
  },

  newspaper: {
    name: 'Newspaper',
    prompt: `Use a NEWSPAPER / BROADSHEET style.
- Layout: USE CSS COLUMNS (column-count, column-gap, column-rule) for body text sections — real multi-column text flow like a newspaper. Mix 2-column and 3-column sections. Hero area should be a massive headline spanning full width, then content drops into columns below. Completely different from standard web layouts.
- Colors: almost entirely black text on off-white/newsprint background (#F5F2EB or #FFFDF7). One spot color used very sparingly (deep red #8B0000 for the masthead or a single accent). NO colorful sections. NO colored backgrounds. Just ink on paper.
- Typography: newspaper hierarchy is EVERYTHING. Masthead: large serif display (Playfair Display, DM Serif Display) at 4-6rem. Main headline: bold serif at 3-4rem. Deck (subheadline): italic serif at 1.2rem. Byline: small caps, light weight. Body: serif at ~15px with 1.6 line-height for readability in columns. Section headers: bold, all-caps, small size with rules above/below.
- Column layout specifics: use column-rule (thin solid lines between columns). Use break-inside: avoid on cards/elements. Pull quotes should use column-span: all to break across columns dramatically.
- Decorations: thin horizontal rules (1px solid black) EVERYWHERE — above/below headlines, between sections, between articles. Drop caps on first paragraphs (::first-letter styled large). Section labels like "TECHNOLOGY" or "FEATURES" in small caps above articles. Dateline and issue number in the masthead.
- Buttons: text links styled as underlined serif text. NO filled buttons. NO rounded buttons. Just text with underlines, like newspaper references.
- Vibe: The New York Times front page, The Guardian, Financial Times. Content-first. Typography IS the design. The layout itself tells you this is serious, credible, authoritative journalism.`,
  },

  neumorphism: {
    name: 'Neumorphism',
    prompt: `Use a NEUMORPHISM / SOFT UI style.
- Layout: centered, card-based. Single column or simple 2-column grid. Max-width 960px. Clean, Apple-like simplicity. Cards and buttons appear to be physically embossed or debossed from the background surface. Everything lives on one continuous surface.
- Background: ONE single background color everywhere — light gray (#E0E5EC). The ENTIRE page is this color. No section color changes. No dark sections. No white sections. Just one continuous gray surface.
- Shadows: THIS IS THE CORE TECHNIQUE. Every element uses DUAL shadows:
  - Raised/embossed: box-shadow: 8px 8px 16px #b8bec7, -8px -8px 16px #ffffff;
  - Pressed/debossed: box-shadow: inset 5px 5px 10px #b8bec7, inset -5px -5px 10px #ffffff;
  - Use raised for cards, containers, inactive buttons
  - Use pressed/inset for input fields, active buttons, pressed states
- Colors: NO vibrant colors. Muted and subtle only. One soft accent color (muted blue #6C8EBF or soft purple #8B7EC8) used only for small interactive elements and text accents. The design is about SHAPE and SHADOW, not color.
- Typography: clean, rounded sans-serif (Nunito, Rubik, Quicksand). Medium weight for body, semibold for headings. Muted text color (#5A6170). NOT black text — everything slightly muted to match the soft aesthetic.
- Borders: NO borders. NO outlines. All depth comes ONLY from shadows. border: none on everything. Border-radius: 16-24px (soft, pillowy corners).
- Buttons: raised with dual shadow. On hover: subtle lift (shadow spreads). On active/click: switch to inset shadow (pressed look). Transition: 0.2s ease.
- Vibe: early 2020s Dribbble trend, calculator apps, smart home UIs. Tactile, physical, like pressing buttons on a real device. Everything looks sculpted from the same piece of clay.`,
  },

  monochrome: {
    name: 'Monochrome',
    prompt: `Use a MONOCHROME style.
- STRICT RULE: Use ONLY ONE HUE in the entire design. Pick a single color (e.g., blue, or warm gray, or green) and use ONLY shades, tints, and tones of that one color. The background is the lightest tint. Text is the darkest shade. Accents are mid-tones. ZERO other colors. Not even black — use the darkest shade of your chosen hue.
- Layout: clean, structured. Two-column asymmetric layout (narrow sidebar + wide content area, or label column + content column). Max-width 1100px. The lack of color forces the design to rely ENTIRELY on typography, spacing, and value contrast.
- Typography: this is the primary design tool since color is absent. Strong contrast between heading size and body size (headlines 3-4× larger than body). Mix a serif for headlines (DM Serif Display) with a sans-serif for body (Inter) — the font pairing creates visual variety that color normally provides. Use weight variation (200, 400, 700) to create hierarchy.
- Value range: use the FULL spectrum from almost-white to almost-black within your single hue. At least 6-7 distinct value steps. Alternate between light and dark sections to create rhythm — a dark section followed by a light section.
- Decorations: minimal. Thin rules. Subtle tone shifts between sections. NO icons, NO emoji, NO illustrations. Let the monochrome palette speak. If you need visual interest, use large typographic elements or geometric shapes in different values of the same hue.
- Buttons: outlined in a mid-tone. Fill on hover with a darker shade. Text-only secondary buttons.
- Vibe: high-end photography portfolio, architectural monograph, sophisticated restraint. The constraint IS the beauty. When you remove color, everything else has to work harder — and it shows.`,
  },

  y2k: {
    name: 'Y2K / 2000s',
    prompt: `Use a Y2K / EARLY 2000s WEB style.
- Layout: centered with max-width 900px. Sections have visible borders and backgrounds that are DIFFERENT from each other (each section its own little world). Mix of centered content and asymmetric floating elements. Starburst/badge shapes overlaying content at angles (use CSS transforms rotate).
- Colors: candy gradients — hot pink (#FF69B4) to cyan (#00CED1), lime (#00FF66) to yellow (#FFE600), purple (#9B30FF) to blue (#1E90FF). Use CSS linear-gradient backgrounds on sections and cards. Chrome/silver (#C0C0C0) accents. Backgrounds can be lavender (#E6E0FA) or soft blue (#E0F0FF). LOUD and SHINY.
- Typography: rounded, bubbly fonts (Fredoka, Baloo 2, or Comic Neue). For "chrome" headings use background: linear-gradient(180deg, #fff 0%, #999 40%, #fff 50%, #666 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; to simulate metallic text effect. Mixed sizes, some text rotated slightly.
- Decorations: starburst/badge shapes (use CSS clip-path: polygon() to create star shapes, or pseudo-elements). Sparkle/star characters (✦ ★ ✧ ·:*¨¨*:·) scattered as decorative text. Bubble-like border-radius (50% on some elements). Shiny beveled borders (use inset box-shadows to simulate 3D beveled edges). "NEW!" badges rotated at -15deg.
- Borders: visible, thick, often multiple borders or beveled edges. Use box-shadow: inset 2px 2px 0 #fff, inset -2px -2px 0 #999 for a Windows-style raised bevel effect.
- Buttons: gradient-filled, beveled 3D look (inset shadows for highlights/shadows), rounded. "Click Here!" and "Enter Site" energy. Bold text.
- Vibe: early 2000s personal web, Neopets, GeoCities but stylish, Polly Pocket website, iMac G3 era. Nostalgic digital maximalism. Shiny, bubbly, unapologetically internet. Makes millennials tear up.`,
  },

  maximalist: {
    name: 'Maximalist',
    prompt: `Use a MAXIMALIST style.
- CORE PRINCIPLE: Fill every surface. No empty space. Every area has pattern, texture, color, or decoration. The opposite of minimalism — MORE is more. But it must be intentional, not chaotic. Think "curated abundance."
- Layout: dense, layered, overlapping. Use CSS Grid with overlapping elements (negative margins, grid-row overlaps). Multiple font sizes in the same section. Sidebar + main + callout boxes. Pull quotes overlapping section boundaries. Max-width 1200px but content fills it densely.
- Colors: RICH and MANY. Deep jewel tones — ruby (#9B111E), emerald (#046307), sapphire (#0F52BA), amethyst (#6B3FA0), amber (#FF8F00). Cream and gold accents. 4+ colors used throughout. Each section can have its own color palette. Pattern backgrounds (CSS repeating patterns — stripes, dots, diamonds using repeating-linear-gradient).
- Typography: use 3 OR MORE font families deliberately. A decorative serif for display headlines (Playfair Display). An italic serif for pull quotes (Cormorant Garamond Italic). A clean sans-serif for body (Inter). A monospace for labels (JetBrains Mono). MIX sizes dramatically — a 6rem headline next to 0.7rem labels. Layered, rich typographic texture.
- Borders: decorative borders on everything. Double borders, dashed borders, dotted borders, mixed border styles on different sides of the same element. Ornamental corner pieces.
- Decorations: pattern backgrounds on sections (CSS repeating-linear-gradient for stripes, dots, checkerboard). Decorative dividers between sections. Pull quotes in large italic overlapping other content. Small detail labels and annotations. Ornamental typographic elements (❧ ✦ ❋ ◆ ❖). Background shapes partially visible behind content.
- Buttons: filled, decorated, possibly with borders + shadows + icons. No two button styles need to be identical. Rich, detailed, touchable.
- Vibe: Wes Anderson film sets, William Morris wallpaper, Indian textile design, baroque architecture. Every surface curated. Rich but not messy — a maximalist knows what they're doing. The eye always has somewhere new to travel.`,
  },

  // ─── Industry & Functional Styles ───────────────────────────────────────────

  cleanTech: {
    name: 'Clean Tech',
    prompt: `Use a CLEAN TECH / MODERN SaaS style.
- Layout: max-width 1200px, centered. Clear visual hierarchy: nav → hero → features → social proof → CTA → footer. Generous vertical spacing between sections (80-100px). Content blocks alternate between full-width and contained. Subtle asymmetry — hero text left-aligned with right-side visual/mockup area.
- Colors: light background (#FFFFFF or #FAFBFC). ONE primary accent — a refined blue (#3B82F6), violet (#7C3AED), or teal (#0EA5E9). Use it sparingly — buttons, links, highlight pills, accent borders. Gray scale for text hierarchy: #111827 headings, #4B5563 body, #9CA3AF captions. NO dark sections unless a single pre-footer CTA band.
- Typography: one modern geometric sans-serif for everything (Inter, Geist, or DM Sans). Weight 500-700 for headings, 400 for body. Headings 2.5-3.5rem, body 1rem-1.125rem. Tight line-height on headings (1.1-1.2), comfortable on body (1.6-1.7).
- Decorations: SUBTLE. Tiny gradient mesh blobs in hero background (very faded, 5-10% opacity). Thin 1px borders (#E5E7EB) on cards. Small rounded corners (8-12px). Soft shadows (shadow-sm or shadow-md). Pill-shaped badges/tags for categories. NO heavy decorations.
- Grid: 2 or 3 column feature grids with icon + title + description cards. Cards with light border, subtle hover lift (translateY -2px + shadow increase). Clean spacing between cards (24-32px gap).
- Buttons: primary filled with accent color + white text, rounded-lg. Secondary outlined or ghost. Small, refined — not oversized. Subtle hover transition (darken 10%).
- Vibe: Vercel, Linear, Supabase, Resend. Quietly confident. The design feels effortless — nothing trying too hard. Every pixel is intentional but invisible. "It just works" energy.`,
  },

  warmCorporate: {
    name: 'Warm Corporate',
    prompt: `Use a WARM CORPORATE / EUROPEAN TECH style.
- Layout: max-width 1200px. Clean, structured but not rigid. Hero with large headline + subtitle + CTA + optional product image/mockup. Feature sections with generous whitespace. Alternating left-right content blocks (text + visual). Footer with multi-column links.
- Colors: warm white background (#FEFDFB or #F9F8F6). Primary accent: a warm teal (#0B8A8A), muted blue (#2563A0), or forest green (#166534) — trustworthy but not cold. Secondary warm accent: amber (#D97706) or terracotta (#C2410C) for CTAs and highlights. Text: warm dark (#1C1917) for headings, warm gray (#57534E) for body. Sections can alternate between warm white and light warm gray (#F5F3EF).
- Typography: pair a clean humanist sans-serif for headings (DM Sans, Outfit, or Plus Jakarta Sans, weight 600-700) with a readable sans-serif for body (Inter or Source Sans 3, weight 400). Headings 2.5-3rem, body 1rem. Generous line-height on body (1.7). Feels professional but approachable — NOT geometric/cold.
- Elements: rounded corners (12-16px) — softer than corporate, not as round as playful. Cards with very subtle shadows + 1px warm gray border. Stats/numbers in large semibold type. Client logos row in grayscale. Testimonial cards with photo + name + role + company.
- Decorations: minimal but warm. Thin accent-colored top borders on cards. Small rounded rectangles as section labels. Subtle background patterns (very faint dot grid at 3% opacity). NO heavy gradients, NO glows, NO dark sections.
- Buttons: primary filled with warm accent + white text, rounded-xl. Comfortable padding (12px 28px). Secondary: outlined with accent border. Friendly hover state (lighten background slightly).
- Vibe: Smartness, Bosch, Philips, Siemens, Miele. European quality — confident but not flashy. Trustworthy and modern. You'd trust this company with your building, your health, your money. Warm enough to feel human, polished enough to feel enterprise-grade.`,
  },

  startupBold: {
    name: 'Startup Bold',
    prompt: `Use a STARTUP BOLD style.
- Layout: max-width 1100px, centered. Hero is dominant — massive headline (4-5rem), punchy subheadline, prominent CTA buttons side by side (primary + secondary). Feature sections use bento-style mixed grids (some cards 2x wide, some 1x). Sections are visual and scannable, not text-heavy. Use screenshots/mockup placeholders as colored rectangles with rounded corners.
- Colors: light background (white or #FAFAFA). ONE bold accent color used generously — electric violet (#7C3AED), hot coral (#F43F5E), or bright blue (#2563EB). Use it for buttons, headings, highlighted text spans (with light tinted background), icon backgrounds, and section accents. Everything else is black (#0F172A) and gray (#64748B). The accent should feel like a brand signature — 30% of the visual weight.
- Typography: one bold sans-serif for everything. Headings in 700-800 weight (Inter, Sora, or General Sans). Oversized hero headline. Body in 400 weight, 1rem-1.125rem. Use colored <mark> or background-highlighted text spans in headlines for emphasis ("The way teams _actually_ work").
- Decorations: colored pills/badges ("New", "Popular", "Beta") with tinted backgrounds. Announcement banner at top of page. Emoji in feature cards for personality. Subtle background grid or dot pattern in hero (5% opacity). Rounded screenshots with subtle shadow as feature visuals.
- Grid: bento-style — CSS Grid with mixed spans (some features get 2 columns, some get 1). Cards with light border, accent-colored icon containers (40px rounded squares with tinted background + accent icon).
- Buttons: large, rounded-xl, filled with accent color. Bold text. Side-by-side hero CTAs (filled primary + ghost secondary). Hover: slight scale(1.02) + shadow increase.
- Vibe: Notion, Arc, Loom, Cal.com, Raycast. Young, ambitious, opinionated. The design has personality — it's not trying to please everyone. One color, used with conviction. Makes you want to sign up immediately.`,
  },

  saasMarketing: {
    name: 'SaaS Marketing',
    prompt: `Use a SaaS MARKETING / DEVELOPER-FACING style.
- Layout: max-width 1200px. Clean and spacious. Hero: left-aligned headline + subtitle + CTA + right-side code snippet or terminal mockup. Below: logo bar ("Trusted by"). Features in alternating rows (text left / visual right, then flip). Comparison table section. FAQ accordion. Pricing cards. Dark or gradient pre-footer CTA band.
- Colors: white (#FFFFFF) base with ONE dark accent section (deep navy #0F172A or near-black #111827) for the pre-footer CTA or hero background variant. Primary accent: blue (#3B82F6) or violet (#8B5CF6). Use subtle tinted backgrounds for feature sections (#F8FAFF or #F5F3FF). Code blocks in dark (#1E293B) with syntax-colored text.
- Typography: system-native feel — Inter or Geist for body, JetBrains Mono or Fira Code for code snippets. Clean weights (400 body, 600 headings). Medium-sized headings (2-3rem). Code blocks in 14px monospace with proper syntax highlighting colors.
- Code/Terminal elements: styled terminal windows with title bar dots (red/yellow/green), dark background, monospace text. Inline code in tinted pill backgrounds. API endpoint examples in feature sections. These establish technical credibility.
- Grid: feature sections alternate between 2-column (text + code/visual) and 3-column icon grids. Pricing section: 3 cards side by side, middle one highlighted (popular). FAQ as accordion with clean expand/collapse.
- Decorations: subtle grid background pattern (CSS grid lines at 2-3% opacity). Tiny gradient orbs behind hero text (15-20% opacity). Badge pills for feature labels. Check marks in feature comparison lists. NO heavy decorations — the code blocks ARE the decoration.
- Buttons: filled primary, rounded-lg. "Get Started" / "View Docs" pattern (filled + ghost). Comfortable but not oversized.
- Vibe: Clerk, Resend, Neon, PlanetScale, Vercel. Developer-trusted, technically credible. The site respects your intelligence — no fluff, no marketing buzzwords. Clean, fast, shows you the product. "I'd actually use this" energy.`,
  },

  dashboardUI: {
    name: 'Dashboard UI',
    prompt: `Use a DASHBOARD / ADMIN UI style.
- Layout: fixed left sidebar (240-280px, dark or tinted) + top header bar + scrollable main content area. Sidebar: logo at top, grouped nav sections with icons + labels, user avatar at bottom. Main content: page title + breadcrumbs at top, then card grid below. Full-width, no max-width constraint — uses all available space.
- Colors: sidebar dark (#111827 or #1E1B4B) with light text. Main content area light (#F9FAFB or #F1F5F9). Cards on white. One primary accent for active states and primary actions (blue #3B82F6 or indigo #6366F1). Status colors: green (#10B981) success, amber (#F59E0B) warning, red (#EF4444) error, gray (#6B7280) neutral. Use these consistently in badges, dots, and charts.
- Typography: one clean sans-serif (Inter, system-ui). Small-medium sizes — body 14px, labels 12px, headings 18-24px. Semibold for headings and stat numbers, regular for body. Monospace for data values and IDs. Dense but readable — dashboards need information density.
- Components: stat cards (icon + number + label + change percentage with up/down arrow). Data tables with alternating row backgrounds, sortable column headers, status badge column. Charts as colored placeholder bars or simple CSS bar charts. Activity feed / timeline. Dropdown selects with borders. Search input in header.
- Cards: white background, 1px border (#E5E7EB), rounded-lg, subtle shadow-sm. Consistent 16-24px internal padding. 16-24px gap between cards. Cards arranged in 2-4 column responsive grid.
- Decorations: MINIMAL. No gradients, no glows, no decorative elements. The data is the decoration. Clean divider lines. Subtle hover states on table rows and nav items (background tint). Active nav item: accent background pill or left border accent.
- Buttons: small, refined. Primary: filled accent, rounded-md. Secondary: outlined or ghost. Destructive: red outlined. Icon buttons (24-32px). Button groups for filters/view toggles.
- Vibe: Stripe Dashboard, Linear app, Vercel Dashboard, Grafana. Professional tool aesthetic. Every pixel serves a function. Dense but not cluttered — the whitespace is intentional. You spend 8 hours a day looking at this and it never gets tiring.`,
  },

  ecommerce: {
    name: 'E-commerce',
    prompt: `Use an E-COMMERCE / PRODUCT style.
- Layout: full-width. Sticky top nav with logo, search bar (prominent, centered), cart icon with badge count. Hero: full-width product showcase or promotional banner. Below: product category grid, featured products grid, testimonials, newsletter signup, footer with multi-column links and payment icons.
- Colors: clean white (#FFFFFF) base. One refined accent for CTAs and pricing: warm coral (#E84D3D), forest green (#166534), or classic black. Text: near-black (#111111) for prices and headings, gray (#555555) for descriptions. Occasional warm tinted section backgrounds (#FDF8F3 or #F7F5F2). Price text always prominent and dark.
- Typography: clean sans-serif for UI (Inter, Helvetica Neue). Prices: tabular numerals, semibold, slightly larger than body. Product names: medium weight, 1-1.125rem. Category headers: bold, uppercase, letter-spaced. Body/descriptions: regular weight, warm gray. Optional: elegant serif for brand tagline or hero headline only.
- Product cards: white background, minimal border or borderless with subtle shadow on hover. Product image area (4:5 or 1:1 aspect ratio, light gray placeholder background). Product name, short description, price, and "Add to Cart" button below. Hover: image slight zoom (scale 1.03), shadow increase, button appears or becomes more prominent.
- Navigation: multi-level — main categories in nav bar. Sticky on scroll. Search bar is a first-class element (not hidden). Cart icon always visible with item count badge. Breadcrumbs on product pages.
- Grid: products in 3 or 4 column grid with consistent gaps (24-32px). Category sections with horizontal scroll or grid. "Shop by category" with image + label cards.
- Decorations: minimal — let the products breathe. Thin dividers between sections. Trust badges near cart/checkout areas (shipping, returns, secure payment). Star ratings below product names. "Sale" or "New" badges positioned absolutely on product cards.
- Buttons: "Add to Cart" is the primary CTA — filled, accent-colored, rounded, clear. "Buy Now" secondary. Quantity selectors with +/- buttons. Size/variant selectors as bordered toggles.
- Vibe: Apple Store, Aesop, Everlane, COS. The product is the hero — the design is invisible. Clean, trustworthy, makes you want to buy. No friction between seeing and purchasing.`,
  },

  portfolio: {
    name: 'Portfolio',
    prompt: `Use a PORTFOLIO / PERSONAL SHOWCASE style.
- Layout: single-column primary flow, max-width 900-1000px, centered. Minimal nav (name/logo left, 3-4 text links right). Hero: large name/title, one-line description, no image. Below: selected work as large case study cards (full-width, stacked). About section. Contact section. Footer minimal.
- Colors: off-white (#FAFAF8) or pure white background. Near-black (#1A1A1A) for text. ONE subtle accent — muted blue (#4A6FA5), warm gray (#8B7E6A), or olive (#5C6B4F) — used only for links and hover states. NO bright colors. The work/portfolio images provide all the color. High contrast text on clean backgrounds.
- Typography: carefully paired fonts — a display serif for name/headings (Fraunces, Instrument Serif, or DM Serif Display, weight 500-700) and a clean sans-serif for body/nav (Inter, DM Sans, weight 400). Large headings (3-4rem for name, 2rem for section titles). Body text 1rem-1.125rem with generous line-height (1.7-1.8). Letter-spacing on section labels (uppercase, small, spaced).
- Case study cards: full-width, stacked vertically. Each card: large image/thumbnail area (16:9 or 3:2 aspect ratio, light gray placeholder with project name), project title, one-line role/description, year. Cards separated by generous whitespace (80px+). Hover: subtle image shift or overlay. Link to case study detail.
- Spacing: extreme — the portfolio breathes. 120px+ between sections. 80px between case study cards. Large margins on body text. The whitespace communicates confidence and selectivity.
- Decorations: ALMOST NONE. Thin hairline rules to divide sections. Small "01, 02, 03" section numbers in muted text. Subtle transition animations on scroll (fade-in, 0.3s). NO icons, NO emoji, NO illustrations. Let the work speak.
- Navigation: sticky, minimal. Name left, 3-4 links right. On scroll: subtle background tint and shadow. Mobile: hamburger to slide-out menu.
- Buttons: text links with subtle underline animation (border-bottom expand on hover). "View project →" as text link, not a button. Contact section can have one outlined button.
- Vibe: award-winning designer portfolio, Awwwards featured. Confidence through restraint. Every project is carefully curated — quality over quantity. The person behind this site is very good at what they do, and the design proves it without saying a word.`,
  },

  documentation: {
    name: 'Documentation',
    prompt: `Use a DOCUMENTATION / KNOWLEDGE BASE style.
- Layout: three-panel — left sidebar nav (240px, fixed), center content area (max-width 720px), right sidebar table of contents (200px, sticky). On mobile: sidebar becomes hamburger dropdown, TOC hidden. The center content area is king — optimized for reading.
- Sidebar: grouped navigation sections with collapsible categories. Section headers in small bold uppercase. Active page highlighted with accent background. Search input at top of sidebar. Nested items indented with thin left border.
- Colors: white (#FFFFFF) content area. Sidebar light gray (#F8FAFC). Subtle accent: blue (#3B82F6) or violet (#7C3AED) for links, active states, and inline code highlights. Code blocks: dark (#1E293B) background with syntax colors. Callout boxes: tinted backgrounds — blue (#EFF6FF) for info, amber (#FFFBEB) for warning, red (#FEF2F2) for danger, green (#F0FDF4) for success. Text: #111827 body, #6B7280 secondary.
- Typography: body optimized for reading — 16px, line-height 1.75, max-width 65ch. Inter or system sans-serif for UI. Code: JetBrains Mono or Fira Code at 14px. Headings: semibold, 1.5-2rem, with anchor links (# icon on hover). Clear typographic hierarchy: h1 > h2 > h3 with decreasing size and increasing margin.
- Content elements: code blocks with copy button and language label. Inline code in tinted pill background (accent-tinted, rounded-md, px-1.5 py-0.5). Callout/admonition boxes with left accent border (4px) and icon. Tables with header row background and alternating rows. Ordered/unordered lists with comfortable spacing. Blockquotes with left border.
- Table of contents (right sidebar): tracks current section on scroll (highlight active heading). Thin left border with accent dot on active item. Small text (13-14px), muted color, accent on active.
- Navigation features: breadcrumbs at top. Previous/Next page links at bottom. "Edit this page" link to source. Last updated timestamp.
- Decorations: NONE. Zero decorative elements. The content IS the design. Clean dividers between sections. Subtle border on sidebar. Focus entirely on readability and navigation.
- Buttons: minimal — "Copy" button on code blocks (small, ghost). Pagination (outlined, previous/next). Sidebar toggle on mobile.
- Vibe: Stripe Docs, Tailwind CSS Docs, Next.js Docs, MDN. The gold standard of developer docs. You forget you're looking at a website — you're just absorbing information. Fast, scannable, never lost.`,
  },

  healthcare: {
    name: 'Healthcare',
    prompt: `Use a HEALTHCARE / WELLNESS style.
- Layout: max-width 1200px, centered. Clean and calming. Hero: reassuring headline, warm subtext, clear primary CTA ("Book Appointment" / "Get Started"), optional hero image area (soft, human). Below: services/features in clean grid. Trust section (certifications, doctor profiles). Testimonials. FAQ. Contact/location. Footer.
- Colors: soft, calming, trust-building. White (#FFFFFF) base. Primary: calming teal (#0D9488) or medical blue (#0284C7) — NOT corporate navy, softer and friendlier. Secondary: warm coral (#F97316) or soft rose (#E11D48) for CTAs — warm and approachable. Backgrounds alternate between white and very soft tint (#F0FDFA for teal, #EFF6FF for blue). Text: warm dark (#1E293B), warm gray (#64748B) for secondary. NO harsh blacks.
- Typography: friendly humanist sans-serif — Nunito, DM Sans, or Plus Jakarta Sans. Weight 600-700 for headings (warm, not heavy). Weight 400 for body at 1rem-1.125rem. Generous line-height (1.7+). Headings 2-3rem. Everything feels approachable and readable — elderly patients and young parents both feel comfortable.
- Trust elements: doctor/staff cards with photo placeholder, name, specialty, credentials. Certification badges and accreditation logos. Star ratings. Patient count ("10,000+ patients served"). Insurance accepted logos. HIPAA/privacy badges near forms.
- Cards: soft rounded corners (16px). Light shadow + very subtle border. Internal padding 24-32px. Service cards with icon (soft-colored circle background + line icon described in text) + title + description + "Learn more" link.
- Decorations: soft, organic. Subtle curved section dividers (gentle wave SVG between sections). Soft gradient blobs in background at 5% opacity. Rounded pill shapes for tags and badges. NO sharp edges, NO dark areas, NO aggressive elements. Everything says "safe."
- Buttons: primary filled with rounded-xl, soft shadow. Comfortable size (14px 32px padding). "Book Now" / "Schedule Visit" language. Secondary: outlined, same rounded. Hover: slight lift + warmer shadow.
- Vibe: One Medical, Hims, Headspace, Calm, modern dental practice. You feel better just looking at the site. Clean, trustworthy, human. The design says "we care about you" without being clinical or cold. A nervous patient feels reassured; a busy parent feels this will be easy.`,
  },

  fintech: {
    name: 'Fintech',
    prompt: `Use a FINTECH / FINANCIAL style.
- Layout: max-width 1200px. Hero: strong headline about control/visibility/money, app screenshot or card visual mockup (use colored rounded rectangles with fake card numbers/graphs as placeholders). Below: feature highlights with data visuals. Security/trust section. Pricing/comparison. Testimonials from business users. CTA. Footer.
- Colors: deep but modern. Dark navy (#0C1222) or near-black (#0A0A0F) hero/accent sections. White (#FFFFFF) and light gray (#F8FAFC) content sections. Primary accent: fintech green (#10B981) or electric blue (#3B82F6). Use the accent for positive numbers, CTAs, and highlights. Red (#EF4444) for negative/loss indicators. Subtle gradients on card mockups (dark navy → dark blue).
- Typography: precise and trustworthy. Inter, Söhne, or SF Pro style sans-serif. Tabular numerals for all numbers and financial figures (font-variant-numeric: tabular-nums). Weight 600-700 for headings, 400 for body. Numbers and monetary values: larger, semibold, monospace-like alignment. Headings 2.5-3rem. Body 1rem.
- Data elements: transaction list rows (icon + merchant name + date + amount, right-aligned). Balance cards with large number + currency + percentage change with up/down arrow. Simple bar/line charts as CSS-drawn elements (colored bars in flex containers). Card mockup: rounded dark rectangle with card number dots, cardholder name, Visa/MC symbol placeholder.
- Cards: clean white with subtle shadow-sm or 1px border. Rounded-xl (16px). Internal padding 24px. Some cards with dark gradient background for "premium" feel (dark section feature cards).
- Security/trust: shield icons described as unicode (🔒 or ✓), encryption badge, regulatory compliance labels (described as text in badges: "Bank-level security", "256-bit encrypted", "FDIC insured"). Partner bank logos in grayscale.
- Decorations: subtle. Thin gradient lines as accents. Small dots or connection lines between feature sections suggesting network/flow. NO playful elements, NO emoji (except 🔒), NO heavy decorations. Clean, precise, trustworthy.
- Buttons: filled accent, rounded-lg, medium size. "Get Started Free" / "Open Account" pattern. White text on accent. Secondary: ghost or outlined. One strong CTA per section.
- Vibe: Mercury, Wise, Revolut, Brex, Ramp. Your money is safe here. The design is so clean it feels like your account already has more money in it. Precision, clarity, control. Every pixel says "we take this seriously."`,
  },

  media: {
    name: 'Media',
    prompt: `Use a MEDIA / CONTENT PLATFORM style.
- Layout: full-width. Top nav: logo, category links, search, sign-in. Hero: featured content card (large, 16:9 image area with gradient overlay + title + category badge + read time). Below: content grid — mixed sizes (1 large + 2 small per row, or masonry-style). Category filter bar (horizontal scrolling pills). Trending/popular sidebar on wider screens. Newsletter signup section. Footer.
- Colors: clean white (#FFFFFF) or very light gray (#FAFAFA) base. Text: near-black (#111111) for titles (high contrast for readability), medium gray (#555555) for metadata (author, date, read time). Category badges in soft tinted colors (each category gets its own: tech = blue tint, design = purple tint, culture = coral tint, etc.). Optional dark mode variant: #111111 background, #F5F5F5 text.
- Typography: this style is TYPOGRAPHY-FORWARD. Headlines: bold serif (Playfair Display, Lora, or Charter) at 1.5-2.5rem — editorial authority. Body text: clean sans-serif (Inter, system-ui) at 16px with 1.7 line-height — optimized for reading. Metadata: small sans-serif (12-13px), uppercase, letter-spaced, muted color. Author names: medium weight sans-serif. Mix of serif and sans-serif creates visual texture.
- Content cards: image area (placeholder with gradient background) with category badge overlaid at top-left. Below image: category label (small, colored, uppercase), headline (serif, bold), excerpt (2 lines, truncated), author + date + read time row (small, muted). Cards have subtle hover: shadow increase + slight lift. Border-radius 8-12px.
- Grid: responsive — 1 column mobile, 2 columns tablet, 3 columns desktop. Featured/hero card spans 2 columns. Consistent gap (24-32px). Cards vary in size for visual rhythm.
- Decorations: minimal — the content images provide all visual interest. Thin dividers between sections. Category pills with tinted backgrounds. Author avatar circles (small, 24-32px). Bookmark/save icon on cards. Share button.
- Buttons: mostly text links and ghost buttons. "Read more" as text link with arrow. Newsletter signup: email input + filled button side by side. Category filters as pill toggles (active: filled, inactive: outlined).
- Vibe: Medium, Substack, The Verge, Spotify editorial. Content is the product — the design serves it. Scannable, inviting, you always know what to read next. The layout itself tells you what's important.`,
  },

  government: {
    name: 'Government',
    prompt: `Use a GOVERNMENT / INSTITUTIONAL / ACCESSIBLE style.
- Layout: max-width 960px, centered. Simple, predictable structure. Top: banner with institution name + official badge. Nav: horizontal, text-only, clear labels. Hero: clear headline describing the service, brief description, prominent action buttons. Below: task-based cards ("Apply for...", "Find your...", "Check your..."). Information sections with clear headings. Footer: multi-column with required legal links, accessibility statement, language selector.
- Colors: high-contrast, accessible. White (#FFFFFF) background. Dark text (#1D1D1D) — true black for body, NOT gray. One institutional accent: government blue (#1D70B8), civic green (#00703C), or deep red (#D4351C). Use accent ONLY for links, buttons, and focus states. Light tinted backgrounds (#F3F2F1) for alternate sections. EVERY color combination must pass WCAG AAA contrast (7:1 minimum). NO decorative color use.
- Typography: highly readable system font stack or government-standard sans-serif (GDS Transport, Roboto, or Noto Sans). Body: 19px minimum (NOT 16px — accessibility requirement). Line-height: 1.6-1.7. Headings: bold, clear hierarchy (h1: 2rem, h2: 1.5rem, h3: 1.25rem). NO light font weights (never below 400). NO italics for body text. NO justified text. Left-aligned everything.
- Accessibility: CRITICAL. All interactive elements have visible focus outlines (3px solid accent, 2px offset). Skip-to-content link as first element. All form fields have visible labels (NOT placeholder-only). Error messages in red with error icon, associated with field via aria. Buttons have clear text labels (NO icon-only buttons). Link text is descriptive (NO "click here"). Minimum touch target 44x44px.
- Task cards: white background, 1px border (#B1B4B6), small rounded corners (4px max — NOT overly rounded). Clear title, one-line description, right-pointing arrow or chevron. Prominent, easy to tap. Organized by user need, not by department.
- Forms: if present — large input fields (48px height), visible labels above, clear validation messages, step indicators for multi-step processes. One question per page pattern.
- Decorations: NONE. Zero decorative elements. No icons unless they serve a genuine informational purpose. No images unless directly relevant to content. No animations. No hover effects beyond standard underline/focus changes. Every element earns its place through function.
- Buttons: filled with accent color, white text. Large (48px height, 24px horizontal padding). Clear text ("Start now", "Continue", "Sign in"). NO ghost buttons, NO subtle buttons — every button must be obviously a button. Green for positive primary actions, standard accent for secondary.
- Vibe: GOV.UK, USDS, service.nsw.gov.au, Canada.ca. Radically simple. Aggressively clear. Designed for EVERYONE — the 80-year-old, the screen reader user, the person with slow internet, the non-native speaker. Not beautiful in a design award way — beautiful in a "7 million people used this today and nobody got confused" way. Form follows function, fully.`,
  },
};

// ─── Dynamic Variation Strategies ──────────────────────────────────────────
// Instead of hardcoded nudges, we ask the LLM to generate context-aware
// variation strategies tailored to the specific brief and style.

async function generateVariationStrategies({ userPrompt, stylePrompt, count, model, providerName, apiKey }) {
  const provider = createProvider({ name: providerName, apiKey });
  const strategyDb = new DatabaseImpl();
  const tools = createDefaultRegistry();

  const agent = new AgentLoop({
    provider,
    tools,
    db: strategyDb,
    workingDir: process.cwd(),
    maxTokens: 2048,
    maxTurns: 1,
    model,
    providerName,
    disabledTools: ['bash', 'read', 'write', 'edit', 'glob', 'grep', 'webfetch'],
  });

  const strategyPrompt = `You are a world-class web design director. You are about to generate ${count + 1} versions of a website. Version 1 will be a straight interpretation of the brief and style. You must produce creative direction strategies for versions 2 through ${count + 1}.

Each strategy must push the design in a GENUINELY DIFFERENT direction — different layout approach, different visual emphasis, different mood, or different interpretation of the brief. They must be specific to THIS project, not generic advice.

WEBSITE BRIEF:
${userPrompt}
${stylePrompt ? `\nDESIGN STYLE:\n${stylePrompt}` : ''}

RULES:
- Produce exactly ${count} strategies, one per line
- Each strategy should be 1-2 sentences, written as a direct instruction to a designer
- Strategies must be meaningfully different from each other — vary across dimensions like layout structure, typography emphasis, color mood, whitespace usage, visual complexity, content hierarchy
- ${count <= 3 ? 'With few variations, make them more polarized and distinct' : 'With many variations, cover a wide range of the design space'}
- Do NOT include numbering, bullets, or prefixes — just the strategy text, one per line
- Do NOT repeat the style directive — focus on what makes each version DIFFERENT`;

  let result = '';
  agent.on('event', (event) => {
    if (event.type === 'text') {
      result += event.text;
    }
  });

  try {
    await agent.run(strategyPrompt);
  } finally {
    strategyDb.close();
  }

  const strategies = result
    .trim()
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, count);

  while (strategies.length < count) {
    strategies.push('Take a distinctly different creative approach from the other versions.');
  }

  return strategies;
}

// ─── Model Presets ──────────────────────────────────────────────────────────

const MODELS = {
  claude: {
    providerName: 'anthropic',
    apiKeyEnv: 'ANTHROPIC_API_KEY',
    model: 'claude-sonnet-4-6',
    label: 'Claude Sonnet',
  },
  gemini: {
    providerName: 'gemini',
    apiKeyEnv: 'GOOGLE_API_KEY',
    model: 'gemini-3-flash-preview',
    label: 'Gemini 3.1 Flash',
  },
};

// ─── CLI Arg Parsing ────────────────────────────────────────────────────────

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    command: 'generate', // 'generate' or 'iterate'
    prompt: null,
    styles: [],
    versions: 1,
    models: ['claude'],
    mode: 'landing', // 'landing' or 'webapp'
    from: null,       // path to reference output dir (--from)
    iterate: null,    // path to output dir to iterate on (--iterate)
    themeAuto: false,  // LLM picks best styles from our catalog
    themeSynth: false, // LLM generates a custom style prompt
  };

  const positional = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--versions' || arg === '-v') {
      opts.versions = parseInt(args[++i], 10);
      if (isNaN(opts.versions) || opts.versions < 1) {
        console.error('--versions must be a positive integer');
        process.exit(1);
      }
    } else if (arg === '--models' || arg === '-m') {
      opts.models = args[++i].split(',').map(s => s.trim());
    } else if (arg === '--mode') {
      opts.mode = args[++i];
      if (!['landing', 'webapp'].includes(opts.mode)) {
        console.error('--mode must be "landing" or "webapp"');
        process.exit(1);
      }
    } else if (arg === '--theme-auto') {
      opts.themeAuto = true;
    } else if (arg === '--theme-synth') {
      opts.themeSynth = true;
    } else if (arg === '--from') {
      opts.from = args[++i];
    } else if (arg === '--iterate') {
      opts.command = 'iterate';
      opts.iterate = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    } else {
      positional.push(arg);
    }
  }

  // --iterate mode: only needs the path, prompt is optional
  if (opts.command === 'iterate') {
    if (!opts.iterate) {
      console.error('--iterate requires a path to an output directory');
      process.exit(1);
    }
    if (!existsSync(opts.iterate)) {
      console.error(`Directory not found: ${opts.iterate}`);
      process.exit(1);
    }
    // Use first model only for iterate
    opts.models = [opts.models[0]];
  } else {
    // Generate mode: prompt is required
    if (positional.length < 1) {
      printUsage();
      process.exit(0);
    }

    opts.prompt = positional[0];

    // Styles: optional second positional arg. If omitted → freestyle.
    if (positional.length >= 2) {
      if (positional[1] === 'all') {
        opts.styles = Object.keys(STYLES);
      } else {
        opts.styles = positional[1].split(',').map(s => s.trim());
      }
    }
  }

  // Validate theme flags
  if (opts.themeAuto && opts.themeSynth) {
    console.error('Cannot use --theme-auto and --theme-synth together. Pick one.');
    process.exit(1);
  }
  if ((opts.themeAuto || opts.themeSynth) && opts.styles.length > 0) {
    console.error('Cannot use --theme-auto or --theme-synth with explicit styles.');
    process.exit(1);
  }

  // Validate --from path
  if (opts.from) {
    if (!existsSync(opts.from)) {
      console.error(`--from directory not found: ${opts.from}`);
      process.exit(1);
    }
    const fromCss = `${opts.from}/style.css`;
    if (!existsSync(fromCss)) {
      console.error(`No style.css found in --from directory: ${opts.from}`);
      process.exit(1);
    }
  }

  // Validate styles
  const invalidStyles = opts.styles.filter(s => !STYLES[s]);
  if (invalidStyles.length > 0) {
    console.error(`Unknown styles: ${invalidStyles.join(', ')}`);
    console.error(`Available: ${Object.keys(STYLES).join(', ')}`);
    process.exit(1);
  }

  // Validate models
  const invalidModels = opts.models.filter(m => !MODELS[m]);
  if (invalidModels.length > 0) {
    console.error(`Unknown models: ${invalidModels.join(', ')}`);
    console.error(`Available: ${Object.keys(MODELS).join(', ')}`);
    process.exit(1);
  }

  // Validate API keys
  for (const modelKey of opts.models) {
    const { apiKeyEnv, label } = MODELS[modelKey];
    if (!process.env[apiKeyEnv]) {
      console.error(`Missing ${apiKeyEnv} environment variable (required for ${label})`);
      process.exit(1);
    }
  }

  return opts;
}

function printUsage() {
  console.log(`
  DesignFast Multi-Style Generator

  Usage:
    node test-multi.js <prompt> [styles] [options]        Generate sites
    node test-multi.js --iterate <output-dir> [options]   Iterate on existing output

  Arguments:
    prompt                  Description of the website/webapp to create (required for generate)
    styles                  Comma-separated style names, "all", or omit for freestyle
                            When omitted, the LLM designs freely with no style constraint

  Options:
    --versions, -v <N>      Generate N versions per style/model combo (default: 1)
                            Each version gets a creative nudge for genuine variety
    --models, -m <list>     Comma-separated model names (default: claude)
                            Available: ${Object.keys(MODELS).join(', ')}
    --mode <type>           "landing" (single page) or "webapp" (multi-page app)
                            Default: landing
    --theme-auto            LLM picks the best 1-3 styles from our catalog for your prompt
                            (only when no styles are specified)
    --theme-synth           LLM generates a fully custom style brief tailored to your prompt
                            (only when no styles are specified)
    --from <dir>            Use the design style from a previous output directory
                            Reads style.css + index.html as reference for the new generation
    --iterate <dir>         Interactive mode: iterate on an existing output directory
                            Opens a REPL where you can request changes to the generated files
    --help, -h              Show this help

  Available styles:
    ${Object.keys(STYLES).join(', ')}

  Examples:
    # Single style, one version
    node test-multi.js "A coffee subscription landing page" minimalist

    # Multiple styles
    node test-multi.js "A photography portfolio" minimalist,brutalist,playful

    # All styles
    node test-multi.js "A SaaS landing page" all

    # Freestyle — no style, let the LLM decide
    node test-multi.js "A coffee subscription landing page"

    # 3 creative versions of the same style
    node test-multi.js "A portfolio site" minimalist --versions 3

    # Compare Claude vs Gemini on the same style
    node test-multi.js "A portfolio site" brutalist --models claude,gemini

    # Full matrix: 2 styles × 3 versions × 2 models = 12 agents
    node test-multi.js "A fintech dashboard" corporate,cyberpunk -v 3 -m claude,gemini

    # Multi-page webapp
    node test-multi.js "A project management app with dashboard, tasks, and settings" --mode webapp

    # Freestyle webapp with multiple versions
    node test-multi.js "A recipe sharing app" --mode webapp -v 3

    # Auto-select: LLM picks the best styles from our 30-style catalog
    node test-multi.js "A smart building IoT platform" --theme-auto

    # Synthesize: LLM creates a fully custom style brief for your content
    node test-multi.js "A luxury pet grooming service" --theme-synth --versions 3

    # Generate a webapp using the style from a previous landing page
    node test-multi.js "A CRM dashboard app" --mode webapp --from output/2026-04-04/minimalist/

    # Iterate on a generated output interactively
    node test-multi.js --iterate output/2026-04-04/freestyle-claude-v1/
    > make the sidebar collapsible
    > change accent color to teal
    > add a settings page
    > done
`);
}

// ─── Base Instructions ──────────────────────────────────────────────────────

const LANDING_INSTRUCTIONS = `You are a visual designer, not a web developer. You think in composition, tension, rhythm, and emotion — not in "sections" and "components." Your work gets featured on Awwwards and siteinspire. People screenshot your sites and share them.

DESIGN PRINCIPLES:

1. STRUCTURE IS THE DESIGN
   The layout IS the style — not something you apply color to. A minimalist site and a brutalist site must have fundamentally different page architectures: different flow, different grid logic, different content hierarchy, different sense of space.
   - Maximum 5–7 content blocks. Depth beats breadth. One unforgettable block beats five forgettable ones.
   - Every block must have a different visual density, layout direction, or spatial feel than its neighbors.
   - The page needs a beginning, a shift, and a resolution — a narrative arc, not a checklist.

2. TYPOGRAPHY IS YOUR PRIMARY TOOL
   Great design is 90% typography:
   - Use extreme scale contrast (e.g., 8rem headline next to 0.875rem body text)
   - Use weight contrast within sections (ultra-light paired with heavy)
   - Letter-spacing and line-height shape the feel more than color does
   - One typeface used masterfully beats three used generically
   - Headlines can be anywhere: mid-section, full-bleed, split across columns, breaking the grid

3. VISUAL RHYTHM
   If you scroll and two consecutive blocks feel similar, the design has failed:
   - Alternate density: a packed block followed by vast whitespace
   - Alternate direction: left-aligned → centered → asymmetric → full-bleed
   - Alternate tone: light surface → dark band → accent color → typographic hero
   - Use background shifts, scale changes, and spatial breathing to create rhythm

4. RESTRAINT IS POWER
   - Fewer elements, more impact. Delete anything that doesn't make the page stronger.
   - One accent color used precisely beats a rainbow.
   - Whitespace is a design element, not empty space to fill.
   - If a section exists only because "landing pages usually have this" — remove it.

5. AUTHENTICITY
   - NO fake UI elements: no browser chrome, no terminal mockups, no phone frames, no fake app screenshots, no fake dashboards
   - NO fake social proof: no "trusted by" logo bars, no testimonials with made-up names/companies/avatars, no fake star ratings
   - Use typography, color, composition, and real copy to create visual impact — not props
   - Write copy that sounds human and opinionated. Short sentences. Personality. Not marketing-speak.

6. CSS CRAFT
   - Create texture with CSS: gradients, blend modes, clipping, custom shapes, grid overlap, layering
   - Purposeful motion: hover states that reveal information, subtle transitions, micro-interactions
   - Custom properties for a coherent system (spacing scale, color tokens, type scale)
   - Every interactive state should feel intentional — not just "opacity 0.8"

NEVER DO THESE:
- The hero-features-testimonials-pricing-CTA-footer template. Invent your own page structure.
- A centered hero with gradient text + subtitle + two side-by-side buttons
- Three equal-width cards in a row with icons on top
- Dark sections with barely-readable low-contrast text
- Sections that are just "background color + centered heading + grid of cards"
- More than 2 font families
- Decorative elements that serve no compositional purpose (random floating orbs, meaningless gradients)
- Repeating the same layout pattern in more than one block
- Any element you've seen on 100 other SaaS sites

FILE RULES:
1. Create exactly TWO files:
   - style.css — ALL custom CSS: custom properties, animations, keyframes, transitions, hover effects, media queries, decorative styles
   - index.html — the complete page using Tailwind CSS via CDN AND linking to style.css

2. In index.html include:
   - <script src="https://cdn.tailwindcss.com"></script>
   - <link rel="stylesheet" href="style.css">
   - Google Fonts via <link> in the <head>

3. ZERO inline styles — NEVER use style="..." attributes. ALL styling through Tailwind classes or custom classes in style.css. Output is automatically rejected if any style= attributes are found.

4. Self-contained (no external assets except CDN fonts/Tailwind), responsive, realistic copy (never lorem ipsum).

5. Write style.css FIRST, then index.html.

6. DO NOT explain anything. Just create the two files.`;

const FREESTYLE_DIRECTION = `You have total creative freedom. Before writing any code, decide:
- What is the ONE emotion this site should evoke?
- What is the ONE bold visual idea that will make it unforgettable?

Build the entire page around that idea. If the idea doesn't scare you a little, it's not bold enough.

Some starting points (pick one or invent your own):
- All typography, no imagery — the words ARE the design, at massive scale
- A single dramatic color used on a neutral canvas
- Asymmetric, off-grid layout where nothing is centered
- Ultra-dense editorial layout like a magazine spread
- Full-bleed sections with extreme vertical scale contrast
- A monochrome palette with one surprise accent moment
- Horizontal rhythm: content that reads left-to-right across wide sections

Do NOT default to dark mode. Do NOT default to SaaS aesthetics. The style should emerge from the content's personality.`;

const WEBAPP_INSTRUCTIONS = `You are a world-class web designer and frontend developer. Your job is to create a beautiful, complete, multi-page web application prototype.

RULES:
1. Create these files:
   - style.css — ALL shared custom CSS: custom properties, animations, keyframes, transitions, hover effects, media queries, component styles, any non-Tailwind styles
   - app.js — Shared JavaScript: navigation highlighting, interactive components, any client-side logic. NO frameworks — vanilla JS only.
   - index.html — the main/home page
   - Additional .html pages as needed for the described webapp (e.g., dashboard.html, settings.html, tasks.html)

2. In EVERY .html page:
   - Include <script src="https://cdn.tailwindcss.com"></script> for Tailwind
   - Include <link rel="stylesheet" href="style.css"> for your custom styles
   - Include <script src="app.js" defer></script> for shared JavaScript
   - Include any Google Fonts via <link> in the <head>

3. Navigation:
   - Every page MUST have a consistent nav bar/sidebar linking to ALL other pages
   - Use relative href paths (e.g., href="dashboard.html")
   - Highlight the current page in the navigation

4. ZERO inline styles:
   - NEVER use style="..." attributes in HTML. Not even once. Not for "just one property."
   - ALL styling must go through either Tailwind utility classes OR custom classes defined in style.css.
   - If you need a one-off visual tweak, create a CSS class for it in style.css.
   - This is a hard rule — the output will be automatically rejected if any style= attributes are found in the HTML.

5. The webapp must be:
   - Fully self-contained (no external assets except CDN fonts and Tailwind)
   - Responsive (mobile-first, works on all screen sizes)
   - Complete with realistic content, realistic form fields, realistic data tables — not placeholder text
   - Each page should feel like a real, functional app screen (even though backend logic is simulated)
   - Visually consistent across all pages (same header, same colors, same component styles)

6. Write style.css FIRST, then app.js, then each HTML page starting with index.html.

7. DO NOT explain anything. Just create the files.`;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * List .css, .js, .html files in a directory.
 */
function listOutputFiles(dirPath) {
  return readdirSync(dirPath).filter(f => /\.(css|js|html)$/.test(f));
}

/**
 * Resolve a path to absolute.
 */
function absPath(p) {
  return p.startsWith('/') ? p : `${process.cwd()}/${p}`;
}

/**
 * Build a reference style instruction pointing at a previous output directory.
 * The agent will use its read tool to inspect the files itself.
 */
function buildFromReference(fromPath) {
  const files = listOutputFiles(fromPath);
  const dir = absPath(fromPath);

  return `\n\nREFERENCE DESIGN:
Before writing any files, you MUST use your read tool to study the design language in these reference files:
${files.map(f => `  - ${dir}/${f}`).join('\n')}

Read style.css FIRST — it defines the color palette, typography, spacing, shadows, animations, and component styles.
Then read index.html to understand the structural patterns, Tailwind class usage, and component markup.
${files.includes('app.js') ? 'Then read app.js to understand interaction patterns.\n' : ''}
IMPORTANT: Replicate the DESIGN LANGUAGE from these reference files — same colors, font choices, spacing rhythm, border styles, shadow styles, animation patterns, and component styling. You are NOT copying the content or layout — you are extracting the visual system and applying it to the NEW website described below.`;
}

/**
 * Build the style catalog summary for the auto-selector.
 * Returns a compact string: "key: Name — vibe description" for each style.
 */
function buildStyleCatalog() {
  const vibeExtractor = /Vibe:\s*(.+?)\.?\s*$/m;
  return Object.entries(STYLES).map(([key, style]) => {
    const vibeMatch = style.prompt.match(vibeExtractor);
    const vibe = vibeMatch ? vibeMatch[1].trim() : style.name;
    return `  ${key}: ${style.name} — ${vibe}`;
  }).join('\n');
}

/**
 * --theme-auto: Ask the LLM to pick the best 1-3 styles from our catalog.
 * Returns an array of style keys.
 */
async function resolveThemeAuto(userPrompt, modelKey) {
  const modelCfg = MODELS[modelKey];
  const catalog = buildStyleCatalog();

  console.log(`🤖 Auto-selecting styles for: "${userPrompt.slice(0, 60)}..."`);

  const provider = createProvider({
    name: modelCfg.providerName,
    apiKey: process.env[modelCfg.apiKeyEnv],
    model: modelCfg.model,
  });

  const db = new DatabaseImpl();
  const tools = createDefaultRegistry();

  const agent = new AgentLoop({
    provider,
    tools,
    db,
    workingDir: process.cwd(),
    maxTokens: 1024,
    maxTurns: 1,
    model: modelCfg.model,
    disabledTools: ['bash', 'read', 'write', 'edit', 'glob', 'grep', 'webfetch'],
  });

  const selectorPrompt = `You are a design style selector. Given a website description and a catalog of available design styles, pick the single BEST style that fits the described website.

STYLE CATALOG:
${catalog}

WEBSITE DESCRIPTION:
${userPrompt}

RULES:
- Pick exactly ONE style — the single best match for this website's content and purpose.
- Pick a style that is APPROPRIATE for the content — a hospital website should NOT get "cyberpunk", a fintech app should NOT get "playful".
- Respond with ONLY the style key, nothing else. Example: cleanTech`;

  let result = '';
  agent.on('event', (event) => {
    if (event.type === 'text') {
      result += event.text;
    }
  });

  await agent.run(selectorPrompt);
  db.close();

  // Parse response — extract the single best style key
  const keys = result
    .trim()
    .split(/[\s,]+/)
    .map(s => s.trim().replace(/[^a-zA-Z]/g, ''))
    .filter(s => STYLES[s]);

  if (keys.length === 0) {
    console.error(`  Style selector returned no valid styles: "${result.trim()}"`);
    console.error(`  Falling back to freestyle.`);
    return [];
  }

  console.log(`🎯 Selected: ${STYLES[keys[0]].name}\n`);
  return [keys[0]];
}

/**
 * --theme-synth: Ask the LLM to generate a custom style prompt tailored to the content.
 * Returns a synthesized style prompt string.
 */
async function resolveThemeSynth(userPrompt, modelKey) {
  const modelCfg = MODELS[modelKey];

  console.log(`🧪 Synthesizing custom style for: "${userPrompt.slice(0, 60)}..."`);

  const provider = createProvider({
    name: modelCfg.providerName,
    apiKey: process.env[modelCfg.apiKeyEnv],
    model: modelCfg.model,
  });

  const db = new DatabaseImpl();
  const tools = createDefaultRegistry();

  const agent = new AgentLoop({
    provider,
    tools,
    db,
    workingDir: process.cwd(),
    maxTokens: 32_768,
    maxTurns: 1,
    model: modelCfg.model,
    disabledTools: ['bash', 'read', 'write', 'edit', 'glob', 'grep', 'webfetch'],
  });

  const synthPrompt = `You are a world-class web design director. Given a website description, create a detailed design system brief that would be given to a designer to implement the site.

WEBSITE DESCRIPTION:
${userPrompt}

Write a design system brief covering these aspects (be specific — include exact hex colors, font names, pixel values):
- Layout: structure, max-width, grid approach, section flow
- Colors: exact hex values for background, text, primary accent, secondary accent, section alternates
- Typography: specific Google Font names, weights for headings vs body, sizes, line-heights
- Spacing: section gaps, card padding, overall density
- Cards/Components: border radius, shadows, borders, hover states
- Decorations: what decorative elements to use (or not), animation style
- Buttons: primary and secondary styles, sizing, border radius
- Vibe: 2-3 real-world reference websites this should feel like

RULES:
- Be SPECIFIC and OPINIONATED. No "you could use blue or green" — pick ONE and commit.
- The style must be APPROPRIATE for the described website. A children's app gets different treatment than a law firm.
- Use the same bullet-point format as shown above.
- Output ONLY the design brief, no preamble, no explanation.`;

  let result = '';
  agent.on('event', (event) => {
    if (event.type === 'text') {
      result += event.text;
    }
  });

  await agent.run(synthPrompt);
  db.close();

  const brief = result.trim();
  if (brief.length < 100) {
    console.error(`  Style synthesizer returned too short a response. Falling back to freestyle.`);
    return null;
  }

  console.log(`🎨 Custom style synthesized (${brief.length} chars)\n`);
  return brief;
}

// ─── Iterate Mode ───────────────────────────────────────────────────────────

async function runIterateMode(opts) {
  const targetDir = opts.iterate;
  const modelCfg = MODELS[opts.models[0]];
  const db = new DatabaseImpl();

  console.log(`\n🔄 DesignFast Interactive Mode`);
  console.log(`📁 Working on: ${targetDir}/`);
  console.log(`🤖 Model: ${modelCfg.label}`);

  // List existing files (not read — the agent will read them itself)
  const fileList = listOutputFiles(targetDir);

  if (fileList.length === 0) {
    console.error(`No .css/.js/.html files found in ${targetDir}`);
    db.close();
    process.exit(1);
  }

  console.log(`📄 Files: ${fileList.join(', ')}`);
  console.log(`${'─'.repeat(60)}`);
  console.log(`Type your changes. "done" or "exit" to quit.\n`);

  const provider = createProvider({
    name: modelCfg.providerName,
    apiKey: process.env[modelCfg.apiKeyEnv],
    model: modelCfg.model,
  });

  const tools = createDefaultRegistry();

  const agent = new AgentLoop({
    provider,
    tools,
    db,
    workingDir: process.cwd(),
    maxTokens: 32_768,
    maxTurns: 50,
    model: modelCfg.model,
  });

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCost = 0;
  let sessionId = null;

  agent.on('event', (event) => {
    switch (event.type) {
      case 'tool_start':
        console.log(`  🔧 ${event.name}`);
        break;
      case 'tool_output':
        if (event.is_error) {
          console.log(`  ❌ ${event.output}`);
        } else {
          console.log(`  ✅ Done (${event.duration_ms}ms)`);
        }
        break;
      case 'usage':
        totalInputTokens += event.input_tokens || 0;
        totalOutputTokens += event.output_tokens || 0;
        totalCost += event.cost_usd || 0;
        break;
      case 'error':
        console.error(`  💥 ${event.message}`);
        break;
    }
  });

  // Build initial context: tell the agent where the files are (it will read them itself)
  const dir = absPath(targetDir);

  const initPrompt = `You are a world-class web designer and developer working on an existing project.

The project files are in "${dir}/". The files are:
${fileList.map(f => `  - ${dir}/${f}`).join('\n')}

FIRST: Use your read tool to read ALL of these files so you understand the current state of the project. Start with style.css, then the HTML files, then any JS files.

RULES:
- When the user asks for changes, modify the existing files in "${dir}/" using the edit tool or write tool.
- Always re-read a file before editing it if you haven't read it recently in this conversation.
- Maintain visual consistency — same design language, colors, fonts, spacing.
- If adding new pages, follow the same patterns (same nav, same head, same CSS/JS includes).
- Keep all file paths relative within the "${dir}/" folder.
- After making changes, briefly confirm what you changed (one line).
- Do NOT rewrite entire files unless necessary — prefer targeted edits.

Start by reading all the files now.`;

  // First run to establish session context
  const session = await agent.run(initPrompt);
  sessionId = session.id;

  // REPL loop
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = () => {
    return new Promise((resolve) => {
      rl.question('> ', (answer) => resolve(answer));
    });
  };

  while (true) {
    const input = await askQuestion();
    const trimmed = input.trim();

    if (!trimmed) continue;
    if (trimmed === 'done' || trimmed === 'exit' || trimmed === 'quit') break;

    try {
      console.log('');
      await agent.continueSession(sessionId, trimmed);
      console.log('');
    } catch (error) {
      console.error(`  💥 Error: ${error.message}\n`);
    }
  }

  rl.close();

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`📊 Session Summary`);
  console.log(`  Tokens: ${totalInputTokens} in / ${totalOutputTokens} out  |  Total: $${totalCost.toFixed(4)}`);
  console.log(`📁 Output: ${targetDir}/`);
  console.log(`🌐 Open: open ${targetDir}/index.html\n`);

  db.close();
}

// ─── Generate Mode ──────────────────────────────────────────────────────────

async function runGenerateMode(opts) {
  // ─── Resolve theme mode ─────────────────────────────────────────────────

  // --theme-auto: LLM picks best styles from catalog
  if (opts.themeAuto && opts.styles.length === 0) {
    const picked = await resolveThemeAuto(opts.prompt, opts.models[0]);
    if (picked.length > 0) {
      opts.styles = picked;
    }
  }

  // --theme-synth: LLM generates a custom style prompt
  let synthStylePrompt = null;
  if (opts.themeSynth && opts.styles.length === 0) {
    synthStylePrompt = await resolveThemeSynth(opts.prompt, opts.models[0]);
  }

  // Build the job matrix: every combination of (style, version, model)
  const jobs = [];

  let styleEntries;
  if (opts.styles.length > 0) {
    // Explicit styles (or auto-selected)
    styleEntries = opts.styles.map(s => ({ key: s, name: STYLES[s].name, prompt: STYLES[s].prompt }));
  } else if (synthStylePrompt) {
    // Synthesized custom style
    styleEntries = [{ key: 'synth', name: 'Synthesized', prompt: synthStylePrompt }];
  } else {
    // Freestyle fallback
    styleEntries = [{ key: 'freestyle', name: 'Freestyle', prompt: null }];
  }

  // Generate context-aware variation strategies if multiple versions
  const variationStrategyMap = new Map();
  if (opts.versions > 1) {
    const firstModelCfg = MODELS[opts.models[0]];
    for (const style of styleEntries) {
      try {
        console.log(`🎨 Generating variation strategies for "${style.name}"...`);
        const strategies = await generateVariationStrategies({
          userPrompt: opts.prompt,
          stylePrompt: style.prompt || '',
          count: opts.versions - 1,
          model: firstModelCfg.model,
          providerName: firstModelCfg.providerName,
          apiKey: process.env[firstModelCfg.apiKeyEnv],
        });
        variationStrategyMap.set(style.key, strategies);
        strategies.forEach((s, i) => console.log(`  v${i + 2}: ${s}`));
      } catch (err) {
        console.warn(`⚠️  Failed to generate strategies for "${style.name}": ${err.message}`);
      }
    }
  }

  for (const style of styleEntries) {
    const strategies = variationStrategyMap.get(style.key) || [];
    for (let version = 1; version <= opts.versions; version++) {
      const variationNudge = version > 1 ? (strategies[version - 2] || '') : '';
      for (const modelKey of opts.models) {
        jobs.push({ style, version, variationNudge, modelKey });
      }
    }
  }

  const totalJobs = jobs.length;
  const baseInstructions = opts.mode === 'webapp' ? WEBAPP_INSTRUCTIONS : LANDING_INSTRUCTIONS;

  // Build --from reference block (if provided)
  const fromReference = opts.from ? buildFromReference(opts.from) : '';

  // Output directory
  const outputBase = 'output';
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const runDir = `${outputBase}/${timestamp}`;

  // Header
  console.log(`\n🎨 DesignFast Multi-Style Generator`);
  console.log(`📝 Prompt: "${opts.prompt}"`);
  console.log(`📐 Mode: ${opts.mode}`);
  if (opts.from) {
    console.log(`🎨 From: ${opts.from} (reference style)`);
  }
  if (opts.styles.length > 0) {
    console.log(`🎭 Styles: ${opts.styles.join(', ')}${opts.themeAuto ? ' (auto-selected)' : ''}`);
  } else if (synthStylePrompt) {
    console.log(`🎭 Styles: synthesized (custom style brief)`);
  } else {
    console.log(`🎭 Styles: freestyle (designer's choice)`);
  }
  console.log(`🔢 Versions: ${opts.versions}`);
  console.log(`🤖 Models: ${opts.models.join(', ')}`);
  console.log(`📊 Total jobs: ${totalJobs}`);
  console.log(`${'─'.repeat(60)}\n`);

  // ─── Agent Runner ─────────────────────────────────────────────────────────

  const db = new DatabaseImpl();

  function buildJobDir(job) {
    const parts = [job.style.key];
    if (opts.models.length > 1) parts.push(job.modelKey);
    if (opts.versions > 1) parts.push(`v${job.version}`);
    return `${runDir}/${parts.join('-')}`;
  }

  function buildJobLabel(job) {
    const parts = [job.style.name];
    if (opts.models.length > 1) parts.push(MODELS[job.modelKey].label);
    if (opts.versions > 1) parts.push(`v${job.version}`);
    return parts.join(' / ');
  }

  async function runJob(job) {
    const jobDir = buildJobDir(job);
    const label = buildJobLabel(job);
    const modelCfg = MODELS[job.modelKey];
    const startTime = Date.now();

    const provider = createProvider({
      name: modelCfg.providerName,
      apiKey: process.env[modelCfg.apiKeyEnv],
      model: modelCfg.model,
    });

    const tools = createDefaultRegistry();

    const maxTurns = opts.mode === 'webapp' ? 80 : 50;

    const agent = new AgentLoop({
      provider,
      tools,
      db,
      workingDir: process.cwd(),
      maxTokens: 32_768,
      maxTurns,
      model: modelCfg.model,
    });

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;

    agent.on('event', (event) => {
      switch (event.type) {
        case 'tool_start':
          console.log(`  [${label}] 🔧 ${event.name}`);
          break;
        case 'tool_output':
          if (event.is_error) {
            console.log(`  [${label}] ❌ ${event.output}`);
          } else {
            console.log(`  [${label}] ✅ Done (${event.duration_ms}ms)`);
          }
          break;
        case 'usage':
          totalInputTokens += event.input_tokens || 0;
          totalOutputTokens += event.output_tokens || 0;
          totalCost += event.cost_usd || 0;
          break;
        case 'error':
          console.error(`  [${label}] 💥 ${event.message}`);
          break;
      }
    });

    // Build prompt
    let prompt = baseInstructions;

    // --from reference (injected before the content prompt so it sets the design context)
    if (fromReference) {
      prompt += fromReference;
    }

    prompt += `\n\nWEBSITE TO CREATE:\n${opts.prompt}`;

    // Style block: --from overrides style presets and freestyle
    if (fromReference) {
      // Style already defined by the reference — no additional style block needed
    } else if (job.style.prompt) {
      prompt += `\n\nDESIGN STYLE:\n${job.style.prompt}`;
    } else {
      prompt += `\n\nDESIGN STYLE:\n${FREESTYLE_DIRECTION}`;
    }

    // Variation nudge (dynamically generated per-project)
    if (job.variationNudge) {
      prompt += `\n\nCREATIVE DIRECTION:\n${job.variationNudge}`;
    }

    // File output instruction
    if (opts.mode === 'webapp') {
      prompt += `\n\nWrite ALL files into the "${jobDir}" folder. Write style.css first, then app.js, then each HTML page starting with index.html.`;
    } else {
      prompt += `\n\nWrite both files into the "${jobDir}" folder. Write style.css first, then index.html.`;
    }

    try {
      await agent.run(prompt);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      return {
        label,
        style: job.style.key,
        modelKey: job.modelKey,
        version: job.version,
        success: true,
        elapsed,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cost: totalCost,
      };
    } catch (error) {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      return {
        label,
        style: job.style.key,
        modelKey: job.modelKey,
        version: job.version,
        success: false,
        elapsed,
        error: error.message,
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        cost: totalCost,
      };
    }
  }

  // ─── Launch All Jobs in Parallel ──────────────────────────────────────────

  for (const job of jobs) {
    console.log(`🚀 Starting: ${buildJobLabel(job)} → ${buildJobDir(job)}/`);
  }

  const results = await Promise.allSettled(jobs.map(job => runJob(job)));

  // ─── Summary ──────────────────────────────────────────────────────────────

  console.log(`\n${'─'.repeat(60)}`);
  console.log(`\n📊 Generation Summary\n`);

  let totalCost = 0;
  let totalTokensIn = 0;
  let totalTokensOut = 0;
  let successCount = 0;
  let failCount = 0;

  for (const result of results) {
    const r = result.status === 'fulfilled'
      ? result.value
      : { label: '?', success: false, error: result.reason?.message };

    if (r.success) {
      successCount++;
      totalCost += r.cost;
      totalTokensIn += r.inputTokens;
      totalTokensOut += r.outputTokens;
      console.log(`  ✅ ${r.label.padEnd(32)} ${r.elapsed}s  |  ${r.inputTokens} in / ${r.outputTokens} out  |  $${r.cost.toFixed(4)}`);
    } else {
      failCount++;
      console.log(`  ❌ ${(r.label).padEnd(32)} FAILED: ${r.error}`);
    }
  }

  console.log(`  ${'─'.repeat(56)}`);
  console.log(`  ${successCount} succeeded, ${failCount} failed`);
  console.log(`  Tokens: ${totalTokensIn} in / ${totalTokensOut} out  |  Total: $${totalCost.toFixed(4)}`);
  console.log(`\n📁 Output: ${runDir}/`);
  console.log(`🌐 Open: open ${runDir}/*/index.html\n`);

  db.close();
}

// ─── Main ───────────────────────────────────────────────────────────────────

const opts = parseArgs(process.argv);

if (opts.command === 'iterate') {
  await runIterateMode(opts);
} else {
  await runGenerateMode(opts);
}
