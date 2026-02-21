import { WritingType, StructureType, StructureDefinition, SpineNodeId, SpineNodeStatus } from './types';

export const COLORS = {
  PRIMARY: '#1E293B',
  SECONDARY: '#FDFBF7',
  ACCENT: '#7b61ff',
  TEXT: '#111827',
  BG_NIGHT: '#0F172A',
};

// Precise match for the core brand colors specified in the UI Contract
export const PROJECT_COLORS = [
  '#FADE4B', // Sun Yellow
  '#FF6B2C', // Vibrant Orange
  '#D4FF5F', // Neon Green
  '#B2A4FF'  // Dreamy Purple
];

export const PROJECT_ICONS = [
  'fa-feather-pointed', 'fa-pen-nib', 'fa-book-open', 'fa-note-sticky',
  'fa-paper-plane', 'fa-diagram-project', 'fa-flask', 'fa-graduation-cap',
  'fa-clapperboard', 'fa-layer-group'
];

export const SPINE_NODES_CONFIG: Record<SpineNodeId, { label: string, en: string, icon: string, description: string }> = {
  [SpineNodeId.WRITING]: { label: '內容創作', en: 'WRITING', icon: 'fa-feather', description: '內容尚在草稿階段。' },
  [SpineNodeId.STRUCTURAL_LOCK]: { label: '結構鎖定', en: 'STRUCTURAL LOCK', icon: 'fa-lock', description: '章節結構已確認，不再變動。' },
  [SpineNodeId.EDITORIAL_READY]: { label: '編輯完成', en: 'EDITORIAL READY', icon: 'fa-spell-check', description: '內容已通過 AI 或人工審核。' },
  [SpineNodeId.METADATA_COMPLETE]: { label: '出版資料', en: 'METADATA COMPLETE', icon: 'fa-tags', description: '標題、摘要與分類等資料齊備。' },
  [SpineNodeId.ISBN_ASSIGNED]: { label: '識別碼分配', en: 'ISBN ASSIGNED', icon: 'fa-barcode', description: '已分配 ISBN 或確認無需 ISBN。' },
  [SpineNodeId.COVER_READY]: { label: '封面備齊', en: 'COVER READY', icon: 'fa-image', description: '印刷或數位封面已生成。' },
  [SpineNodeId.PREFLIGHT_CHECK]: { label: '出版前檢查', en: 'PREFLIGHT CHECK', icon: 'fa-clipboard-check', description: '執行最終出版合規性檢查。' },
  [SpineNodeId.DISTRIBUTION_READY]: { label: '可分發', en: 'DISTRIBUTION READY', icon: 'fa-truck-loading', description: '準備進入分發通道。' },
  [SpineNodeId.PUBLISHED]: { label: '正式出版', en: 'PUBLISHED', icon: 'fa-earth-americas', description: '作品已成功交付。' }
};

export const INITIAL_SPINE_NODES = (): Record<SpineNodeId, SpineNodeStatus> => {
  const nodes = {} as Record<SpineNodeId, SpineNodeStatus>;
  Object.values(SpineNodeId).forEach(id => {
    nodes[id] = { id, isCompleted: id === SpineNodeId.WRITING };
  });
  return nodes;
};

