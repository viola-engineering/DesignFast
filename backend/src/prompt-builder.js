import {
  AgentLoop,
  createProvider,
  createDefaultRegistry,
  DatabaseImpl,
} from '@angycode/core';

// ─── Style Presets ──────────────────────────────────────────────────────────

export const STYLES = {
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
- Security/trust: shield icons described as unicode, encryption badge, regulatory compliance labels (described as text in badges: "Bank-level security", "256-bit encrypted", "FDIC insured"). Partner bank logos in grayscale.
- Decorations: subtle. Thin gradient lines as accents. Small dots or connection lines between feature sections suggesting network/flow. NO playful elements, NO emoji (except lock), NO heavy decorations. Clean, precise, trustworthy.
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

  // ─── Additional Visual Styles ───────────────────────────────────────────────

  gradient: {
    name: 'Gradient / Aurora',
    prompt: `Use a GRADIENT / AURORA style.
- Layout: max-width 1200px, centered. Spacious sections with generous padding (100px+ vertical). Hero takes full viewport height with centered content. Sections flow smoothly with gradient backgrounds that shift between them. NO harsh section boundaries.
- Colors: rich, flowing gradient backgrounds are THE defining feature. Use multi-stop gradients: purple (#8B5CF6) → pink (#EC4899) → orange (#F97316), or blue (#3B82F6) → cyan (#06B6D4) → green (#10B981). Background gradients should be large-scale (covering entire sections or the full page). Mesh gradients via layered radial-gradients for organic blob effects. Text: white on dark gradient areas, dark (#111827) on light areas.
- Gradient techniques: use CSS conic-gradient, radial-gradient, and linear-gradient layered together. Animate gradients subtly with @keyframes (background-position shift). Add noise texture overlay at 3-5% opacity for depth. Gradient borders using background-clip tricks.
- Typography: clean, modern sans-serif (Inter, DM Sans, or Satoshi). White or very dark text depending on background luminosity. Headlines 3-4rem, semibold. Let the gradients be the star — typography is clean and secondary.
- Cards: glassmorphism-style cards floating over gradient backgrounds — semi-transparent white (rgba(255,255,255,0.1)), backdrop-filter: blur(12px), subtle white border. Cards create contrast against the flowing colors beneath.
- Decorations: floating gradient orbs (large radial-gradients positioned absolutely). Subtle grain texture overlay. Soft glow effects around key elements (box-shadow with gradient colors). NO hard edges, NO borders (except on glass cards). Everything flows.
- Buttons: semi-transparent white or filled with a gradient. Rounded-full or rounded-xl. Glow effect on hover (box-shadow expands).
- Vibe: Stripe's gradient backgrounds, Linear's color washes, Vercel's aurora effects. Modern, premium, atmospheric. The color itself creates emotion — the gradients ARE the design. Feels like looking at the northern lights through frosted glass.`,
  },

  claymorphism: {
    name: 'Claymorphism',
    prompt: `Use a CLAYMORPHISM / 3D CLAY style.
- Layout: centered, max-width 1100px. Card-based with generous spacing (32px gaps). Hero with large 3D-style illustration area placeholder. Feature cards in 2-3 column grid. Sections have comfortable padding (80px vertical). Everything feels like physical objects sitting on a surface.
- Background: soft, warm pastel background — light peach (#FEF3E7), soft lavender (#F3E8FF), or pale mint (#ECFDF5). The background is a flat, soft color — NOT white. This creates the "surface" the clay objects sit on.
- 3D Clay effect: THE KEY TECHNIQUE. Every card/element uses:
  - Rounded corners: border-radius 24-32px (very soft, pillowy)
  - Soft inner shadow at top-left: box-shadow: inset 4px 4px 8px rgba(255,255,255,0.6)
  - Soft outer shadow at bottom-right: box-shadow: 12px 12px 24px rgba(0,0,0,0.1)
  - Slight outer glow: add a third shadow layer with the element's color tinted lighter
  - Combine: box-shadow: inset 4px 4px 8px rgba(255,255,255,0.6), 12px 12px 24px rgba(0,0,0,0.1), 0 0 0 4px rgba(255,255,255,0.3);
- Colors: soft, matte pastels for card backgrounds — coral (#FFB4A2), lavender (#B8A9C9), mint (#98D8C8), butter yellow (#F7DC6F), soft blue (#89CFF0). Each card can be a different pastel. Text: warm dark (#2D3436) for readability. NO vibrant or saturated colors — everything matte and soft.
- Typography: rounded, friendly sans-serif (Nunito, Quicksand, or Poppins). Medium to bold weights. Comfortable sizes. The type should feel soft and approachable, matching the clay aesthetic.
- Icons/graphics: describe simple blob shapes or rounded icons that look like clay sculptures. Soft, organic shapes with the same shadow treatment. NO sharp geometric icons.
- Buttons: same clay treatment — soft pastel fill, rounded-2xl, inset highlight shadow + outer drop shadow. On hover: slight translateY(-2px) lift with shadow growing. Feels like pressing a soft rubber button.
- Vibe: children's educational app, friendly SaaS, iOS 16+ design language. Soft, tactile, approachable. Everything looks like it was sculpted from soft clay or marshmallow. You want to reach out and squish the interface.`,
  },

  vaporwave: {
    name: 'Vaporwave / Synthwave',
    prompt: `Use a VAPORWAVE / SYNTHWAVE / 80s RETRO-FUTURISM style.
- Layout: full-width with dramatic sections. Hero spans full viewport with centered content over the signature grid/sunset. Sections alternate between dark and gradient areas. Max-width 1100px for text content but backgrounds bleed edge to edge. Asymmetric element placement — some elements float off-grid.
- Colors: the SIGNATURE palette. Background: deep dark purple (#1a0a2e) or dark blue (#0d0221). Accent gradients: hot pink (#ff006e) → orange (#ff8c00) → yellow (#ffbe0b), or cyan (#00ffff) → magenta (#ff00ff). Neon pink and cyan are mandatory. Sunset gradient (pink → orange → yellow) for hero backgrounds. Chrome/silver (#c0c0c0) accents.
- Signature elements:
  - Perspective grid: CSS grid lines receding to horizon using perspective and rotateX transforms, or repeating-linear-gradient creating a grid pattern that fades with a gradient mask
  - Sunset: large radial-gradient (yellow center → orange → pink → purple) as background, positioned at bottom-center
  - Neon glow: text-shadow and box-shadow with multiple layers of pink/cyan at increasing blur (0 0 10px, 0 0 20px, 0 0 40px)
  - Chrome text: linear-gradient text with metallic colors (white → gray → white) using background-clip
- Typography: retro display fonts — use script/cursive for main headlines (described as "neon sign script"), geometric sans-serif (Orbitron, Exo 2) for body. Neon glow effect on headlines. Text can be LARGE (5-6rem for hero).
- Decorations: palm tree silhouettes (describe as dark shapes), Greek/Roman statue busts as imagery placeholders (the aesthetic signature), retro car silhouettes, geometric triangles and lines, scanlines overlay (repeating-linear-gradient). VHS tracking artifacts as CSS noise.
- Buttons: outlined with neon glow, or filled with gradient. Hover: glow intensifies dramatically. Retro feel — could say "ENTER" or have 80s-style text.
- Vibe: 1980s retrofuturism, Miami Vice, Blade Runner sunsets, vaporwave album covers, a e s t h e t i c. Nostalgic for a future that never happened. Makes you hear synthesizers just looking at it.`,
  },

  darkTech: {
    name: 'Dark Tech',
    prompt: `Use a DARK TECH / MODERN DARK MODE style.
- Layout: max-width 1200px, centered. Clean and spacious. Hero with left-aligned headline + right-side visual/mockup area. Features in clean grid. Generous vertical rhythm (80-100px between sections). The layout itself is conventional — it's the dark treatment that defines this style. Full-width dark sections, no alternating light/dark.
- Colors: dark background throughout — NOT pure black. Use very dark gray (#0A0A0B), dark navy (#0F1419), or near-black with slight warmth (#111113). This is softer than pure #000000. Text: off-white (#E5E7EB) for body, bright white (#FFFFFF) for headlines. ONE accent color used sparingly: electric blue (#3B82F6), purple (#8B5CF6), green (#10B981), or cyan (#06B6D4). Use accent ONLY for interactive elements, highlights, and key CTAs.
- Subtle lighting effects: very subtle gradients that suggest light sources — a faint radial gradient of the accent color at 5% opacity behind hero text. Thin accent-colored borders (1px) on cards. Subtle glow (box-shadow: 0 0 20px accent at 10% opacity) on hover states. The page should feel like a dark room with soft accent lighting.
- Typography: clean sans-serif (Inter, SF Pro, system-ui). White headlines (600-700 weight), gray body text (#9CA3AF for secondary, #E5E7EB for primary). Standard sizes — nothing oversized. The typography is functional, not decorative.
- Cards: dark card backgrounds (#18181B or #1F2937) on the slightly lighter page background. Very subtle border (#27272A). Minimal shadow (shadows don't work well on dark backgrounds). Hover: border lightens or gains accent tint, subtle background lighten.
- Decorations: minimal. Thin lines (accent-colored or gray). Subtle dot grid pattern in hero at 3% opacity. Code blocks with syntax highlighting (actual dark theme colors). NO gradients except very subtle lighting effects. NO glows except on hover states.
- Buttons: primary filled with accent color + white text, rounded-lg. Secondary: outlined with gray border or ghost with hover fill. Small and refined — not chunky.
- Vibe: GitHub dark mode, Discord, Spotify, Linear app. Professional dark UI that you'd use for 10 hours and never get tired. The dark mode that developers actually want to use. Functional, calm, focused. Nothing flashy — just good.`,
  },

  pastel: {
    name: 'Pastel / Soft',
    prompt: `Use a PASTEL / SOFT / GEN-Z style.
- Layout: max-width 1100px, centered with generous margins. Rounded everything. Cards arranged in soft grids with large gaps (32px). Sections have very comfortable padding (100px vertical). Hero centered with soft, approachable headline. The layout feels gentle and breathable — nothing packed or dense.
- Colors: soft, desaturated pastels — baby pink (#FFC0CB, but softer: #FFE4E9), lavender (#E6E0F8), mint (#C7F0DB), butter cream (#FFF8E7), sky (#D4EAFF), peach (#FFE5D9). Background: very soft off-white (#FEFEFE) or the palest tint of your main pastel. Text: soft charcoal (#444444, NOT black) for body, slightly darker for headings. Avoid high contrast — everything should feel gentle.
- Rounded shapes: border-radius 20-30px on cards. Pill shapes (border-radius: 9999px) for buttons and tags. Blob-shaped decorative elements using border-radius with 8 values for organic shapes. NO sharp corners anywhere in the design.
- Typography: rounded, friendly fonts (Nunito, Quicksand, Poppins, or DM Sans). Medium weights (500-600 for headings, 400 for body). Nothing bold or heavy. Generous line-height (1.7+). The type feels soft and approachable.
- Decorations: floating blob shapes in soft pastels as background decorations. Subtle grain texture at 2-3% opacity. Small decorative elements: stars, hearts, sparkles (✦ ★ ♡) used sparingly. Soft shadows (large blur, low opacity, tinted with the element's color). Wavy section dividers using SVG or clip-path.
- Cards: soft pastel background (each card can be a different pastel), extra-rounded corners, soft colored shadow (not gray — tint the shadow with the card's color). On hover: gentle lift with shadow spread.
- Buttons: pill-shaped, soft pastel fill with slightly darker text. On hover: slight darkening or gentle scale. NO harsh hover states. Secondary: outlined with rounded border.
- Vibe: Notion's softer pages, Glossier, modern Gen-Z brands, wellness apps, stationery aesthetics. Soft, approachable, calming. The design equivalent of a warm hug. Makes you feel safe and happy. Nothing threatening or corporate about it.`,
  },

  handDrawn: {
    name: 'Hand-drawn / Sketch',
    prompt: `Use a HAND-DRAWN / SKETCH / DOODLE style.
- Layout: max-width 1000px, centered. Slightly informal arrangement — elements can be slightly off-grid or rotated 1-2 degrees. Hero with large illustrated-style headline. Sections separated by hand-drawn style dividers. Cards arranged casually, not in a strict grid. The layout feels human-made, not computer-perfect.
- Colors: warm, muted palette like a sketchbook — cream paper background (#FDF9F3 or #FEFCF6), charcoal sketch lines (#333333), muted accent colors as if from colored pencils: dusty rose (#E8B4B8), sage green (#A3B18A), muted mustard (#D4A574), soft blue (#89A8B2). Colors should feel hand-applied, slightly uneven in spirit.
- Hand-drawn effects:
  - Borders: use SVG filters or wavy borders to look hand-drawn. Or use border-style with dashed/dotted in organic patterns
  - Underlines: wavy SVG underlines under headings, not straight lines
  - Boxes: slightly irregular shapes using clip-path with imperfect coordinates
  - Decorations: squiggle lines, arrows, stars drawn in a sketchy style (describe these as SVG or unicode characters styled appropriately)
- Typography: mix of handwriting-style font for headlines (Caveat, Patrick Hand, or Kalam) and clean readable sans-serif for body (Inter, DM Sans). The headline font should look genuinely hand-written. Body stays readable. Notes and annotations in the handwriting font.
- Decorations: doodle-style elements — stars, arrows, underlines, circles, exclamation marks, thought bubbles. Small margin notes and annotations. Tape/sticky note effects on cards. Paper texture overlay at low opacity. Post-it note style callouts.
- Cards: look like paper cards or sticky notes — slight rotation, subtle paper texture, maybe a "taped" corner effect using pseudo-elements. Hand-drawn border or drop shadow that looks sketched.
- Buttons: look like drawn buttons with sketchy borders. Fill with muted color. On hover: a drawn "press" effect or scribble appears.
- Vibe: Notion's illustrations, Dropbox Paper, Basecamp sketchy style, indie game aesthetics. Personal, approachable, creative. Feels like someone's lovingly crafted notebook. The imperfection IS the perfection — it feels human, warm, and creative.`,
  },

  memphis: {
    name: 'Memphis',
    prompt: `Use a MEMPHIS DESIGN style.
- Layout: dynamic and asymmetric. Elements placed at angles, overlapping, breaking the grid intentionally. Hero with bold headline at an angle. Sections don't follow conventional top-to-bottom flow — elements float, overlap, and create visual tension. Max-width 1100px but elements break out. Deliberate visual chaos that's still navigable.
- Colors: bold, clashing primaries and pastels — hot pink (#FF6B9D), electric blue (#0066FF), yellow (#FFE600), mint green (#98FF98), coral (#FF6F61), purple (#9B59B6), black for outlines. Colors are used in large flat blocks. Backgrounds can be different colors per section. The palette is intentionally "wrong" by traditional standards — that's the point.
- Signature shapes: THE DEFINING ELEMENT. Geometric shapes used decoratively:
  - Squiggly lines (wavy borders, SVG paths)
  - Dots and circles (polka dot patterns, floating circles)
  - Triangles scattered as decoration
  - Lightning bolts and zigzags
  - Terrazzo-style confetti patterns (small scattered shapes)
  - These shapes have thick black outlines (2-3px stroke)
- Typography: bold, chunky sans-serif for headlines (900 weight, condensed works well). Mix sizes dramatically. Text can be rotated, stacked vertically, or placed at angles. Black text or reversed out of colored blocks. Headline might be broken across multiple lines at unusual break points.
- Patterns: terrazzo/confetti patterns (small scattered shapes on backgrounds using CSS or described as patterns). Polka dots. Stripes at angles. Grid patterns. These add texture to sections and cards.
- Cards: solid colored backgrounds with thick black borders (3px+). Shapes decorating corners or edges. Slight rotation. Not all cards need to be rectangles — some could have an irregular edge.
- Buttons: bold colored fills with black outlines. Thick, chunky. Text in black or white. Could be at a slight angle. Shadow offset (4px 4px 0 black) for 3D pop effect.
- Vibe: 1980s Memphis Group, Ettore Sottsass, bowling alley carpet, 90s Nickelodeon, Saved by the Bell aesthetics. Bold, playful, deliberately "bad taste" that circles back to being iconic. Anti-minimalist. Makes you smile with its audacity.`,
  },

  scandinavian: {
    name: 'Scandinavian / Nordic',
    prompt: `Use a SCANDINAVIAN / NORDIC / HYGGE style.
- Layout: clean, uncluttered, single-column dominant. Max-width 900px for text content. Generous whitespace — let elements breathe. Hero simple and centered. Sections have large padding (100px+). Content is sparse and intentional — every element earns its place. The layout feels calm and considered.
- Colors: natural, muted, warm-neutral palette. Background: warm white (#FAFAF8) or very light warm gray (#F5F3F0). Text: warm charcoal (#3D3D3D), NOT pure black. Accent: one muted natural color — dusty sage (#A3B18A), warm terracotta (#C4A484), muted navy (#4A5568), or soft blush (#D4A5A5). The palette should feel like natural materials: wood, wool, stone, linen.
- Natural materials feel: design should evoke wood grain, woolen textures, ceramic, plants. Use subtle texture overlays (paper grain at 2%). Warm shadows (tinted slightly brown, not pure gray). Everything feels tactile and natural, not digital.
- Typography: elegant, readable serif for headlines (Lora, Merriweather, or Playfair Display) paired with clean sans-serif for body (Inter, DM Sans). Understated sizes — headlines 2-2.5rem, nothing oversized. Light to medium weights. Generous letter-spacing on labels. The typography is refined but not showy.
- Decorations: minimal but meaningful. Thin hairline rules. Simple line illustrations described as minimal Scandinavian style (geometric, single-line). Plant imagery. Subtle cream/beige backgrounds for subtle section definition. NO bold graphics, NO heavy elements. Negative space is a feature.
- Cards: clean white or very slight warm tint. Minimal or no border — just subtle shadow (warm-tinted, soft). Rounded corners but not too round (8-12px). Internal padding generous. The cards feel like paper or ceramic objects.
- Buttons: understated. Outlined with thin warm-gray border, or subtle filled with muted accent. NOT attention-grabbing — they exist but don't shout. Text-style links preferred over chunky buttons where possible.
- Vibe: IKEA, Muji, Kinfolk magazine, Copenhagen cafes. Calm, warm, considered. "Hygge" translated to digital — cozy, intentional, unpretentious. The design makes you want to curl up with a warm drink. Minimalist but not cold — there's warmth in every choice.`,
  },

  // ─── Additional Industry Styles ─────────────────────────────────────────────

  education: {
    name: 'Education / EdTech',
    prompt: `Use an EDUCATION / EDTECH style.
- Layout: max-width 1200px. Clear navigation with course categories. Hero with aspirational headline + student imagery placeholder + prominent CTA ("Start Learning", "Browse Courses"). Below: featured courses grid, learning paths section, instructor highlights, testimonials from learners, stats (students enrolled, courses, completion rate). Footer with course categories, support links.
- Colors: trustworthy yet approachable. Primary: a learning-friendly blue (#2563EB) or teal (#0D9488) — NOT corporate navy. Secondary: encouraging green (#10B981) for progress/success, warm orange (#F97316) for CTAs and energy. Background: clean white with light blue-tinted (#F8FAFC) or warm cream (#FDF8F3) alternate sections. Text: #1E293B headings, #475569 body.
- Typography: friendly and readable. Clean sans-serif (Inter, DM Sans, or Nunito) for everything. Headlines: 600-700 weight, 2-3rem. Body: 400 weight, 1rem, generous line-height (1.7) for readability during learning. Nothing too formal or too playful — the sweet spot of approachable expertise.
- Course cards: image placeholder (16:9), course title, instructor name + small avatar placeholder, skill level badge (Beginner/Intermediate/Advanced), duration, rating (★ 4.8), price or "Free" badge. Hover: subtle lift + shadow. Grid of 3-4 cards per row.
- Progress elements: progress bars for course completion, step indicators for learning paths, achievement badges, streak counters. Use green for progress fills. These make learning feel like a game.
- Trust elements: number of students enrolled, instructor credentials, certificate mention, company logos for "Where our learners work". Testimonials with photo + name + role + company.
- Decorations: subtle. Small icons for course topics (described as simple line icons). Illustration-style graphics in hero (described as abstract learning imagery). Progress-related iconography. Light background patterns optional.
- Buttons: primary filled with CTA color (blue or orange), rounded-lg. "Enroll Now", "Start Learning", "View Course". Secondary: outlined. Generous sizing — these need to feel clickable.
- Vibe: Coursera, Udemy, Khan Academy, Duolingo (but slightly more mature). Encouraging, accessible, achievement-oriented. The design says "you can do this" — learning feels attainable, not intimidating. Clear paths, visible progress, celebrating achievement.`,
  },

  restaurant: {
    name: 'Restaurant / Food',
    prompt: `Use a RESTAURANT / FOOD / DINING style.
- Layout: full-width hero with large food imagery placeholder (appetizing description). Navigation: logo, menu sections (Menu, About, Reservations, Contact, Order Online). Below hero: philosophy/story section, menu highlights with food cards, location/hours, reservation CTA, Instagram-style gallery placeholder. Footer with hours, address, social links.
- Colors: appetite-appealing palette. Background: warm cream (#FDF8F3) or clean white. Text: rich dark (#1A1A1A) for menus, warm gray (#57534E) for descriptions. Accent: choose based on cuisine type — warm red (#DC2626) for bold/Italian, forest green (#166534) for organic/farm-to-table, gold (#B8860B) for upscale, terracotta (#C2410C) for rustic. The accent appears in CTAs, highlights, and decorative elements.
- Typography: this is KEY for restaurant personality. Headlines: elegant serif (Playfair Display, Cormorant, or Fraunces) for upscale feel, or bold sans-serif for casual. Menu items: clean serif, proper case, with prices right-aligned. Descriptions: smaller, italic or light weight. The typography sets the dining tone — formal or casual.
- Food imagery areas: large, appetizing. Hero: full-bleed or 3/4 screen food shot placeholder (describe the mood: "steaming pasta", "fresh salad", "craft cocktail"). Menu items: smaller square images. Use warm-toned placeholder backgrounds where actual food would go.
- Menu display: organized by category (Starters, Mains, Desserts, Drinks). Each item: name (prominent), description (1-2 lines, evocative language about ingredients), price (right-aligned, clean). Cards or simple list format depending on formality.
- Reservation CTA: prominent section with date/time/party size selector described as form fields. "Reserve a Table" button. Phone number as alternative. This is a KEY conversion point.
- Decorations: subtle, food-adjacent. Thin decorative dividers. Small ingredient illustrations (describe as line drawings of herbs, vegetables). Textured backgrounds suggesting paper or linen at low opacity. NO generic stock-photo feel — everything bespoke.
- Buttons: "Reserve Now", "Order Online", "View Full Menu". Filled with accent color for primary. Styled appropriately to restaurant tier (elegant outlined for upscale, solid friendly for casual).
- Vibe: Resy, OpenTable restaurant pages, award-winning restaurant websites. The design makes you hungry. The aesthetic matches the food — rustic for farm-to-table, sleek for modern cuisine, warm for Italian. You can almost taste it.`,
  },

  realEstate: {
    name: 'Real Estate',
    prompt: `Use a REAL ESTATE / PROPERTY style.
- Layout: full-width. Hero: large search bar prominently centered ("Find your dream home"), property type tabs (Buy, Rent, Sell), location input + filters. Below: featured listings grid, neighborhood highlights, agent/team section, testimonials, market stats, contact CTA. Navigation: logo, Buy, Rent, Sell, Agents, About, Contact. Search is the HERO of the page.
- Colors: trustworthy and premium. Background: clean white (#FFFFFF). Primary accent: real-estate blue (#1E40AF) or forest green (#166534) — colors of trust and growth. Secondary: warm gold (#B8860B) or coral (#DC7F6B) for CTAs and highlights. Text: dark (#111827) for prices and headings (these must be highly legible), gray (#6B7280) for descriptions.
- Typography: professional and clear. Clean sans-serif (Inter, DM Sans). Prices: LARGE, semibold, tabular numerals — the most important info. Headlines: 600 weight. Addresses: medium weight, proper capitalization. Descriptions: regular weight, gray. The type hierarchy prioritizes: Price > Location > Details.
- Property cards: THE KEY COMPONENT. Image placeholder (16:9 or 4:3), property type badge ("For Sale" / "For Rent" overlaid on image), price (large, prominent), address, beds/baths/sqft in icon row (🛏 3 | 🛁 2 | 📐 1,500 sqft), brief description or neighborhood. Cards have subtle shadow, rounded corners (12px). Hover: lift + shadow increase + subtle image zoom. Save/favorite heart icon.
- Search/filter UI: prominent search bar with location autocomplete styling. Filter pills or dropdowns for: price range, beds, baths, property type, more filters. This UI is functional, not decorative.
- Map placeholder: describe an interactive map area where listings would appear as pins. Map/list toggle.
- Agent section: agent cards with photo placeholder, name, title, phone, email, and "Contact" button. Trust-building element.
- Stats: "100+ listings", "50+ neighborhoods", "20 years experience", "1000+ homes sold". Large numbers, credibility builders.
- Decorations: minimal. Clean lines. Home/location icons. Light gray section backgrounds for variation. NO distracting decorations — this is functional.
- Buttons: "Search", "View Listing", "Contact Agent", "Schedule Tour". Filled primary buttons for main actions.
- Vibe: Zillow, Redfin, Compass, Sotheby's Realty. The design is a tool first — it helps you find a home. Clean, trustworthy, search-focused. Prices and locations are immediately scannable. Makes house hunting feel organized, not overwhelming.`,
  },

  travel: {
    name: 'Travel / Hospitality',
    prompt: `Use a TRAVEL / HOSPITALITY / BOOKING style.
- Layout: full-width, immersive. Hero: full-viewport stunning destination imagery placeholder with search overlay (Where to? / Check in / Check out / Guests). Navigation: logo, Stays, Experiences, Flights (if applicable). Below: trending destinations grid, featured properties, experience categories, testimonials from travelers, inspiration section. The hero sells the dream; the content helps you book it.
- Colors: aspirational and warm. Hero: dark overlay on imagery for text readability. Body: clean white (#FFFFFF) base. Accent: sunset coral (#F97316), ocean blue (#0EA5E9), or forest green (#059669) — colors of destinations. Text: #111827 headings, #6B7280 body. Cards on white. Light warm sections (#FDF8F3) for visual breaks.
- Typography: clean and modern with aspirational headlines. Headlines: can use a slightly more expressive font (DM Sans, Outfit) in 600-700 weight. Destination names: featured prominently. Prices: clear, with "per night" or "from $X" formatting. Body: 400 weight, readable. Hero headline: large, evocative ("Discover your next adventure", "Where to next?").
- Search component: THE PRIMARY UI. Prominent, centered on hero. Clean white card with: destination input, date range picker (check-in/check-out), guests dropdown, search button. Well-organized, easy to use. Consider tab switching for different search types.
- Destination/property cards: large image placeholder (16:9), destination or property name, location, rating (★ 4.9), price per night or trip price, save/wishlist heart. Images should feel aspirational. Cards have subtle hover effect. Grid of 3-4 cards.
- Experience cards: category cards (Beach, Mountain, City, Adventure) with evocative imagery placeholders and overlaid titles.
- Trust elements: booking count ("10,000+ travelers"), ratings, Superhost/verified badges, clear cancellation policies.
- Decorations: let the imagery do the work. Minimal UI decorations. Subtle shadows on cards. Clean iconography for amenities (wifi, pool, etc. described as icons).
- Buttons: "Search", "Book Now", "Explore", "View All". Primary: filled with accent color. The main CTA is SEARCH. Booking buttons are secondary.
- Vibe: Airbnb, Booking.com, Expedia, boutique hotel sites. The design sells experiences and dreams — then makes booking frictionless. Aspirational imagery + functional booking UI. You want to go there immediately.`,
  },

  fitness: {
    name: 'Fitness / Sports',
    prompt: `Use a FITNESS / SPORTS / ATHLETIC style.
- Layout: dynamic and energetic. Full-width hero with bold headline, action-oriented subtext, strong CTA ("Start Training", "Join Now"). Below: programs/classes grid, trainer profiles, membership tiers, transformation testimonials (before/after placeholder), gym amenities, app download CTA. Navigation: Programs, Classes, Trainers, Membership, Location.
- Colors: bold and energetic. Dark backgrounds for drama — near-black (#0A0A0A) or deep charcoal (#1A1A1A) for hero and feature sections. Primary accent: energetic orange (#F97316), electric red (#EF4444), or neon green (#22C55E). Secondary: white text on dark, dark text on light sections. High contrast throughout. The palette should feel ACTIVE.
- Typography: bold, strong, condensed. Headlines in heavy weights (800-900) — Oswald, Bebas Neue style (describe as "tall, condensed, bold"). UPPERCASE for impact headlines and section labels. Large sizes (4-6rem for hero). Body: clean sans-serif (Inter) in normal weight for readability. The typography feels powerful.
- Imagery placeholders: describe athletic, action-oriented scenes — people mid-workout, gym equipment, dynamic poses. High contrast, dramatic lighting described. Desaturated or color-graded feel. These images sell the energy.
- Program cards: image placeholder (athlete/exercise), program name, difficulty level, duration (6 weeks), results focus ("Build Strength", "Lose Fat"). Cards have dark backgrounds or dramatic imagery. Bold typography on cards.
- Trainer cards: photo placeholder, name, specialty, certifications, "Book Session" CTA. Social proof element.
- Membership/pricing: tiered cards (Basic, Pro, Elite). Dark or gradient backgrounds. Features list with checkmarks. Prominent pricing. "Most Popular" badge on middle tier.
- Stats: impactful numbers — "10,000+ members", "500+ workouts", "50+ trainers", "24/7 access". Large, bold treatment.
- Decorations: dynamic angles — use CSS clip-path for diagonal section cuts. Abstract geometric shapes suggesting movement. Subtle grid or line patterns. Motivational text treatments ("NO EXCUSES", "PUSH YOUR LIMITS").
- Buttons: bold, filled, uppercase text. "JOIN NOW", "START FREE TRIAL", "BOOK CLASS". Primary in accent color. Large, impossible to miss. On hover: energetic effect (scale, glow).
- Vibe: Nike, Under Armour, Peloton, premium gym brands. The design motivates — you feel energized just looking at it. Bold, confident, no excuses. Makes you want to start working out immediately.`,
  },

  nonprofit: {
    name: 'Non-profit / Charity',
    prompt: `Use a NON-PROFIT / CHARITY / CAUSE style.
- Layout: max-width 1200px. Hero: emotional headline, impactful subtext, prominent donation CTA ("Donate Now", "Join the Cause"). Below: mission/impact section, programs overview, impact statistics with visual representation, stories/testimonials from beneficiaries, ways to help (donate, volunteer, spread word), partners/supporters logos, newsletter signup. Navigation: About, Our Work, Impact, Get Involved, Donate.
- Colors: cause-appropriate and warm. Background: clean white or warm off-white (#FDF8F3). Primary accent based on cause: hope blue (#3B82F6) for general, green (#059669) for environmental, warm orange (#F97316) for humanitarian, purple (#7C3AED) for education/arts. The accent is used for CTAs and highlights. Text: warm dark (#1E293B), NOT harsh black. Emotional warmth in the palette.
- Typography: approachable and earnest. Headlines: slightly expressive sans-serif or friendly serif (Source Serif, Lora) for warmth. Body: clean sans-serif (Inter, DM Sans), comfortable reading sizes. Nothing too corporate or too casual. The typography feels genuine and human.
- Donate button: THE MOST IMPORTANT ELEMENT. Always visible — in nav, in hero, floating or repeated throughout. Filled with accent color, prominent size. "Donate", "Give Now", "Support Our Mission". Cannot be missed.
- Impact statistics: large, visual numbers. "$2M raised", "50,000 lives changed", "100 communities served". Use icons or simple visualizations. These prove the organization's effectiveness.
- Story/testimonial cards: beneficiary stories with photo placeholder (described warmly), name, location, their story quote. These create emotional connection. Photo-forward cards.
- Ways to help section: multiple options — Donate (primary), Volunteer, Corporate partnerships, Spread the word. Each with icon and brief description.
- Trust elements: annual report link, charity ratings badges, financial transparency section, partner/donor logos. Non-profits must build trust.
- Decorations: subtle and purposeful. Soft shapes suggesting hope/growth. Photos do the emotional heavy lifting. Avoid looking too "designed" — authenticity matters.
- Buttons: "Donate Now" is filled, prominent, repeated. Secondary CTAs: "Learn More", "Get Involved", "Volunteer" in outlined style.
- Vibe: charity:water, Red Cross, local community foundations, environmental nonprofits. The design creates emotional connection and drives action. It's warm, trustworthy, and human. You feel good donating here. The mission is clear; the impact is visible; the ask is obvious.`,
  },

  agency: {
    name: 'Agency / Creative',
    prompt: `Use an AGENCY / CREATIVE STUDIO style.
- Layout: unconventional and bold. Hero: massive headline with attitude, minimal subtext, work preview or creative visual element. NO traditional hero-features-CTA structure. Below: portfolio/work showcase (the MAIN content), about/philosophy section, client logos, team (optional), contact. Navigation: minimal — Work, About, Contact. The work is the hero of the site.
- Colors: bold and distinctive — the agency's "signature". Options: high contrast black (#000000) and white with one bold accent; all dark with neon accent; muted sophistication with cream and charcoal. Every agency has a distinctive palette. Use it consistently and confidently. Text: high contrast, readable.
- Typography: DISTINCTIVE — typography IS the design for creative agencies. Options: oversized display serif (6-10rem headlines), brutalist monospace, elegant thin sans-serif, or bold condensed type. The type choice defines the agency personality. Mix weights and sizes dramatically. Headlines can break conventional rules.
- Work/portfolio showcase: THE MAIN CONTENT. Large, full-width project images or cards. Project title + client + year. Hover: project reveal, title animation, or case study preview. Grid can be bento-style, masonry, or dramatic single-column scroll. Each project should feel like a teaser for the full case study.
- About section: short, punchy copy about the agency's philosophy. Maybe a manifesto statement. Not corporate boilerplate — actual personality. Team photos optional (some agencies prefer anonymity).
- Client logos: shown in grayscale, subtle. Not the hero of the page — the work is the hero. But logos build credibility.
- Contact section: minimal but prominent. Email address large. Maybe a simple contact form. Physical address optional. "Let's talk" / "Get in touch" / "Start a project" energy.
- Decorations: depends on agency style. Could be: minimal (whitespace is the decoration), experimental (cursor effects, unusual layouts), bold (geometric shapes, strong lines), or refined (subtle typography details). The decoration style IS the portfolio.
- Buttons: minimal — often just styled text links. "View Project →", "Say Hello →". If buttons exist, they match the agency's aesthetic. Nothing generic.
- Interactions: this is where agencies show off. Hover effects, scroll animations, transitions, cursor changes. The interactivity demonstrates the agency's craft. But substance over flash — don't let gimmicks overshadow the work.
- Vibe: award-winning design studios, agencies on Awwwards, creative studios with attitude. The website IS the portfolio — it demonstrates capabilities by existing. Confident, distinctive, memorable. You leave knowing exactly what this agency is about and wanting to hire them.`,
  },

  events: {
    name: 'Events / Conference',
    prompt: `Use an EVENTS / CONFERENCE style.
- Layout: full-width, urgency-driven. Hero: event name (large), date (prominent), location, countdown timer, early-bird CTA ("Get Tickets", "Register Now"). Below: speaker lineup grid, schedule/agenda, venue info, sponsor logos, FAQ, ticket tiers. Navigation: Speakers, Schedule, Venue, Tickets. The date and ticket CTA must be ever-present.
- Colors: distinctive event branding. Choose a bold primary: electric blue (#3B82F6), vibrant purple (#7C3AED), energetic coral (#F97316), or tech green (#10B981). Use it extensively — hero background, CTAs, section accents. Secondary: dark (#111827) for contrast, white for content areas. The event should feel like it has its own brand identity.
- Typography: bold and event-specific. Large event name treatment (4-6rem, could be custom lettering described). Date and location: prominent, clear. Headlines: bold sans-serif (700-800 weight). Body: clean sans-serif. Speaker names: semibold, clear hierarchy.
- Countdown timer: THE URGENCY ELEMENT. Days/Hours/Minutes/Seconds displayed prominently. "Event starts in..." Creates FOMO. Styled to match event branding.
- Speaker cards: photo placeholder (square, professional), name, title/company, talk title or topic tags. Grid of 4-6 speakers featured, "View All Speakers" link. Speakers are the draw — feature them prominently.
- Schedule/agenda: organized by day and time slot. Track differentiation if multiple tracks (color-coded tabs). Clear time stamps. Talk title, speaker, and room/location. Expandable details optional. Could be timeline or table format.
- Ticket section: tiered cards (Early Bird, Regular, VIP). Price prominent. What's included list. "Limited availability" or "X spots left" urgency. Clear primary "Get Tickets" CTA.
- Venue section: map placeholder, address, travel/accommodation info. Photo of venue placeholder. Practical info that helps people commit.
- Sponsor logos: tiered (Gold, Silver, Bronze or similar). Logos displayed in grid. "Become a Sponsor" link.
- Decorations: event-branded elements. Geometric shapes, patterns, or photo treatments that create a distinct visual identity. Could be: tech-inspired grid patterns, creative gradients, bold geometric accents. The event should feel special and worth attending.
- Buttons: high-urgency CTAs. "Get Tickets Now", "Register", "Book Your Spot". Filled with primary color, large. Secondary: "Learn More", "View Schedule".
- Vibe: major tech conferences (WWDC, Google I/O), design conferences (Figma Config, OFFF), professional summits. The design creates excitement and urgency. You want to be there. The speakers look great, the schedule looks valuable, and tickets feel limited. Register NOW.`,
  },

  gaming: {
    name: 'Gaming',
    prompt: `Use a GAMING / GAME MARKETING style.
- Layout: full-width, immersive, cinematic. Hero: full-viewport key art placeholder with game logo, release date, and "Pre-order" or "Play Now" CTA. Below: game trailer/video placeholder, feature highlights, character/world showcase, editions/pricing, reviews/accolades, community section, platform availability. The page is an EXPERIENCE, not a brochure.
- Colors: game-appropriate but typically dramatic. Dark backgrounds (#0A0A0F) for immersion — the game art needs to pop. Accent: neon/electric colors that match the game's palette (cyan, magenta, gold, green). High contrast. UI elements have subtle glow effects. The page should feel like an extension of the game world.
- Typography: genre-appropriate display font. Sci-fi: futuristic, angular. Fantasy: ornate, medieval-inspired. Modern: bold, condensed. The typography contributes to world-building. Game title: can be stylized or replaced with logo. UI text: clean sans-serif for readability.
- Hero treatment: the KEY element. Full-screen key art or video placeholder. Game logo centered or positioned dramatically. Release date prominent. Platform icons (PlayStation, Xbox, Steam, Switch described as small icons). Pre-order/Buy button with glow effect.
- Video/trailer section: large video player placeholder. "Watch Trailer" — this is the main marketing asset.
- Feature showcase: game features with dramatic screenshots. "Open World", "Multiplayer", "100+ Hours" type selling points. Visual, not text-heavy. Let the imagery sell.
- Editions/pricing: Standard, Deluxe, Ultimate editions. What's included (base game, DLC, skins, etc.). Box art placeholder for each. Pre-order bonuses highlighted.
- Reviews/accolades: "9/10 - IGN", "Game of the Year" badges. Review score prominently displayed. Press quotes.
- Platform availability: PlayStation, Xbox, PC, Switch icons with "Available Now" or "Coming Soon" status.
- Decorations: immersive UI elements. Subtle animated particles (described as CSS animations — floating dust, ember particles for fantasy, data streams for sci-fi). Glow effects on interactive elements. HUD-inspired UI borders. Background elements suggesting the game world.
- Buttons: "Pre-order Now", "Buy Now", "Watch Trailer", "Join Community". Glowing, animated effects on hover. Style matches the game universe.
- Vibe: PlayStation exclusives, AAA game launches, Steam store pages elevated. The page is a portal into the game world. Immersive, dramatic, makes you need to play this game. Every scroll reveals more of the world. You're sold before you reach the buy button.`,
  },

  legal: {
    name: 'Legal / Professional Services',
    prompt: `Use a LEGAL / PROFESSIONAL SERVICES style.
- Layout: max-width 1100px, structured and trustworthy. Hero: clear value proposition headline (what they do + who they help), professional subtext, "Schedule Consultation" CTA. Below: practice areas/services grid, attorney/team profiles, case results or credentials, client testimonials, firm history/about, contact with multiple channels. Navigation: Practice Areas, Attorneys, About, Results, Contact.
- Colors: authoritative and trustworthy. Primary: deep navy (#1E3A5F) or forest green (#1B4332) — colors of trust and stability. Background: clean white (#FFFFFF) with light gray (#F8FAFC) alternate sections. Accent: muted gold (#B8860B) or burgundy (#722F37) for subtle prestige touches. Text: dark (#111827) for maximum readability. NO bright colors, NO playful tones. Serious but not cold.
- Typography: traditional and readable. Headlines: professional serif (Lora, Source Serif, or Merriweather) — serif conveys establishment and trust. Body: clean sans-serif (Inter, system-ui) for readability. Sizes: conservative, nothing oversized. The typography says "we've been doing this a long time."
- Attorney/team cards: professional photo placeholder (described as formal headshot), name, title (Partner, Associate), practice areas, education/credentials, "View Profile" link. Grid of 3-4 per row. Photos should feel professional, approachable, competent.
- Practice areas: icon (described as simple line icon) + practice area name + brief description. Cards or list format. Link to detailed practice area pages. Common areas: Corporate, Litigation, Employment, Real Estate, Estate Planning, etc.
- Credentials/results: bar admissions, awards, case results (where appropriate), years of experience. These build trust. "AV Rated", "Super Lawyers", firm anniversaries.
- Testimonials: client quotes with name/initial + company or "Verified Client". Focus on professionalism, outcomes, communication. Carousel or cards.
- Contact section: multiple channels — phone (prominent), email, contact form, office address with map placeholder. "Schedule a Consultation" CTA. Office hours.
- Decorations: minimal and dignified. Thin lines, subtle borders. Possibly subtle legal imagery (scales, columns — described appropriately). NO heavy graphics. The content builds trust, not the decoration.
- Buttons: "Schedule Consultation", "Contact Us", "View Our Practice Areas". Filled with primary color (navy/green), professional sizing. Not flashy — reliable.
- Vibe: established law firms, BigLaw websites, professional consultancies. The design says "we are competent, established, and trustworthy." You feel confident hiring this firm. Professional without being stuffy. Approachable without being casual. Your matter is in good hands.`,
  },
};

