export const ADMIN_NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'users', label: 'Users' },
  { id: 'catalog', label: 'Catalog' },
  { id: 'orders', label: 'Orders' },
  { id: 'ai', label: 'AI Performance' },
];

export const MONTHLY_REVENUE_DATA = [
  { month: 'Jan', revenue: 62400, growth: 6.2 },
  { month: 'Feb', revenue: 71200, growth: 14.1 },
  { month: 'Mar', revenue: 68800, growth: -3.4 },
  { month: 'Apr', revenue: 82400, growth: 19.8 },
  { month: 'May', revenue: 91600, growth: 11.2 },
  { month: 'Jun', revenue: 98200, growth: 7.2 },
  { month: 'Jul', revenue: 105400, growth: 7.3 },
  { month: 'Aug', revenue: 112800, growth: 7.0 },
  { month: 'Sep', revenue: 118600, growth: 5.1 },
  { month: 'Oct', revenue: 124500, growth: 5.0 },
  { month: 'Nov', revenue: 131200, growth: 5.4 },
  { month: 'Dec', revenue: 142800, growth: 8.8 },
];

/** 7-day time series for interactive Business Overview KPI chart */
export const ADMIN_KPI_GRAPH_DATA = {
  revenue: [
    { name: 'Mon', value: 90000 },
    { name: 'Tue', value: 110000 },
    { name: 'Wed', value: 124500 },
    { name: 'Thu', value: 118200 },
    { name: 'Fri', value: 132800 },
    { name: 'Sat', value: 141600 },
    { name: 'Sun', value: 138400 },
  ],
  users: [
    { name: 'Mon', value: 7800 },
    { name: 'Tue', value: 8100 },
    { name: 'Wed', value: 8432 },
    { name: 'Thu', value: 8290 },
    { name: 'Fri', value: 8610 },
    { name: 'Sat', value: 8920 },
    { name: 'Sun', value: 8750 },
  ],
  accuracy: [
    { name: 'Mon', value: 97.5 },
    { name: 'Tue', value: 97.8 },
    { name: 'Wed', value: 98.2 },
    { name: 'Thu', value: 98.0 },
    { name: 'Fri', value: 98.4 },
    { name: 'Sat', value: 98.1 },
    { name: 'Sun', value: 98.3 },
  ],
  conversion: [
    { name: 'Mon', value: 4.2 },
    { name: 'Tue', value: 4.5 },
    { name: 'Wed', value: 4.8 },
    { name: 'Thu', value: 4.6 },
    { name: 'Fri', value: 5.1 },
    { name: 'Sat', value: 4.9 },
    { name: 'Sun', value: 5.0 },
  ],
};

/** Maps StatCard ids to graphData keys */
export const ADMIN_KPI_METRIC_KEY = {
  revenue: 'revenue',
  users: 'users',
  'face-accuracy': 'accuracy',
  conversion: 'conversion',
};

export const ADMIN_KPI_CHART_CONFIG = {
  revenue: {
    title: 'Revenue Trend',
    subtitle: 'Daily revenue · last 7 days · INR',
    stroke: '#10b981',
    barFill: '#10b981',
    ring: 'ring-emerald-500',
    activeBorder: 'border-emerald-500',
    valueFormatter: (value) => `₹${Number(value).toLocaleString('en-IN')}`,
    yAxisFormatter: (value) =>
      value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : `₹${(value / 1000).toFixed(0)}K`,
  },
  users: {
    title: 'Active Users Trend',
    subtitle: 'Daily active users · last 7 days',
    stroke: '#3b82f6',
    barFill: '#3b82f6',
    ring: 'ring-blue-500',
    activeBorder: 'border-blue-500',
    valueFormatter: (value) => Number(value).toLocaleString('en-IN'),
    yAxisFormatter: (value) => `${(value / 1000).toFixed(1)}K`,
  },
  accuracy: {
    title: 'Face Login Accuracy',
    subtitle: '7-day rolling accuracy · percent',
    stroke: '#a855f7',
    barFill: '#a855f7',
    ring: 'ring-violet',
    activeBorder: 'border-violet-500',
    valueFormatter: (value) => `${Number(value).toFixed(1)}%`,
    yAxisFormatter: (value) => `${value}%`,
  },
  conversion: {
    title: 'Conversion Rate Trend',
    subtitle: 'Catalog → purchase · last 7 days',
    stroke: '#f97316',
    barFill: '#f97316',
    ring: 'ring-orange-500',
    activeBorder: 'border-orange-500',
    valueFormatter: (value) => `${Number(value).toFixed(1)}%`,
    yAxisFormatter: (value) => `${value}%`,
  },
};

export const ADMIN_KPI_CARDS = [
  {
    id: 'revenue',
    label: 'Total Revenue',
    value: '₹1,24,500',
    trend: '+12%',
    trendUp: true,
    caption: 'vs last 30 days',
  },
  {
    id: 'users',
    label: 'Active Users',
    value: '8,432',
    trend: '+5%',
    trendUp: true,
    caption: 'monthly active',
  },
  {
    id: 'face-accuracy',
    label: 'AI Face Login Accuracy',
    value: '98.2%',
    trend: '+0.4%',
    trendUp: true,
    caption: '7-day rolling avg',
  },
  {
    id: 'conversion',
    label: 'Conversion Rate',
    value: '4.8%',
    trend: '+0.6%',
    trendUp: true,
    caption: 'catalog → purchase',
  },
];

export const AI_TRYON_SUCCESS_RATE = 92;

