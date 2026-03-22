export const COLOR = {
  PRIMARY_COLOR: '#000000',
  // PRIMARY_COLOR: 'black',
  SECONDARY_COLOR: '#F2C94C',
  LIGHT_BACKGROUND: '#EFF2F5',
  WHITE_COLOR: '#FFFFFF',
  DISABLED_TEXT_COLOR: '#666',
  YELLOW_COLOR: '#FBAE2C',
  RED_COLOR: '#F44336',
  GREEN_COLOR: '#37AE47',
  BLACK_COLOR: '#000000',
  BORDER_COLOR: '#ddd',
  TRANSPARENT: 'transparent',
  PLACEHOLDER_COLOR: '#999',
  HOT_LEADS_BACKGROUND: '#FFEBEE',
  WARM_LEADS_BACKGROUND: '#FFF3E0',
  HOT_LEADS_COLOR: '#E74C3C',
  WARM_LEADS_COLOR: '#F39C12',
  COLD_LEADS_COLOR: '#3498DB',
  COLD_LEADS_BACKGROUND: '#E8F6FF',
  LIGHT_GREY: '#757575',
  BADGE_BACKGROUND: '#FAF3E1',
  BADGE_TEXT_COLOR: '#456882',
  PENDING_COLOR: '#facc15',
  APPROVED_COLOR: '#22c55e',
  REJECTED_COLOR: '#ef4444',
  PURPLE_COLOR: '#ae72b8ff',
}
export const FONTS = {
  // FONT_REGULAR: 'Oswald-Regular',
  // FONT_MEDIUM: 'Oswald-Medium',
  // FONT_SEMIBOLD: 'Oswald-SemiBold',
  // FONT_BOLD: 'Oswald-Bold',
  FONT_REGULAR: 'Poppins-Regular',
  FONT_MEDIUM: 'Poppins-Medium',
  FONT_SEMIBOLD: 'Poppins-SemiBold',
  FONT_BOLD: 'Poppins-Bold',
}

export const INPUT_TYPE_ID = {
  TEXT_INPUT: 1,
  NUMBER: 2,
  DATE: 3,
  FILE_TYPE: 4,
  SINGLE_SELECT_DROPDOWN: 5,
  MULTI_SELECT_DROPDOWN: 6,
  SWITCH: 7,
}

export const LEAD_STATUS = {
  INSURED_ADDED: 'Insured Added',
  QUOTATION_PENDING: 'Quotation Pending'
}

export const INSURANCE_COMPANIES = [
  {
    "id": 1,
    "value": "Aditya Birla Capital"
  },
  {
    "id": 2,
    "value": "Bajaj Allianz"
  },
  {
    "id": 3,
    "value": "Cholamandalam"
  },
  {
    "id": 4,
    "value": "Future Generali India"
  },
  {
    "id": 5,
    "value": "Go Digit"
  },
  {
    "id": 6,
    "value": "HDFC Ergo"
  },
  {
    "id": 7,
    "value": "ICICI Lombard"
  },
  {
    "id": 8,
    "value": "Iffco-Tokio"
  },
  {
    "id": 9,
    "value": "Kotak General"
  },
  {
    "id": 10,
    "value": "LIC"
  },
  {
    "id": 11,
    "value": "ManipalCigna"
  },
  {
    "id": 12,
    "value": "National Insurance"
  },
  {
    "id": 13,
    "value": "New India Assurance"
  },
  {
    "id": 14,
    "value": "Oriental Insurance"
  },
  {
    "id": 15,
    "value": "Reliance General"
  },
  {
    "id": 16,
    "value": "Royalsundaram"
  },
  {
    "id": 17,
    "value": "Shriram General"
  },
  {
    "id": 18,
    "value": "Star Health"
  },
  {
    "id": 19,
    "value": "Tata AIG"
  },
  {
    "id": 20,
    "value": "United India"
  }
]

export const QUOTATION_STATUS = {
  'QUOTATION WAITING APPROVAL': 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
}

export const HEALTH_CATEGORY_CODE = [10, 11]
export const GENERAL_HEALTH_CATEGORY_CODE = [9, 10, 11]

export const PRODUCT_IDS = {
  MOTOR: 2,
  HEALTH: 4,
};

export const CATEGORY_IDS = {
  INDIVIDUAL: 6,
  FLOATER: 7,
};

export const RELATIONSHIPS = [
  { id: 'self', label: 'Self' },
  { id: 'spouse', label: 'Spouse' },
  { id: 'father', label: 'Father' },
  { id: 'mother', label: 'Mother' },
  { id: 'son', label: 'Son' },
  { id: 'daughter', label: 'Daughter' },
  { id: 'brother', label: 'Brother' },
  { id: 'sister', label: 'Sister' },
  { id: 'fatherInLaw', label: 'Father-in-Law' },
  { id: 'motherInLaw', label: 'Mother-in-Law' },
];

export const CONDITIONAL_FORM_SECTIONS = [
  {
    productId: PRODUCT_IDS.HEALTH,
    categoryId: CATEGORY_IDS.INDIVIDUAL,
    sectionTitle: 'Health Individual Information',
    fields: [
      {
        type: 'dropdown',
        name: 'relationship',
        label: 'Relationship',
        data: RELATIONSHIPS,
        defaultValue: RELATIONSHIPS[0],
        editable: false,
      },
      {
        type: 'input',
        name: 'age',
        label: 'Age *',
        required: true,
        keyboardType: 'numeric',
        placeholder: 'Enter age',
      },
    ],
  },
];

// ─── Health Floater constants ──────────────────────────────────────────────────

export const ADULT_RELATIONSHIPS = RELATIONSHIPS.filter(
  r => !['son', 'daughter'].includes(r.id),
);

export const CHILD_RELATIONSHIPS = RELATIONSHIPS.filter(r =>
  ['son', 'daughter'].includes(r.id),
);

/** Dropdown options: how many adults (1–6) */
export const ADULT_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6].map(n => ({
  id: n,
  label: String(n),
  value: String(n),
}));

/** Dropdown options: how many children (0–4) */
export const CHILDREN_COUNT_OPTIONS = [1, 2, 3, 4].map(n => ({
  id: n,
  label: String(n),
  value: String(n),
}));