// ─── Creative Variation Nudges ──────────────────────────────────────────────

export const VARIATION_NUDGES = [
  '', // v1: pure style, no nudge
  'Take a MORE EXPERIMENTAL approach to this style. Push boundaries, be bold with unexpected choices while staying within the style family. Surprise the viewer.',
  'Take a MORE CONSERVATIVE, REFINED approach. Classic execution, polished details, nothing risky. The "safe but perfect" version.',
  'Emphasize TYPOGRAPHY as the hero element. Let text do the heavy lifting — oversized headlines, dramatic font pairings, typographic rhythm.',
  'Emphasize LAYOUT and SPATIAL COMPOSITION. Unusual grid, asymmetric balance, creative use of whitespace or density. The structure itself is the design.',
  'Emphasize COLOR and ATMOSPHERE. Let the palette and mood dominate. Rich tones, bold combos, or subtle gradients — make the viewer feel something through color alone.',
  'Take a CONTENT-FIRST approach. The design should feel invisible — every choice in service of readability, scannability, and clear hierarchy. Function over form.',
  'Add a sense of MOTION and ENERGY. CSS animations, transitions, hover effects, scroll-driven reveals. The page should feel alive and dynamic.',
  'Go for MAXIMAL DETAIL and CRAFT. Micro-interactions, decorative flourishes, every pixel considered. The "artisan" version.',
];

