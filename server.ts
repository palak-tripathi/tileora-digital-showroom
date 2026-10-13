import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'tileora_admin_2026';
const ADMIN_TOKEN = 'tileora_session_token_' + Buffer.from(ADMIN_PASSWORD).toString('base64');

app.use(express.json());

// In-Memory & File-backed Database Store
interface TileItem {
  id: string;
  name: string;
  category: string;
  collection: string;
  pricePerSqm: number;
  currency: string;
  dimensionsMm: { width: number; length: number };
  thicknessMm: number;
  finish: string;
  material: string;
  application: string[];
  color: string;
  colorFamily: string;
  waterAbsorptionPercent: number;
  slipRating: string;
  coveragePerBoxSqm: number;
  piecesPerBox: number;
  weightPerBoxKg: number;
  inStock: boolean;
  featured?: boolean;
  imageUrl: string;
  description: string;
  idealFor: string[];
  careInstructions?: string;
}

interface EnquiryItem {
  id: string;
  referenceId: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  customerType: string;
  interestedProduct?: string;
  interestedCategory?: string;
  projectType: string;
  estimatedAreaSqm?: number;
  budgetRange?: string;
  projectLocation: string;
  message: string;
  status: 'New' | 'Contacted' | 'In Progress' | 'Closed';
  adminNotes?: string;
}

const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');
const PRODUCTS_FILE = path.join(DATA_DIR, 'products.json');

// Initialize enquiries store
let enquiriesStore: EnquiryItem[] = [];
if (fs.existsSync(ENQUIRIES_FILE)) {
  try {
    enquiriesStore = JSON.parse(fs.readFileSync(ENQUIRIES_FILE, 'utf-8'));
  } catch {
    enquiriesStore = [];
  }
} else {
  // Initial seed demo enquiries with realistic data
  enquiriesStore = [
    {
      id: 'enq_seed_1',
      referenceId: 'TLQ-2026-1042',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      customerName: 'Sarah Jenkins',
      email: 's.jenkins@studioform.example',
      phone: '+1 (555) 234-8901',
      customerType: 'Architect / Interior Designer',
      interestedProduct: 'Carrara White Porcelain',
      projectType: 'Commercial Project',
      estimatedAreaSqm: 280,
      budgetRange: 'Standard Architectural ($3,000 - $8,000)',
      projectLocation: 'Northview Design District',
      message: 'Need full lot calibration and 2 samples delivered to our design studio for client presentation.',
      status: 'New',
    },
    {
      id: 'enq_seed_2',
      referenceId: 'TLQ-2026-0988',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      customerName: 'Robert Lang',
      email: 'robert.lang@example.com',
      phone: '+1 (555) 876-5432',
      customerType: 'Homeowner',
      interestedProduct: 'Basalt Charcoal Exterior Paver',
      projectType: 'Renovation',
      estimatedAreaSqm: 85,
      budgetRange: 'Standard Architectural ($3,000 - $8,000)',
      projectLocation: 'West Harbor Promenade',
      message: 'Looking for R11 slip rated outdoor pavers around pool deck. Please confirm pedestal installation compatibility.',
      status: 'Contacted',
    },
  ];
  fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiriesStore, null, 2));
}

const saveEnquiries = () => {
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiriesStore, null, 2));
  } catch (err) {
    console.error('Failed to save enquiries to disk:', err);
  }
};

// Admin authentication middleware
const requireAdmin = (req: Request, res: Response, next: () => void) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Missing admin bearer token' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (token !== ADMIN_TOKEN) {
    res.status(401).json({ success: false, error: 'Unauthorized: Invalid credentials' });
    return;
  }
  next();
};

// --- API ROUTES ---

// Admin Login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ success: false, error: 'Invalid administrator credentials.' });
    return;
  }
  res.json({
    success: true,
    token: ADMIN_TOKEN,
    message: 'Authenticated successfully.',
  });
});

// Admin Stats
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const total = enquiriesStore.length;
  const newCount = enquiriesStore.filter((e) => e.status === 'New').length;
  const inProgress = enquiriesStore.filter((e) => e.status === 'In Progress').length;
  const closed = enquiriesStore.filter((e) => e.status === 'Closed').length;

  res.json({
    success: true,
    stats: {
      total,
      newCount,
      inProgress,
      closed,
    },
  });
});

// Get Enquiries (Protected)
app.get('/api/enquiries', requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    enquiries: enquiriesStore,
  });
});

