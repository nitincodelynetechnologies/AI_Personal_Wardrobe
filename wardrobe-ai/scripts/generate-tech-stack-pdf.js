/**
 * Generates docs/TECH_STACK.pdf from structured content using pdfkit.
 * Run: node scripts/generate-tech-stack-pdf.js
 */
const fs = require('fs');
const path = require('path');

async function main() {
  const PDFDocument = require('pdfkit');
  const outPath = path.join(__dirname, '..', 'docs', 'TECH_STACK.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 56, bottom: 56, left: 56, right: 56 },
    info: {
      Title: 'AI Personal Wardrobe — Technology Stack',
      Author: 'AI Personal Wardrobe Platform',
      Subject: 'Languages, Frameworks, and Libraries',
    },
  });

  const stream = fs.createWriteStream(outPath);
  doc.pipe(stream);

  const colors = {
    primary: '#1e3a5f',
    accent: '#2563eb',
    text: '#1f2937',
    muted: '#6b7280',
    line: '#e5e7eb',
  };

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

  function ensureSpace(needed = 40) {
    if (doc.y + needed > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
    }
  }

  function drawHeader() {
    doc
      .fillColor(colors.primary)
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('AI Personal Wardrobe & Virtual Fashion Platform', { align: 'center' });
    doc.moveDown(0.3);
    doc
      .fillColor(colors.accent)
      .fontSize(14)
      .text('Technology Stack Reference', { align: 'center' });
    doc.moveDown(0.4);
    doc
      .fillColor(colors.muted)
      .fontSize(10)
      .font('Helvetica')
      .text('Document version 1.0  •  June 18, 2026  •  wardrobe-ai/', { align: 'center' });
    doc.moveDown(1.2);
    doc
      .strokeColor(colors.line)
      .lineWidth(1)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc.moveDown(1);
  }

  function section(title) {
    ensureSpace(50);
    doc.fillColor(colors.primary).fontSize(14).font('Helvetica-Bold').text(title);
    doc.moveDown(0.4);
  }

  function subsection(title) {
    ensureSpace(36);
    doc.fillColor(colors.accent).fontSize(11).font('Helvetica-Bold').text(title);
    doc.moveDown(0.25);
  }

  function paragraph(text) {
    ensureSpace(24);
    doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(text, {
      width: pageWidth,
      lineGap: 3,
    });
    doc.moveDown(0.5);
  }

  function bullet(items) {
    items.forEach((item) => {
      ensureSpace(18);
      doc.fillColor(colors.text).fontSize(10).font('Helvetica').text(`•  ${item}`, {
        width: pageWidth - 12,
        indent: 12,
        lineGap: 2,
      });
    });
    doc.moveDown(0.4);
  }

  function table(headers, rows, colWidths) {
    const rowHeight = 18;
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    ensureSpace(rowHeight * (rows.length + 2));

    let x = doc.page.margins.left;
    let y = doc.y;

    doc.fillColor('#f3f4f6').rect(x, y, totalWidth, rowHeight).fill();
    doc.fillColor(colors.primary).fontSize(8).font('Helvetica-Bold');
    headers.forEach((h, i) => {
      doc.text(h, x + 4, y + 5, { width: colWidths[i] - 8, lineBreak: false });
      x += colWidths[i];
    });
    y += rowHeight;

    rows.forEach((row, ri) => {
      x = doc.page.margins.left;
      if (ri % 2 === 0) {
        doc.fillColor('#fafafa').rect(x, y, totalWidth, rowHeight).fill();
      }
      doc.fillColor(colors.text).fontSize(7.5).font('Helvetica');
      row.forEach((cell, i) => {
        doc.text(String(cell), x + 4, y + 5, { width: colWidths[i] - 8, lineBreak: false });
        x += colWidths[i];
      });
      y += rowHeight;
    });

    doc.y = y + 8;
  }

  drawHeader();

  section('1. Executive Summary');
  paragraph(
    'This platform is a multi-service, Docker-first application for AI-powered wardrobe management, face authentication, outfit styling, and virtual fashion. It combines a JavaScript web stack with Python microservices for machine learning, PostgreSQL for relational data, and Qdrant for vector search.',
  );

  section('2. Languages Used');
  table(
    ['Language', 'Where Used', 'Why'],
    [
      ['TypeScript', 'Backend (NestJS)', 'Strong typing, safer API contracts, NestJS ecosystem'],
      ['JavaScript (JSX)', 'Frontend (Next.js)', 'React/Next convention, fast UI iteration'],
      ['Python 3', 'AI microservices', 'Best ML libraries: InsightFace, PyTorch, rembg, OpenCV'],
      ['SQL', 'Migrations & schema', 'PostgreSQL relational integrity and indexes'],
      ['YAML / Shell', 'Docker & scripts', 'Reproducible infrastructure-as-code'],
    ],
    [70, 130, pageWidth - 200],
  );

  section('3. Architecture');
  paragraph(
    'Browser → Next.js Frontend (3003 dev / 3000 Docker) → NestJS API Gateway (3001) → PostgreSQL (5432), Qdrant (6333), Face Service (8000), Stylist Service (8001).',
  );
  bullet([
    'Docker-first: single docker-compose.yml for six core services',
    'Internal network: wardrobe-network with container hostnames',
    'Graceful degradation: backend fallbacks when AI services are down',
    'Local-first: no cloud required for development',
  ]);

  section('4. Frontend Stack');
  subsection('Core');
  table(
    ['Technology', 'Version', 'Why'],
    [
      ['Next.js', '15.x', 'App Router, SSR, image optimization, API rewrites'],
      ['React', '19.x', 'Component UI, large ecosystem'],
      ['Tailwind CSS', '3.4.x', 'Rapid styling, design tokens, small bundles'],
    ],
    [90, 55, pageWidth - 145],
  );

  subsection('UI & State');
  bullet([
    'Radix UI — accessible dialogs, tabs, select (WAI-ARIA primitives)',
    'ShadCN pattern (CVA + clsx + tailwind-merge) — customizable components',
    'Zustand — minimal global client state (auth, wardrobe cache)',
    'TanStack Query — server state, caching, optimistic mutations',
    'React Hook Form + Zod — performant forms with schema validation',
    'Lucide React + next-themes — icons and dark/light mode',
  ]);

  subsection('Face Auth & Media');
  bullet([
    '@vladmandic/face-api + TensorFlow.js — browser face detection for camera preview',
    'browser-image-compression — WebP upload compression (~500KB, 1024px max)',
    'Next.js Image — lazy loading, responsive sizes, WebP/AVIF',
  ]);

  section('5. Backend Stack (NestJS Gateway)');
  table(
    ['Library', 'Purpose', 'Why'],
    [
      ['NestJS 10', 'API framework', 'Modules, DI, guards, enterprise structure'],
      ['JWT + Passport', 'Authentication', 'Stateless sessions, standard Nest pattern'],
      ['bcryptjs', 'Password hashing', 'Secure credential storage'],
      ['class-validator', 'DTO validation', 'Decorator-based request validation'],
      ['@nestjs/swagger', 'API docs', 'OpenAPI at /api/docs'],
      ['pg', 'PostgreSQL', 'Relational data, migrations'],
      ['@qdrant/js-client-rest', 'Vector DB', 'Face similarity search'],
      ['Jest', 'Testing', 'Unit tests for services'],
    ],
    [100, 110, pageWidth - 210],
  );

  section('6. AI Services (Python / FastAPI)');
  subsection('Face Service — Port 8000');
  bullet([
    'InsightFace + ONNX Runtime — 512-dim ArcFace embeddings for login/register',
    'OpenCV + Pillow + NumPy — image preprocessing',
    'Isolated service keeps heavy ML models out of the Node gateway',
  ]);

  subsection('Stylist Service — Port 8001');
  bullet([
    'PyTorch + torchvision (MobileNetV2) — clothing category & 512-dim embeddings',
    'scikit-learn K-Means — dominant color extraction',
    'rembg (U-2-Net) — automatic background removal on wardrobe upload',
    'FastAPI + Uvicorn + Pydantic — consistent API layer with face-service',
  ]);

  section('7. Databases & DevOps');
  table(
    ['Technology', 'Port', 'Role'],
    [
      ['PostgreSQL', '5432', 'Users, wardrobe, outfits (ACID relational)'],
      ['Qdrant', '6333', 'Face & clothing vector similarity search'],
      ['Docker Compose', '—', '6-service reproducible stack'],
      ['Named volumes', '—', 'Persistent data across restarts'],
    ],
    [100, 50, pageWidth - 150],
  );

  section('8. Local Service URLs');
  table(
    ['Service', 'URL'],
    [
      ['Frontend (npm dev)', 'http://localhost:3003'],
      ['Frontend (Docker)', 'http://localhost:3000'],
      ['Backend API', 'http://localhost:3001/api'],
      ['Swagger UI', 'http://localhost:3001/api/docs'],
      ['Face AI Service', 'http://localhost:8000'],
      ['Stylist AI Service', 'http://localhost:8001'],
      ['PostgreSQL', 'localhost:5432'],
      ['Qdrant', 'http://localhost:6333'],
    ],
    [130, pageWidth - 130],
  );

  section('9. Key Design Decisions');
  table(
    ['Decision', 'Why This Stack Won'],
    [
      ['Next.js over plain SPA', 'Routing, image optimization, API rewrites, SSR'],
      ['NestJS over raw Express', 'Modules, guards, Swagger, scales with features'],
      ['Python for AI', 'InsightFace, rembg, PyTorch — best ML ecosystem'],
      ['Postgres + Qdrant', 'Relational integrity + local vector search'],
      ['Zustand + React Query', 'Less boilerplate; clear client vs server state'],
      ['Docker Compose (not K8s yet)', 'Right size for local dev and MVP'],
    ],
    [120, pageWidth - 120],
  );

  section('10. Feature-to-Technology Map');
  table(
    ['Feature', 'Technologies'],
    [
      ['Face auth', 'face-api.js, InsightFace, Qdrant, JWT'],
      ['Wardrobe catalog', 'Next.js, NestJS, PostgreSQL, stylist analysis'],
      ['Background removal', 'rembg + U-2-Net (stylist-service)'],
      ['Outfit styling', 'NestJS outfits, stylist recommendation engine'],
      ['Image optimization', 'browser-image-compression, Next.js Image'],
    ],
    [110, pageWidth - 110],
  );

  doc.moveDown(1);
  doc
    .strokeColor(colors.line)
    .lineWidth(0.5)
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .stroke();
  doc.moveDown(0.5);
  doc
    .fillColor(colors.muted)
    .fontSize(8)
    .font('Helvetica-Oblique')
    .text('Generated for the AI Personal Wardrobe & Virtual Fashion Platform project.', {
      align: 'center',
    });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  console.log(`PDF written to: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