// ─── Base Instructions ──────────────────────────────────────────────────────

export const LANDING_INSTRUCTIONS = `You are a world-class web designer. Your job is to create a beautiful, complete, single-page website.

RULES:
1. Create exactly TWO files:
   - style.css — ALL custom CSS goes here: custom properties, animations, keyframes, transitions, hover effects, media queries, decorative styles, any non-Tailwind styles
   - index.html — the complete HTML page, using Tailwind CSS via CDN AND linking to style.css

2. In index.html:
   - Include <script src="https://cdn.tailwindcss.com"></script> for Tailwind
   - Include <link rel="stylesheet" href="style.css"> for your custom styles
   - Use Tailwind utility classes for layout, spacing, typography basics
   - Use style.css classes for animations, custom effects, decorative elements, and anything Tailwind can't do
   - Include any Google Fonts via <link> in the <head>

3. ZERO inline styles:
   - NEVER use style="..." attributes in HTML. Not even once. Not for "just one property."
   - ALL styling must go through either Tailwind utility classes OR custom classes defined in style.css.
   - If you need a one-off visual tweak, create a CSS class for it in style.css.
   - This is a hard rule — the output will be automatically rejected if any style= attributes are found in the HTML.

4. The site must be:
   - Fully self-contained (no external assets except CDN fonts and Tailwind)
   - Responsive (mobile-first, works on all screen sizes)
   - Complete with real-looking content (not lorem ipsum — write realistic copy for the described website)
   - Visually polished and production-quality

5. Write style.css FIRST, then index.html.

6. If the user's prompt contains a URL (https://...), use your WebFetch tool to visit it BEFORE designing.
   Study the page content, structure, copy, branding, and layout. Use what you learn to inform the design.
   If the user asks to replicate or reference it, match the structure and feel as closely as possible.

7. DO NOT explain anything. Just create the files.`;

