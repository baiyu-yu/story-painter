import { StyleSheet, Font } from '@react-pdf/renderer';

// Register a Chinese font. 
// Note: In a real environment, we need to ensure the font file is accessible via URL.
// Since we are in a Vite app, we can import it.
// However, @react-pdf/renderer fetches fonts via HTTP request in the browser.
// We need to provide a URL.
// Register local fonts served from /public/fonts (TTF/OTF required by @react-pdf)
Font.register({
  family: 'LXGW WenKai',
  fonts: [
    { src: '/fonts/LXGWWenKai-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/LXGWWenKai-Medium.ttf', fontWeight: 'bold' },
  ],
});

// Register Pixel Font for Cyberpunk theme
Font.register({
  family: 'ArkPixel',
  src: '/fonts/ArkPixel-12px-ZH.ttf.ttf',
});

// Register Noto Sans SC
Font.register({
  family: 'Noto Sans SC',
  fonts: [
    { src: '/fonts/NotoSansSC-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/NotoSansSC-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Register Noto Sans Mono CJK SC (monospaced Chinese) for terminal/script themes
Font.register({
  family: 'Noto Sans Mono CJK SC',
  fonts: [
    { src: '/fonts/NotoSansMonoCJKsc-Regular.otf', fontWeight: 'normal' },
    { src: '/fonts/NotoSansMonoCJKsc-Bold.otf', fontWeight: 'bold' },
  ],
});

// Register Source Han Serif SC (serif Chinese) for newspaper/novel themes
Font.register({
  family: 'Source Han Serif SC',
  fonts: [
    { src: '/fonts/SourceHanSerifSC-Regular.otf', fontWeight: 'normal' },
    { src: '/fonts/SourceHanSerifSC-Bold.otf', fontWeight: 'bold' },
  ],
});

// Register Source Han Sans SC (sans Chinese) for office/magazine themes
Font.register({
  family: 'Source Han Sans SC',
  fonts: [
    { src: '/fonts/SourceHanSansSC-Regular.otf', fontWeight: 'normal' },
    { src: '/fonts/SourceHanSansSC-Bold.otf', fontWeight: 'bold' },
  ],
});

// Register ZhiMangXing (Calligraphy Chinese) for Ancient theme
Font.register({
  family: 'Zhi Mang Xing',
  src: '/fonts/ZhiMangXing-Regular.ttf',
});


export const themeStyles = {
  dnd: {
    pageBackground: '#fdf6e3',
    primaryColor: '#5c2d2d',
    secondaryColor: '#8b4513',
    textColor: '#2c1810',
    fontFamily: 'Noto Sans SC',
    headingFontFamily: 'Noto Sans SC',
    bodyFontFamily: 'Noto Sans SC',
    obFontFamily: 'Noto Sans SC',
    borderColor: '#5c2d2d',
    borderWidth: 3,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'standard',
    icon: 'gourd',
    messageBlock: { bg: '#fffaf2', border: '#8b6b3e', shadow: 0.05, borderRadius: 2 },
    messageObBlock: { bg: '#f7efe0', border: '#a07b46', borderRadius: 2 },
    charCard: { bg: '#fff6e0', borderStyle: 'dashed', borderRadius: 2 },
    introAccent: '#8b4513',
    // Design Elements
    layoutType: 'classic',
    headerAlign: 'center',
    showPageBorder: true,
    pagePadding: 24,
    decorationType: 'corner-ornaments',
    decorationColor: '#8b4513'
  },
  coc: {
    pageBackground: '#1a1a1a',
    primaryColor: '#8fbc8f', // DarkSeaGreen
    secondaryColor: '#2e8b57', // SeaGreen
    textColor: '#dcdcdc',
    fontFamily: 'LXGW WenKai',
    headingFontFamily: 'LXGW WenKai',
    bodyFontFamily: 'LXGW WenKai',
    obFontFamily: 'LXGW WenKai',
    borderColor: '#2e8b57',
    borderWidth: 1,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'dark-box',
    icon: 'cat',
    messageBlock: { bg: '#222222', border: '#2f4f4f', shadow: 0.1, borderRadius: 1 },
    messageObBlock: { bg: '#1c1c1c', border: '#2f4f4f', borderRadius: 1 },
    charCard: { bg: '#141414', borderStyle: 'solid', borderRadius: 1 },
    introAccent: '#2e8b57',
    // Design Elements
    layoutType: 'immersive',
    headerAlign: 'left',
    showPageBorder: true,
    pagePadding: 20,
    decorationType: 'watermark-pattern',
    decorationColor: '#2f4f4f',
    watermarkText: 'TOP SECRET'
  },
  cyberpunk: {
    pageBackground: '#050505',
    primaryColor: '#00f3ff',
    secondaryColor: '#ff00ff',
    textColor: '#e0e0e0',
    fontFamily: 'ArkPixel',
    headingFontFamily: 'ArkPixel',
    bodyFontFamily: 'ArkPixel',
    obFontFamily: 'ArkPixel',
    borderColor: '#00f3ff',
    borderWidth: 0,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'neon',
    icon: 'fish',
    messageBlock: { bg: '#0a0a0a', border: '#00f3ff', shadow: 0.2, borderRadius: 0.1 },
    messageObBlock: { bg: '#0f0f0f', border: '#ff00ff', borderRadius: 0.1 },
    charCard: { bg: '#0b0b0b', borderStyle: 'solid', borderRadius: 0.1 },
    introAccent: '#bc13fe',
    // Design Elements
    layoutType: 'modern',
    headerAlign: 'right',
    showPageBorder: false,
    pagePadding: 16,
    decorationType: 'sidebar-strip',
    decorationColor: '#00f3ff'
  },
  japanese: {
    pageBackground: '#fffbfb',
    primaryColor: '#ff7eb9',
    secondaryColor: '#ffb7d2',
    textColor: '#5d5d5d',
    fontFamily: 'Noto Sans SC',
    headingFontFamily: 'LXGW WenKai',
    bodyFontFamily: 'LXGW WenKai',
    obFontFamily: 'LXGW WenKai',
    borderColor: '#ff7eb9',
    borderWidth: 1,
    backgroundImage: null,
    borderStyle: 'dotted',
    bubbleStyle: 'rounded',
    icon: 'cat',
    messageBlock: { bg: '#fff0f5', border: 'transparent', shadow: 0.02, borderRadius: 12 },
    messageObBlock: { bg: '#ffeaf2', border: 'transparent', borderRadius: 12 },
    charCard: { bg: '#fff5f8', borderStyle: 'dotted', borderRadius: 16 },
    introAccent: '#ff7eb9',
    // Design Elements
    layoutType: 'clean',
    headerAlign: 'center',
    showPageBorder: false,
    pagePadding: 30,
    decorationType: 'watermark-pattern',
    decorationColor: '#ffb7d2',
    watermarkText: '桜'
  },
  ancient: {
    pageBackground: '#f5e8c4',
    primaryColor: '#5d4037',
    secondaryColor: '#8d6e63',
    textColor: '#3e2723',
    fontFamily: 'LXGW WenKai',
    headingFontFamily: 'Zhi Mang Xing',
    bodyFontFamily: 'LXGW WenKai',
    obFontFamily: 'LXGW WenKai',
    borderColor: '#5d4037',
    borderWidth: 4,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'indent',
    icon: 'gourd',
    messageBlock: { bg: '#fdf5e6', border: '#8d6e63', shadow: 0, borderRadius: 1 },
    messageObBlock: { bg: '#faebd7', border: '#a1887f', borderRadius: 1 },
    charCard: { bg: '#f5e3a6', borderStyle: 'solid', borderRadius: 1 },
    introAccent: '#8d6e63',
    // Design Elements
    layoutType: 'classic',
    headerAlign: 'center',
    showPageBorder: true,
    pagePadding: 32,
    decorationType: 'top-bottom-border',
    decorationColor: '#5d4037'
  },
  script: {
    pageBackground: '#ffffff',
    primaryColor: '#000000',
    secondaryColor: '#444444',
    textColor: '#000000',
    fontFamily: 'Noto Sans Mono CJK SC',
    headingFontFamily: 'Noto Sans Mono CJK SC',
    bodyFontFamily: 'Noto Sans Mono CJK SC',
    obFontFamily: 'Noto Sans Mono CJK SC',
    borderColor: '#000000',
    borderWidth: 0,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'standard',
    icon: 'gourd',
    messageBlock: { bg: '#ffffff', border: '#ffffff', shadow: 0, borderRadius: 1 },
    messageObBlock: { bg: '#ffffff', border: '#ffffff', borderRadius: 1 },
    charCard: { bg: '#ffffff', borderStyle: 'solid', borderRadius: 1 },
    introAccent: '#000000',
    // Design Elements
    layoutType: 'classic',
    headerAlign: 'center',
    showPageBorder: false,
    pagePadding: 48, // Wider margins for script
    decorationType: 'none',
    decorationColor: '#000000'
  },
  minimalist: {
    pageBackground: '#ffffff',
    primaryColor: '#333333',
    secondaryColor: '#666666',
    textColor: '#1a1a1a',
    fontFamily: 'Noto Sans SC',
    headingFontFamily: 'Noto Sans SC',
    bodyFontFamily: 'Noto Sans SC',
    obFontFamily: 'Noto Sans SC',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'standard',
    icon: 'cat',
    messageBlock: { bg: '#f8f9fa', border: '#dee2e6', shadow: 0, borderRadius: 4 },
    messageObBlock: { bg: '#f1f3f5', border: '#e9ecef', borderRadius: 4 },
    charCard: { bg: '#ffffff', borderStyle: 'solid', borderRadius: 4 },
    introAccent: '#333333',
    // Design Elements
    layoutType: 'clean',
    headerAlign: 'left',
    showPageBorder: false,
    pagePadding: 30,
    decorationType: 'none',
    decorationColor: '#000000'
  },
  terminal: {
    pageBackground: '#0d1117',
    primaryColor: '#00ff41',
    secondaryColor: '#008f11',
    textColor: '#00ff41',
    fontFamily: 'Noto Sans Mono CJK SC',
    headingFontFamily: 'Noto Sans Mono CJK SC',
    bodyFontFamily: 'Noto Sans Mono CJK SC',
    obFontFamily: 'Noto Sans Mono CJK SC',
    borderColor: '#00ff41',
    borderWidth: 1,
    backgroundImage: null,
    borderStyle: 'dashed',
    bubbleStyle: 'neon',
    icon: 'fish',
    messageBlock: { bg: '#000000', border: '#00ff41', shadow: 0, borderRadius: 1 },
    messageObBlock: { bg: '#011a04', border: '#008f11', borderRadius: 1 },
    charCard: { bg: '#0d1117', borderStyle: 'dashed', borderRadius: 1 },
    introAccent: '#00ff41',
    // Design Elements
    layoutType: 'modern',
    headerAlign: 'left',
    showPageBorder: true,
    pagePadding: 16,
    decorationType: 'corner-ornaments',
    decorationColor: '#00ff41'
  },
  office: {
    pageBackground: '#ffffff',
    primaryColor: '#2d3748',
    secondaryColor: '#4a5568',
    textColor: '#1a202c',
    fontFamily: 'Source Han Sans SC',
    headingFontFamily: 'Source Han Sans SC',
    bodyFontFamily: 'Source Han Sans SC',
    obFontFamily: 'Source Han Sans SC',
    borderColor: '#e2e8f0',
    borderWidth: 1,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'standard',
    icon: 'cat',
    messageBlock: { bg: '#f7fafc', border: '#e2e8f0', shadow: 0, borderRadius: 6 },
    messageObBlock: { bg: '#edf2f7', border: '#e2e8f0', borderRadius: 6 },
    charCard: { bg: '#ffffff', borderStyle: 'solid', borderRadius: 6 },
    introAccent: '#2d3748',
    // Design Elements
    layoutType: 'clean',
    headerAlign: 'left',
    showPageBorder: false,
    pagePadding: 28,
    decorationType: 'none',
    decorationColor: '#2d3748'
  },
  magazine: {
    pageBackground: '#ffffff',
    primaryColor: '#111827',
    secondaryColor: '#ef4444',
    textColor: '#111827',
    fontFamily: 'Source Han Sans SC',
    headingFontFamily: 'Source Han Sans SC',
    bodyFontFamily: 'Source Han Sans SC',
    obFontFamily: 'Source Han Sans SC',
    borderColor: '#e5e7eb',
    borderWidth: 0,
    backgroundImage: null,
    borderStyle: 'solid',
    bubbleStyle: 'rounded',
    icon: 'cat',
    messageBlock: { bg: '#fafafa', border: '#e5e7eb', shadow: 0.05, borderRadius: 12 },
    messageObBlock: { bg: '#f5f5f5', border: '#e5e7eb', borderRadius: 12 },
    charCard: { bg: '#ffffff', borderStyle: 'solid', borderRadius: 12 },
    introAccent: '#ef4444',
    // Design Elements
    layoutType: 'modern',
    headerAlign: 'center',
    showPageBorder: false,
    pagePadding: 24,
    decorationType: 'sidebar-strip',
    decorationColor: '#ef4444'
  }
};

export type ThemeKey = keyof typeof themeStyles;

export const getThemeStyle = (theme: ThemeKey) => {
    return themeStyles[theme] || themeStyles['dnd']; // Fallback to 'dnd' if theme is not found
};
