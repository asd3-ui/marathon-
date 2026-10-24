import { CharacterSkin } from '../types/game';

export const GAME_CHARACTERS: CharacterSkin[] = [
  {
    id: 'athletic_runner',
    name: 'Alex Sterling',
    nameAr: 'أليكس — العداء الرياضي',
    titleAr: 'بطل المسار السريع',
    descriptionAr: 'عداء رياضي أولمبي بملابس رياضية نيونية وسترة هوديز تكتيكية، مزود بنفاثات تسارع حركية لسرعة بديهة فائقة.',
    price: 0,
    unlocked: true,
    modelType: 'athletic_runner',
    hoodieColor: '#0284c7', // Cyan/electric blue as in user's image
    pantsColor: '#0f172a',
    hairColor: '#1e293b',
    backpackColor: '#06b6d4',
    accentColor: '#38bdf8',
    thrusterColor: '#00f0ff',
    thrusterColorHex: 0x00f0ff,
    icon: '🏃',
    speedRating: 75,
    jumpRating: 80
  },
  {
    id: 'cyber_prodigy',
    name: 'Kaelen Neo',
    nameAr: 'كايلين — عبقري السايبر',
    titleAr: 'مستكشف الفضاء السيبراني',
    descriptionAr: 'مهندس ذكاء مستقبلي مدرع بنظام هولوجرامي وخوذة رقمية تقرأ معادلات الفضاء الرياضي بسرعة فائقة.',
    price: 300,
    unlocked: false,
    modelType: 'cyber_prodigy',
    hoodieColor: '#2563eb', // Deep royal neon blue
    pantsColor: '#030712',
    hairColor: '#0f172a',
    backpackColor: '#3b82f6',
    accentColor: '#60a5fa',
    thrusterColor: '#3b82f6',
    thrusterColorHex: 0x3b82f6,
    icon: '⚡',
    speedRating: 85,
    jumpRating: 78
  },
  {
    id: 'space_explorer',
    name: 'Captain Maya',
    nameAr: 'الكابتن مايا — رائدة المدار',
    titleAr: 'مستكشفة المجرات الكونية',
    descriptionAr: 'رائدة فضاء شجاعة مجهزة ببدلة فضاء مدارية متينة ومحرك نفاث ثنائي متطور يوفر قفزات استثنائية.',
    price: 650,
    unlocked: false,
    modelType: 'space_explorer',
    hoodieColor: '#d97706', // Gold / Amber astronaut flight suit
    pantsColor: '#451a03',
    hairColor: '#78350f',
    backpackColor: '#f59e0b',
    accentColor: '#fef08a',
    thrusterColor: '#fbbf24',
    thrusterColorHex: 0xfbbf24,
    icon: '🚀',
    speedRating: 80,
    jumpRating: 95
  },
  {
    id: 'desert_phantom',
    name: 'Tariq Mirage',
    nameAr: 'طارق — شبح الصحراء',
    titleAr: 'فارس الكثبان الذهبية',
    descriptionAr: 'عداء صحراوي أسطوري يرتدي وشاحاً تكتيكياً ودروعاً خفيفة ممتصة للصدمات، يتحرك كالعاصفة الرملية الخاطفة.',
    price: 950,
    unlocked: false,
    modelType: 'desert_phantom',
    hoodieColor: '#ea580c', // Fiery desert rust
    pantsColor: '#1c1917',
    hairColor: '#1c1917',
    backpackColor: '#c2410c',
    accentColor: '#fb923c',
    thrusterColor: '#f97316',
    thrusterColorHex: 0xf97316,
    icon: '🌪️',
    speedRating: 94,
    jumpRating: 84
  },
  {
    id: 'quantum_champion',
    name: 'Zane Quantum',
    nameAr: 'زين — بطل الكوانتم',
    titleAr: 'محارب الطاقة الكمومية',
    descriptionAr: 'بطل خارق محصن بدروع الكوانتم الكمومية وخلايا الطاقة المشعة، يمنحه أعلى درجات الاستقرار والثبات والسرعة.',
    price: 1500,
    unlocked: false,
    modelType: 'quantum_champion',
    hoodieColor: '#7c3aed', // Quantum Royal Violet
    pantsColor: '#090514',
    hairColor: '#020617',
    backpackColor: '#8b5cf6',
    accentColor: '#c084fc',
    thrusterColor: '#a855f7',
    thrusterColorHex: 0xa855f7,
    icon: '👑',
    speedRating: 98,
    jumpRating: 96
  }
];
