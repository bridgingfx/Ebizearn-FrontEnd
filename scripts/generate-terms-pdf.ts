/**
 * Generates public/legal/terms-and-conditions.pdf from the SINGLE source of
 * truth (src/legal/terms.ts) — the same structured content the /terms page
 * renders. Run: npm run legal:pdf  (also runs automatically via `prebuild`).
 *
 * Executed with tsx (devDependency); not part of `tsc -b`.
 */
import PDFDocument from 'pdfkit';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  COMPANY_ADDRESS,
  COMPANY_LEGAL_NAME,
  COMPANY_REGISTRATION_NUMBER,
  GOVERNING_LAW_SHORT,
  SUPPORT_EMAIL,
  TERMS_SECTIONS,
  TERMS_UPDATED,
  TERMS_VERSION,
  type LegalBlock,
} from '../src/legal/terms.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '../public/legal/terms-and-conditions.pdf');

const NAVY: [number, number, number] = [7, 24, 47];
const BLUE: [number, number, number] = [22, 139, 255];
const BODY: [number, number, number] = [51, 65, 85];
const MUTED: [number, number, number] = [100, 116, 139];

function renderBlock(doc: InstanceType<typeof PDFDocument>, block: LegalBlock): void {
  if (block.type === 'list') {
    for (const item of block.items ?? []) {
      const x = doc.x;
      doc.fillColor(BLUE).text('•', x, doc.y, { continued: true });
      doc.fillColor(BODY).font('Helvetica').fontSize(10.5).text(`  ${item}`, { continued: false });
      doc.moveDown(0.35);
    }
    doc.moveDown(0.25);
    return;
  }
  doc
    .fillColor(BODY)
    .font('Helvetica')
    .fontSize(10.5)
    .text(block.text ?? '', { align: 'justify', lineGap: 2 });
  doc.moveDown(0.6);
}

function main(): void {
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 64, bottom: 64, left: 64, right: 64 },
    bufferPages: true,
    info: {
      Title: `eBizEarn Terms of Service (v${TERMS_VERSION})`,
      Author: COMPANY_LEGAL_NAME,
      Subject: 'Terms of Service',
    },
  });

  const stream = fs.createWriteStream(OUT);
  doc.pipe(stream);

  // --- Cover header ---
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(26).text('eBizEarn');
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(20).text('Terms of Service');
  doc.moveDown(0.4);
  doc.fillColor(BLUE).font('Helvetica-Bold').fontSize(11)
    .text(`Version ${TERMS_VERSION} · Last updated ${TERMS_UPDATED}`);
  doc.moveDown(0.8);

  doc.fillColor(BODY).font('Helvetica').fontSize(10.5);
  doc.text(`Operated by ${COMPANY_LEGAL_NAME}.`, { lineGap: 2 });
  doc.text(`Registered address: ${COMPANY_ADDRESS}.`, { lineGap: 2 });
  doc.text(`Company registration number: ${COMPANY_REGISTRATION_NUMBER}.`, { lineGap: 2 });
  doc.text(`Contact: ${SUPPORT_EMAIL}.`, { lineGap: 2 });
  doc.text(`Governing law: the laws of ${GOVERNING_LAW_SHORT}; disputes are subject to the exclusive jurisdiction of the competent courts of Tbilisi, Georgia.`, { lineGap: 2 });
  doc.moveDown(1.2);

  // --- Sections ---
  for (const section of TERMS_SECTIONS) {
    // Keep headings with at least some body text.
    if (doc.y > doc.page.height - 160) doc.addPage();
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13)
      .text(`${section.n}. ${section.title}`);
    doc.moveDown(0.4);
    for (const block of section.blocks) renderBlock(doc, block);
    doc.moveDown(0.5);
  }

  // Footers: drawn after all content, by switching to each buffered page.
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(i);
    const { width, height } = doc.page;
    doc
      .font('Helvetica')
      .fontSize(8)
      .fillColor(MUTED)
      .text(`eBizEarn Terms of Service · v${TERMS_VERSION}`, 64, height - 44, {
        width: width - 128,
        align: 'left',
      })
      .text(`Page ${i + 1} of ${range.count}`, 64, height - 44, {
        width: width - 128,
        align: 'right',
      });
  }

  doc.end();

  stream.on('finish', () => {
    const bytes = fs.statSync(OUT).size;
    console.log(`Wrote ${path.relative(process.cwd(), OUT)} (${bytes} bytes, terms v${TERMS_VERSION})`);
  });
}

main();