export const AI_MODEL_GROUPS = [
  {
    name: 'Google Gemini',
    placeholder: 'AIza...',
    models: [
      { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro', isRecommended: true },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash' },
      { id: 'gemini-3-deep-think', name: 'Gemini 3 Deep Think' },
      { id: 'gemini-2.5-pro-preview', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash-preview', name: 'Gemini 2.5 Flash' },
      { id: 'gemini-2.5-flash-lite-preview', name: 'Gemini 2.5 Flash-Lite' },
      { id: 'gemini-2.0-pro-preview', name: 'Gemini 2.0 Pro' },
      { id: 'gemini-2.0-flash-preview', name: 'Gemini 2.0 Flash' }
    ]
  },
  {
    name: 'OpenAI',
    placeholder: 'sk-...',
    models: [
      { id: 'gpt-5', name: 'GPT-5', isRecommended: true },
      { id: 'gpt-4.1', name: 'GPT-4.1' },
      { id: 'gpt-4', name: 'GPT-4' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
    ]
  },
  {
    name: 'Anthropic',
    placeholder: 'sk-ant-...',
    models: [
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', isRecommended: true },
      { id: 'claude-3-opus', name: 'Claude 3 Opus' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet' }
    ]
  },
  {
    name: 'Microsoft Azure OpenAI',
    placeholder: 'Endpoint Key...',
    models: [
      { id: 'azure-gpt-4.1', name: 'Azure GPT-4.1', isRecommended: true },
      { id: 'azure-gpt-4', name: 'Azure GPT-4' },
      { id: 'azure-gpt-35-turbo', name: 'Azure GPT-35 Turbo' }
    ]
  },
  {
    name: 'Mistral AI',
    placeholder: 'Mistral Key...',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', isRecommended: true },
      { id: 'mistral-medium', name: 'Mistral Medium' }
    ]
  },
  {
    name: 'Meta',
    placeholder: 'Meta API Key...',
    models: [
      { id: 'llama-3-70b', name: 'LLaMA 3 70B', isRecommended: true },
      { id: 'llama-3-8b', name: 'LLaMA 3 8B' }
    ]
  },
  {
    name: 'Cohere',
    placeholder: 'Cohere Key...',
    models: [
      { id: 'command-r-plus', name: 'Command R+', isRecommended: true },
      { id: 'command-r', name: 'Command R' }
    ]
  },
  {
    name: 'Open Source / Enterprise',
    placeholder: 'API Key...',
    models: [
      { id: 'falcon-180b', name: 'Falcon 180B', isRecommended: true },
      { id: 'mixtral-8x22b', name: 'Mixtral 8x22B' }
    ]
  },
  {
    name: 'Custom (Bring Your Own API)',
    placeholder: 'Enter Custom API Key...',
    models: []
  }
];

export const STRUCTURE_DEFINITIONS: Record<StructureType, StructureDefinition> = {
  [StructureType.CHAPTER]: {
    type: StructureType.CHAPTER,
    autoNumbering: true,
    defaultNamingRule: (i) => `第 ${i} 章`,
    allowManualOrder: true
  },
  [StructureType.SECTION]: {
    type: StructureType.SECTION,
    autoNumbering: true,
    defaultNamingRule: (i) => `第 ${i} 節`,
    allowManualOrder: true
  },
  [StructureType.BLOCK]: {
    type: StructureType.BLOCK,
    autoNumbering: false,
    defaultNamingRule: () => '',
    allowManualOrder: false
  },
  [StructureType.FREE]: {
    type: StructureType.FREE,
    autoNumbering: false,
    defaultNamingRule: () => '',
    allowManualOrder: false
  }
};

export const TEMPLATE_STRUCTURE_MAP: Record<WritingType, StructureType> = {
  [WritingType.NOVEL]: StructureType.CHAPTER,
  [WritingType.LONG_FORM]: StructureType.CHAPTER,
  [WritingType.BLOG]: StructureType.SECTION,
  [WritingType.DIARY]: StructureType.FREE,
  [WritingType.COPYWRITING]: StructureType.BLOCK,
  [WritingType.BUSINESS_PLAN]: StructureType.SECTION,
  [WritingType.SCREENPLAY]: StructureType.CHAPTER,
  [WritingType.ACADEMIC]: StructureType.SECTION,
  [WritingType.PRD]: StructureType.SECTION,
  [WritingType.COURSE]: StructureType.SECTION,
  [WritingType.BOOK_OUTLINE]: StructureType.SECTION,
  [WritingType.CUSTOM]: StructureType.FREE
};

export interface TemplateConfig {
  label: string;
  enLabel: string;
  icon: string;
  description: string;
  skeleton: string[]; 
}

export const TEMPLATES: Record<WritingType, TemplateConfig> = {
  [WritingType.NOVEL]: {
    label: '長篇敘事',
    enLabel: 'Novel / Fiction',
    icon: 'fa-feather-pointed',
    description: '市場最受歡迎架構，整合章節、世界觀與深度筆記。',
    skeleton: [] 
  },
  [WritingType.LONG_FORM]: {
    label: '長篇創作',
    enLabel: 'Long-form Writing',
    icon: 'fa-book-open',
    description: '適合進行大篇幅、多章節的專業創作。',
    skeleton: []
  },
  [WritingType.BLOG]: {
    label: '部落格創作',
    enLabel: 'Blog / Medium',
    icon: 'fa-pen-nib',
    description: '專為虛構寫作環境，支援三幕結構與角色弧線。',
    skeleton: []
  },
  [WritingType.DIARY]: {
    label: '隨手筆記',
    enLabel: 'Diary / Notes',
    icon: 'fa-note-sticky',
    description: '部落格與專欄創作者首選，強調論證邏輯與證據鏈。',
    skeleton: []
  },
  [WritingType.CUSTOM]: {
    label: '自定義範本',
    enLabel: 'Custom Template',
    icon: 'fa-plus',
    description: '由您定義結構，靈活適配任何創作場景。',
    skeleton: []
  },
  [WritingType.BUSINESS_PLAN]: {
    label: '商業計畫書',
    enLabel: 'Business Plan',
    icon: 'fa-briefcase',
    description: '創業首選：市場分析、產品定義與財務預測。',
    skeleton: []
  },
  [WritingType.SCREENPLAY]: {
    label: '影視腳本',
    enLabel: 'Screenplay',
    icon: 'fa-clapperboard',
    description: '符合工業標準的場景、對白與行動描述管理。',
    skeleton: []
  },
  [WritingType.ACADEMIC]: {
    label: '學術論文',
    enLabel: 'Academic Paper',
    icon: 'fa-graduation-cap',
    description: '嚴謹的論文結構模板，鎖定必要學術區塊。',
    skeleton: []
  },
  [WritingType.PRD]: {
    label: '產品需求文件',
    enLabel: 'PRD / Spec',
    icon: 'fa-gears',
    description: '定義問題與需求列表，追蹤產品成功指標。',
    skeleton: []
  },
  // Fixed duplicate WritingType.COPYWRITING entry here
  [WritingType.COPYWRITING]: {
    label: '行銷文案',
    enLabel: 'Copywriting',
    icon: 'fa-bullhorn',
    description: '針對定時發佈內容優化，Hook 到 CTA 一氣呵成。',
    skeleton: []
  },
  [WritingType.COURSE]: {
    label: '教學課程',
    enLabel: 'Course / Tutorial',
    icon: 'fa-chalkboard-user',
    description: '管理課程目標與單元教學內容。',
    skeleton: []
  },
  [WritingType.BOOK_OUTLINE]: {
    label: '書籍大綱',
    enLabel: 'Book Outline',
    icon: 'fa-sitemap',
    description: '書籍定位、目標讀者與跨章節出版規劃。',
    skeleton: []
  }
};

export const PLACEHOLDER_TEXT = "寫作即是思考的延伸，請在此開始記錄...";