export const AI_TRYON_DONUT_DATA = [
  { name: 'Successful', value: 92, fill: '#e91e8c' },
  { name: 'Partial', value: 5, fill: 'rgba(233, 30, 140, 0.35)' },
  { name: 'Failed', value: 3, fill: '#150d22' },
];

export const USER_DEMOGRAPHICS_DATA = [
  { name: 'Women', value: 48, fill: '#1F2937' },
  { name: 'Men', value: 38, fill: '#7c3aed' },
  { name: 'Non-binary', value: 9, fill: '#9CA3AF' },
  { name: 'Prefer not to say', value: 5, fill: '#E5E7EB' },
];

export const MOST_TRIED_PRODUCTS = [
  {
    id: 'try-1',
    name: 'Classic Navy Blazer',
    brand: 'ZARA',
    count: 1240,
    max: 1240,
    image_url:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'try-2',
    name: 'Silk Midi Dress',
    brand: 'ARKET',
    count: 986,
    max: 1240,
    image_url:
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'try-3',
    name: 'Oversized Wool Coat',
    brand: 'COS',
    count: 842,
    max: 1240,
    image_url:
      'https://images.unsplash.com/photo-1594938291221-94f313b0e6ad?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'try-4',
    name: 'Leather Low Sneaker',
    brand: 'COMMON PROJECTS',
    count: 715,
    max: 1240,
    image_url:
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200',
  },
];

export const MOST_PURCHASED_PRODUCTS = [
  {
    id: 'buy-1',
    name: 'Minimal Denim Shirt',
    brand: 'UNIQLO',
    count: 532,
    max: 532,
    image_url:
      'https://images.unsplash.com/photo-1602810318383-0e0111714b98?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'buy-2',
    name: 'Linen Wide Trousers',
    brand: 'ZARA',
    count: 478,
    max: 532,
    image_url:
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'buy-3',
    name: 'Cashmere Crew Sweater',
    brand: 'MASSIMO DUTTI',
    count: 401,
    max: 532,
    image_url:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&q=80&w=200',
  },
  {
    id: 'buy-4',
    name: 'Chelsea Boot',
    brand: 'ACNE STUDIOS',
    count: 356,
    max: 532,
    image_url:
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&q=80&w=200',
  },
];

export const RECENT_ORDERS = [
  {
    id: 'ORD-84729',
    customer: 'Aisha Sharma',
    amount: 12499,
    status: 'Delivered',
    date: '2026-06-18',
  },
  {
    id: 'ORD-84712',
    customer: 'Rohan Mehta',
    amount: 7498,
    status: 'Processing',
    date: '2026-06-18',
  },
  {
    id: 'ORD-84698',
    customer: 'Priya Nair',
    amount: 4299,
    status: 'Confirmed',
    date: '2026-06-17',
  },
  {
    id: 'ORD-84671',
    customer: 'Vikram Singh',
    amount: 18997,
    status: 'Shipped',
    date: '2026-06-17',
  },
  {
    id: 'ORD-84655',
    customer: 'Meera Kapoor',
    amount: 3299,
    status: 'Delivered',
    date: '2026-06-16',
  },
];

export const ADMIN_USER_STATS = [
  {
    id: 'total-registered',
    label: 'Total Registered',
    value: '12,840',
    trend: '+18%',
    trendUp: true,
    caption: 'vs last 30 days',
  },
  {
    id: 'face-enrolled',
    label: 'Face Enrolled',
    value: '9,214',
    trend: '+12%',
    trendUp: true,
    caption: 'biometric adoption',
  },
  {
    id: 'onboarding-complete',
    label: 'Onboarding Complete',
    value: '7,892',
    trend: '+9%',
    trendUp: true,
    caption: 'profile completion',
  },
  {
    id: 'churn',
    label: 'Churn (30d)',
    value: '2.1%',
    trend: '-0.3%',
    trendUp: false,
    caption: 'vs prior month',
  },
];

export const ADMIN_CATALOG_STATS = [
  {
    id: 'live-skus',
    label: 'Live SKUs',
    value: '148',
    trend: '+6',
    trendUp: true,
    caption: 'new this month',
  },
  {
    id: 'out-of-stock',
    label: 'Out of Stock',
    value: '6',
    trend: '-2',
    trendUp: true,
    caption: 'inventory health',
  },
  {
    id: 'avg-margin',
    label: 'Avg. Margin',
    value: '42%',
    trend: '+1.2%',
    trendUp: true,
    caption: 'gross margin',
  },
  {
    id: 'tryon-ctr',
    label: 'Try-On CTR',
    value: '18.4%',
    trend: '+2.1%',
    trendUp: true,
    caption: 'catalog engagement',
  },
];

export const ADMIN_AI_METRICS = [
  {
    id: 'chat-sessions',
    label: 'Stylist Chat Sessions',
    value: '3,420',
    trend: '+14%',
    trendUp: true,
    caption: 'vs last 30 days',
  },
  {
    id: 'tryon-renders',
    label: 'Try-On Renders',
    value: '8,104',
    trend: '+22%',
    trendUp: true,
    caption: 'virtual try-on',
  },
  {
    id: 'outfit-gen',
    label: 'Outfit Generations',
    value: '5,672',
    trend: '+11%',
    trendUp: true,
    caption: 'AI stylist output',
  },
  {
    id: 'inference-latency',
    label: 'Avg. Inference Latency',
    value: '1.8s',
    trend: '-0.4s',
    trendUp: true,
    caption: 'p95 response time',
  },
];

export const ORDER_STATUS_STYLES = {
  Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  Processing: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  Confirmed: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
  Shipped: 'bg-violet/10 text-violet border-violet/30',
  Cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

export function formatAdminCurrency(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

export function formatAdminDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