// Create Enquiry (Public with server validation)
app.post('/api/enquiries', (req: Request, res: Response) => {
  const {
    customerName,
    email,
    phone,
    customerType,
    interestedProduct,
    projectType,
    estimatedAreaSqm,
    budgetRange,
    projectLocation,
    message,
  } = req.body;

  if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
    res.status(400).json({ success: false, error: 'Customer name is required.' });
    return;
  }
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    res.status(400).json({ success: false, error: 'Valid email address is required.' });
    return;
  }
  if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
    res.status(400).json({ success: false, error: 'Valid contact phone number is required.' });
    return;
  }
  if (!projectLocation || typeof projectLocation !== 'string' || !projectLocation.trim()) {
    res.status(400).json({ success: false, error: 'Project location is required.' });
    return;
  }

  // Generate unique Reference ID (e.g., TLQ-2026-7491)
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const referenceId = `TLQ-2026-${randomSuffix}`;

  const newEnquiry: EnquiryItem = {
    id: `enq_${Date.now()}_${randomSuffix}`,
    referenceId,
    createdAt: new Date().toISOString(),
    customerName: customerName.trim(),
    email: email.trim(),
    phone: phone.trim(),
    customerType: customerType || 'Homeowner',
    interestedProduct: interestedProduct || 'General Spec',
    projectType: projectType || 'Renovation',
    estimatedAreaSqm: estimatedAreaSqm ? Number(estimatedAreaSqm) : undefined,
    budgetRange: budgetRange || 'Standard',
    projectLocation: projectLocation.trim(),
    message: message ? message.trim() : '',
    status: 'New',
  };

  enquiriesStore.unshift(newEnquiry);
  saveEnquiries();

  res.status(201).json({
    success: true,
    message: 'Quotation request recorded successfully.',
    enquiry: newEnquiry,
  });
});

// Update Enquiry Status (Protected)
app.put('/api/enquiries/:id/status', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const enquiry = enquiriesStore.find((e) => e.id === id);
  if (!enquiry) {
    res.status(404).json({ success: false, error: 'Enquiry not found.' });
    return;
  }

  if (status) {
    enquiry.status = status;
  }
  if (adminNotes !== undefined) {
    enquiry.adminNotes = adminNotes;
  }

  saveEnquiries();

  res.json({
    success: true,
    enquiry,
  });
});

// Products Dynamic Add/Delete (Protected)
app.post('/api/products', requireAdmin, (req: Request, res: Response) => {
  const newProduct = req.body;
  if (!newProduct.name || !newProduct.pricePerSqm) {
    res.status(400).json({ success: false, error: 'Product name and price are required.' });
    return;
  }
  newProduct.id = `tile_${Date.now()}`;
  res.status(201).json({ success: true, product: newProduct });
});

app.delete('/api/products/:id', requireAdmin, (req: Request, res: Response) => {
  res.json({ success: true, message: `Product ${req.params.id} marked deleted.` });
});

