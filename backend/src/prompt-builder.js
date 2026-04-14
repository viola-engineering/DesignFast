// NOTE: @angycode/core is no longer imported here.
// LLM calls are delegated via a queryLLM callback passed by the caller,
// allowing both the web app (AgentLoop) and the CLI (Claude Code subprocess)
// to reuse these functions without code duplication.


// ─── Style Presets ──────────────────────────────────────────────────────────

export const STYLES = {
  minimalist: {
    name: 'Minimalist',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#FAFAF9',
            heading: '#2D2D2D',
            body: '#6B6B6B',
            accent: '#8B9A7B',
            muted: '#D4D0CB',
          },
          fontFamily: {
            body: ['"Cormorant Garamond"', 'serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a MINIMALIST style.
- Layout: single-column, \`max-w-3xl mx-auto\` — a single river of content flowing down the page, nothing else. NO multi-column grids. NO card grids. NO sidebars. Think of a single sheet of handmade paper with words placed carefully upon it.
- Colors: \`bg-surface\` — a warm, lived-in off-white like aged Japanese paper. \`text-heading\` — deep charcoal, not quite black, like sumi ink that's been diluted once. \`text-body\` — a quiet mid-gray that recedes behind the content. \`text-accent\` only for one subtle interactive element, like a single pressed wildflower marking a page. \`border-muted\` for hairline dividers so thin they feel like pencil lines.
- Typography: use \`font-body\` everywhere (Cormorant Garamond — a single elegant serif that reads like a letter from a thoughtful friend). Light weights (\`font-light\`) so the letterforms feel drawn, not stamped. Large line-height (\`leading-relaxed\` or \`leading-loose\`) — let the words breathe like haiku. Generous letter-spacing (\`tracking-wide\`).
- Spacing: extreme whitespace — silence is the design. \`py-32\` or more between sections, each one a quiet room you walk into. \`px-6\` generous padding everywhere. The margins are as important as the text.
- Decorations: NONE. No icons, no emoji, no illustrations, no shadows, no borders, no rounded corners, no background shapes. Use only thin hairline \`<hr class="border-muted">\` dividers if needed — these should feel like the faintest crease in folded paper.
- Buttons: text-only or minimal outlined with \`border-muted\`. No filled buttons. Whisper-quiet interactions.
- style.css: subtle fade-in animations on sections (opacity 0 to 1 over 600ms with a slight 10px upward translate for a gentle rising-into-view effect), smooth 200ms ease transitions on all interactive elements, a delicate 1px bottom-border on links that fades to transparent at the edges using a linear-gradient border-image. Add a gentle letter-spacing transition on hover for navigation items (tracking-wide to tracking-wider over 300ms).
- Vibe: Dieter Rams. Japanese zen. "Less, but better." Every element must earn its place. The page should feel like stepping into a quiet temple — you notice the absence of noise before you notice anything else.`,
  },

  brutalist: {
    name: 'Brutalist',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#000000',
            surface: '#FFFFFF',
            accent: '#FF0000',
            heading: '#000000',
            body: '#000000',
          },
          fontFamily: {
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
            brutal: '4px 4px 0px #000000',
          },
        },
      },
    },
    prompt: `Use a BRUTALIST style.
- Layout: asymmetric, intentionally "broken" grid — elements shoved to the edges, overlapping like posters wheat-pasted on a concrete wall. Off-center positioning that makes you feel slightly uneasy. Use CSS Grid with unusual column spans (a 5-column grid where content sits in columns 2-4, then suddenly bleeds into column 5). NO symmetry. NO conventional hero-features-pricing structure. The layout itself should feel like a statement against polish.
- Colors: \`bg-surface\` (stark white, like bare drywall) and \`bg-primary\` (pure black, like wet asphalt) as the only base. ONE raw \`text-accent\` or \`bg-accent\` (angry red, like a fire alarm) used sparingly — maybe just a single word or a thick underline. High contrast that hurts a little.
- Typography: \`font-mono\` (JetBrains Mono) for everything — monospace is honest, it doesn't pretend. MASSIVE headlines (\`text-7xl\` to \`text-9xl\`, big enough to feel confrontational). Mix uppercase and lowercase deliberately — "HELLO world" not "Hello World". \`tracking-tight\` on headers (cramped, claustrophobic), \`tracking-widest\` on body (sparse, clinical).
- Borders: thick \`border-4 border-primary\` on everything — every element announces its box model like an exposed I-beam. \`rounded-card\` (0px) — NO rounded corners anywhere. The box is a box.
- Decorations: raw, exposed structure. Show the grid. Use visible border outlines on empty divs to reveal the skeleton. Text can be rotated via style.css transforms. Elements should feel like they were placed by hand and taped down.
- Buttons: \`rounded-card border-4 border-primary font-mono\`. No hover animations — just \`hover:bg-primary hover:text-surface\` instant color invert. Blunt, like a light switch.
- style.css: CSS transforms for text rotation (rotate -3deg to 5deg on headlines and pull-quotes), z-index stacking to create deliberate overlaps between sections, negative margins (-2rem to -4rem) to make elements collide into each other, a mix-blend-mode: difference on one accent element for visual disruption, thick 4px dashed outlines on focus states. Add a subtle screen-flicker animation (opacity 1 to 0.97 and back over 4s infinite) on the page load.
- Vibe: raw concrete, exposed pipes, 1990s web meets punk zine. Intentionally rough. Anti-design is the design. This page should feel like someone built it angry — and that anger is the aesthetic.`,
  },

  glassmorphism: {
    name: 'Glassmorphism',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#1a0533',
            heading: '#FFFFFF',
            body: '#E2E8F0',
            accent: '#A855F7',
            glass: 'rgba(255,255,255,0.12)',
            'glass-border': 'rgba(255,255,255,0.2)',
          },
          fontFamily: {
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '24px',
          },
          boxShadow: {
            card: '0 8px 32px rgba(0,0,0,0.3)',
            glow: '0 0 30px rgba(168,85,247,0.3)',
          },
        },
      },
    },
    prompt: `Use a GLASSMORPHISM style.
- Layout: centered, layered card panels floating over a colorful background like frosted windows suspended in a nebula. Content lives inside frosted glass containers. Max 2 columns via \`grid grid-cols-1 md:grid-cols-2\`. Overlapping layers create depth — cards should stack and slightly overlap (use negative margins or translate) so you feel the z-axis.
- Background: \`bg-surface\` — a deep, inky violet-black (#1a0533) as the dark base. In style.css, define a rich gradient mesh layered on top: use multiple radial-gradient layers (e.g., radial-gradient(ellipse at 20% 50%, rgba(120,0,255,0.4), transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(255,0,150,0.3), transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(0,100,255,0.3), transparent 50%)) to create a swirling cosmic backdrop.
- Glass panels: use \`bg-glass border border-glass-border rounded-card shadow-card\` and add \`backdrop-blur-xl\` — the cards should look like frosted bathroom glass, translucent and milky with the background colors bleeding through softly. The rgba(255,255,255,0.12) background creates that characteristic "breathed-on window" look. Add an inset box-shadow (inset 0 1px 0 rgba(255,255,255,0.1)) for a top-edge light refraction.
- Colors: \`text-heading\` (pure white, crisp against the frost). \`text-body\` (soft blue-gray, like moonlit fog). \`text-accent\` (electric purple) for highlights that glow like neon through mist.
- Typography: \`font-body\` (Inter — clean sans-serif that disappears and lets the glass do the talking). \`font-medium\`. High contrast white text that pops against the translucency.
- Spacing: generous \`p-8\` inside glass panels — content needs room to breathe inside its glass house. Cards have \`gap-6\` between them.
- Decorations: floating blurred color orbs in the background (define in style.css as absolutely positioned divs with radial-gradient fills, 300-500px wide, border-radius: 50%, filter: blur(80px), animated with a slow 15s ease-in-out infinite alternate translateY float). \`shadow-glow\` on glass edges. NO sharp borders. Everything feels ethereal and weightless.
- style.css: gradient mesh background with 3+ radial-gradient layers, floating color orbs that drift slowly (keyframes: translateY(-20px) to translateY(20px) over 15s), a subtle shimmer on glass borders (border-color cycling from rgba(255,255,255,0.15) to rgba(255,255,255,0.3) over 3s), backdrop-filter fallbacks for older browsers, and hover transitions (transform: translateY(-4px) and shadow-glow intensification on card hover over 300ms).
- Vibe: iOS/macOS frosted glass, but more atmospheric — like looking through a rain-streaked window at a neon city. Premium, layered, dreamlike. Depth through translucency. The page should feel like it exists in three dimensions.`,
  },

  corporate: {
    name: 'Corporate',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#1E3A5F',
            accent: '#D97706',
            surface: '#FFFFFF',
            'surface-alt': '#F8FAFC',
            heading: '#0F172A',
            body: '#475569',
            muted: '#94A3B8',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
            button: '8px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.1)',
            hover: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a CORPORATE / PROFESSIONAL style.
- Layout: structured \`max-w-7xl mx-auto\` — the kind of clean, predictable grid that makes a Fortune 500 CFO feel safe. Clear visual hierarchy. Standard sections: nav, hero, features grid, social proof, CTA, footer. Every section exactly where you expect it, like a well-organized boardroom.
- Colors: \`bg-primary\` — a deep, authoritative navy (#1E3A5F) like a banker's suit — for nav/footer/CTAs. \`bg-surface\` (crisp white, freshly pressed) and \`bg-surface-alt\` (cool blue-gray, like morning fog on glass) alternating sections. \`text-heading\` (near-black, ink-dark) for titles. \`text-body\` (slate gray, measured and calm) for paragraphs. \`bg-accent\` / \`text-accent\` — warm amber/gold that says "click here, this is important" without shouting.
- Typography: \`font-heading\` and \`font-body\` (both Inter — the Helvetica of our era, quietly professional). \`font-normal\` for body, \`font-semibold\` to \`font-bold\` for headings. Standard sizes — nothing flashy, because the content does the talking.
- Grid: 2 or 3 column grids for features using \`grid grid-cols-1 md:grid-cols-3 gap-8\`. Equal spacing. Aligned. Balanced. Every card the same height like soldiers in formation.
- Elements: \`shadow-card\` on cards (subtle, just enough depth to lift them off the page). \`rounded-card\` (12px — professional curves, not playful). Professional icons (use unicode symbols). Stat numbers in \`text-4xl font-bold\` with small \`text-muted\` labels beneath.
- Buttons: \`bg-primary text-white rounded-button\` for primary — solid, confident. \`border border-primary text-primary\` for secondary — understated but present.
- Trust signals: fake logos bar ("Trusted by"), testimonial cards with role/company, metric counters. The social proof section should feel like walking past a wall of framed credentials.
- style.css: smooth 200ms ease-out hover transitions on cards (translateY(-2px) and shadow-hover elevation), subtle background-color transitions on buttons, a thin animated underline on nav links (width 0 to 100% on hover via ::after pseudo-element), and a gentle gradient overlay on the hero section (linear-gradient from rgba(30,58,95,0.9) to rgba(30,58,95,0.7)) to add depth.
- Vibe: McKinsey, Stripe, enterprise SaaS. Inspires confidence. No personality — all professionalism. The design equivalent of a firm handshake.`,
  },

  playful: {
    name: 'Playful',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#FF6B6B',
            secondary: '#FFD93D',
            tertiary: '#06D6A0',
            quaternary: '#4CC9F0',
            surface: '#FFF8EE',
            heading: '#2D2235',
            body: '#4A4458',
            accent: '#7B2FBE',
          },
          fontFamily: {
            heading: ['"Fredoka"', 'sans-serif'],
            body: ['"Nunito"', 'sans-serif'],
          },
          borderRadius: {
            card: '1.5rem',
            pill: '9999px',
            button: '9999px',
          },
          boxShadow: {
            card: '0 4px 0 rgba(0,0,0,0.1)',
            button: '0 4px 0 rgba(0,0,0,0.2)',
            hover: '0 6px 0 rgba(0,0,0,0.15)',
          },
        },
      },
    },
    prompt: `Use a PLAYFUL and COLORFUL style.
- Layout: irregular/asymmetric grid — a bento box of delights where every cell is a different surprise. Cards at slightly different sizes, like scattered playing cards on a table. Sections that break the grid intentionally. Mixed column spans (one big card next to two small ones, then three equal ones). NOT a standard top-to-bottom flow — it should feel like exploring, not scrolling.
- Colors: a candy store palette — use \`bg-primary\` (coral, like a ripe grapefruit), \`bg-secondary\` (sunshine yellow, warm and loud), \`bg-tertiary\` (mint green, fresh as bubblegum), \`bg-quaternary\` (sky blue, cartoon-cloud bright), \`bg-accent\` (grape purple, playful royalty). Use 4+ colors boldly. \`bg-surface\` (warm cream, like vanilla ice cream) as page background.
- Typography: \`font-heading\` (Fredoka — bubbly, rounded display font that looks like it's smiling at you) for headings. \`font-body\` (Nunito — soft, friendly, the round sans-serif equivalent of a hug) for body. Oversized headings (\`text-6xl\`+) that demand attention. Bold weights everywhere (\`font-bold\` to \`font-black\`).
- Corners: \`rounded-card\` (1.5rem) on cards — soft, squeezable. \`rounded-pill\` on buttons and tags — like jellybean shapes.
- Decorations: floating emoji scattered as decoration, animated elements that bring the page to life. Doodle-style squiggle underlines via inline SVG. Blob shapes in the background peeking out from behind cards.
- Buttons: chunky 3D buttons with \`shadow-button\` (4px solid shadow beneath, like a physical button you want to push). \`rounded-button\` pill shape. Large (\`py-4 px-8\`+). When pressed, the shadow should collapse (translateY(4px) and shadow to 0) — satisfying tactile click feeling.
- style.css: wiggle animation (rotate -3deg to 3deg, 0.3s, infinite for decorative emoji), bounce animation (translateY(-6px) to 0, 0.6s ease, infinite alternate for floating elements), gentle float animation (translateY(-10px) to translateY(10px), 3s ease-in-out infinite alternate), squiggle underline SVG as background-image on highlighted text, blob shapes via border-radius animations that morph between organic forms (60% 40% 55% 45% / 50% 60% 40% 50% shifting over 8s), confetti-like scattered dots via radial-gradient background pattern.
- Vibe: Duolingo, Notion marketing site, kindergarten teacher meets modern web. Joyful, energetic, makes you smile — and then makes you click things just to see what happens.`,
  },

  darkLuxury: {
    name: 'Dark Luxury',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#0A0A0A',
            primary: '#C9A84C',
            heading: '#F5F0E8',
            body: '#B8B0A0',
            muted: '#3A3530',
          },
          fontFamily: {
            heading: ['"Playfair Display"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a DARK LUXURY style.
- Layout: full-width, full-bleed sections — content stretches edge to edge like a black velvet tablecloth. NO max-width container. Large hero taking \`min-h-screen\` — a single powerful statement centered in a sea of darkness. Generous vertical rhythm (\`py-24\` to \`py-32\` between sections). Fewer sections, each with the breathing room of a five-star hotel lobby.
- Colors: \`bg-surface\` — the deepest black (#0A0A0A), not gray, not charcoal, black like the inside of a grand piano. \`text-primary\` — old gold/champagne (#C9A84C), the color of light catching a watch face. \`text-heading\` — warm cream (#F5F0E8), like candlelight on parchment. \`text-body\` — muted taupe (#B8B0A0), quiet and receding. \`border-primary\` for thin gold lines that gleam like wire in a jeweler's display. \`border-muted\` for the subtlest of dividers, barely there.
- Typography: \`font-heading\` (Playfair Display — an elegant serif that looks like it was engraved, not typed) for headlines. \`font-body\` with \`font-extralight\` for body text — so thin the letters almost dissolve, like whispered words. \`uppercase tracking-[0.2em]\` on headings — spaced out, unhurried, the way luxury takes its time.
- Spacing: extravagant whitespace — the most expensive thing on this page is what's NOT there. Single elements centered on screen with massive margins. Let every word sit in silence.
- Decorations: thin gold hairline dividers (\`border-t border-primary\`). NO shadows. NO blobs. NO emoji. Minimal — luxury is restraint. A single thin gold line says more than a hundred gradients.
- Buttons: \`border border-primary text-primary uppercase tracking-widest\`. Thin text, thin border. NO filled buttons — filling them would be vulgar. The restraint IS the design.
- style.css: elegant fade-in animations on scroll (opacity 0 to 1 with translateY(20px) to translateY(0) over 800ms ease-out), a radial gradient glow behind the hero headline at 5% opacity (radial-gradient(ellipse, rgba(201,168,76,0.05), transparent 70%)), subtle gold shimmer animation on dividers (background-position shift on a linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent) over 3s), smooth 300ms transitions on all hover states, and letter-spacing that subtly expands on heading hover (tracking-[0.2em] to tracking-[0.25em]).
- Vibe: Rolex, Aesop, luxury hotel website. Whispers, doesn't shout. Every pixel exudes premium. The page should feel like being escorted to a private room — understated, intentional, and unforgettable.`,
  },

  editorial: {
    name: 'Editorial',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#000000',
            accent: '#C41E3A',
            surface: '#FFFFFF',
            heading: '#000000',
            body: '#333333',
            muted: '#999999',
          },
          fontFamily: {
            heading: ['"Playfair Display"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use an EDITORIAL / MAGAZINE style.
- Layout: asymmetric multi-column grid inspired by the art directors of print magazines — the kind of spread that makes you pause and study the composition. Mix wide and narrow columns via \`grid grid-cols-3\` with varying spans. Pull quotes that break the grid and demand attention. Full-bleed accent areas next to narrow text columns. NOT a standard web layout — it should feel like opening a beautifully designed magazine to a feature spread.
- Colors: mostly \`bg-primary\` (ink black, dense and authoritative) and \`bg-surface\` (pure white, the blank canvas) with ONE strong \`text-accent\` / \`bg-accent\` (deep crimson red #C41E3A — like a lipstick mark on a manuscript). Large areas of solid white or solid black — dramatic contrast is the palette.
- Typography: BOLD typographic hierarchy IS the design — this is a style where the typeface does all the heavy lifting. \`font-heading\` (Playfair Display, a serif with dramatic thick/thin strokes) at \`text-7xl\` to \`text-9xl\` — letters so large they become abstract shapes. Small \`font-body\` (Inter, crisp sans-serif) for body text at a humble text-base. Mix italic and roman deliberately — an italic pull quote next to roman body text creates visual music. Pull quotes in oversized italic serif that feel like someone underlined a passage in a book.
- Grid: CSS Grid with deliberate asymmetry. 2-column layouts where text column is \`col-span-1\` and accent column is \`col-span-2\` or vice versa — the tension between narrow and wide is the composition. Break the grid with full-width elements that span all columns.
- Decorations: large typographic numbers for section numbering (\`text-8xl font-heading text-muted\` — ghostly numerals anchoring each section). Thin rule lines (\`border-t border-primary\`) used like a designer's straightedge. Drop caps on opening paragraphs. NO icons. NO emoji. Let typography do the work — it's been doing it for 500 years.
- Whitespace: dramatic — large gaps between elements, like the silence between movements in a symphony. Short text blocks with generous margins. The white space is as composed as the content.
- style.css: drop cap styling via \`::first-letter\` (font-size: 4em, float: left, line-height: 0.8, Playfair Display, margin-right: 0.1em), pull quote positioning with large italic text and thin top/bottom borders, section numbers positioned absolutely at negative offsets so they peek out from behind content, a subtle text-indent on body paragraphs for a print feel, smooth 200ms opacity transitions on grid items, and a thin animated underline on links using ::after with scaleX(0) to scaleX(1).
- Vibe: The New York Times Magazine, Bloomberg Businessweek, Monocle. Content-first, type-driven, sophisticated. The page should look like it was art-directed, not just coded.`,
  },

  retro: {
    name: 'Retro',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#606C38',
            accent: '#DDA15E',
            surface: '#FEFAE0',
            heading: '#283D3B',
            body: '#4A4A3A',
            rose: '#D4A59A',
          },
          fontFamily: {
            heading: ['"Playfair Display"', 'serif'],
            body: ['"Libre Baskerville"', 'serif'],
          },
          borderRadius: {
            card: '4px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a RETRO / VINTAGE style.
- Layout: centered, \`max-w-5xl mx-auto\`. Stacked sections with decorative borders between them like chapters in an old book. Symmetrical, deliberate, slightly formal — the kind of layout you'd see on a vintage apothecary label or a hand-set letterpress poster.
- Colors: a muted, sun-faded palette — \`text-rose\` (dusty pink, like dried flowers pressed between pages), \`text-primary\` (olive green, like aged copper patina), \`text-accent\` (mustard gold, warm as candlelight on brass), \`text-heading\` (faded deep teal, like old sea-worn paint). \`bg-surface\` (cream — not white, never white — the warm yellow-cream of aged paper). NO neon. NO pure white. Everything should look like it's been sitting in a sun-drenched shop window.
- Typography: \`font-body\` (Libre Baskerville — a proper serif with old-world gravitas) for everything. \`font-heading\` (Playfair Display — a display serif with the drama of a Victorian broadsheet) for main headline only. Small caps for subheadings (\`uppercase tracking-widest text-sm\`) — the way they used to do it. Classic typographic details: thin rules above and below section headers.
- Borders: decorative double-line borders (\`border-double border-4 border-heading\`) — the kind you'd see framing a certificate of authenticity. Ornamental dividers between sections that feel hand-drawn.
- Decorations: badge/emblem style elements — bordered containers with text inside like "EST. 2024" or "HANDCRAFTED" or "PREMIUM QUALITY". Vintage label aesthetic — every element should feel like it could be a sticker on an old steamer trunk. NO modern icons — use typographic symbols (stars, bullets, decorative marks) as ornaments.
- Buttons: bordered, \`uppercase tracking-widest\`. \`border border-heading\`. Muted colors. They should feel like labels on apothecary jars.
- style.css: decorative border patterns using border-image with repeating-linear-gradient for a hatched/engraved border effect, ornamental divider styling using ::before/::after with centered decorative characters between thin rules, a subtle paper texture via a faint repeating noise background-image (CSS radial-gradient dots at 2% opacity), vignette effect on the page edges (box-shadow: inset 0 0 100px rgba(0,0,0,0.06)), gentle sepia-toned hover transitions (filter: sepia(0.1) on hover over 300ms), and typographic flourishes on headings via ::before/::after pseudo-elements.
- Vibe: vintage apothecary label, 1960s magazine ad, letterpress print shop. Warm, nostalgic, crafted — like something you'd find in a leather-bound journal or pinned to a corkboard in a Parisian bookshop.`,
  },

  neobrutalism: {
    name: 'Neobrutalism',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#000000',
            accent: '#FF5ABE',
            blue: '#3B82F6',
            lime: '#B8FF29',
            orange: '#FF7F11',
            surface: '#FFFFFF',
            heading: '#000000',
            body: '#000000',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
          },
          boxShadow: {
            brutal: '4px 4px 0px #000000',
            'brutal-hover': '0px 0px 0px #000000',
          },
        },
      },
    },
    prompt: `Use a NEOBRUTALISM style.
- Layout: blocky, grid-based — like a scrapbook page where someone pasted chunky stickers with joyful abandon. Large cards with hard borders. Slightly chaotic but intentional arrangement (a 3-column grid where one card spans 2 columns, another is rotated 1-2deg). Cards can be slightly rotated via style.css. Mix of sizes — some big, some small, creating visual rhythm like a drum beat.
- Colors: bright, saturated, unapologetic — \`bg-accent\` (hot pink #FF5ABE, like a highlighter streak), \`bg-blue\` (electric blue, straight from the tube), \`bg-lime\` (acid green #B8FF29, almost radioactive), \`bg-orange\` (tangerine #FF7F11, warm and loud), \`bg-surface\` (clean white, the paper beneath the stickers), \`bg-primary\` (jet black for borders and text). High contrast combos — pink card with black text, lime badge on blue background. Nothing is subtle.
- Borders: thick \`border-4 border-primary\` on EVERYTHING — the black outline is the signature of this style, like every element was cut out with scissors. Hard \`shadow-brutal\` (4px 4px 0px #000000) on every element — a solid offset shadow with zero blur. Every card, button, and badge looks like a physical sticker or fridge magnet.
- Typography: \`font-heading\` at \`font-black\` weight — big, chunky, unapologetic. Large headings that fill their containers. Mix of sizes for visual rhythm — a \`text-6xl\` headline next to \`text-sm\` labels.
- Corners: \`rounded-card\` (8px max) — just enough softness to feel friendly, NOT pill-shaped. Chunky, not smooth. The geometry is deliberate.
- Decorations: colored blocks as backgrounds behind text. Elements look like physical stickers/stamps — think bumper stickers, festival wristbands, zine cutouts. Thick 4px underlines on important text. Star and asterisk decorations scattered like confetti.
- Buttons: thick bordered, \`shadow-brutal\`, \`font-bold\` text. Bright colored fill (each button a different color). On hover: shadow disappears (\`hover:shadow-brutal-hover\` = 0px 0px 0px) and button shifts down/right (translateX(4px) translateY(4px)) — like physically pressing a 3D sticker flat.
- style.css: card rotation transforms (rotate(-1deg) to rotate(2deg) on alternating cards via :nth-child), hover shadow transitions (shadow and transform over 150ms ease — snappy, not floaty), a subtle hover scale(1.02) on cards, thick wavy underlines via text-decoration-style: wavy on accent links, and a playful entrance animation where cards slide in from slightly rotated positions (rotate(3deg) translateY(20px) to rotate(0) translateY(0) over 400ms).
- Vibe: Figma marketing, Gumroad, modern zine aesthetic. Bold, in-your-face, unapologetic. This page should feel like it's having the time of its life — loud, colorful, and impossible to ignore.`,
  },

  organic: {
    name: 'Organic',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#2D5016',
            accent: '#C67B4B',
            surface: '#FAF6F0',
            'surface-alt': '#E8DCC8',
            heading: '#3E2723',
            body: '#5C4A3A',
            sage: '#A8B5A2',
          },
          fontFamily: {
            heading: ['"Lora"', 'serif'],
            body: ['"Lato"', 'sans-serif'],
          },
          borderRadius: {
            card: '16px',
            organic: '60% 40% 55% 45% / 50% 60% 40% 50%',
          },
          boxShadow: {
            card: '0 8px 30px rgba(0,0,0,0.08)',
            hover: '0 12px 40px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    prompt: `Use an ORGANIC / NATURAL style.
- Layout: flowing, single-column with occasional 2-column splits — like a gentle stream winding through a meadow. \`max-w-5xl mx-auto\`. Content feels like it flows downward naturally, each section growing organically from the last. No hard breaks between sections — use wave dividers and curved edges so sections melt into each other.
- Colors: earth tones pulled straight from a forest floor — \`bg-surface\` (warm cream #FAF6F0, like unbleached linen), \`bg-surface-alt\` (sand #E8DCC8, sun-warmed and soft). \`text-primary\` (forest green #2D5016, deep as moss on a stone), \`text-accent\` (terracotta #C67B4B, the warm clay of a handmade pot), \`text-heading\` (deep soil brown #3E2723, rich as turned earth), \`text-body\` (warm walnut #5C4A3A, gentle on the eyes). \`bg-sage\` — a muted sage green like dried herbs hanging in a kitchen window.
- Typography: \`font-heading\` (Lora — a warm serif with gentle curves, like handwriting that's been refined) and \`font-body\` (Lato — humanist sans-serif, friendly and readable as a conversation). Comfortable reading sizes. \`font-normal\` weight. \`leading-relaxed\` (1.7+) — let the text breathe like air between leaves.
- Shapes: organic rounded shapes — \`rounded-card\` (16px, soft without being cartoonish) for standard elements, \`rounded-organic\` (60% 40% 55% 45% / 50% 60% 40% 50%) for asymmetric blob-like shapes that feel grown, not drawn. No sharp geometric shapes anywhere — nature doesn't do right angles.
- Decorations: wave section dividers (SVG curves in style.css — gentle sine-wave paths, not jagged). \`shadow-card\` (soft, large blur radius of 30px, very low opacity — shadows that feel like the shade under a tree). NO hard lines. Everything soft, rounded, breathing.
- Spacing: comfortable, generous — \`py-16 px-6\`. Feels like a well-designed book page you'd read with a cup of tea. Sections have room to exist, like plants given enough space to grow.
- Buttons: \`rounded-card bg-primary text-surface\`. Gentle \`transition-all duration-300\` hover — buttons that warm when you approach them (hover: slightly darker bg, subtle translateY(-2px) lift, shadow-hover expansion).
- style.css: wave/curve SVG section dividers using inline SVG with fill matching the next section's background color, organic shape clip-paths on accent images (clip-path: ellipse or custom polygon), subtle leaf-sway animation on decorative elements (rotate(-2deg) to rotate(2deg) over 4s ease-in-out infinite), soft parallax-like effect on background elements (background-attachment: fixed on texture overlays), a whisper-thin grain texture overlay at 3% opacity via a CSS noise pattern, and smooth color transitions on links (color change over 300ms).
- Vibe: Aesop, organic food brand, wellness spa. Calm, grounded, connected to nature. The page should feel like stepping barefoot onto warm grass — everything soft, natural, and alive.`,
  },

  cyberpunk: {
    name: 'Cyberpunk',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#0A0A0F',
            primary: '#00F0FF',
            accent: '#FF00FF',
            green: '#39FF14',
            pink: '#FF2D6B',
            heading: '#FFFFFF',
            body: '#A0AEC0',
            panel: '#111125',
          },
          fontFamily: {
            heading: ['"Orbitron"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '4px',
          },
          boxShadow: {
            neon: '0 0 15px rgba(0,240,255,0.5), 0 0 40px rgba(0,240,255,0.2)',
            'neon-pink': '0 0 15px rgba(255,0,255,0.5), 0 0 40px rgba(255,0,255,0.2)',
          },
        },
      },
    },
    prompt: `Use a CYBERPUNK / NEON style.
- Layout: dashboard-like grid panels with thick borders and gaps — the screen should look like the cockpit of a spacecraft or a hacker's multi-monitor setup. Asymmetric, dense, information-heavy. Mix wide and narrow panels. Some sections styled as "terminal windows" with colored title bars (a thin bar at the top with a blinking dot and window title in monospace). NO conventional hero-features-pricing flow — make it feel like a HUD interface. Data readouts, status indicators, system panels.
- Colors: \`bg-surface\` — the void (#0A0A0F), deep enough to make the neons burn. Neon accents that sear: \`text-primary\` (electric cyan #00F0FF, like liquid electricity), \`text-accent\` (hot magenta #FF00FF, ultraviolet glare), \`text-green\` (matrix green #39FF14, toxic and alive), \`text-pink\` (neon pink #FF2D6B, like a sign in a rain-soaked alley). \`bg-panel\` (#111125, dark blue-black for card backgrounds — just light enough to see the edges). \`shadow-neon\` and \`shadow-neon-pink\` for glow effects that bleed light into the darkness.
- Typography: \`font-mono\` (JetBrains Mono) for UI labels and body text — everything reads like terminal output. \`font-heading\` (Orbitron — geometric, futuristic, the typeface of a heads-up display) for headlines. \`uppercase tracking-widest\` for labels and section headers — cold, clinical, systematic.
- Borders: \`border border-primary\` on panels — cyan wire-frame edges that define each module. On hover, the border should glow (box-shadow expanding). Corner accents in style.css — L-shaped bracket marks (10px x 10px) via ::before/::after on each corner of panels, like targeting reticles.
- Decorations: scanline overlay across the entire page (repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px) — CRT monitor texture). Animated glitch effect on the hero text (random translateX jitters and clip-path slicing via keyframes). Blinking cursor animation after terminal text. Faux terminal prompts ("> system.ready", ">> initializing..."). Grid background pattern on the body (1px lines at 40px intervals in rgba(0,240,255,0.05)).
- Buttons: \`border border-primary text-primary\` with \`shadow-neon\`. On hover: background fills with neon cyan, text goes black, glow intensifies (shadow blur doubles) — like a switch being thrown.
- style.css: scanline overlay as a fixed pseudo-element covering the viewport, glitch animation keyframes (3 stages: translateX(-2px) with clip-path inset, translateX(2px) with different clip-path, back to normal — 0.3s triggered on hover or looping every 5s), L-shaped corner accents via ::before/::after with border-top + border-left (10px solid cyan) positioned absolutely, grid background pattern on body, neon glow pulse animation (shadow-neon expanding and contracting over 2s infinite), a typing animation for terminal prompts (width 0 to 100% with steps()), chromatic aberration text-shadow on headings (1px 0 rgba(0,240,255,0.7), -1px 0 rgba(255,0,255,0.7)).
- Vibe: Blade Runner, Cyberpunk 2077, hacker terminal meets neon Tokyo at 2AM in the rain. Dark, electric, futuristic. The page should feel like it's alive — humming with electricity, glitching at the edges, running on something dangerous.`,
  },

  swiss: {
    name: 'Swiss / Bauhaus',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#FF0000',
            blue: '#0000FF',
            yellow: '#FFD700',
            surface: '#FFFFFF',
            heading: '#000000',
            body: '#000000',
          },
          fontFamily: {
            heading: ['"Inter"', 'Helvetica', 'sans-serif'],
            body: ['"Inter"', 'Helvetica', 'sans-serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a SWISS / BAUHAUS / INTERNATIONAL TYPOGRAPHIC style.
- Layout: strict modular grid system — every element placed with the precision of a blueprint. Use CSS Grid with exact mathematical columns (\`grid grid-cols-12\` with content snapping to 4/8/12 spans). Asymmetric but CALCULATED balance — the kind of composition where you could draw diagonal lines connecting every element and they'd all align. \`bg-surface\` (white) background. Content blocks align to a visible underlying grid logic. The negative space is as deliberate as the content.
- Colors: PRIMARY colors only — \`bg-primary\` (pure red #FF0000, Mondrian red, the red of a stop sign), \`bg-blue\` (pure blue #0000FF, Klein blue, a blue that vibrates), \`bg-yellow\` (warm gold #FFD700, the yellow of a Bauhaus poster), \`bg-heading\` (absolute black), \`bg-surface\` (pure white). Use them sparingly and deliberately — a single red block says everything. Large areas of solid primary color as section backgrounds. NO gradients — gradients are imprecise. Only flat, absolute color.
- Typography: \`font-heading\` / \`font-body\` (Inter/Helvetica — the geometric sans-serif that defined an era). Headlines in \`font-bold\` to \`font-black\` — typography as architecture. Body in \`font-normal\` to \`font-light\` — clean, functional, invisible. Use a strict mathematical type scale (each size exactly 1.25x the last). NO serif fonts — serifs are decorative, and decoration is dishonest.
- Grid: content MUST feel like it sits on a precise grid — you should almost be able to see the underlying structure. Use visible structural elements — thin black rules (\`border-t border-heading\`) that serve as both design and organization. Asymmetric layouts where text occupies 1/3 and whitespace 2/3. The grid is not hidden — it IS the design.
- Decorations: geometric shapes ONLY — circles, rectangles, lines. Used as compositional elements, not decoration — a large red circle anchoring the top-right corner, a yellow rectangle creating visual weight at the bottom-left, a black diagonal line connecting two compositional points. Every shape is structural, purposeful, load-bearing. Think Kandinsky's "Composition VIII."
- Buttons: \`bg-heading text-surface rounded-card\` (0px radius — pure rectangle). No shadows. No gradients. Just geometry. The button is a black rectangle with white text because that's all it needs to be.
- style.css: geometric shapes positioned absolutely (circles via border-radius: 50% with solid primary-color backgrounds, rectangles as plain divs, diagonal lines via a thin black div rotated with transform: rotate(45deg)), compositional layout overrides, a subtle grid-reveal animation on page load where content fades in along the grid lines (staggered opacity transitions by column), thin animated rules that extend from 0 to full width on scroll (width transition over 600ms), and mathematical spacing using CSS custom properties for consistent rhythm (--grid-unit: 8px, all spacing as multiples).
- Vibe: Josef Muller-Brockmann, Jan Tschichold, Bauhaus school. Mathematical precision. The grid IS the design. Every pixel is accountable. This page should look like it was composed, not designed — the way a mathematician solves an equation.`,
  },

  artDeco: {
    name: 'Art Deco',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#D4AF37',
            surface: '#FAF3E0',
            'surface-dark': '#1A1A1A',
            heading: '#1A1A1A',
            body: '#3A3A3A',
            emerald: '#1B4332',
          },
          fontFamily: {
            heading: ['"Cinzel"', 'serif'],
            body: ['"Cormorant Garamond"', 'serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use an ART DECO style.
- Layout: centered and SYMMETRICAL — every element anchored to a strong vertical axis like the spire of the Chrysler Building. Content framed within decorative borders. \`max-w-5xl mx-auto\`. Sections separated by ornamental dividers that feel etched in brass.
- Colors: \`bg-surface-dark\` — deep black like polished obsidian — paired with \`text-primary\` / \`border-primary\` — warm gold that catches light like hammered bullion. \`bg-surface\` (ivory cream, aged parchment warmth) as background. \`text-emerald\` as a jewel-like accent, deep forest green of a velvet lounge.
- Typography: \`font-heading\` (Cinzel, tall condensed serif) for headlines — letters that stand like columns. \`uppercase tracking-[0.2em]\` for all headings — Art Deco is about VERTICAL letterforms that tower. \`font-body\` (Cormorant Garamond) for body text — elegant, ink-on-linen readability.
- Borders: thin gold lines (\`border border-primary\`) used extensively like gilded picture frames. Double-line borders (\`border-double border-4 border-primary\`). Geometric border patterns via style.css.
- Decorations: fan/sunburst shapes (CSS conic-gradient in style.css). Geometric patterns — chevrons, zigzags, stepped pyramids. Ornamental dividers between sections. Corner ornaments on cards.
- Buttons: \`border border-primary text-primary uppercase tracking-widest\`. Gold fill on hover with a smooth 0.3s transition that feels like a light turning on. NO rounded corners — sharp as a tuxedo lapel.
- style.css: radiating sunburst/fan shapes via conic-gradient behind hero sections, geometric repeating patterns using clip-path polygons, corner ornament pseudo-elements with gold borders that frame cards like gallery pieces, decorative dividers with layered border-image gradients, gold shimmer hover effect using background-position animation on linear-gradient, stepped pyramid shapes via nested box-shadows.
- Vibe: The Great Gatsby, 1920s Manhattan, Chrysler Building lobby. Geometric luxury dripping with intention.`,
  },

  newspaper: {
    name: 'Newspaper',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#F5F2EB',
            heading: '#000000',
            body: '#1A1A1A',
            accent: '#8B0000',
            muted: '#666666',
          },
          fontFamily: {
            heading: ['"Playfair Display"', 'serif'],
            body: ['"Source Serif 4"', 'serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a NEWSPAPER / BROADSHEET style.
- Layout: USE CSS COLUMNS in style.css (column-count, column-gap, column-rule) for body text — real multi-column text flow like spreading open a broadsheet on a Sunday morning. Hero area should be a massive headline spanning full width like a front-page banner, then content drops into columns below.
- Colors: almost entirely \`text-heading\` — ink-black, dense and authoritative — on \`bg-surface\` — warm newsprint, the color of paper that has lived a day. One \`text-accent\` / \`bg-accent\` — deep crimson red, the urgency of a breaking headline — for the masthead only. NO colorful sections — restraint is credibility.
- Typography: newspaper hierarchy is EVERYTHING — this is a design made entirely of WORDS. Masthead: \`font-heading text-6xl\` — commanding, the name of an institution. Main headline: \`font-heading font-bold text-4xl\` — the kind of headline that stops someone mid-stride at a newsstand. Deck (subheadline): \`font-body italic text-xl\` — the elegant pull into the story. Byline: \`uppercase tracking-widest text-sm font-light\` — quiet authority. Body: \`font-body text-base leading-relaxed\` — comfortable long-reading serif.
- Column layout: use style.css for column-rule (thin, faint, like pencil lines on the page), break-inside: avoid, column-span: all for pull quotes that break across columns like a shout.
- Decorations: thin horizontal rules (\`border-t border-heading\`) EVERYWHERE — these hairlines are the skeleton of the layout. Drop caps on first paragraphs (style.css ::first-letter — large, 3-line tall, serif, floated). Section labels like "TECHNOLOGY" in \`uppercase tracking-widest text-xs font-bold\`.
- Buttons: text links styled as underlined serif text. NO filled buttons. NO rounded buttons. Links are the only navigation — like a real paper.
- style.css: CSS columns with column-count 2-3 and thin column-rule borders, elegant drop cap ::first-letter with float and font-size 3.5em, pull quote styling with large italic text and top/bottom double borders, dateline styling with small-caps, masthead underline using a thick-then-thin double border effect, justified text with hyphens:auto for authentic column wrapping.
- Vibe: The New York Times front page, The Guardian, Financial Times. Typography IS the design — every pixel of whitespace earned.`,
  },

  neumorphism: {
    name: 'Neumorphism',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#E0E5EC',
            heading: '#4A5060',
            body: '#5A6170',
            accent: '#6C8EBF',
          },
          fontFamily: {
            body: ['"Nunito"', 'sans-serif'],
          },
          borderRadius: {
            card: '20px',
            pill: '9999px',
          },
          boxShadow: {
            raised: '8px 8px 16px #b8bec7, -8px -8px 16px #ffffff',
            pressed: 'inset 5px 5px 10px #b8bec7, inset -5px -5px 10px #ffffff',
          },
        },
      },
    },
    prompt: `Use a NEUMORPHISM / SOFT UI style.
- Layout: centered, card-based. Single column or simple 2-column grid. \`max-w-5xl mx-auto\`. Clean, Apple-like simplicity. Everything lives on one continuous surface — imagine a single slab of soft clay where elements are gently pushed in or raised out.
- Background: ONE single \`bg-surface\` color everywhere — a cool, matte gray like fog on brushed aluminum. The ENTIRE page is this color. No section color changes. Just one continuous surface, unbroken.
- Shadows: THIS IS THE CORE TECHNIQUE. Every element uses DUAL shadows that create the illusion of physical depth:
  - Raised: \`shadow-raised\` for cards, containers, inactive buttons — elements feel like they float just above the surface, catching light from the top-left
  - Pressed: \`shadow-pressed\` for input fields, active buttons — dimpled inward, like a thumbprint in wet clay
- Colors: NO vibrant colors. \`text-accent\` — muted blue, like twilight — used only for small interactive elements. \`text-heading\` and \`text-body\` — NOT black, slightly muted, like pencil on gray paper.
- Typography: \`font-body\` (Nunito, rounded sans-serif — letters as soft as the UI). \`font-medium\` for body, \`font-semibold\` for headings. Muted text colors that never shout.
- Borders: NO borders. NO outlines. All depth comes ONLY from shadows. \`rounded-card\` — pillowy 20px corners that make everything feel soft enough to touch.
- Buttons: \`shadow-raised rounded-card\`. On hover: subtle lift. On active/click: switch to \`shadow-pressed\` — the satisfying click of a physical button.
- style.css: smooth transition effects (0.2s ease) for shadow swapping on hover/active/click states so raised elements depress smoothly, circular progress indicators with inset shadows, toggle switches that physically slide between raised/pressed states, concentric shadow rings on focused inputs creating a soft glow, icon containers with inner shadow creating recessed wells.
- Vibe: early 2020s Dribbble trend, calculator apps, smart home UIs. Tactile, physical, sculpted from clay — you want to reach out and press it.`,
  },

  monochrome: {
    name: 'Monochrome',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            'mono-50': '#EBF0F5',
            'mono-100': '#D0DBE5',
            'mono-200': '#A8BCCF',
            'mono-300': '#7D9AB5',
            'mono-500': '#4A6F8F',
            'mono-700': '#2A4560',
            'mono-900': '#142030',
            surface: '#EBF0F5',
            heading: '#142030',
            body: '#2A4560',
            accent: '#4A6F8F',
          },
          fontFamily: {
            heading: ['"DM Serif Display"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(20,32,48,0.1)',
          },
        },
      },
    },
    prompt: `Use a MONOCHROME style.
- STRICT RULE: Use ONLY ONE HUE (blue-gray) — like a photograph printed in cyanotype, every shade drawn from the same cold ocean. The full spectrum from \`bg-mono-50\` (pale morning mist) to \`bg-mono-900\` (deep midnight ink) is defined in the config. ZERO other colors.
- Layout: clean, structured. Two-column asymmetric layout. \`max-w-6xl mx-auto\`. The lack of color forces the design to rely ENTIRELY on typography, spacing, and value contrast — and that constraint becomes its superpower.
- Typography: \`font-heading\` (DM Serif Display, stately and sharp) for headlines, \`font-body\` (Inter, crisp and modern) for body — the font pairing creates the visual variety that color normally provides. Use weight variation (\`font-extralight\` whisper-thin, \`font-normal\`, \`font-bold\` commanding) to create rhythm.
- Value range: use the FULL spectrum like a painter working in ink wash. \`bg-mono-900\` (near-black, dramatic) and \`bg-mono-50\` (barely-there gray) alternate between sections. At least 6-7 distinct value steps — each one deliberate.
- Decorations: minimal. Thin rules (\`border-t border-mono-200\`) — delicate as a pencil line. NO icons, NO emoji. Let the monochrome palette speak in its quiet authority.
- Buttons: \`border border-accent text-accent\`. Fill on hover with darker shade — like ink saturating paper. Text-only secondary buttons.
- style.css: subtle hover transitions that shift between value steps (0.3s ease), elegant underline animations on links using background-size transforms, section dividers with gradient fades from mono-200 to transparent, large pull-quote text with semi-transparent mono-300 color that layers beautifully over dark backgrounds, smooth opacity transitions on scroll for a photographic fade-in feel.
- Vibe: high-end photography portfolio, architectural monograph, Ansel Adams gallery. The constraint IS the beauty — every shade earned.`,
  },

  y2k: {
    name: 'Y2K / 2000s',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#FF69B4',
            secondary: '#00CED1',
            lime: '#00FF66',
            purple: '#9B30FF',
            surface: '#E6E0FA',
            heading: '#4B0082',
            body: '#333366',
            chrome: '#C0C0C0',
          },
          fontFamily: {
            heading: ['"Fredoka"', 'sans-serif'],
            body: ['"Baloo 2"', 'sans-serif'],
          },
          borderRadius: {
            card: '16px',
            pill: '9999px',
            bubble: '50%',
          },
          boxShadow: {
            bevel: 'inset 2px 2px 0 #fff, inset -2px -2px 0 #999',
            card: '4px 4px 0 rgba(0,0,0,0.2)',
          },
        },
      },
    },
    prompt: `Use a Y2K / EARLY 2000s WEB style.
- Layout: centered \`max-w-4xl mx-auto\`. Sections have visible borders and backgrounds that are DIFFERENT from each other — every section its own little world. Mix of centered content and asymmetric floating elements. Starburst/badge shapes overlaying content at angles like stickers slapped on a laptop.
- Colors: candy gradients (define in style.css) — \`bg-primary\` (hot pink, bubblegum electric) to \`bg-secondary\` (cyan, swimming-pool blue), \`bg-lime\` (radioactive green) to yellow, \`bg-purple\` (grape soda) to blue. \`text-chrome\` — silver like a CD-ROM catching light. \`bg-surface\` (lavender, cotton candy clouds). LOUD and SHINY — this is maximalism with a sugar rush.
- Typography: \`font-heading\` and \`font-body\` (rounded, bubbly fonts — letters that bounce). "Chrome" headings via gradient text effect in style.css. Mixed sizes, some text rotated slightly — nothing sits perfectly straight.
- Decorations: starburst shapes (style.css clip-path). Sparkle characters (✦ ★ ✧) scattered like confetti. \`rounded-bubble\` on some elements. \`shadow-bevel\` for Windows-style raised bevel effect that screams 2002. "NEW!" badges rotated at -15deg.
- Borders: visible, thick, \`shadow-bevel\` for beveled edges — everything has that chunky plastic feel.
- Buttons: gradient-filled (style.css), beveled 3D look (\`shadow-bevel\`), \`rounded-card\`. "Click Here!" energy — unapologetically eager.
- style.css: candy gradients cycling pink-to-cyan and lime-to-yellow, chrome text effect using background-clip text with metallic linear-gradient, starburst clip-path polygons with 12+ points, rotation transforms (tilted badges at -15deg, slightly askew cards at 1-2deg), bevel shadow effects with white inset top-left and dark inset bottom-right, animated sparkle using keyframe opacity and scale pulses, scrolling marquee-style ticker text, iridescent hover effects shifting gradient angle on mouseover.
- Vibe: early 2000s personal web, Neopets, GeoCities stylish. Nostalgic digital maximalism — the internet when it was weird and wonderful.`,
  },

  maximalist: {
    name: 'Maximalist',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            ruby: '#9B111E',
            emerald: '#046307',
            sapphire: '#0F52BA',
            amethyst: '#6B3FA0',
            amber: '#FF8F00',
            surface: '#FDF5E6',
            heading: '#1A0A00',
            body: '#2D1A0D',
            gold: '#C9A84C',
          },
          fontFamily: {
            display: ['"Playfair Display"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
            quote: ['"Cormorant Garamond"', 'serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '8px',
          },
          boxShadow: {
            card: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
      },
    },
    prompt: `Use a MAXIMALIST style.
- CORE PRINCIPLE: Fill every surface. Every area has pattern, texture, color, or decoration. MORE is more. Like walking into a curiosity cabinet where every shelf overflows with treasure — intentional abundance, not chaos.
- Layout: dense, layered, overlapping. Use CSS Grid with overlapping elements (grid-row/grid-column overlap). Multiple font sizes in same section. Pull quotes overlapping section boundaries like they burst out of their frames. \`max-w-7xl mx-auto\` but fills densely — no empty space goes unadorned.
- Colors: RICH jewel tones — \`bg-ruby\` (deep garnet, wine-stain red), \`bg-emerald\` (forest canopy green), \`bg-sapphire\` (cathedral-window blue), \`bg-amethyst\` (twilight purple), \`bg-amber\` (liquid honey). \`bg-surface\` (antique cream, old book pages) and \`text-gold\` accents that catch the eye like gilded lettering. 4+ colors throughout. Each section can have its own palette. Pattern backgrounds (style.css).
- Typography: use 3+ font families — the variety IS the point. \`font-display\` for headlines — massive, commanding. \`font-quote italic\` for pull quotes — elegant, whispered asides. \`font-body\` for body. \`font-mono\` for labels — technical, precise. MIX sizes dramatically — \`text-8xl\` next to \`text-xs\` creates visual thunder.
- Borders: decorative borders on everything. \`border-double\`, \`border-dashed\`, mixed styles — each border a deliberate frame.
- Decorations: pattern backgrounds (style.css repeating-linear-gradient for stripes, dots). Decorative dividers that feel hand-drawn. Ornamental typographic elements (❧ ✦ ❋ ◆ ❖) as section punctuation.
- Buttons: filled, decorated, possibly with borders + shadows. Rich, detailed, touchable — buttons that feel like embossed leather.
- style.css: intricate pattern backgrounds using repeating-linear-gradient (diagonal stripes, polka dots, cross-hatching), overlapping CSS grid positioning with negative margins and z-index layering, ornate border-image gradients, pull quotes with large decorative quotation marks via ::before pseudo-elements, section backgrounds with layered radial-gradients creating depth, animated hover effects that reveal hidden pattern layers, drop-shadow text on dark sections for a letterpress feel.
- Vibe: Wes Anderson, William Morris wallpaper, baroque architecture. Every surface curated — a feast for the eyes.`,
  },

  cleanTech: {
    name: 'Clean Tech',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#3B82F6',
            surface: '#FFFFFF',
            'surface-alt': '#FAFBFC',
            heading: '#111827',
            body: '#4B5563',
            muted: '#9CA3AF',
            border: '#E5E7EB',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '10px',
            pill: '9999px',
            button: '8px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.08)',
            hover: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a CLEAN TECH / MODERN SaaS style.
- Layout: \`max-w-7xl mx-auto\`. Clear visual hierarchy: nav → hero → features → social proof → CTA → footer. Generous vertical spacing (\`py-20\` to \`py-24\`) — the whitespace breathes confidence, like a gallery with perfectly hung pieces.
- Colors: \`bg-surface\` (white, clean as a fresh canvas) and \`bg-surface-alt\` (whisper-light gray) alternating. ONE \`bg-primary\` / \`text-primary\` accent — a precise, electric blue that draws the eye like a beacon — used sparingly on buttons, links, highlight pills. \`text-heading\` (near-black, authoritative), \`text-body\` (medium gray, easy on the eyes), \`text-muted\` (light, receding). \`border-border\` for card borders — barely there, like pencil lines.
- Typography: \`font-heading\` and \`font-body\` (Inter — the typeface of quiet competence). \`font-medium\` to \`font-semibold\` for headings, \`font-normal\` for body. \`text-3xl\` to \`text-4xl\` headings, \`text-base\` to \`text-lg\` body.
- Decorations: SUBTLE. \`border border-border\` on cards. \`rounded-card\`. \`shadow-card\` — barely perceptible, like a card resting on glass. Pill-shaped badges (\`rounded-pill\`).
- Grid: \`grid grid-cols-1 md:grid-cols-3 gap-8\` for features. Cards with hover lift (\`hover:-translate-y-0.5 hover:shadow-hover\` transition) — a micro-interaction that rewards curiosity.
- Buttons: \`bg-primary text-white rounded-button\` primary. \`border border-border text-body\` secondary.
- style.css: subtle gradient mesh blobs (radial-gradient with primary color at 3-5% opacity) floating in hero background creating an ambient glow, smooth hover transitions (0.2s ease) on all interactive elements, delicate border-bottom animation on nav links using transform scaleX, feature cards that lift with transition transform and box-shadow simultaneously, a faint dot-grid background pattern in surface-alt sections using radial-gradient repeating at 24px intervals.
- Vibe: Vercel, Linear, Supabase. Quietly confident — every pixel considered, nothing wasted. "It just works" energy.`,
  },

  warmCorporate: {
    name: 'Warm Corporate',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#0B8A8A',
            accent: '#D97706',
            surface: '#FEFDFB',
            'surface-alt': '#F5F3EF',
            heading: '#1C1917',
            body: '#57534E',
            muted: '#A8A29E',
            border: '#E7E5E4',
          },
          fontFamily: {
            heading: ['"DM Sans"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '14px',
            button: '12px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.06)',
            hover: '0 4px 12px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    prompt: `Use a WARM CORPORATE / EUROPEAN TECH style.
- Layout: \`max-w-7xl mx-auto\`. Clean, structured — the visual equivalent of a firm handshake. Hero with large headline + subtitle + CTA. Alternating left-right content blocks. \`bg-surface\` and \`bg-surface-alt\` alternating sections like pages of a well-designed annual report.
- Colors: \`bg-surface\` — warm white, the color of Italian marble with a hint of cream. \`bg-primary\` / \`text-primary\` — warm teal, trustworthy as deep water but not cold, think Mediterranean not Arctic. \`bg-accent\` / \`text-accent\` — amber like polished brass, for CTAs that feel valuable. \`text-heading\` (warm dark, espresso-toned), \`text-body\` (warm gray, stone). \`border-border\` — soft, warm edges.
- Typography: \`font-heading\` (DM Sans, 600-700 — geometric but friendly) paired with \`font-body\` (Inter, 400 — crisp and neutral). Feels professional but approachable — like a well-dressed person who smiles easily.
- Elements: \`rounded-card\` (14px — softer than typical corporate, more human). \`shadow-card\` + \`border border-border\`. Stats in large \`font-semibold\` — numbers that command attention. Client logos in grayscale.
- Decorations: minimal. Thin accent-colored top borders on cards (\`border-t-2 border-primary\`) — a subtle signature stripe. NO heavy gradients.
- Buttons: \`bg-accent text-white rounded-button px-7 py-3\` — warm, inviting amber. Secondary: \`border border-primary text-primary\`.
- style.css: smooth hover transitions (0.25s ease) on cards and buttons, accent top-border that grows from center outward on card hover using transform scaleX, stat counters with tabular-nums for aligned digits, client logo strip with gentle grayscale-to-color transition on hover, subtle warm radial-gradient behind hero headline at very low opacity creating a welcoming glow, card hover that lifts with shadow-hover creating a picked-up feeling.
- Vibe: Smartness, Bosch, Miele. European quality — trustworthy, modern, and warm. The kind of design that builds confidence.`,
  },

  startupBold: {
    name: 'Startup Bold',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#7C3AED',
            surface: '#FFFFFF',
            'surface-alt': '#FAFAFA',
            heading: '#0F172A',
            body: '#64748B',
            'primary-light': '#EDE9FE',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '16px',
            button: '14px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.08)',
            hover: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    prompt: `Use a STARTUP BOLD style.
- Layout: \`max-w-6xl mx-auto\`. Hero is dominant — massive headline (\`text-5xl\` to \`text-6xl\`) that hits you like a billboard, punchy subheadline, prominent CTA buttons side by side. Bento-style mixed grids for features — the layout itself says "we think different."
- Colors: \`bg-surface\` (white, clean slate). ONE bold \`bg-primary\` / \`text-primary\` — vibrant violet, confident and unapologetic, the color of ambition — used generously on buttons, headings, highlighted text spans (with \`bg-primary-light\` — soft lilac wash), icon backgrounds. \`text-heading\` (near-black, definitive) and \`text-body\` (gray, relaxed).
- Typography: \`font-heading\` in \`font-bold\` to \`font-extrabold\` — letters that lean forward with energy. Oversized hero headline. Highlighted text spans in headlines with \`bg-primary-light rounded px-2\` — like someone took a highlighter to the important parts.
- Decorations: colored pills/badges (\`bg-primary-light text-primary rounded-full px-3 py-1 text-sm\`) — like status indicators from the future. Emoji in feature cards adding personality. Rounded screenshots with \`shadow-card\` as feature visuals.
- Grid: bento-style — CSS Grid with mixed spans (\`col-span-2\` and \`col-span-1\`), the asymmetry creates visual energy. Cards with \`border border-gray-200\`, accent-colored icon containers.
- Buttons: large \`rounded-button bg-primary text-white font-semibold px-8 py-3\` — chunky, satisfying, impossible to miss. Side-by-side hero CTAs.
- style.css: subtle dot grid background pattern in hero using radial-gradient repeating at 20px intervals with primary color at 5% opacity, bento card hover effects with smooth translate-y and shadow transitions (0.2s ease), highlighted text spans with animated gradient background-position shift on hover, pill badges with subtle scale bounce on scroll-into-view, hero headline with gradient text effect (primary to primary-light) using background-clip text for extra punch.
- Vibe: Notion, Arc, Loom, Raycast. Young, ambitious, opinionated — the design equivalent of leaning forward in your chair.`,
  },

  saasMarketing: {
    name: 'SaaS Marketing',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#3B82F6',
            surface: '#FFFFFF',
            'surface-alt': '#F8FAFF',
            dark: '#0F172A',
            heading: '#0F172A',
            body: '#475569',
            muted: '#94A3B8',
            border: '#E2E8F0',
            code: '#1E293B',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
            code: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '12px',
            button: '8px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.08)',
            hover: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a SaaS MARKETING / DEVELOPER-FACING style.
- Layout: \`max-w-7xl mx-auto\`. Hero: left-aligned headline + CTA + right-side code snippet or terminal mockup — the code IS the hero image. Logo bar. Features in alternating rows. FAQ accordion. Pricing cards. Dark pre-footer CTA band (\`bg-dark\`) — a dramatic mood shift that says "this is serious."
- Colors: \`bg-surface\` (white, clinical clean) base. ONE \`bg-dark\` section — deep navy like a terminal at 2am — for pre-footer. \`text-primary\` / \`bg-primary\` — precise blue, the color of trust in tech. \`bg-surface-alt\` for feature sections — barely tinted, like IDE background. \`bg-code\` — near-black with a hint of blue, the color of a warm terminal — for code blocks with syntax-colored text.
- Typography: \`font-heading\` and \`font-body\` (Inter — developer-approved, no-nonsense). \`font-code\` (JetBrains Mono — the monospace font that says you know what you are doing). Clean weights (\`font-normal\` body, \`font-semibold\` headings).
- Code/Terminal: styled terminal windows with title bar dots (red/yellow/green circles), \`bg-code rounded-card\`, \`font-code text-sm\`. Inline code in tinted pill backgrounds — like VS Code token highlighting.
- Grid: features alternate 2-column (text + code) and 3-column icon grids. Pricing: 3 cards, middle highlighted with a ring of primary color.
- Decorations: subtle grid background pattern (style.css). Badge pills. Check marks in comparison lists — green for included, muted for excluded.
- Buttons: \`bg-primary text-white rounded-button\`. "Get Started" / "View Docs" pattern — always two CTAs, technical and non-technical.
- style.css: fine-line grid background pattern using repeating-linear-gradient at 1px width with 5% opacity, terminal window title bar with flexbox dots (8px circles in red/amber/green), syntax highlighting with distinct colors for strings/keywords/comments/functions, code block line numbers in muted color with left border, pricing card highlight using box-shadow ring (0 0 0 2px primary), FAQ accordion with smooth max-height transitions and rotating chevron, dark section with radial-gradient spotlight effect behind CTA text.
- Vibe: Clerk, Resend, Neon, PlanetScale. Developer-trusted, technically credible — the design equivalent of clean documentation.`,
  },

  dashboardUI: {
    name: 'Dashboard UI',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#6366F1',
            sidebar: '#111827',
            surface: '#F9FAFB',
            card: '#FFFFFF',
            heading: '#111827',
            body: '#4B5563',
            muted: '#9CA3AF',
            border: '#E5E7EB',
            success: '#10B981',
            warning: '#F59E0B',
            danger: '#EF4444',
          },
          fontFamily: {
            body: ['"Inter"', 'system-ui', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '8px',
            button: '6px',
          },
          boxShadow: {
            card: '0 1px 2px rgba(0,0,0,0.05)',
          },
        },
      },
    },
    prompt: `Use a DASHBOARD / ADMIN UI style.
- Layout: fixed left sidebar (\`w-64 bg-sidebar\`) + top header bar + scrollable main content area — the classic cockpit layout where everything is within reach. Sidebar: logo at top, grouped nav with icons, user avatar at bottom. Main: page title + breadcrumbs, then card grid. Full-width, no max-width — uses every pixel.
- Colors: \`bg-sidebar\` — dark charcoal, like a control panel bezel — with \`text-white\`. \`bg-surface\` — cool light gray, easy on the eyes for hours of use. \`bg-card\` (white) for cards that pop forward. \`text-primary\` / \`bg-primary\` — indigo, calm but noticeable — for active states. Status colors that communicate instantly: \`text-success\` (green, all clear), \`text-warning\` (amber, attention needed), \`text-danger\` (red, act now). \`border-border\` for card edges — barely visible structure.
- Typography: \`font-body\` (Inter — born for UI). Small-medium sizing: body \`text-sm\`, labels \`text-xs\`, headings \`text-lg\`. \`font-mono\` for data values — numbers that snap to a grid. Dense but readable — information-rich without feeling cramped.
- Components: stat cards (icon + number + label + trend arrow — a story in 4 elements). Data tables with \`even:bg-gray-50\` zebra striping. Status badges (\`rounded-full px-2 py-0.5 text-xs\`) — little traffic lights. Activity feed with timestamps.
- Cards: \`bg-card border border-border rounded-card shadow-card p-4\`. \`gap-4\` between cards. 2-4 column responsive grid.
- Decorations: MINIMAL — in a dashboard, clarity IS the decoration. Clean dividers. Subtle hover on table rows and nav items. Active nav: \`bg-primary/10 text-primary\` pill or left border accent.
- Buttons: small, \`bg-primary text-white rounded-button\`. Secondary: \`border border-border\`. Destructive: \`text-danger border-danger\`.
- style.css: subtle gradient glow behind stat cards using box-shadow with primary color at 5% opacity, animated progress bars with cubic-bezier(0.4, 0, 0.2, 1) easing that feel alive, pulsing status indicators with expanding box-shadow animation (green ring ripple for active, amber pulse for warnings), sidebar gradient from bg-sidebar to slightly darker creating depth, custom scrollbar styling (::-webkit-scrollbar with 6px width, rounded thumb in muted color), table row hover with smooth background-color transition, smooth sidebar nav item transitions with left-border that slides in, sparkline-style mini charts in stat cards using CSS gradients.
- Vibe: Stripe Dashboard, Linear app, Vercel Dashboard. Professional tool aesthetic — the design disappears and the data speaks.`,
  },

  ecommerce: {
    name: 'E-commerce',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#111111',
            accent: '#E84D3D',
            surface: '#FFFFFF',
            'surface-alt': '#FDF8F3',
            heading: '#111111',
            body: '#555555',
            muted: '#999999',
            border: '#EEEEEE',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
            button: '8px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.06)',
            hover: '0 8px 24px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use an E-COMMERCE / PRODUCT style.
- Layout: full-width. Sticky top nav: logo, search bar (prominent, centered — the storefront window), cart icon with badge. Hero: full-width promotional banner — cinematic, editorial, the product as art. Below: categories grid, featured products grid, testimonials, newsletter, footer.
- Colors: \`bg-surface\` (white, gallery-wall clean) base. \`text-primary\` / \`bg-primary\` — near-black, the authority of a price tag — for prices/headings. \`bg-accent\` / \`text-accent\` — warm coral, inviting as a come-in sign — for CTAs. \`text-body\` for descriptions. \`bg-surface-alt\` — warm cream like unbleached linen — for warm sections. \`border-border\` — whisper-thin, never competing with the product.
- Typography: \`font-heading\` for UI. Prices: \`font-semibold text-lg\` tabular numerals — numbers that snap into neat columns. Category headers: \`uppercase tracking-widest\` — labels in a boutique. Body: \`font-normal text-body\` — descriptions that let the product speak.
- Product cards: \`bg-surface rounded-card shadow-card\` with hover \`shadow-hover\`. Product image area (generous, let the product breathe), name, short description, price, "Add to Cart" button. Hover: image scale 1.03 — a gentle lean-in, like picking something up off a shelf.
- Navigation: sticky, search bar first-class. Cart icon with item count badge — a subtle reminder of intent. Breadcrumbs for wayfinding.
- Grid: \`grid grid-cols-2 md:grid-cols-4 gap-6\`. "Shop by category" image + label cards.
- Decorations: minimal — the products ARE the decoration. Trust badges. Star ratings in amber. "Sale" / "New" badges positioned absolutely.
- Buttons: "Add to Cart" \`bg-accent text-white rounded-button\` — warm, inviting, the most important button on the page. Quantity +/- buttons.
- style.css: product image hover zoom with overflow hidden and transform scale transition (0.4s cubic-bezier), sticky nav with backdrop-filter blur and subtle bottom shadow that appears on scroll, Sale badge with slight rotation (-3deg) and bold background, product card hover that lifts with simultaneous shadow-hover and translateY transition, search bar with expanding width on focus using transition, cart badge with scale bounce animation on item add, image skeleton loading placeholder using animated linear-gradient shimmer, smooth category card overlay text with text-shadow for readability over images.
- Vibe: Apple Store, Aesop, Everlane. Product is the hero — design is invisible, but the craft is everywhere.`,
  },

  portfolio: {
    name: 'Portfolio',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#FAFAF8',
            heading: '#1A1A1A',
            body: '#555555',
            accent: '#4A6FA5',
            muted: '#BBBBBB',
          },
          fontFamily: {
            heading: ['"Instrument Serif"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '6px',
          },
          boxShadow: {
            card: 'none',
            hover: '0 8px 30px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a PORTFOLIO / PERSONAL SHOWCASE style — the kind of site that wins Awwwards. It should feel like walking through a quiet, impeccably curated gallery: hushed, confident, every element placed with deliberate intention.
- Layout: single-column, \`max-w-4xl mx-auto\`. Minimal nav (name left, 3-4 text links right). Hero: large name, one-line description. Below: selected work as large case study cards (full-width, stacked). About. Contact. Minimal footer.
- Colors: \`bg-surface\` (off-white, like heavy uncoated stock paper). \`text-heading\` (near-black) for text. \`text-accent\` only for links and hover states — used sparingly like a single accent wall in a white room. \`text-muted\` for secondary info.
- Typography: \`font-heading\` (Instrument Serif, display serif) for name/headings — elegant, editorial, the typographic equivalent of a firm handshake. \`font-body\` (Inter, sans-serif) for body/nav. Large headings (\`text-4xl\` for name). \`leading-relaxed\` body. \`uppercase tracking-widest text-xs\` for section labels that whisper rather than shout.
- Case study cards: full-width, stacked vertically. Large image area, project title, one-line role, year. \`py-20\`+ between cards. Hover: subtle \`shadow-hover\`.
- Spacing: extreme — \`py-32\`+ between sections. \`py-20\` between cards. The whitespace communicates confidence. Let the work breathe like art in a museum.
- Decorations: ALMOST NONE. Thin \`border-t border-muted\`. Small "01, 02, 03" section numbers in \`text-muted\`. NO icons, NO emoji.
- Buttons: text links with \`hover:border-b border-accent\` underline animation. "View project →" as text link.
- style.css should be RICH and creative: smooth scroll-triggered fade-in and slide-up animations on case study cards using @keyframes with opacity and translateY, underline expand transition that grows from left to right on hover using ::after pseudo-element with scaleX transform, subtle parallax depth on hero name with a faint text-shadow that shifts on scroll, image reveal animations where project images clip-path from 0% to full on scroll, custom cursor style that changes to a soft circle on hoverable elements, smooth 300ms cubic-bezier transitions on all interactive elements for that buttery gallery feel.
- Vibe: Awwwards featured, award-winning designer portfolio. Confidence through restraint. The design equivalent of a perfectly tailored black suit.`,
  },

  documentation: {
    name: 'Documentation',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#3B82F6',
            surface: '#FFFFFF',
            sidebar: '#F8FAFC',
            heading: '#111827',
            body: '#374151',
            muted: '#6B7280',
            border: '#E5E7EB',
            code: '#1E293B',
            'info-bg': '#EFF6FF',
            'warn-bg': '#FFFBEB',
            'danger-bg': '#FEF2F2',
            'success-bg': '#F0FDF4',
          },
          fontFamily: {
            body: ['"Inter"', 'system-ui', 'sans-serif'],
            code: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '8px',
            code: '6px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a DOCUMENTATION / KNOWLEDGE BASE style — the kind of docs developers actually enjoy reading. It should feel like a well-organized workshop: everything has its place, tools are within reach, and the craftsmanship is evident in every detail.
- Layout: three-panel — left sidebar nav (\`w-60 bg-sidebar\` fixed), center content (\`max-w-prose\`), right TOC sidebar (\`w-48\` sticky). On mobile: sidebar becomes hamburger, TOC hidden.
- Sidebar: grouped nav sections. Section headers \`uppercase text-xs font-bold tracking-wider\`. Active page: \`bg-primary/10 text-primary\`. Search input at top with a focused glow.
- Colors: \`bg-surface\` content area (clean, paper-white). \`bg-sidebar\` for nav (a whisper of cool gray). \`text-primary\` for links and active states — the guiding thread through the content. \`bg-code\` for code blocks (deep, like a terminal at midnight). Callout boxes: \`bg-info-bg\`, \`bg-warn-bg\`, \`bg-danger-bg\`, \`bg-success-bg\` with left \`border-l-4\` — color-coded signals that catch the eye without breaking flow.
- Typography: body \`text-base leading-relaxed\` \`max-w-prose\` — readable for hours without fatigue. \`font-code text-sm\` for code. Headings \`font-semibold\` with anchor links.
- Content: code blocks with copy button and language label on \`bg-code rounded-code\`. Inline code \`bg-primary/10 rounded px-1.5 py-0.5 text-sm font-code\`. Callout boxes. Tables. Lists with comfortable spacing.
- TOC (right): tracks current section. \`text-sm text-muted\`, \`text-primary\` on active.
- Navigation: breadcrumbs. Previous/Next links at bottom.
- Decorations: NONE. Content IS the design. The polish is in the micro-interactions.
- style.css should be RICH and creative: sidebar fixed positioning with smooth scroll behavior, TOC active section tracking with a sliding left-border indicator that animates between items using translateY transitions, code blocks with syntax highlighting and a subtle inner glow on hover, smooth copy-button feedback animation with a checkmark that fades in and scales, search input with an expanding focus ring using box-shadow transition, custom scrollbar with thin track and primary-colored thumb for the sidebar, callout boxes with a subtle left-border color pulse animation on first appearance.
- Vibe: Stripe Docs, Tailwind CSS Docs, Next.js Docs. Gold standard developer docs — where reading documentation feels like a pleasure, not a chore.`,
  },

  healthcare: {
    name: 'Healthcare',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#0D9488',
            accent: '#F97316',
            surface: '#FFFFFF',
            'surface-alt': '#F0FDFA',
            heading: '#1E293B',
            body: '#64748B',
            muted: '#94A3B8',
            border: '#E2E8F0',
          },
          fontFamily: {
            heading: ['"Nunito"', 'sans-serif'],
            body: ['"DM Sans"', 'sans-serif'],
          },
          borderRadius: {
            card: '16px',
            button: '12px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.06)',
            hover: '0 6px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a HEALTHCARE / WELLNESS style — the kind of site that lowers your blood pressure just by looking at it. It should feel like stepping into a modern clinic with natural light pouring through floor-to-ceiling windows: calm, warm, immediately reassuring.
- Layout: \`max-w-7xl mx-auto\`. Clean and calming. Hero: reassuring headline, warm subtext, clear CTA ("Book Appointment"). Services grid. Trust section. Testimonials. FAQ. Contact.
- Colors: \`bg-surface\` (white, airy) and \`bg-surface-alt\` (soft teal tint, like sea glass held to light) alternating. \`bg-primary\` / \`text-primary\` (calming teal — think ocean at dawn). \`bg-accent\` (warm coral) for CTAs that feel inviting, not urgent. \`text-heading\` (warm dark), \`text-body\` (warm gray).
- Typography: \`font-heading\` (Nunito, friendly — every letterform has soft, rounded terminals that feel approachable). \`font-body\` (DM Sans, approachable). \`font-semibold\` to \`font-bold\` for headings. \`leading-relaxed\`.
- Trust: doctor cards with photo placeholder, name, specialty. Certification badges. Patient count. Insurance logos.
- Cards: \`rounded-card shadow-card border border-border p-6\`. Service cards with icon (soft circle background) + title + description. Cards should feel like smooth river stones — rounded, warm, comfortable to hold.
- Decorations: soft curved section dividers (SVG wave in style.css). \`rounded-card\` everywhere. Everything says "safe."
- Buttons: \`bg-primary text-white rounded-button shadow-card\`. "Book Now" language. Hover: \`shadow-hover\`.
- style.css should be RICH and creative: organic SVG wave section dividers that flow like gentle breathing between content areas, soft radial gradient blobs in teal and coral at 8-12% opacity floating behind hero and trust sections, gentle pulse animation on the primary CTA button using box-shadow that expands and fades like a heartbeat, smooth 250ms ease transitions on all cards with a slight upward float on hover, decorative ::before pseudo-elements on service cards creating a soft gradient arc above each icon, custom scrollbar with rounded teal thumb on white track, loading skeleton shimmer animation with a warm teal-to-white gradient sweep.
- Vibe: One Medical, Hims, Headspace. Clean, trustworthy, human. The digital equivalent of a reassuring hand on your shoulder.`,
  },

  fintech: {
    name: 'Fintech',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#10B981',
            surface: '#FFFFFF',
            'surface-alt': '#F8FAFC',
            dark: '#0C1222',
            heading: '#0F172A',
            body: '#475569',
            muted: '#94A3B8',
            border: '#E2E8F0',
            danger: '#EF4444',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          borderRadius: {
            card: '16px',
            button: '10px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.08)',
            hover: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    prompt: `Use a FINTECH / FINANCIAL style — the kind of site that makes you feel smarter about money just by visiting. It should feel like the cockpit of a precision instrument: every number perfectly aligned, every interaction crisp and confident, data presented with the clarity of a Swiss watch face.
- Layout: \`max-w-7xl mx-auto\`. Hero: headline about control/money, app screenshot mockup. Features with data visuals. Security section. Pricing. Testimonials. \`bg-dark\` hero/accent sections.
- Colors: \`bg-dark\` (deep navy, like a banker's suit at dusk) hero. \`bg-surface\` and \`bg-surface-alt\` for content. \`text-primary\` / \`bg-primary\` (fintech green — the color of growth, optimism, positive returns) for positive numbers and CTAs. \`text-danger\` for negative. \`border-border\`.
- Typography: \`font-heading\` and \`font-body\` (Inter — chosen for its exceptional tabular figures and neutral authority). Tabular numerals (\`tabular-nums\` via style.css). \`font-mono\` for amounts that need to feel data-driven. \`font-semibold\` to \`font-bold\` for headings.
- Data elements: transaction rows with alternating subtle backgrounds. Balance cards with large number + trend arrow. Simple CSS bar charts. Card mockup: \`bg-dark rounded-card\` with card details.
- Cards: \`bg-surface shadow-card border border-border rounded-card p-6\`. Some \`bg-dark\` cards for premium feel.
- Security: shield icons, encryption badges, "Bank-level security" in badge pills.
- Buttons: \`bg-primary text-white rounded-button\`. "Get Started Free" / "Open Account".
- style.css should be RICH and creative: tabular-nums font-variant for perfectly aligned columns of numbers, animated gradient line accents that shimmer subtly across card tops like a holographic credit card, trend arrows with smooth count-up number animations using @keyframes, a faint radial gradient glow of primary green behind the hero balance display, transaction rows with staggered slide-in animations on scroll, card mockup with a floating 3D tilt effect using perspective and rotateY on hover, subtle dot-grid background pattern at 3% opacity on dark sections, progress bars that fill with a smooth cubic-bezier easing.
- Vibe: Mercury, Wise, Revolut, Brex. Precision, clarity, control. Every pixel earns trust.`,
  },

  media: {
    name: 'Media',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#111111',
            accent: '#E84D3D',
            surface: '#FFFFFF',
            'surface-alt': '#FAFAFA',
            heading: '#111111',
            body: '#555555',
            muted: '#999999',
            border: '#EEEEEE',
          },
          fontFamily: {
            heading: ['"Playfair Display"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '10px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.06)',
            hover: '0 6px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a MEDIA / CONTENT PLATFORM style — the kind of site where you lose an hour reading and don't regret it. It should feel like a beautifully typeset magazine that happens to be digital: the typography draws you in, the layout guides your eye, and every piece of content feels curated and worth your time.
- Layout: full-width. Top nav: logo, category links, search, sign-in. Hero: featured content card (large image area with gradient overlay + title + badge). Below: content grid, category filter pills, trending sidebar. Newsletter signup.
- Colors: \`bg-surface\` (white) or \`bg-surface-alt\`. \`text-primary\` / \`text-heading\` (near-black) for titles. \`text-body\` for metadata. Category badges in soft tinted colors. \`text-accent\` for highlights.
- Typography: TYPOGRAPHY-FORWARD — this is where the design lives. Headlines: \`font-heading\` (Playfair Display, serif, bold — each headline should feel like a newspaper masthead, commanding attention with elegant authority). Body: \`font-body\` (Inter) \`text-base leading-relaxed\`. Metadata: \`text-xs uppercase tracking-widest text-muted\` — quiet, deferential to the content.
- Content cards: image area with category badge overlaid. \`font-heading font-bold\` headline, excerpt, author + date + read time. \`rounded-card shadow-card hover:shadow-hover\`.
- Grid: \`grid grid-cols-1 md:grid-cols-3 gap-6\`. Featured card \`md:col-span-2\`.
- Decorations: minimal. Category pills (\`rounded-full px-3 py-1 text-sm\`). Author avatar circles. Bookmark icon.
- Buttons: mostly text links. Newsletter: email input + filled button.
- style.css should be RICH and creative: gradient overlay on hero images using a multi-stop linear-gradient from transparent to deep black for dramatic text legibility, category badge tinted backgrounds with subtle backdrop-blur for a frosted pill effect, content cards with a smooth image zoom transition (scale 1.03) on hover contained by overflow-hidden, reading progress bar fixed at top of viewport that fills with accent color as user scrolls, ::after pseudo-element on featured card creating a subtle vignette shadow around the image edges, smooth staggered fade-in animations on the content grid using animation-delay, bookmark icon with a satisfying fill animation on click using @keyframes.
- Vibe: Medium, Substack, The Verge. Content is the product. The design is invisible until you notice how good everything feels.`,
  },

  government: {
    name: 'Government',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#1D70B8',
            surface: '#FFFFFF',
            'surface-alt': '#F3F2F1',
            heading: '#1D1D1D',
            body: '#1D1D1D',
            muted: '#505A5F',
            border: '#B1B4B6',
          },
          fontFamily: {
            body: ['"Noto Sans"', 'system-ui', 'sans-serif'],
          },
          borderRadius: {
            card: '4px',
            button: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use a GOVERNMENT / INSTITUTIONAL / ACCESSIBLE style — the kind of site that treats every single visitor with dignity and respect. It should feel like a well-run public library: welcoming to everyone regardless of ability, immediately useful, with no barriers between people and the information they need.
- Layout: \`max-w-4xl mx-auto\`. Simple, predictable. Top: banner with institution name. Nav: horizontal, text-only. Hero: clear headline, brief description, prominent action buttons. Task cards ("Apply for...", "Find your..."). Footer: legal links, accessibility statement.
- Colors: high-contrast WCAG AAA — no one should ever have to squint. \`bg-surface\` (white). \`text-heading\` / \`text-body\` (true black). \`bg-primary\` / \`text-primary\` for links, buttons, focus — the civic blue of trust and authority. \`bg-surface-alt\` for alternate sections. \`border-border\`.
- Typography: \`font-body\` (Noto Sans). Body: \`text-lg\` minimum (accessibility). \`leading-relaxed\`. Headings: \`font-bold\`. NO light weights (never below \`font-normal\`). NO italics for body. Left-aligned.
- Accessibility: CRITICAL. Visible \`focus:ring-4 focus:ring-primary\` on all interactive elements. Skip-to-content link. All form fields have visible labels. Error messages with icon. Descriptive link text. \`min-h-[44px] min-w-[44px]\` touch targets.
- Task cards: \`bg-surface border border-border rounded-card p-4\`. Clear title, description, right arrow. Organized by user need.
- Decorations: NONE. No icons unless informational. No animations. Every element earns its place.
- Buttons: \`bg-primary text-white rounded-button min-h-[48px] px-6 font-bold\`. NO ghost buttons — every button must be obviously a button.
- style.css should be RICH and purposeful (creativity serves accessibility here): bold focus ring styling with 3px offset outline in primary blue so keyboard users always know exactly where they are, skip-to-content link that smoothly slides down from the top when focused, comprehensive print styles that reformat layout to single-column and show URLs after links, form validation states with clear color-coded left borders and icon indicators, smooth 150ms transitions on button hover states for responsive feedback without disorienting motion, high-contrast selection/highlight colors using ::selection, reduced-motion media query that disables all transitions for users who prefer reduced motion.
- Vibe: GOV.UK, USDS. Radically simple. Aggressively clear. Designed for EVERYONE. The beauty is in the unwavering commitment to inclusion.`,
  },

  gradient: {
    name: 'Gradient / Aurora',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#111827',
            heading: '#FFFFFF',
            body: '#D1D5DB',
            accent: '#8B5CF6',
            glass: 'rgba(255,255,255,0.1)',
            'glass-border': 'rgba(255,255,255,0.15)',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '20px',
            pill: '9999px',
          },
          boxShadow: {
            card: '0 8px 32px rgba(0,0,0,0.2)',
            glow: '0 0 40px rgba(139,92,246,0.3)',
          },
        },
      },
    },
    prompt: `Use a GRADIENT / AURORA style — the kind of site that makes you feel like you're floating through the northern lights. It should feel like liquid color in motion: ethereal, luminous, mesmerizing. Every section transition should feel like wading deeper into a pool of light.
- Layout: \`max-w-7xl mx-auto\`. Spacious sections (\`py-24\`+). Hero takes full viewport with centered content. NO harsh section boundaries — gradient backgrounds flow between sections.
- Colors: rich gradient backgrounds are THE defining feature — they should feel alive, like bioluminescent deep-sea creatures or ink dropped in water. Define multi-stop gradient classes in style.css (purple → pink → orange, or blue → cyan → green). \`text-heading\` (white) on dark gradients. \`text-body\` on lighter areas.
- Gradient techniques (ALL in style.css): layered conic-gradient, radial-gradient, linear-gradient. Animate subtly with @keyframes. Add noise texture overlay at 3-5% opacity.
- Typography: \`font-heading\` and \`font-body\` (Inter, clean sans-serif). \`text-heading\` or \`text-body\` depending on background. Headlines \`text-4xl font-semibold\`. Let gradients be the star.
- Cards: glassmorphism over gradients — \`bg-glass border border-glass-border rounded-card shadow-card backdrop-blur-xl\`.
- Decorations: floating gradient orbs (positioned radial-gradients in style.css). Grain texture overlay. \`shadow-glow\` on key elements.
- Buttons: semi-transparent white or gradient-filled. \`rounded-pill\`. Glow on hover.
- style.css should be RICH and creative — this is THE style where CSS does the heavy lifting: layered multi-stop gradient backgrounds using stacked linear-gradient and radial-gradient with 4-5 color stops each, floating gradient orbs as positioned absolute pseudo-elements with large radial-gradients that slowly drift using @keyframes translateX/translateY animation over 15-20s, SVG noise/grain texture overlay at 3-5% opacity for organic depth, gradient border trick using background-clip with padding-box and border-box on a gradient background, smooth gradient color-shift animations using @keyframes that rotate hue over 8-12s, glassmorphism cards with backdrop-filter blur and subtle inner glow using inset box-shadow, conic-gradient decorative elements that slowly rotate.
- Vibe: Stripe's gradients, Linear's color washes, Vercel's aurora. Modern, premium, atmospheric. The kind of site people screenshot and share because the colors alone are breathtaking.`,
  },

  claymorphism: {
    name: 'Claymorphism',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#FEF3E7',
            coral: '#FFB4A2',
            lavender: '#B8A9C9',
            mint: '#98D8C8',
            butter: '#F7DC6F',
            sky: '#89CFF0',
            heading: '#2D3436',
            body: '#4A4A4A',
          },
          fontFamily: {
            heading: ['"Nunito"', 'sans-serif'],
            body: ['"Quicksand"', 'sans-serif'],
          },
          borderRadius: {
            card: '28px',
          },
          boxShadow: {
            clay: 'inset 4px 4px 8px rgba(255,255,255,0.6), 12px 12px 24px rgba(0,0,0,0.1), 0 0 0 4px rgba(255,255,255,0.3)',
            'clay-hover': 'inset 4px 4px 8px rgba(255,255,255,0.6), 16px 16px 32px rgba(0,0,0,0.12), 0 0 0 4px rgba(255,255,255,0.3)',
          },
        },
      },
    },
    prompt: `Use a CLAYMORPHISM / 3D CLAY style — the kind of interface that looks like it was sculpted from soft modeling clay and placed on a warm peach table. It should feel irresistibly tactile: every element looks like you could reach into the screen and squish it between your fingers. Playful, dimensional, delightful.
- Layout: centered, \`max-w-6xl mx-auto\`. Card-based with generous \`gap-8\`. Hero with large illustration area. Feature cards in \`grid grid-cols-1 md:grid-cols-3\`.
- Background: soft warm \`bg-surface\` (peach, like a potter's workbench dusted with terracotta). NOT white. This creates the "surface" the clay objects sit on.
- 3D Clay effect: THE KEY TECHNIQUE. Every card uses \`shadow-clay rounded-card\`. On hover: \`shadow-clay-hover\` with slight \`hover:-translate-y-1\`.
- Colors: soft matte pastels for card backgrounds — \`bg-coral\`, \`bg-lavender\`, \`bg-mint\`, \`bg-butter\`, \`bg-sky\` — like a handful of pastel-colored Play-Doh. Each card a different pastel. \`text-heading\` for readability.
- Typography: \`font-heading\` and \`font-body\` (Nunito/Quicksand, rounded friendly). \`font-medium\` to \`font-bold\`.
- Icons/graphics: describe blob shapes or rounded icons that look clay-sculpted. Apply same \`shadow-clay\` treatment.
- Buttons: \`rounded-card shadow-clay\` with soft pastel fill. Hover: \`hover:-translate-y-0.5 hover:shadow-clay-hover\`. Feels like pressing soft rubber.
- style.css should be RICH and creative: smooth 300ms cubic-bezier bounce transitions on all hover states so cards feel like they spring back when released, subtle wobble @keyframes animation on hero illustration elements that makes them feel alive and jiggly, ::before pseudo-elements on cards creating a soft inner highlight gradient from top-left (white at 15% opacity) to simulate the rounded clay light reflection, button press effect using translateY(2px) and reduced shadow on :active to feel like pushing into soft material, floating blob background shapes using large border-radius with 8 values for organic forms that slowly morph using @keyframes, soft pastel gradient backgrounds on section transitions, card entrance animations with a gentle scale-up and fade-in from 0.9 to 1.0.
- Vibe: children's educational app, friendly SaaS, iOS 16+. Soft, tactile, approachable. You want to squish the interface. The design equivalent of a warm, friendly hug.`,
  },

  vaporwave: {
    name: 'Vaporwave / Synthwave',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#1a0a2e',
            primary: '#ff006e',
            accent: '#00ffff',
            yellow: '#ffbe0b',
            orange: '#ff8c00',
            heading: '#FFFFFF',
            body: '#D4A0FF',
            chrome: '#c0c0c0',
          },
          fontFamily: {
            heading: ['"Orbitron"', 'sans-serif'],
            body: ['"Exo 2"', 'sans-serif'],
          },
          borderRadius: {
            card: '4px',
          },
          boxShadow: {
            neon: '0 0 10px #ff006e, 0 0 20px #ff006e, 0 0 40px #ff006e',
            'neon-cyan': '0 0 10px #00ffff, 0 0 20px #00ffff, 0 0 40px #00ffff',
          },
        },
      },
    },
    prompt: `Use a VAPORWAVE / SYNTHWAVE / 80s RETRO-FUTURISM style — the kind of site that feels like driving a DeLorean through a neon-drenched Miami sunset while synthwave pulses through the speakers. It should feel electric, nostalgic, and impossibly cool: chrome reflections, hot pink neon bleeding into the night, a perspective grid stretching to infinity beneath a gradient sky.
- Layout: full-width with dramatic sections. Hero spans full viewport centered over the signature grid/sunset. \`max-w-6xl mx-auto\` for text.
- Colors: \`bg-surface\` (deep dark purple, the color of a twilight sky just before the stars appear). Accent gradients in style.css: \`text-primary\` (hot pink that burns like neon tubes) → \`text-orange\` → \`text-yellow\`. \`text-accent\` (electric cyan, crackling with energy). \`text-chrome\` (silver, like polished metal catching light).
- Signature elements (ALL in style.css):
  - Perspective grid receding to horizon (perspective + rotateX transforms, repeating-linear-gradient)
  - Sunset: large radial-gradient (yellow → orange → pink → purple)
  - Neon glow: \`shadow-neon\` and \`shadow-neon-cyan\` for text and boxes
  - Chrome text: linear-gradient with metallic colors + background-clip
- Typography: \`font-heading\` (Orbitron, retro display) for headlines with \`shadow-neon\`. \`font-body\` (Exo 2, geometric) for body. Large hero text (\`text-6xl\`+).
- Decorations: palm tree silhouettes (dark shapes), geometric triangles, scanlines overlay (style.css repeating-linear-gradient).
- Buttons: \`border border-accent text-accent shadow-neon-cyan\`. Hover: glow intensifies. Retro feel.
- style.css should be RICH and creative — go ALL OUT here: perspective grid floor using repeating-linear-gradient with perspective and rotateX transforms that feels like it stretches to the horizon, large sunset radial-gradient (yellow center → orange → hot pink → deep purple edges) as the hero backdrop, neon glow @keyframes that pulse and flicker subtly like real neon tubes using alternating box-shadow intensities, chrome text effect using linear-gradient with silver/white/gray metallic stops and background-clip text, scanline overlay using repeating-linear-gradient with 2px transparent/1px rgba lines at 5% opacity, palm tree silhouette shapes as ::before pseudo-elements, neon border animations that chase around card edges using @keyframes with background-position on gradient borders, text flicker animation that briefly dims opacity to simulate old CRT monitors.
- Vibe: 1980s retrofuturism, Miami Vice, Blade Runner sunsets, a e s t h e t i c. The internet's coolest fever dream.`,
  },

  darkTech: {
    name: 'Dark Tech',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#0A0A0B',
            card: '#18181B',
            primary: '#3B82F6',
            heading: '#FFFFFF',
            body: '#9CA3AF',
            'body-bright': '#E5E7EB',
            muted: '#4B5563',
            border: '#27272A',
          },
          fontFamily: {
            heading: ['"Inter"', 'system-ui', 'sans-serif'],
            body: ['"Inter"', 'system-ui', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
            button: '8px',
          },
          boxShadow: {
            card: 'none',
            glow: '0 0 20px rgba(59,130,246,0.1)',
          },
        },
      },
    },
    prompt: `Use a DARK TECH / MODERN DARK MODE style — the kind of interface you'd happily stare at for a 12-hour coding session. It should feel like a command center at 2 AM: dark, focused, with just enough light to guide your eye. The darkness isn't empty — it's alive with subtle depth, faint glows, and precision-placed accents that make information effortlessly scannable.
- Layout: \`max-w-7xl mx-auto\`. Clean and spacious. Hero with left-aligned headline + right-side visual. Features in clean grid. Generous \`py-20\` to \`py-24\` between sections. Full-width dark, no alternating.
- Colors: \`bg-surface\` (dark gray, NOT pure black — pure black feels like staring into a void, this should feel like brushed graphite) throughout. \`bg-card\` for card backgrounds (one shade lighter, creating subtle layers of depth). \`text-heading\` (white) for headlines. \`text-body\` (gray) for secondary. \`text-body-bright\` for primary body. ONE \`text-primary\` / \`bg-primary\` accent (blue — a single point of living color in a monochrome world) for interactive elements only. \`border-border\`.
- Subtle lighting: faint radial gradient of \`bg-primary\` at 5% opacity behind hero (style.css). \`border border-border\` on cards. \`shadow-glow\` on hover.
- Typography: \`font-heading\` and \`font-body\` (Inter). \`text-heading font-semibold\` to \`font-bold\` for headlines. \`text-body\` for secondary.
- Cards: \`bg-card border border-border rounded-card\`. Hover: \`hover:border-primary/30 hover:shadow-glow\` transition.
- Decorations: minimal. Thin lines. Subtle dot grid in hero (style.css, 3% opacity). Code blocks with syntax highlighting.
- Buttons: \`bg-primary text-white rounded-button\`. Secondary: \`border border-border text-body hover:bg-card\`.
- style.css should be RICH and creative: subtle radial gradient light source behind the hero in primary blue at 5-8% opacity that creates a sense of depth like moonlight through fog, dot grid background pattern using radial-gradient with 1px dots at 3% opacity for texture, code blocks with syntax highlighting and a faint top-border gradient accent in primary blue, card hover transitions with border-color shifting to primary/30 and a soft blue glow box-shadow that fades in over 200ms, smooth ::after pseudo-element on cards creating a subtle gradient sheen on hover that sweeps across the surface, custom dark scrollbar with rounded thumb matching border color, section dividers using a faint horizontal gradient line that fades from transparent to border color and back, focus ring styling with primary blue glow for keyboard navigation.
- Vibe: GitHub dark mode, Discord, Spotify, Linear. Professional dark UI for 10-hour sessions. The kind of interface that makes you feel like a hacker in the best possible way.`,
  },

  pastel: {
    name: 'Pastel / Soft',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            pink: '#FFE4E9',
            lavender: '#E6E0F8',
            mint: '#C7F0DB',
            butter: '#FFF8E7',
            sky: '#D4EAFF',
            peach: '#FFE5D9',
            surface: '#FEFEFE',
            heading: '#444444',
            body: '#666666',
          },
          fontFamily: {
            heading: ['"Nunito"', 'sans-serif'],
            body: ['"DM Sans"', 'sans-serif'],
          },
          borderRadius: {
            card: '24px',
            pill: '9999px',
          },
          boxShadow: {
            card: '0 4px 16px rgba(200,180,220,0.2)',
            hover: '0 8px 24px rgba(200,180,220,0.3)',
          },
        },
      },
    },
    prompt: `Use a PASTEL / SOFT / GEN-Z style — the kind of site that feels like sinking into a cloud made of cotton candy. It should feel dreamy, gentle, and endlessly cozy: soft edges everywhere, colors that look like they were mixed with cream, and an overall warmth that wraps around you like a cashmere blanket.
- Layout: \`max-w-6xl mx-auto\`. Rounded everything. Cards in \`gap-8\`. Sections with \`py-24\`. Hero centered. Gentle and breathable.
- Colors: soft pastels — \`bg-pink\`, \`bg-lavender\`, \`bg-mint\`, \`bg-butter\`, \`bg-sky\`, \`bg-peach\` — like a watercolor palette left out in the sun, each hue faded to its sweetest, most delicate version. \`bg-surface\` (soft white). \`text-heading\` (soft charcoal, NOT black — black would feel harsh here, like shouting in a library). \`text-body\` (gentle gray). Low contrast — everything gentle.
- Rounded shapes: \`rounded-card\` (24px) on cards. \`rounded-pill\` for buttons and tags. Define blob shapes via style.css border-radius with 8 values. NO sharp corners.
- Typography: \`font-heading\` and \`font-body\` (Nunito/DM Sans, rounded friendly). \`font-medium\` for headings, \`font-normal\` for body. \`leading-relaxed\`.
- Decorations: floating blob shapes in pastels (style.css). Grain texture at 2-3% opacity. Small stars/sparkles (✦ ★ ♡) sparingly. \`shadow-card\` (tinted, not gray). Wavy section dividers.
- Cards: each a different pastel background (\`bg-pink\`, \`bg-lavender\`, etc.). \`rounded-card shadow-card\`. Hover: \`hover:shadow-hover hover:-translate-y-1\`.
- Buttons: \`rounded-pill\`, soft pastel fill with darker text. Gentle hover.
- style.css should be RICH and creative: floating blob decorations using large border-radius with 8 asymmetric values that slowly morph shape using @keyframes over 10-15s creating a lava-lamp effect, wavy SVG section dividers between content areas in alternating pastel colors, grain texture overlay at 2-3% opacity for analog warmth, card hover animations with a gentle -translate-y-1 float and shadow expansion over 300ms ease-out, ::before pseudo-elements on cards adding a soft pastel gradient glow at the top edge, sparkle/star decorative elements that gently pulse opacity using @keyframes, custom scrollbar with a rounded pastel-pink thumb on a lavender track, smooth background-color transitions on buttons that feel like watercolors bleeding together.
- Vibe: Notion's softer pages, Glossier, Gen-Z brands. The design equivalent of a warm hug. Everything should feel like it was designed while listening to lo-fi beats.`,
  },

  handDrawn: {
    name: 'Hand-drawn / Sketch',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#FDF9F3',
            heading: '#333333',
            body: '#555555',
            rose: '#E8B4B8',
            sage: '#A3B18A',
            mustard: '#D4A574',
            blue: '#89A8B2',
          },
          fontFamily: {
            heading: ['"Caveat"', 'cursive'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
          },
          boxShadow: {
            card: '3px 3px 0 rgba(0,0,0,0.08)',
          },
        },
      },
    },
    prompt: `Use a HAND-DRAWN / SKETCH / DOODLE style — the kind of site that feels like opening someone's beloved Moleskine notebook. It should feel human, imperfect, and charming: like a creative friend sketched the whole design during a coffee shop afternoon, complete with little doodles in the margins and notes pinned at slightly crooked angles.
- Layout: \`max-w-5xl mx-auto\`. Slightly informal — elements can be rotated 1-2 degrees (style.css transforms). Hero with large illustrated-style headline. Cards arranged casually. Feels human-made.
- Colors: warm sketchbook palette — \`bg-surface\` (cream paper, like a page from a well-loved journal). \`text-heading\` (charcoal, like a soft pencil mark). Accent colors like colored pencils: \`bg-rose\`, \`bg-sage\`, \`bg-mustard\`, \`bg-blue\` — each one looking like it was carefully shaded in by hand, slightly uneven and all the more beautiful for it.
- Hand-drawn effects (in style.css):
  - Borders: wavy/irregular via SVG filter or dashed in organic patterns
  - Underlines: wavy SVG underlines under headings
  - Boxes: slightly irregular clip-path with imperfect coordinates
  - Decorations: squiggle lines, arrows, stars
- Typography: \`font-heading\` (Caveat, handwriting) for headlines — looks genuinely hand-written, like someone scrawled it with a felt-tip pen. \`font-body\` (Inter) stays readable for longer text. Annotations in \`font-heading\` scattered like margin notes.
- Decorations: doodle elements — stars, arrows, underlines, circles. Tape/sticky note effects on cards (style.css pseudo-elements). Paper texture overlay.
- Cards: look like paper cards — slight rotation, \`shadow-card\`, maybe "taped" corner via pseudo-element. \`bg-surface\` or pastel fills.
- Buttons: sketchy borders (style.css), muted color fill, drawn press effect on hover.
- style.css should be RICH and creative: wavy/irregular borders using SVG filters or dashed border patterns that feel hand-drawn, wavy SVG underlines under headings that wiggle like someone drew them freehand, card slight rotation transforms (rotate 1-2deg alternating) with transition back to 0 on hover for a playful "picked up" feeling, tape/sticky-note corner effects using ::before pseudo-elements with small rotated rectangles in a translucent tan color, paper grain texture overlay at 4-5% opacity using a noise SVG filter, irregular clip-path on image containers with slightly imperfect coordinates, button hover effect that adds a sketchy double-border and slight wiggle animation, pencil-stroke underline animation that draws itself from left to right on headings entering viewport.
- Vibe: Notion illustrations, Dropbox Paper, indie game aesthetics. Personal, warm, creative. The site should feel like it was made by a human, for humans, with visible love in every detail.`,
  },

  memphis: {
    name: 'Memphis',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            pink: '#FF6B9D',
            blue: '#0066FF',
            yellow: '#FFE600',
            mint: '#98FF98',
            coral: '#FF6F61',
            purple: '#9B59B6',
            surface: '#FFFFFF',
            heading: '#000000',
            body: '#333333',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            brutal: '4px 4px 0 #000000',
          },
        },
      },
    },
    prompt: `Use a MEMPHIS DESIGN style — loud, irreverent, a sugar rush of geometry and color that feels like a 1980s Italian design collective raided a candy store and redesigned the internet.
- Layout: dynamic and asymmetric. Elements at angles, overlapping, breaking the grid deliberately. Hero with a bold headline tilted at a cocky angle. Deliberate visual chaos that's still navigable — like a well-organized party. \`max-w-6xl mx-auto\` but elements break out and spill past boundaries. Every section should feel like it's vibrating with playful energy.
- Colors: bold, clashing, unapologetically joyful — \`bg-pink\`, \`bg-blue\`, \`bg-yellow\`, \`bg-mint\`, \`bg-coral\`, \`bg-purple\`, \`bg-heading\` (black for outlines). Large flat color blocks that collide and overlap. Backgrounds differ per section. The palette feels intentionally "wrong" in the best way — like mixing every crayon in the box.
- Signature shapes (style.css): squiggly lines (wavy SVG paths), dots/circles (polka dots), triangles, lightning bolts, terrazzo confetti patterns. ALL shapes have thick black outlines (2-3px stroke). These shapes aren't decoration — they ARE the design language.
- Typography: \`font-heading font-black\` for headlines. Mix sizes dramatically — whisper-to-shout scale. Text can be rotated, stacked vertically, reversed out of colored blocks. \`text-heading\` on bright backgrounds. Headlines should feel like they're shouting from a billboard.
- Patterns (style.css): terrazzo/confetti scattered shapes. Polka dots. Stripes at jaunty angles. Layer them — patterns on patterns.
- Cards: solid colored backgrounds with \`border-4 border-heading\`. Geometric shapes peeking from corners. Slight rotation (2-3deg). \`shadow-brutal\` for that chunky, punchy pop.
- Buttons: bold colored fills with \`border-4 border-heading shadow-brutal\`. Text in black or white. Buttons should feel like candy you want to press.
- style.css should be WILD: terrazzo confetti backgrounds using radial-gradient scatter and repeating patterns, polka dot overlays via radial-gradient, CSS rotation transforms on cards and headings (rotate 1-3deg), squiggly animated SVG line borders, geometric ::before/::after pseudo-elements (triangles, circles) positioned at card corners, hover animations that bounce elements with cubic-bezier(0.68, -0.55, 0.265, 1.55), thick black outline hover glow effects.
- Vibe: 1980s Memphis Group, Ettore Sottsass, bowling alley carpet, Saved by the Bell. Bold, playful, maximalist — the opposite of minimalism and proud of it.`,
  },

  scandinavian: {
    name: 'Scandinavian / Nordic',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#FAFAF8',
            'surface-alt': '#F5F3F0',
            heading: '#3D3D3D',
            body: '#666666',
            accent: '#A3B18A',
            muted: '#C4BFB6',
          },
          fontFamily: {
            heading: ['"Lora"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '10px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(60,50,40,0.06)',
          },
        },
      },
    },
    prompt: `Use a SCANDINAVIAN / NORDIC / HYGGE style — the digital equivalent of a sunlit room with pale birch floors, a wool throw draped over a linen sofa, and a ceramic mug of coffee steaming beside a single sprig of eucalyptus. Every pixel should breathe.
- Layout: clean, uncluttered, single-column dominant. \`max-w-4xl mx-auto\` for text. Generous whitespace — the silence between notes that makes the music. Sparse and intentional. Calm, considered. Each element placed with the deliberation of a curator arranging a gallery.
- Colors: natural, warm-neutral. \`bg-surface\` (warm white). \`text-heading\` (warm charcoal, NOT pure black). \`text-accent\` (dusty sage) for links/accents. \`bg-surface-alt\` for subtle section variety. \`border-muted\`.
- Natural materials feel: design evokes wood, wool, ceramic. Paper grain texture overlay (style.css, 2%). Warm shadows (\`shadow-card\` tinted brown). Tactile, natural.
- Typography: \`font-heading\` (Lora, elegant serif) for headlines. \`font-body\` (Inter, clean sans-serif) for body. Understated sizes (\`text-2xl\` to \`text-3xl\` headings). \`font-light\` to \`font-normal\`. \`tracking-wide\` on labels.
- Decorations: minimal but meaningful. Thin \`border-t border-muted\` rules. Negative space is a feature.
- Cards: \`bg-surface rounded-card shadow-card\`. Minimal or no border. Generous padding. Feel like paper or ceramic.
- Buttons: understated. \`border border-muted text-heading\` outlined. NOT attention-grabbing. Text links preferred.
- style.css should be SUBTLE but TEXTURED: paper grain noise texture overlay (subtle background-image SVG noise at 2-3% opacity), warm-tinted box-shadows using rgba with brown/amber base (never pure grey), gentle fade-in transitions on scroll (opacity + translateY with 0.6s ease), soft hover state transitions (0.3s ease color shifts, not abrupt), thin decorative ::after border lines on sections using border-image with subtle gradient, custom selection color in warm muted tones (::selection background).
- Vibe: IKEA showroom, Muji storefront, Kinfolk magazine spread, a Copenhagen cafe at golden hour. Calm, warm, "hygge" translated to digital. Cozy, intentional, quietly beautiful.`,
  },

  education: {
    name: 'Education / EdTech',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#2563EB',
            accent: '#F97316',
            success: '#10B981',
            surface: '#FFFFFF',
            'surface-alt': '#F8FAFC',
            heading: '#1E293B',
            body: '#475569',
            muted: '#94A3B8',
            border: '#E2E8F0',
          },
          fontFamily: {
            heading: ['"DM Sans"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
            pill: '9999px',
            button: '8px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.08)',
            hover: '0 6px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use an EDUCATION / EDTECH style.
- Layout: \`max-w-7xl mx-auto\`. Clear nav with categories. Hero: aspirational headline + CTA ("Start Learning"). Featured courses grid, learning paths, instructor highlights, testimonials, stats.
- Colors: \`bg-surface\` and \`bg-surface-alt\` alternating. \`bg-primary\` / \`text-primary\` (blue) — friendly, not corporate. \`text-success\` / \`bg-success\` for progress. \`bg-accent\` / \`text-accent\` (orange) for CTAs. \`text-heading\`, \`text-body\`.
- Typography: \`font-heading\` (DM Sans) and \`font-body\` (Inter). Friendly and readable. \`font-semibold\` headings. \`leading-relaxed\`.
- Course cards: image placeholder, title, instructor + avatar, skill badge (\`rounded-pill bg-primary/10 text-primary text-xs\`), duration, rating (★), price. \`rounded-card shadow-card hover:shadow-hover\`. Grid of 3-4.
- Progress: progress bars (\`bg-success\` fill), step indicators, achievement badges.
- Trust: student count, instructor credentials, company logos.
- Buttons: \`bg-primary text-white rounded-button\` or \`bg-accent text-white\`. "Enroll Now", "Start Learning".
- style.css: progress bar animations, course card hover effects.
- Vibe: Coursera, Udemy, Khan Academy. Encouraging, accessible, achievement-oriented.`,
  },

  restaurant: {
    name: 'Restaurant / Food',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#DC2626',
            accent: '#B8860B',
            surface: '#FDF8F3',
            heading: '#1A1A1A',
            body: '#57534E',
            muted: '#A8A29E',
            border: '#E7E5E4',
          },
          fontFamily: {
            heading: ['"Playfair Display"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.06)',
          },
        },
      },
    },
    prompt: `Use a RESTAURANT / FOOD / DINING style.
- Layout: full-width hero with large food imagery placeholder. Nav: logo, Menu, About, Reservations, Contact. Below: philosophy, menu highlights, location/hours, reservation CTA, gallery. Footer with hours, address.
- Colors: \`bg-surface\` (warm cream). \`text-heading\` (rich dark) for menus. \`text-primary\` / \`bg-primary\` (warm red) for bold accents. \`text-accent\` / \`border-accent\` (gold) for upscale touches. \`text-body\`, \`text-muted\`.
- Typography: KEY for personality. \`font-heading\` (Playfair Display, elegant serif) for headlines and menu item names. \`font-body\` for descriptions. Menu items: prices right-aligned via \`flex justify-between\`. Descriptions: \`italic font-light text-sm\`.
- Food imagery: large, full-bleed hero. Warm-toned placeholder backgrounds.
- Menu display: organized by category. Each item: name (\`font-heading font-semibold\`), description, price (right-aligned). Cards or list format.
- Reservation CTA: prominent section with "Reserve a Table" button.
- Decorations: subtle. Thin \`border-t border-border\` dividers. NO generic feel — bespoke.
- Buttons: "Reserve Now" \`bg-primary text-white rounded-card\`. "Order Online" secondary.
- style.css: hero image overlay gradient, menu layout fine-tuning.
- Vibe: Resy, award-winning restaurant websites. Design makes you hungry.`,
  },

  realEstate: {
    name: 'Real Estate',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#1E40AF',
            accent: '#DC7F6B',
            surface: '#FFFFFF',
            'surface-alt': '#F8FAFC',
            heading: '#111827',
            body: '#6B7280',
            muted: '#9CA3AF',
            border: '#E5E7EB',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"DM Sans"', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
            button: '8px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.06)',
            hover: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    prompt: `Use a REAL ESTATE / PROPERTY style.
- Layout: full-width. Hero: large search bar centered ("Find your dream home"), property type tabs. Below: featured listings grid, neighborhoods, agents, testimonials, market stats. Search is the HERO.
- Colors: \`bg-surface\` (white). \`bg-primary\` / \`text-primary\` (trust blue). \`bg-accent\` / \`text-accent\` (warm coral) for CTAs. \`text-heading\` for prices (highly legible). \`text-body\`, \`border-border\`.
- Typography: \`font-heading\` and \`font-body\` (clean sans-serif). Prices: \`text-xl font-bold tabular-nums\` — most important info. Addresses: \`font-medium\`. Descriptions: \`font-normal text-body\`.
- Property cards: image placeholder, type badge (\`absolute top-2 left-2 bg-primary text-white rounded-full px-3 py-1 text-xs\`), price (\`text-lg font-bold\`), address, beds/baths/sqft row. \`rounded-card shadow-card hover:shadow-hover\`.
- Search UI: prominent search bar with filter pills/dropdowns.
- Agent cards: photo placeholder, name, title, phone, "Contact" button.
- Stats: "100+ listings" — large numbers for credibility.
- Buttons: "Search" \`bg-primary text-white rounded-button\`. "View Listing" secondary.
- style.css: tabular-nums font-variant, search bar styling, badge positioning.
- Vibe: Zillow, Redfin, Compass. Design is a tool — search-focused, trustworthy.`,
  },

  travel: {
    name: 'Travel / Hospitality',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#F97316',
            accent: '#0EA5E9',
            surface: '#FFFFFF',
            'surface-alt': '#FDF8F3',
            heading: '#111827',
            body: '#6B7280',
            muted: '#9CA3AF',
            border: '#E5E7EB',
          },
          fontFamily: {
            heading: ['"DM Sans"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '14px',
            button: '10px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.06)',
            hover: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    prompt: `Use a TRAVEL / HOSPITALITY / BOOKING style.
- Layout: full-width, immersive. Hero: full-viewport destination imagery placeholder with search overlay. Nav: Stays, Experiences. Below: trending destinations, featured properties, categories, testimonials.
- Colors: hero: dark overlay on imagery (\`bg-black/50\` via style.css). \`bg-surface\` (white) body. \`bg-primary\` / \`text-primary\` (sunset coral) for CTAs. \`text-accent\` (ocean blue). \`bg-surface-alt\` (warm) for visual breaks.
- Typography: \`font-heading\` (DM Sans, aspirational) \`font-semibold\`. Destination names prominent. Prices: "per night" formatting. Hero headline: large, evocative.
- Search: THE PRIMARY UI. Prominent on hero. White card with: destination input, date picker, guests, search button. Tab switching for types.
- Destination cards: large image placeholder, name, location, rating (★), price, save heart. \`rounded-card shadow-card hover:shadow-hover\`. Grid of 3-4.
- Experience cards: category cards with overlaid titles.
- Trust: booking count, ratings, verified badges.
- Buttons: "Search" \`bg-primary text-white rounded-button\`. "Book Now" secondary.
- style.css: hero image overlay, search card styling, image hover effects.
- Vibe: Airbnb, Booking.com. Aspirational imagery + functional booking. You want to go there.`,
  },

  fitness: {
    name: 'Fitness / Sports',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#F97316',
            surface: '#0A0A0A',
            'surface-light': '#FFFFFF',
            heading: '#FFFFFF',
            'heading-dark': '#0A0A0A',
            body: '#D1D5DB',
            'body-dark': '#4B5563',
            accent: '#22C55E',
          },
          fontFamily: {
            heading: ['"Oswald"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
            button: '6px',
          },
          boxShadow: {
            card: '0 4px 16px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    prompt: `Use a FITNESS / SPORTS / ATHLETIC style.
- Layout: dynamic and energetic. Full-width hero with bold headline, strong CTA ("Start Training"). Programs grid. Trainer profiles. Membership tiers. Testimonials. App download CTA.
- Colors: dark backgrounds for drama — \`bg-surface\` (near-black) for hero and feature sections. \`bg-primary\` / \`text-primary\` (energetic orange) as main accent. \`bg-surface-light\` for alternate sections. \`text-heading\` (white on dark), \`text-heading-dark\` (black on light). High contrast.
- Typography: \`font-heading\` (Oswald, bold condensed) in \`font-bold\` to \`font-black\`. \`uppercase\` for impact headlines. Large sizes (\`text-5xl\` to \`text-7xl\` hero). \`font-body\` (Inter) for readability.
- Program cards: image placeholder, name, difficulty, duration. Dark backgrounds. Bold type.
- Trainer cards: photo placeholder, name, specialty, certifications, "Book Session" CTA.
- Membership: tiered cards (Basic, Pro, Elite). "Most Popular" badge.
- Decorations: dynamic angles (style.css clip-path for diagonal section cuts). Motivational text treatments.
- Buttons: bold \`bg-primary text-white uppercase font-bold rounded-button\`. "JOIN NOW". Large. Hover: scale/glow (style.css).
- style.css: diagonal clip-path sections, hover scale animations, dynamic background effects.
- Vibe: Nike, Under Armour, Peloton. Bold, confident. Makes you want to work out.`,
  },

  nonprofit: {
    name: 'Non-profit / Charity',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#059669',
            accent: '#F97316',
            surface: '#FFFFFF',
            'surface-alt': '#FDF8F3',
            heading: '#1E293B',
            body: '#475569',
            muted: '#94A3B8',
            border: '#E2E8F0',
          },
          fontFamily: {
            heading: ['"Source Serif 4"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
            pill: '9999px',
            button: '10px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.06)',
            hover: '0 6px 20px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    prompt: `Use a NON-PROFIT / CHARITY / CAUSE style.
- Layout: \`max-w-7xl mx-auto\`. Hero: emotional headline, impactful subtext, prominent donation CTA. Mission/impact, programs, statistics, beneficiary stories, ways to help, partners, newsletter.
- Colors: \`bg-surface\` (white) or \`bg-surface-alt\` (warm). \`bg-primary\` / \`text-primary\` (hope green) for accents. \`bg-accent\` (warm orange) for donate CTAs. \`text-heading\` (warm dark). Emotional warmth.
- Typography: \`font-heading\` (Source Serif, warm serif) for headlines. \`font-body\` (Inter) for body. Earnest, genuine.
- Donate button: THE MOST IMPORTANT. Always visible — nav, hero, repeated. \`bg-accent text-white font-bold rounded-button px-8 py-3\`. Cannot be missed.
- Impact stats: \`text-4xl font-bold text-primary\` numbers. "$2M raised", "50,000 lives changed".
- Story cards: beneficiary photo placeholder, name, location, quote. Emotional connection.
- Ways to help: Donate (primary), Volunteer, Corporate, Spread the word.
- Trust: annual report link, charity ratings, partner logos.
- Buttons: "Donate Now" prominent \`bg-accent\`. Secondary: \`border border-primary text-primary\`.
- style.css: minimal — hover effects, subtle animation.
- Vibe: charity:water, Red Cross. Warm, trustworthy, human. Mission clear, impact visible.`,
  },

  agency: {
    name: 'Agency / Creative',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#000000',
            accent: '#FF4500',
            surface: '#FFFFFF',
            heading: '#000000',
            body: '#333333',
            muted: '#999999',
          },
          fontFamily: {
            heading: ['"Instrument Serif"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '0px',
          },
          boxShadow: {
            card: 'none',
          },
        },
      },
    },
    prompt: `Use an AGENCY / CREATIVE STUDIO style.
- Layout: unconventional and bold. Hero: massive headline with attitude, minimal subtext. NO traditional hero-features-CTA. Below: portfolio showcase (the MAIN content), about/philosophy, client logos, contact. Nav: minimal — Work, About, Contact.
- Colors: high contrast — \`bg-primary\` (black) and \`bg-surface\` (white) with one bold \`text-accent\` / \`bg-accent\` (electric orange). Every choice confident.
- Typography: DISTINCTIVE — typography IS the design. \`font-heading\` (Instrument Serif) at \`text-7xl\` to \`text-9xl\` for headlines. \`font-body\` for everything else. Mix weights and sizes dramatically.
- Work showcase: THE MAIN CONTENT. Large, full-width project cards. Project title + client + year. Hover: title animation or case study preview (style.css). Bento-style or dramatic single-column.
- About: short, punchy philosophy copy. Not boilerplate — actual personality.
- Client logos: grayscale, subtle. Work is the hero.
- Contact: minimal. Email large. "Let's talk" energy.
- Buttons: mostly styled text links. "View Project →". Nothing generic.
- style.css: hover effects on portfolio items, scroll animations, cursor changes, typography effects.
- Vibe: Awwwards featured studios. The website IS the portfolio. Confident, distinctive, memorable.`,
  },

  events: {
    name: 'Events / Conference',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#7C3AED',
            accent: '#F97316',
            surface: '#FFFFFF',
            'surface-alt': '#F5F3FF',
            dark: '#111827',
            heading: '#111827',
            'heading-light': '#FFFFFF',
            body: '#4B5563',
            border: '#E5E7EB',
          },
          fontFamily: {
            heading: ['"Inter"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '12px',
            pill: '9999px',
            button: '8px',
          },
          boxShadow: {
            card: '0 2px 8px rgba(0,0,0,0.08)',
            hover: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    prompt: `Use an EVENTS / CONFERENCE style.
- Layout: full-width, urgency-driven. Hero: event name (\`text-5xl font-bold\`), date, location, countdown timer, CTA ("Get Tickets"). Speakers grid, schedule, venue info, sponsors, FAQ, tickets.
- Colors: distinctive event branding. \`bg-primary\` / \`text-primary\` (vibrant purple) used extensively — hero, CTAs, section accents. \`bg-dark\` for contrast. \`bg-surface\` and \`bg-surface-alt\` for content.
- Typography: \`font-heading font-bold\` large event name (\`text-5xl\` to \`text-7xl\`). Date and location: prominent. Speakers: \`font-semibold\`.
- Countdown timer: prominently styled with \`text-4xl font-bold\` Days/Hours/Minutes/Seconds. FOMO creator.
- Speaker cards: photo placeholder (square, \`rounded-card\`), name, title/company, topic tags. Grid of 4-6. "View All Speakers" link.
- Schedule: organized by day, color-coded tracks. Clear timestamps. Expandable details.
- Tickets: tiered cards (Early Bird, Regular, VIP). Price prominent. "Limited" urgency. \`bg-primary\` for featured tier.
- Sponsors: tiered logo grid.
- Buttons: \`bg-primary text-white rounded-button font-semibold\`. "Get Tickets Now". Large, urgent.
- style.css: countdown timer animation, schedule accordion, speaker card hover effects.
- Vibe: major tech conferences (WWDC, Figma Config). Excitement and urgency. Register NOW.`,
  },

  gaming: {
    name: 'Gaming',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            surface: '#0A0A0F',
            primary: '#00D4FF',
            accent: '#FF00AA',
            gold: '#FFD700',
            heading: '#FFFFFF',
            body: '#A0AEC0',
            panel: '#151520',
          },
          fontFamily: {
            heading: ['"Rajdhani"', 'sans-serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
          },
          boxShadow: {
            glow: '0 0 20px rgba(0,212,255,0.3)',
            'glow-accent': '0 0 20px rgba(255,0,170,0.3)',
          },
        },
      },
    },
    prompt: `Use a GAMING / GAME MARKETING style.
- Layout: full-width, immersive, cinematic. Hero: full-viewport key art placeholder, game logo, release date, "Pre-order" CTA. Trailer placeholder, feature highlights, character showcase, editions, reviews, platforms. Page is an EXPERIENCE.
- Colors: \`bg-surface\` (dark) for immersion. \`text-primary\` / \`border-primary\` (neon cyan) and \`text-accent\` (magenta) for electric accents. \`text-gold\` for premium elements. \`bg-panel\` for cards. \`shadow-glow\` and \`shadow-glow-accent\` for neon effects.
- Typography: \`font-heading\` (Rajdhani, futuristic angular). \`font-body\` (Inter) for readability. Headlines: \`text-heading font-bold\`. UI text clean.
- Hero: full-screen key art. Game logo centered. Release date. Platform icons. Pre-order button with \`shadow-glow\`.
- Video section: large player placeholder. "Watch Trailer".
- Editions: Standard/Deluxe/Ultimate. What's included. Pre-order bonuses.
- Reviews: "9/10 - IGN" badges. Press quotes.
- Decorations: subtle animated particles (style.css), glow effects on interactive elements, HUD-inspired borders.
- Buttons: "Pre-order Now" \`bg-primary text-surface font-bold rounded-card shadow-glow\`. Animated hover.
- style.css: particle animations, neon glow keyframes, HUD border effects, hero key art overlay.
- Vibe: AAA game launches, PlayStation exclusives. Immersive, dramatic. Portal into the game world.`,
  },

  legal: {
    name: 'Legal / Professional Services',
    tailwindConfig: {
      theme: {
        extend: {
          colors: {
            primary: '#1E3A5F',
            accent: '#B8860B',
            surface: '#FFFFFF',
            'surface-alt': '#F8FAFC',
            heading: '#111827',
            body: '#4B5563',
            muted: '#9CA3AF',
            border: '#E5E7EB',
          },
          fontFamily: {
            heading: ['"Lora"', 'serif'],
            body: ['"Inter"', 'sans-serif'],
          },
          borderRadius: {
            card: '8px',
            button: '6px',
          },
          boxShadow: {
            card: '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
      },
    },
    prompt: `Use a LEGAL / PROFESSIONAL SERVICES style.
- Layout: \`max-w-6xl mx-auto\`, structured and trustworthy. Hero: clear value proposition, "Schedule Consultation" CTA. Practice areas grid, attorney profiles, credentials, testimonials, firm history, contact.
- Colors: authoritative. \`bg-primary\` / \`text-primary\` (deep navy). \`bg-surface\` and \`bg-surface-alt\` alternating. \`text-accent\` / \`border-accent\` (muted gold) for prestige touches. \`text-heading\`, \`text-body\`.
- Typography: \`font-heading\` (Lora, serif) — conveys establishment and trust. \`font-body\` (Inter) for readability. Conservative sizes.
- Attorney cards: photo placeholder, name, title, practice areas, credentials, "View Profile" link. \`rounded-card shadow-card\`. Grid of 3-4.
- Practice areas: icon + name + description. Cards or list format.
- Credentials: bar admissions, awards ("AV Rated", "Super Lawyers"), firm anniversaries.
- Testimonials: client quotes with name + "Verified Client".
- Contact: phone (prominent), email, form, address + map placeholder. "Schedule a Consultation".
- Decorations: minimal and dignified. Thin lines, subtle borders.
- Buttons: "Schedule Consultation" \`bg-primary text-white rounded-button\`. Professional, reliable.
- style.css: minimal — hover effects, contact form styling.
- Vibe: established law firms, professional consultancies. Competent, trustworthy. Your matter is in good hands.`,
  },
};

// ─── Dynamic Variation Strategies ──────────────────────────────────────────
// Instead of hardcoded nudges, we ask the LLM to generate context-aware
// variation strategies tailored to the specific brief and style.

/**
 * Generate variation strategies for multi-version generation.
 * One LLM call produces all strategies at once so they are inherently diverse.
 *
 * @param {object} opts
 * @param {string} opts.userPrompt - The user's website description
 * @param {string} opts.stylePrompt - The resolved style directive (may be empty)
 * @param {number} opts.count - Number of extra variations needed (versions - 1)
 * @param {string} opts.model - Model ID
 * @param {string} opts.providerName - Provider name
 * @param {string} opts.apiKey - API key
 * @returns {Promise<string[]>} Array of variation strategy strings (length = count)
 */
/**
 * Generate variation strategies for multi-version generation.
 *
 * @param {object} opts
 * @param {string} opts.userPrompt - The user's website description
 * @param {string} opts.stylePrompt - The resolved style directive (may be empty)
 * @param {number} opts.count - Number of extra variations needed (versions - 1)
 * @param {(prompt: string) => Promise<string>} opts.queryLLM - LLM query function
 * @returns {Promise<string[]>} Array of variation strategy strings (length = count)
 */
export async function generateVariationStrategies({ userPrompt, stylePrompt, count, queryLLM, refinementMode = false }) {
  const strategyPrompt = refinementMode
    ? `You are a world-class web design director. Given a design system and website brief, propose ${count} creative directions that a designer could take when building this interface. Each direction should produce a visibly distinct result while using the same colors, fonts, and layout structure.

WEBSITE BRIEF:
${userPrompt}
${stylePrompt ? `\nDESIGN STYLE:\n${stylePrompt}` : ''}

A good direction tells the designer what to PRIORITIZE and what to DOWNPLAY — it changes the character of the page without changing its ingredients. Write each direction as an instruction that would produce a noticeably different result if two designers followed different ones.

RULES:
- Produce exactly ${count} directions, one per line
- Each direction should be 1-2 sentences, written as an instruction to a designer
- The resulting designs must look different from each other at a glance — not just in details
- Do NOT change the layout structure, color palette, or font families
- Do NOT reference specific CSS values, pixel sizes, or timing curves
- Do NOT suggest themes or metaphors
- Do NOT include numbering, bullets, or prefixes — just the direction text, one per line`
    : `You are a world-class web design director. You are about to generate ${count + 1} versions of a website. Version 1 will be a straight interpretation of the brief and style. You must produce creative direction strategies for versions 2 through ${count + 1}.

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

  const result = await queryLLM(strategyPrompt);

  const strategies = result
    .trim()
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, count);

  // Pad if the model returned fewer than requested
  while (strategies.length < count) {
    strategies.push('Take a distinctly different creative approach from the other versions.');
  }

  return strategies;
}

// ─── Base Instructions ──────────────────────────────────────────────────────

export const LANDING_INSTRUCTIONS = `You are a world-class web designer. Your job is to create a beautiful, complete, single-page website that feels like a real product — not a template.

RULES:
1. Create exactly TWO files:
   - style.css — Your creative playground for everything that makes this design DISTINCTIVE: @keyframes animations, micro-interactions, custom gradients (radial glows, mesh gradients, aurora effects), backdrop-filter, pseudo-element decorations (::before/::after), clip-path shapes, custom scrollbars, layered box-shadows with rgba, subtle hover transitions, and any CSS that gives the design its unique personality. A great style.css is 100-400 lines of purposeful, creative CSS.
   - index.html — the complete HTML page with inline Tailwind config and all content

2. TAILWIND + CREATIVE CSS approach:
   - Include the Tailwind CDN script with an inline config that defines the core design tokens:
     <script src="https://cdn.tailwindcss.com"></script>
     <script>tailwind.config = { theme: { extend: { colors: {...}, fontFamily: {...}, borderRadius: {...}, boxShadow: {...} } } }</script>
   - Use Tailwind utility classes for layout structure, spacing, typography basics, and your defined design tokens (bg-primary, text-accent, etc.)
   - The Tailwind config should be RICH — not just 6 colors. Include shades (primary-light, primary-dark), tinted backgrounds (accent/10, accent/20 via Tailwind opacity syntax), multiple shadow depths (shadow-sm, shadow-card, shadow-lg, shadow-glow), and any tokens the design needs.
   - EXTEND the provided config freely — add more colors, shadows, and tokens as the design demands. The config is a starting point, not a ceiling.
   - Use style.css for the creative layer: gradient backgrounds, glow effects, shimmer animations, decorative pseudo-elements, hover state transitions, and anything that gives the design soul and personality.

3. ZERO inline styles:
   - NEVER use style="..." attributes in HTML. Not even once.
   - If you need a gradient background, define a class in style.css. If you need a specific color, add it to the Tailwind config.
   - This is a hard rule — the output will be automatically rejected if any style= attributes are found in the HTML.

4. The site must be:
   - Fully self-contained (no external assets except CDN fonts and Tailwind)
   - Responsive (mobile-first, works on all screen sizes)
   - Complete with real-looking content (not lorem ipsum — write realistic copy for the described website)
   - Visually polished and production-quality — it should feel like a REAL product, not a generic template

5. Write style.css FIRST, then index.html. The CSS sets the creative tone; the HTML brings it to life.

6. If the user's prompt contains a URL (https://...), use your WebFetch tool to visit it BEFORE designing.
   Study the page content, structure, copy, branding, and layout. Use what you learn to inform the design.
   If the user asks to replicate or reference it, match the structure and feel as closely as possible.

7. DO NOT explain anything. Just create the files.`;

export const WEBAPP_INSTRUCTIONS = `You are a world-class web designer and frontend developer. Your job is to create a beautiful, complete, multi-page web application prototype that feels like a real product — not a template.

RULES:
1. Create these files:
   - style.css — Your creative playground for everything that makes this design DISTINCTIVE: @keyframes animations, micro-interactions, custom gradients (radial glows, sidebar gradients, shimmer effects), backdrop-filter, pseudo-element decorations, clip-path shapes, custom scrollbars, layered rgba shadows, hover transitions, pulsing status indicators, and any CSS that gives the app its unique personality. A great style.css is 100-500 lines of purposeful, creative CSS.
   - app.js — Shared JavaScript: navigation highlighting, interactive components, any client-side logic. NO frameworks — vanilla JS only.
   - index.html — the main/home page
   - Additional .html pages as needed for the described webapp (e.g., dashboard.html, settings.html, tasks.html)

2. TAILWIND + CREATIVE CSS approach:
   - In EVERY .html page, include the Tailwind CDN script with an inline config:
     <script src="https://cdn.tailwindcss.com"></script>
     <script>tailwind.config = { theme: { extend: { colors: {...}, fontFamily: {...}, borderRadius: {...}, boxShadow: {...} } } }</script>
   - The Tailwind config MUST be identical across all pages (copy-paste the same config block).
   - Use Tailwind utility classes for layout structure, spacing, typography basics, and your defined design tokens.
   - The Tailwind config should be RICH — include color shades (primary-light, primary-dark), tinted backgrounds, multiple shadow depths, and all tokens the design needs.
   - EXTEND the provided config freely — add more colors, shadows, and tokens as the design demands. The config is a starting point, not a ceiling.
   - Use style.css for the creative layer: gradient backgrounds, glow effects, animated status indicators, decorative pseudo-elements, hover transitions, custom scrollbars, and everything that makes the app feel alive and distinctive.

3. Navigation:
   - Every page MUST have a consistent nav bar/sidebar linking to ALL other pages
   - Use relative href paths (e.g., href="dashboard.html")
   - Highlight the current page in the navigation

4. ZERO inline styles:
   - NEVER use style="..." attributes in HTML. Not even once.
   - If you need a gradient background, define a class in style.css. If you need a specific color, add it to the Tailwind config.
   - This is a hard rule — the output will be automatically rejected if any style= attributes are found in the HTML.

5. The webapp must be:
   - Fully self-contained (no external assets except CDN fonts and Tailwind)
   - Responsive (mobile-first, works on all screen sizes)
   - Complete with realistic content, realistic form fields, realistic data tables — not placeholder text
   - Each page should feel like a real, functional app screen (even though backend logic is simulated)
   - Visually consistent across all pages (same header, same colors, same component styles)

6. Write style.css FIRST, then app.js, then each HTML page starting with index.html. The CSS sets the creative tone.

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
1. Create these files: style.css (only for animations/keyframes/pseudo-elements/backdrop-filter), app.js (shared JS), index.html (main page), and additional .html pages as needed.
2. TAILWIND-FIRST: In every .html page, include:
   <script src="https://cdn.tailwindcss.com"></script>
   <script>tailwind.config = { theme: { extend: { colors: { /* extract from reference image */ }, fontFamily: { /* match reference fonts */ }, borderRadius: {...}, boxShadow: {...} } } }</script>
   Extract the design tokens (colors, fonts, shadows, radii) from the reference image and put them in the Tailwind config. Use those custom classes everywhere.
3. Every page must have consistent navigation linking to all other pages.
4. NEVER use style="..." attributes — use Tailwind classes or define a class in style.css for animations/gradients only.
5. Include Google Fonts via <link> if the reference uses web fonts.
6. Make it responsive and self-contained.\n\n`;
    } else {
      prompt += `TECHNICAL RULES:
1. Create exactly TWO files: style.css (only for animations/keyframes/pseudo-elements/backdrop-filter) and index.html (the complete page).
2. TAILWIND-FIRST: In index.html, include:
   <script src="https://cdn.tailwindcss.com"></script>
   <script>tailwind.config = { theme: { extend: { colors: { /* extract from reference image */ }, fontFamily: { /* match reference fonts */ }, borderRadius: {...}, boxShadow: {...} } } }</script>
   Extract the design tokens (colors, fonts, shadows, radii) from the reference image and put them in the Tailwind config. Use those custom classes everywhere.
3. NEVER use style="..." attributes — use Tailwind classes or define a class in style.css for animations/gradients only.
4. Include Google Fonts via <link> if the reference uses web fonts.
5. Make it responsive and self-contained.
6. Write style.css FIRST (if needed), then index.html.\n\n`;
    }

    prompt += `If the user's prompt contains a URL (https://...), use your WebFetch tool to visit it FIRST.
Extract the real text content, branding, and page structure from the live site.
Combined with the reference image, produce a faithful recreation.\n\n`;

  } else {
    // ── Standard flow: no reference image ──────────────────────────────────
    const baseInstructions = isWebapp ? WEBAPP_INSTRUCTIONS : LANDING_INSTRUCTIONS;
    prompt += baseInstructions + '\n\n';

    // Tailwind config from the style preset (injected as starting point)
    if (job.tailwindConfig) {
      const configJson = JSON.stringify(job.tailwindConfig, null, 2);
      prompt += `TAILWIND CONFIG — start from this config and EXTEND it as your design needs:
${configJson}

This is your starting palette. Use these tokens (bg-primary, text-accent, rounded-card, shadow-card, font-heading, font-body) as the foundation, but freely ADD more colors, shadows, and tokens to the config as the design demands. Do not remove existing tokens — only add.\n\n`;
    }

    // Style directive
    if (job.stylePrompt) {
      prompt += job.stylePrompt + '\n\n';
    }

    // Variation nudge (dynamically generated per-project)
    if (job.variationNudge) {
      prompt += `CREATIVE DIRECTION: ${job.variationNudge}\n\n`;
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
/**
 * --theme-auto: Ask the LLM to pick the best style from our catalog.
 *
 * @param {string} userPrompt - The user's website description
 * @param {(prompt: string) => Promise<string>} queryLLM - LLM query function
 * @returns {Promise<string[]>} Array of style keys
 */
export async function resolveThemeAuto(userPrompt, queryLLM) {
  const catalog = buildStyleCatalog();

  const selectorPrompt = `You are a design style selector. Given a website description and a catalog of available design styles, pick the single BEST style that fits the described website.

STYLE CATALOG:
${catalog}

WEBSITE DESCRIPTION:
${userPrompt}

RULES:
- Pick exactly ONE style — the single best match for this website's content and purpose.
- Pick a style that is APPROPRIATE for the content — a hospital website should NOT get "cyberpunk", a fintech app should NOT get "playful".
- Respond with ONLY the style key, nothing else. Example: cleanTech`;

  const result = await queryLLM(selectorPrompt);

  // Parse response — extract the single best style key
  const keys = result
    .trim()
    .split(/[\s,]+/)
    .map(s => s.trim().replace(/[^a-zA-Z]/g, ''))
    .filter(s => STYLES[s]);

  if (keys.length === 0) {
    return [];
  }

  return [keys[0]];
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
/**
 * --theme-synth: Ask the LLM to generate a custom style prompt tailored to the content.
 *
 * @param {string} userPrompt - The user's website description
 * @param {(prompt: string) => Promise<string>} queryLLM - LLM query function
 * @returns {Promise<string|null>} Synthesized style brief or null
 */
// ── Synth mode: 'classic' (queen-04 style) or 'multi' (independent styles) ──
// Switch this to experiment:
export const SYNTH_MODE = 'bestof'; // 'classic' | 'multi' | 'bestof'

/**
 * Classic synth (queen-04 pipeline): one LLM call → one shared { tailwindConfig, brief }.
 * All versions share the same design system. Variation comes from generateVariationStrategies.
 */
export async function resolveThemeSynthClassic(userPrompt, queryLLM) {
  const synthPrompt = `You are a world-class web design director. Given a website description, create a Tailwind-first design system with both a config object and a design brief.

WEBSITE DESCRIPTION:
${userPrompt}

OUTPUT FORMAT — you must output EXACTLY two sections:

SECTION 1: A JSON object (on one line, no markdown fencing) for the Tailwind CDN inline config. It should define theme.extend with:
- colors: semantic names (primary, accent, surface, muted, heading, body) mapped to hex values
- fontFamily: heading and body font stacks with Google Font names
- borderRadius: card, pill, button — named sizes
- boxShadow: card, hover — named shadows

Example: {"theme":{"extend":{"colors":{"primary":"#1E3A5F","accent":"#D97706","surface":"#F8FAFC","muted":"#94A3B8","heading":"#0F172A","body":"#475569"},"fontFamily":{"heading":["Inter","sans-serif"],"body":["Inter","sans-serif"]},"borderRadius":{"card":"12px","pill":"9999px"},"boxShadow":{"card":"0 1px 3px rgba(0,0,0,0.1)","hover":"0 4px 12px rgba(0,0,0,0.15)"}}}}

SECTION 2: A design brief using Tailwind vocabulary (reference the custom tokens like bg-primary, text-accent, font-heading, rounded-card, shadow-card). Cover:
- Layout: structure, grid approach, section flow (use Tailwind terms: max-w-6xl, mx-auto, grid-cols-3, gap-8)
- Styling: how to apply the tokens — which bg-* for sections, text-* for hierarchy, etc.
- Components: cards, buttons, decorations — all described in Tailwind classes
- style.css guidance: creative CSS that elevates the design — animations, gradients, pseudo-elements, transitions, glows, hover effects
- Vibe: 2-3 real-world reference websites this should feel like

RULES:
- Be SPECIFIC and OPINIONATED. Pick one direction and commit.
- The style must be APPROPRIATE for the described website.
- Separate the two sections with a blank line.
- Output ONLY the JSON and brief, no preamble.`;

  const result = await queryLLM(synthPrompt);

  const text = result.trim();
  if (text.length < 100) {
    return null;
  }

  // Try to extract a JSON config from the first line/section
  let tailwindConfig = null;
  let brief = text;
  const jsonMatch = text.match(/^\s*(\{[\s\S]*?"theme"[\s\S]*?\})\s*\n/m);
  if (jsonMatch) {
    try {
      tailwindConfig = JSON.parse(jsonMatch[1]);
      brief = text.slice(jsonMatch[0].length).trim();
    } catch {
      // Could not parse JSON — use whole text as brief
    }
  }

  return { tailwindConfig, brief };
}

/**
 * Pick the best variation strategy for a given synth design.
 * The LLM evaluates each strategy against the design system and user brief,
 * returning the index of the best one.
 *
 * @param {object} opts
 * @param {string} opts.userPrompt - Original website description
 * @param {string} opts.designPrompt - The synth design's style prompt/brief
 * @param {string[]} opts.strategies - Array of variation strategy candidates
 * @param {(prompt: string) => Promise<string>} opts.queryLLM - LLM query function
 * @returns {Promise<number>} Index (0-based) of the best strategy
 */
export async function pickBestVariation({ userPrompt, designPrompt, strategies, queryLLM }) {
  const numbered = strategies.map((s, i) => `${i + 1}. ${s}`).join('\n');

  const pickPrompt = `You are a senior design director selecting the best creative direction for a website project.

WEBSITE BRIEF:
${userPrompt}

DESIGN SYSTEM DIRECTION:
${designPrompt}

CANDIDATE STRATEGIES:
${numbered}

Pick the ONE strategy that will produce the most polished, professional, and usable result when combined with this design system. The winning strategy should:
- Work naturally with the design system's colors, typography, and mood
- Be appropriate for the described product — not gimmicky, not themed
- Push the design in an interesting direction while remaining practical
- Result in something a real user would want to use daily

Output ONLY the number (1-${strategies.length}) of the best strategy. Nothing else.`;

  const result = await queryLLM(pickPrompt);
  const num = parseInt(result.trim(), 10);
  if (num >= 1 && num <= strategies.length) {
    return num - 1; // 0-based
  }
  return 0; // fallback to first
}

/**
 * Generate N short design seeds — one line each specifying surface tone,
 * primary color direction, and typography direction. Used in bestof mode
 * to give each independent design call a unique starting constraint.
 *
 * @param {string} userPrompt - The user's website description
 * @param {number} count - Number of seeds to generate
 * @param {(prompt: string) => Promise<string>} queryLLM - LLM query function
 * @returns {Promise<string[]>} Array of seed strings
 */
export async function generateDesignSeeds(userPrompt, count, queryLLM) {
  const seedPrompt = `You are a world-class web design director. Given a website description, generate ${count} design seeds. Each seed will guide an independent designer to create a complete design — the seeds must ensure the resulting designs look genuinely different from each other.

WEBSITE DESCRIPTION:
${userPrompt}

Each seed is ONE line with three properties:
- Surface tone
- Primary color direction
- Typography direction

RULES:
- Each seed must differ from the others on at least 2 of 3 properties
- Be specific — name the color character and the typographic personality
- No themes, no metaphors, no archetypes — only material design properties
- All seeds must be appropriate for the described product and its users
- One line per seed, no numbering, no bullets, no preamble`;

  const result = await queryLLM(seedPrompt);
  const seeds = result
    .trim()
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .slice(0, count);

  // Pad if fewer seeds returned
  while (seeds.length < count) {
    seeds.push('');
  }

  return seeds;
}

/**
 * Multi synth (queen-10 pipeline): one LLM call → N independent styles.
 * Each version gets its own { tailwindConfig, prompt }. No variation strategies needed.
 *
 * @param {string} userPrompt - The user's website description
 * @param {(prompt: string) => Promise<string>} queryLLM - LLM query function
 * @param {number} [count=1] - Number of styles to generate in one call
 * @param {string} [designSeed] - Optional design seed to constrain the direction
 */
export async function resolveThemeSynthMulti(userPrompt, queryLLM, count = 1, designSeed = '') {
  const seedBlock = designSeed ? `\nDESIGN DIRECTION: ${designSeed}\nFollow this direction — it defines the surface tone, color, and typography for this design.\n` : '';

  const synthPrompt = `You are a world-class web design director. Given a website description, create ${count} design ${count > 1 ? 'styles' : 'style'} for it.

WEBSITE DESCRIPTION:
${userPrompt}
${seedBlock}
${count > 1 ? `Generate ${count} GENUINELY DIFFERENT styles — different color palettes, different typography, different mood. They should look like they were designed by different designers.\n` : ''}OUTPUT FORMAT — for each style, output exactly:
---STYLE---
CONFIG: {a JSON object on ONE line, no markdown fencing, with this structure: {"theme":{"extend":{"colors":{...},"fontFamily":{...},"borderRadius":{...},"boxShadow":{...}}}}}
PROMPT: {the style directive — see structure below}

CONFIG must include:
- colors: 6-10 semantic tokens (surface, panel, primary, accent, heading, body, muted, plus any others) as hex values
- fontFamily: heading and body arrays with real Google Font names as first entry
- borderRadius: card, pill, button
- boxShadow: card, hover, plus any style-specific shadows

PROMPT must cover these sections:
- Layout: grid structure, spacing approach, sidebar/topbar/content organization, density
- Colors: describe each color token with its role AND its visual character (not just the hex — say what it feels like, what it evokes)
- Typography: font choices, weight hierarchy, how headings vs body vs data/labels are styled, Tailwind classes
- style.css: 4-8 SPECIFIC CSS effects this style needs — name the technique, describe the visual result, say where it applies (e.g., "a subtle radial gradient glow behind the sidebar logo", "progress bar fill with a shimmer animation via @keyframes", "table row left-border that scales up on hover via transform scaleY")
- Vibe: 1-2 sentences capturing the overall feeling

RULES:
- Design for the PRODUCT and its USERS. Think about who uses this and what makes the interface excellent for them.
- Be specific and opinionated — commit to clear design choices.
- The styles must feel appropriate and usable for the described website.
- Output ONLY the styles in the format above. No preamble, no commentary.`;

  const result = await queryLLM(synthPrompt);
  const text = result.trim();
  if (text.length < 100) {
    return [];
  }

  // Parse multiple styles separated by ---STYLE---
  const styleBlocks = text.split(/---STYLE---/).filter(b => b.trim().length > 50);
  const styles = [];

  for (const block of styleBlocks) {
    const trimmed = block.trim();

    // Extract CONFIG JSON — use brace counting to handle nested objects
    let tailwindConfig = null;
    const configStart = trimmed.indexOf('CONFIG:');
    if (configStart >= 0) {
      const afterConfig = trimmed.slice(configStart + 7);
      const braceStart = afterConfig.indexOf('{');
      if (braceStart >= 0) {
        let depth = 0;
        let braceEnd = -1;
        for (let ci = braceStart; ci < afterConfig.length; ci++) {
          if (afterConfig[ci] === '{') depth++;
          else if (afterConfig[ci] === '}') { depth--; if (depth === 0) { braceEnd = ci; break; } }
        }
        if (braceEnd > braceStart) {
          const jsonStr = afterConfig.slice(braceStart, braceEnd + 1);
          try { tailwindConfig = JSON.parse(jsonStr); } catch { /* skip */ }
        }
      }
    }

    // Extract PROMPT text
    let prompt = '';
    const promptMatch = trimmed.match(/PROMPT:\s*([\s\S]+)/);
    if (promptMatch) {
      prompt = promptMatch[1].trim();
    }

    if (prompt.length > 50) {
      styles.push({ tailwindConfig, prompt });
    }
  }

  // Pad if fewer styles were returned than requested
  while (styles.length < count && styles.length > 0) {
    styles.push(styles[0]);
  }

  return styles;
}