export const WEBAPP_INSTRUCTIONS = `You are a world-class web designer and frontend developer. Your job is to create a beautiful, complete, multi-page web application prototype.

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

7. If the user's prompt contains a URL (https://...), use your WebFetch tool to visit it BEFORE designing.
   Study the page content, structure, copy, branding, and layout. Use what you learn to inform the design.
   If the user asks to replicate or reference it, match the structure and feel as closely as possible.

8. DO NOT explain anything. Just create the files.`;

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Build a compact style catalog summary for the auto-selector.
 * Returns "key: Name — vibe description" for each style.
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
 * Build the full prompt for a generation job.
 *
 * @param {object} job - Job data with: prompt, mode, styleKey, stylePrompt, version, fromFiles,
 *                       hasReferenceImages, assets
 * @param {string} outputDir - Working directory where the agent will write files
 * @returns {string} The complete prompt to pass to agent.run()
 */
export function buildPrompt(job, outputDir) {
  const hasRefImage = !!job.hasReferenceImages;
  const isWebapp = job.mode === 'webapp';

  let prompt = '';

  // ── When a reference image is provided, it is the PRIMARY directive ──────
  // The prompt is restructured: reference first, minimal technical rules,
  // NO style presets or variation nudges (the image IS the style).
  if (hasRefImage) {
    prompt += `You are a world-class web designer. The user has attached a REFERENCE IMAGE (screenshot or design mockup).

YOUR #1 PRIORITY: Recreate the design in the reference image as faithfully as possible.
This means matching:
- The EXACT color palette — extract specific hex colors from the image and use them
- The EXACT layout structure — same header style, hero layout, section arrangement, footer
- The typography — same font style (serif/sans-serif), sizes, weights, spacing
- The spacing rhythm, border styles, shadows, rounded corners
- The overall visual identity and polish level
- The content structure and section ordering

The reference image is a DESIGN REFERENCE ONLY.
DO NOT embed, save, or reference the image file itself in any HTML/CSS/JS.
Recreate everything from scratch using code.

`;

    // Technical rules only (no design guidance)
    if (isWebapp) {
      prompt += `TECHNICAL RULES:
1. Create these files: style.css (all custom CSS), app.js (shared JS), index.html (main page), and additional .html pages as needed.
2. Every .html page must include: <script src="https://cdn.tailwindcss.com"></script>, <link rel="stylesheet" href="style.css">, <script src="app.js" defer></script>.
3. Every page must have consistent navigation linking to all other pages.
4. NEVER use style="..." attributes — use Tailwind classes or custom classes in style.css.
5. Include Google Fonts via <link> if the reference uses web fonts.
6. Make it responsive and self-contained.\n\n`;
    } else {
      prompt += `TECHNICAL RULES:
1. Create exactly TWO files: style.css (all custom CSS) and index.html (the complete page).
2. index.html must include: <script src="https://cdn.tailwindcss.com"></script> and <link rel="stylesheet" href="style.css">.
3. NEVER use style="..." attributes — use Tailwind classes or custom classes in style.css.
4. Include Google Fonts via <link> if the reference uses web fonts.
5. Make it responsive and self-contained.
6. Write style.css FIRST, then index.html.\n\n`;
    }

    prompt += `If the user's prompt contains a URL (https://...), use your WebFetch tool to visit it FIRST.
Extract the real text content, branding, and page structure from the live site.
Combined with the reference image, produce a faithful recreation.\n\n`;

  } else {
    // ── Standard flow: no reference image ──────────────────────────────────
    const baseInstructions = isWebapp ? WEBAPP_INSTRUCTIONS : LANDING_INSTRUCTIONS;
    prompt += baseInstructions + '\n\n';

    // Style directive
    if (job.stylePrompt) {
      prompt += job.stylePrompt + '\n\n';
    }

    // Variation nudge
    if (job.version > 0 && job.version <= VARIATION_NUDGES.length) {
      const nudge = VARIATION_NUDGES[job.version - 1];
      if (nudge) {
        prompt += `CREATIVE DIRECTION: ${nudge}\n\n`;
      }
    }
  }

  // Reference code files (fromJobId — design language replication)
  if (job.fromFiles && job.fromFiles.length > 0) {
    prompt += `\nREFERENCE DESIGN:
Before writing any files, you MUST use your read tool to study the design language in these reference files:
${job.fromFiles.map(f => `  - ${outputDir}/${f.filename}`).join('\n')}

Read style.css FIRST — it defines the color palette, typography, spacing, shadows, animations, and component styles.
Then read index.html to understand the structural patterns, Tailwind class usage, and component markup.

IMPORTANT: Replicate the DESIGN LANGUAGE from these reference files — same colors, font choices, spacing rhythm, border styles, shadow styles, animation patterns, and component styling. You are NOT copying the content or layout — you are extracting the visual system and applying it to the NEW website described below.\n\n`;
  }

  // User asset images
  if (job.assets && job.assets.length > 0) {
    const assetList = job.assets.map(a => {
      const dims = a.width && a.height ? ` (${a.width}×${a.height}px)` : '';
      return `  - assets/${a.filename}${dims}`;
    }).join('\n');

    prompt += `USER ASSETS:
The user has provided these image files for use in the website:
${assetList}

RULES for assets:
- Use these EXACT relative paths in your HTML/CSS, for example:
    <img src="assets/${job.assets[0].filename}" alt="...">
    background-image: url('assets/${job.assets[0].filename}');
- These are real image files that will be served at these paths in the preview.
- Use them where appropriate — logos in the navbar/footer, photos in hero sections, etc.
- Do NOT use placeholder images or emoji icons when a real user asset is available.
- Always include descriptive alt text on <img> tags.\n\n`;
  }

  // User prompt
  prompt += `WEBSITE TO CREATE:\n${job.prompt}`;

  // Output directory
  prompt += `\n\nWrite all files to the current working directory: ${outputDir}`;

  prompt += `\n\nDO NOT explain anything. Just create the files.`;

  return prompt;
}