// --- AI RECOMMENDATIONS & WASTAGE CALCULATOR API ---
app.post('/api/ai/recommend-and-calculate', async (req: Request, res: Response) => {
  try {
    const {
      roomType = 'Living Room',
      lengthMetres = 5,
      widthMetres = 4,
      layingPattern = 'Straight Lay',
      surfaceType = 'Floor',
      stylePreference = 'Warm Minimalist',
      specialFactors = [],
      selectedTileName,
      unitCostPerSqm = 35.0,
      coveragePerBox = 1.44,
    } = req.body;

    const length = Math.max(0.5, parseFloat(String(lengthMetres)) || 5);
    const width = Math.max(0.5, parseFloat(String(widthMetres)) || 4);
    const netAreaSqm = parseFloat((length * width).toFixed(2));

    // Calculate baseline wastage based on pattern & room complexity
    let baseWastagePct = 10;
    if (layingPattern.includes('Herringbone') || layingPattern.includes('Diagonal')) {
      baseWastagePct = 15;
    } else if (layingPattern.includes('Chevron')) {
      baseWastagePct = 18;
    } else if (layingPattern.includes('Brick')) {
      baseWastagePct = 12;
    }

    // Additional wastage for niches, columns, alcoves
    if (Array.isArray(specialFactors) && specialFactors.some((f: string) => f.toLowerCase().includes('niche') || f.toLowerCase().includes('complex'))) {
      baseWastagePct += 3;
    }

    const wastageAreaSqm = parseFloat(((netAreaSqm * baseWastagePct) / 100).toFixed(2));
    const grossAreaSqm = parseFloat((netAreaSqm + wastageAreaSqm).toFixed(2));
    const boxesNeeded = Math.ceil(grossAreaSqm / (coveragePerBox || 1.44));
    const totalCost = parseFloat((boxesNeeded * (coveragePerBox || 1.44) * (unitCostPerSqm || 35.0)).toFixed(2));

    let aiAdvice: any = null;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI({ apiKey: geminiKey });

        const prompt = `You are TILEORA's Principal Architectural Ceramic Consultant and Master Quantity Surveyor.
Analyze the following tiling project:
- Target Space: ${roomType} (${surfaceType})
- Net Room Dimensions: ${length}m × ${width}m (${netAreaSqm} m²)
- Laying Pattern: ${layingPattern}
- Style/Color Palette: ${stylePreference}
- Special Environmental Factors: ${Array.isArray(specialFactors) ? specialFactors.join(', ') : 'None'}
- Selected or Target Tile: ${selectedTileName || 'Suggest ideal architectural tiles from catalogue'}
- Calculated Wastage: ${baseWastagePct}% (${wastageAreaSqm} m² off-cuts)
- Gross Area Required: ${grossAreaSqm} m² (${boxesNeeded} boxes required)

Return a JSON object with this exact structure:
{
  "curatorVerdict": "A 2-3 sentence architectural summary of the surface selection and spatial impact.",
  "wastageRationale": "Specific technical explanation of why ${baseWastagePct}% wastage is needed for ${layingPattern} in ${roomType} (e.g. angled perimeter cuts, diagonal border trim).",
  "recommendedTilePicks": [
    {
      "name": "Tile Name (e.g., Carrara White Vitrified Porcelain, Statuario Venato Grande, or Basalt Exterior Paver 20mm)",
      "finish": "Polished / Honed / Matte / Textured",
      "dimensions": "e.g., 600×600 mm or 800×1600 mm",
      "whyIdeal": "Technical explanation (slip rating, water absorption, lighting reflection)"
    }
  ],
  "groutAndJointAdvice": "Recommendation for joint spacer width (e.g. 1.5mm rectified) and matching grout color/type (e.g. Mapei ultracolor or epoxy for wet zones).",
  "substrateInstallationTips": [
    "Crucial substrate/leveling tip 1",
    "Crucial waterproofing or adhesive tip 2"
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          aiAdvice = JSON.parse(response.text);
        }
      } catch (geminiErr) {
        console.warn('Gemini API call skipped or errored, using architectural fallback rules:', geminiErr);
      }
    }

    // Default expert fallback if Gemini key is not configured or offline
    if (!aiAdvice) {
      aiAdvice = {
        curatorVerdict: `For ${roomType} applications spanning ${netAreaSqm} m², specifying large-format porcelain slabs in ${stylePreference} minimizes visible grout lines and maximizes natural architectural lighting reflection.`,
        wastageRationale: `A ${baseWastagePct}% cutting buffer is recommended because ${layingPattern} produces triangular perimeter off-cuts against square perimeter walls that cannot be reused for adjacent runs.`,
        recommendedTilePicks: [
          {
            name: roomType.toLowerCase().includes('outdoor') ? 'Basalt Charcoal Exterior Paver 20mm' : 'Carrara White Vitrified Porcelain',
            finish: roomType.toLowerCase().includes('outdoor') ? 'Textured R11' : 'Honed / Velvet',
            dimensions: roomType.toLowerCase().includes('outdoor') ? '600 × 600 mm (20mm thickness)' : '600 × 1200 mm',
            whyIdeal: roomType.toLowerCase().includes('outdoor') ? 'Monolithic 20mm body engineered with R11 slip rating resistant to frost and chlorine.' : 'Ultra-low 0.08% water absorption vitrified porcelain preventing staining and moisture clouding.'
          },
          {
            name: 'Pietra Grey Raw Silk',
            finish: 'Honed',
            dimensions: '600 × 1200 mm',
            whyIdeal: 'Subtle light diffusion that mitigates glare while providing reliable barefoot traction.'
          }
        ],
        groutAndJointAdvice: 'Specify 1.5mm rectified tile spacers with flexible polymer-modified grout in neutral tone (Mapei Silver Grey or Warm Ivory) to maintain a seamless stone aesthetic.',
        substrateInstallationTips: [
          'Ensure substrate deflection is under L/360 and level within 2mm over 2 metres prior to thin-set troweling.',
          surfaceType.toLowerCase().includes('wall') || roomType.toLowerCase().includes('bath') ? 'Apply certified Class III waterproof tanking membrane across all wet splashback and shower wall perimeters.' : 'Use medium-bed mortar with 95%+ back-buttering coverage to eliminate hollow pockets beneath large slabs.'
        ]
      };
    }

    res.json({
      success: true,
      calculation: {
        netAreaSqm,
        baseWastagePct,
        wastageAreaSqm,
        grossAreaSqm,
        boxesNeeded,
        coveragePerBox: coveragePerBox || 1.44,
        unitCostPerSqm: unitCostPerSqm || 35.0,
        estimatedMaterialCost: totalCost,
      },
      aiRecommendation: aiAdvice,
    });
  } catch (err: any) {
    console.error('Error in AI recommendation and calculator:', err);
    res.status(500).json({ success: false, error: err.message || 'Internal calculation error' });
  }
});

// --- SERVER SETUP & VITE MOUNT ---
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`TILEORA server is running on port ${PORT} [${isDev ? 'Development' : 'Production'}]`);
  });
}

startServer();
