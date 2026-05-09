/**
 * Chère Design Tokens
 * 
 * Quiet luxury aesthetic inspired by Hermès.
 * Warm, elegant, emotional, impressionist.
 * Every component that uses these tokens automatically inherits the brand feel.
 */

export const tokens = {
  colors: {
    // Warm neutrals (primary palette)
    linen:      '#F5F0EB',
    cream:      '#FAF7F2',
    parchment:  '#EDE6DB',
    warmGray:   '#B8AFA6',
    stone:      '#8A817A',
    charcoal:   '#3D3832',
    espresso:   '#2A2420',

    // Accent (used sparingly — like a gold foil detail)
    mutedGold:  '#C4A97D',
    softRose:   '#D4A5A5',
    sageGreen:  '#A8B5A0',
    dustyBlue:  '#9EB1C1',

    // Functional
    white:      '#FFFFFF',
    error:      '#C4756A',
    success:    '#8BA888',
  },

  fonts: {
    serif:       '"Cormorant Garamond", "Georgia", serif',
    sansSerif:   '"DM Sans", "Helvetica Neue", sans-serif',
    handwriting: '"Caveat", cursive',
  },

  fontSize: {
    xs:   '0.75rem',
    sm:   '0.875rem',
    base: '1rem',
    lg:   '1.125rem',
    xl:   '1.25rem',
    '2xl': '1.5rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
    '5xl': '3.5rem',
  },

  fontWeight: {
    light:    300,
    regular:  400,
    medium:   500,
    semibold: 600,
  },

  spacing: {
    sectionGap:   '4rem',
    paragraphGap: '1.5rem',
    photoMargin:  '2rem',
    pageMargin:   '2rem',
    pageMobileMargin: '1.25rem',
  },

  animation: {
    duration: {
      fast:    '200ms',
      normal:  '400ms',
      slow:    '800ms',
      reveal:  '1200ms',
      breathe: '2000ms',
    },
    easing: {
      gentle:  'cubic-bezier(0.4, 0, 0.2, 1)',
      elegant: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
      spring:  'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },

  borderRadius: {
    sm:   '0.25rem',
    md:   '0.5rem',
    lg:   '1rem',
    xl:   '1.5rem',
    full: '9999px',
  },

  shadows: {
    subtle:   '0 1px 3px rgba(42, 36, 32, 0.04)',
    card:     '0 2px 8px rgba(42, 36, 32, 0.06)',
    photo:    '0 4px 16px rgba(42, 36, 32, 0.08)',
    elevated: '0 8px 24px rgba(42, 36, 32, 0.10)',
    glow:     '0 0 24px rgba(196, 169, 125, 0.15)',
  },
} as const;

// Tailwind-compatible CSS custom properties
export const cssVariables = `
  :root {
    /* Colors */
    --color-linen: ${tokens.colors.linen};
    --color-cream: ${tokens.colors.cream};
    --color-parchment: ${tokens.colors.parchment};
    --color-warm-gray: ${tokens.colors.warmGray};
    --color-stone: ${tokens.colors.stone};
    --color-charcoal: ${tokens.colors.charcoal};
    --color-espresso: ${tokens.colors.espresso};
    --color-muted-gold: ${tokens.colors.mutedGold};
    --color-soft-rose: ${tokens.colors.softRose};
    --color-sage-green: ${tokens.colors.sageGreen};
    --color-dusty-blue: ${tokens.colors.dustyBlue};
    --color-error: ${tokens.colors.error};
    --color-success: ${tokens.colors.success};

    /* Typography */
    --font-serif: ${tokens.fonts.serif};
    --font-sans: ${tokens.fonts.sansSerif};
    --font-hand: ${tokens.fonts.handwriting};

    /* Shadows */
    --shadow-subtle: ${tokens.shadows.subtle};
    --shadow-card: ${tokens.shadows.card};
    --shadow-photo: ${tokens.shadows.photo};
    --shadow-elevated: ${tokens.shadows.elevated};
    --shadow-glow: ${tokens.shadows.glow};

    /* Animation */
    --ease-gentle: ${tokens.animation.easing.gentle};
    --ease-elegant: ${tokens.animation.easing.elegant};
    --duration-fast: ${tokens.animation.duration.fast};
    --duration-normal: ${tokens.animation.duration.normal};
    --duration-slow: ${tokens.animation.duration.slow};
    --duration-reveal: ${tokens.animation.duration.reveal};
  }
`;

// Tribute page theme variants
export const tributeThemes = {
  'warm-linen': {
    background: tokens.colors.linen,
    surface: tokens.colors.cream,
    text: tokens.colors.espresso,
    textSecondary: tokens.colors.stone,
    accent: tokens.colors.mutedGold,
    border: tokens.colors.parchment,
  },
  'soft-sage': {
    background: '#F2F5F0',
    surface: '#F8FAF6',
    text: '#2D3A2D',
    textSecondary: '#6B7A6B',
    accent: tokens.colors.sageGreen,
    border: '#DDE5D9',
  },
  'midnight-gold': {
    background: '#1A1714',
    surface: '#242018',
    text: '#F5F0EB',
    textSecondary: '#B8AFA6',
    accent: tokens.colors.mutedGold,
    border: '#3D3832',
  },
} as const;

export type TributeTheme = keyof typeof tributeThemes;