/**
 * --theme-auto: Ask the LLM to pick the best 1-3 styles from our catalog.
 * Returns an array of style keys.
 *
 * @param {string} userPrompt - The user's website description
 * @param {string} model - Model ID (e.g. 'claude-sonnet-4-6')
 * @param {string} providerName - Provider name ('anthropic' | 'gemini')
 * @param {string} apiKey - API key for the provider
 * @returns {Promise<string[]>} Array of style keys
 */
export async function resolveThemeAuto(userPrompt, model, providerName, apiKey) {
  const catalog = buildStyleCatalog();

  const provider = createProvider({
    name: providerName,
    apiKey,
  });

  const agentDb = new DatabaseImpl();
  const tools = createDefaultRegistry();

  const agent = new AgentLoop({
    provider,
    tools,
    db: agentDb,
    workingDir: process.cwd(),
    maxTokens: 1024,
    maxTurns: 1,
    model,
    providerName,
    disabledTools: ['bash', 'read', 'write', 'edit', 'glob', 'grep', 'webfetch'],
  });

  const selectorPrompt = `You are a design style selector. Given a website description and a catalog of available design styles, pick the 1-3 styles that BEST fit the described website.

STYLE CATALOG:
${catalog}

WEBSITE DESCRIPTION:
${userPrompt}

RULES:
- Pick 1-3 styles. Usually 2-3 is ideal to give the user variety.
- Pick styles that are APPROPRIATE for the content — a hospital website should NOT get "cyberpunk", a fintech app should NOT get "playful".
- If multiple styles could work, prefer diversity (e.g., don't pick two that are very similar).
- Respond with ONLY the style keys, comma-separated, nothing else. Example: cleanTech,warmCorporate,minimalist`;

  let result = '';
  agent.on('event', (event) => {
    if (event.type === 'text') {
      result += event.text;
    }
  });

  try {
    await agent.run(selectorPrompt);
  } finally {
    agentDb.close();
  }

  // Parse response — extract valid style keys
  const keys = result
    .trim()
    .split(/[\s,]+/)
    .map(s => s.trim().replace(/[^a-zA-Z]/g, ''))
    .filter(s => STYLES[s]);

  if (keys.length === 0) {
    return [];
  }

  return keys;
}

/**
 * --theme-synth: Ask the LLM to generate a custom style prompt tailored to the content.
 * Returns a synthesized style prompt string, or null on failure.
 *
 * @param {string} userPrompt - The user's website description
 * @param {string} model - Model ID
 * @param {string} providerName - Provider name
 * @param {string} apiKey - API key
 * @returns {Promise<string|null>} Synthesized style brief or null
 */
export async function resolveThemeSynth(userPrompt, model, providerName, apiKey) {
  const provider = createProvider({
    name: providerName,
    apiKey,
  });

  const agentDb = new DatabaseImpl();
  const tools = createDefaultRegistry();

  const agent = new AgentLoop({
    provider,
    tools,
    db: agentDb,
    workingDir: process.cwd(),
    maxTokens: 2048,
    maxTurns: 1,
    model,
    providerName,
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

  try {
    await agent.run(synthPrompt);
  } finally {
    agentDb.close();
  }

  const brief = result.trim();
  if (brief.length < 100) {
    return null;
  }

  return brief;
}
