// Builds the engagement's downloadable PowerPoint report entirely in the
// browser (pptxgenjs), from the same data the on-screen report and the
// plain-text export use. No backend, no template file: every slide is
// composed here, and which sections end up in the deck is controlled by
// the caller's PptxExportOptions.

import pptxgen from 'pptxgenjs';
import type { ScopeDocument } from '../types';
import type { DetailedObservationGroup, PeerComparisonRow, RoadmapItem, RoadmapPhase } from './report';
import type { GapEntry } from './scoring';

const BRAND_DARK = '282728';
const BRAND_GREEN = '86BC25';
const BRAND_NEON = '86EB22';
const BRAND_BLUE = '00A3E0';
const WHITE = 'FFFFFF';
const FONT = 'Arial';

export interface PptxExportOptions {
  scope: boolean;
  executiveSummary: boolean;
  initiatives: boolean;
  observationsGaps: boolean;
  maturityIndustry: boolean;
  roadmap: boolean;
  detailedDomains: boolean;
}

export const DEFAULT_PPTX_OPTIONS: PptxExportOptions = {
  scope: true,
  executiveSummary: true,
  initiatives: true,
  observationsGaps: true,
  maturityIndustry: true,
  roadmap: true,
  detailedDomains: true,
};

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

function addHeaderSlide(pptx: pptxgen, title: string): pptxgen.Slide {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: BRAND_DARK } });
  slide.addShape(pptx.ShapeType.ellipse, { x: 12.5, y: -0.3, w: 1.2, h: 1.2, fill: { color: BRAND_GREEN } });
  slide.addText(title, { x: 0.4, y: 0, w: 11, h: 0.9, fontFace: FONT, fontSize: 22, bold: true, color: WHITE, valign: 'middle' });
  return slide;
}

function addCoverSlide(pptx: pptxgen, scopeDocument: ScopeDocument | undefined) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND_DARK };
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.8, y: 4.6, w: 3.2, h: 3.2, fill: { color: BRAND_GREEN }, line: { color: BRAND_GREEN } });
  slide.addShape(pptx.ShapeType.ellipse, { x: -1, y: -1.2, w: 2.2, h: 2.2, fill: { color: BRAND_BLUE } });
  slide.addText('Secure SDLC Assessment Report', {
    x: 0.7,
    y: 2.6,
    w: 10,
    h: 1.4,
    fontFace: FONT,
    fontSize: 36,
    bold: true,
    color: WHITE,
  });
  const subtitleParts = [
    scopeDocument?.reviewLevel === 'organization' ? 'Organization-level review' : scopeDocument?.reviewLevel === 'application' ? 'Application-level review' : null,
    scopeDocument?.applicationType || null,
  ].filter(Boolean);
  slide.addText(subtitleParts.length > 0 ? subtitleParts.join(' · ') : 'Engagement assessment summary', {
    x: 0.7,
    y: 4.0,
    w: 9,
    h: 0.6,
    fontFace: FONT,
    fontSize: 16,
    color: BRAND_NEON,
  });
  slide.addText(new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }), {
    x: 0.7,
    y: 6.6,
    w: 6,
    h: 0.4,
    fontFace: FONT,
    fontSize: 12,
    color: 'CCCCCC',
  });
}

function addScopeSlide(pptx: pptxgen, scopeDocument: ScopeDocument | undefined) {
  const slide = addHeaderSlide(pptx, 'Scope and Objectives');
  const level = scopeDocument?.reviewLevel === 'organization' ? 'an organization-level' : 'an application-level';
  const appType = scopeDocument?.applicationType ? ` (${scopeDocument.applicationType})` : '';
  const opening = `This engagement performed ${level} secure software development lifecycle assessment${appType}, benchmarked against industry-recognized frameworks to identify strengths, gaps, and a practical path to improved maturity.`;
  const bullets: pptxgen.TextProps[] = [{ text: opening, options: { bullet: false, breakLine: true, fontSize: 15, color: BRAND_DARK } }];
  if (scopeDocument?.complianceRequirements && scopeDocument.complianceRequirements.length > 0) {
    bullets.push({
      text: `Compliance requirements in scope: ${scopeDocument.complianceRequirements.join(', ')}`,
      options: { bullet: true, breakLine: true, fontSize: 14 },
    });
  }
  if (scopeDocument?.text.trim()) {
    bullets.push({ text: scopeDocument.text.trim(), options: { bullet: true, fontSize: 14 } });
  }
  slide.addText(bullets, { x: 0.6, y: 1.3, w: 12.1, h: 5.6, fontFace: FONT, valign: 'top', color: BRAND_DARK });
}

function addExecutiveSummarySlide(pptx: pptxgen, executiveSummary: string) {
  const slide = addHeaderSlide(pptx, 'Executive Summary');
  slide.addText(executiveSummary, {
    x: 0.6,
    y: 1.4,
    w: 12.1,
    h: 5.4,
    fontFace: FONT,
    fontSize: 16,
    color: BRAND_DARK,
    valign: 'top',
    lineSpacingMultiple: 1.3,
  });
}

function addInitiativesSlides(pptx: pptxgen, roadmap: RoadmapItem[]) {
  const items = roadmap.slice(0, 20);
  if (items.length === 0) {
    const slide = addHeaderSlide(pptx, 'Key Initiatives');
    slide.addText('No open initiatives. Every assessed control already meets the maturity threshold.', {
      x: 0.6,
      y: 1.4,
      w: 12,
      h: 1,
      fontFace: FONT,
      fontSize: 16,
      color: BRAND_DARK,
    });
    return;
  }
  for (const group of chunk(items, 8)) {
    const slide = addHeaderSlide(pptx, 'Key Initiatives');
    const bullets: pptxgen.TextProps[] = group.map((item) => ({
      text: `${item.frameworkShortName} ${item.controlCode}: ${item.recommendation}`,
      options: { bullet: true, breakLine: true, fontSize: 14 },
    }));
    slide.addText(bullets, { x: 0.6, y: 1.3, w: 12.1, h: 5.6, fontFace: FONT, color: BRAND_DARK, valign: 'top' });
  }
}

function addObservationsGapsSlides(pptx: pptxgen, gaps: GapEntry[]) {
  if (gaps.length === 0) {
    const slide = addHeaderSlide(pptx, 'Key Observations and Gaps');
    slide.addText('No significant gaps identified across in-scope controls.', {
      x: 0.6,
      y: 1.4,
      w: 12,
      h: 1,
      fontFace: FONT,
      fontSize: 16,
      color: BRAND_DARK,
    });
    return;
  }
  for (const group of chunk(gaps, 10)) {
    const slide = addHeaderSlide(pptx, 'Key Observations and Gaps');
    const rows: pptxgen.TableRow[] = [
      [
        { text: 'Framework', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Control', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Rating', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
      ],
      ...group.map(
        (gap): pptxgen.TableRow => [
          { text: gap.frameworkShortName },
          { text: `${gap.controlCode}: ${gap.controlName}` },
          { text: gap.rating === null ? 'Unrated' : `${gap.rating} / 3` },
        ],
      ),
    ];
    slide.addTable(rows, { x: 0.6, y: 1.3, w: 12.1, fontFace: FONT, fontSize: 12, colW: [2, 8.1, 2] });
  }
}

function addMaturityIndustrySlide(pptx: pptxgen, peerRows: PeerComparisonRow[]) {
  const slide = addHeaderSlide(pptx, 'Maturity Score vs. Industry Benchmark');
  const anyPeerSet = peerRows.some((r) => r.peerAverage !== null);
  if (anyPeerSet) {
    slide.addChart(
      pptx.ChartType.bar,
      [
        { name: 'Your average', labels: peerRows.map((r) => r.frameworkShortName), values: peerRows.map((r) => Number(r.yourAverage.toFixed(2))) },
        {
          name: 'Industry benchmark',
          labels: peerRows.map((r) => r.frameworkShortName),
          values: peerRows.map((r) => (r.peerAverage === null ? 0 : Number(r.peerAverage.toFixed(2)))),
        },
      ],
      {
        x: 0.6,
        y: 1.3,
        w: 12.1,
        h: 5.4,
        barDir: 'col',
        valAxisMaxVal: 3,
        chartColors: [BRAND_GREEN, BRAND_BLUE],
        showLegend: true,
        legendPos: 'b',
        showValAxisTitle: true,
        valAxisTitle: 'Maturity (0 to 3)',
      },
    );
  } else {
    const rows: pptxgen.TableRow[] = [
      [
        { text: 'Framework', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Your average', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Industry benchmark', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
      ],
      ...peerRows.map((row): pptxgen.TableRow => [{ text: row.frameworkShortName }, { text: `${row.yourAverage.toFixed(1)} / 3` }, { text: 'Not provided' }]),
    ];
    slide.addTable(rows, { x: 0.6, y: 1.3, w: 12.1, fontFace: FONT, fontSize: 14, colW: [4, 4.05, 4.05] });
    slide.addText('No industry benchmark values were entered for this engagement.', {
      x: 0.6,
      y: 5.6,
      w: 12,
      h: 0.5,
      fontFace: FONT,
      fontSize: 12,
      italic: true,
      color: '666666',
    });
  }
}

function addRoadmapSlide(pptx: pptxgen, roadmap: RoadmapItem[]) {
  const phases: RoadmapPhase[] = ['Now (0 to 30 days)', 'Next (31 to 90 days)', 'Later (90+ days)'];
  const slide = addHeaderSlide(pptx, 'Roadmap');
  const bullets: pptxgen.TextProps[] = [];
  for (const phase of phases) {
    const items = roadmap.filter((r) => r.phase === phase);
    if (items.length === 0) continue;
    bullets.push({ text: phase, options: { bold: true, breakLine: true, fontSize: 15, color: BRAND_DARK } });
    for (const item of items) {
      bullets.push({
        text: `${item.frameworkShortName} ${item.controlCode}: ${item.controlName}`,
        options: { bullet: true, breakLine: true, fontSize: 13, color: BRAND_DARK },
      });
    }
  }
  if (bullets.length === 0) {
    bullets.push({ text: 'No open items.', options: { fontSize: 14 } });
  }
  slide.addText(bullets, { x: 0.6, y: 1.3, w: 12.1, h: 5.6, fontFace: FONT, valign: 'top' });
}

function addDetailedDomainSlides(pptx: pptxgen, detailedGroups: DetailedObservationGroup[]) {
  for (const group of detailedGroups) {
    const assessed = group.entries.filter((e) => e.ratingLabel !== 'Not yet rated' || e.notes.trim() || e.evidenceTitles.length > 0);
    if (assessed.length === 0) continue;

    const divider = pptx.addSlide();
    divider.background = { color: BRAND_DARK };
    divider.addText(group.frameworkShortName, { x: 0.8, y: 3.1, w: 11.5, h: 1.3, fontFace: FONT, fontSize: 32, bold: true, color: WHITE });
    divider.addText('Detailed observations', { x: 0.8, y: 4.2, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 16, color: BRAND_NEON });

    for (const entry of assessed) {
      const slide = addHeaderSlide(pptx, `${group.frameworkShortName}: ${entry.code}`);
      slide.addText(entry.name, { x: 0.6, y: 1.1, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: BRAND_DARK });
      slide.addText(
        [
          { text: 'Rating: ', options: { bold: true, fontSize: 13 } },
          { text: `${entry.ratingLabel}\n`, options: { fontSize: 13 } },
          { text: 'Question asked: ', options: { bold: true, fontSize: 13 } },
          { text: `${entry.question}\n`, options: { fontSize: 13 } },
          { text: 'Observations: ', options: { bold: true, fontSize: 13 } },
          { text: `${entry.notes || 'No observations recorded.'}\n`, options: { fontSize: 13 } },
          { text: 'Evidence: ', options: { bold: true, fontSize: 13 } },
          { text: entry.evidenceTitles.length > 0 ? entry.evidenceTitles.join(', ') : 'No evidence linked yet.', options: { fontSize: 13 } },
        ],
        { x: 0.6, y: 1.7, w: 12.1, h: 5, fontFace: FONT, color: BRAND_DARK, valign: 'top', lineSpacingMultiple: 1.25 },
      );
    }
  }
}

export async function exportEngagementPptx(params: {
  options: PptxExportOptions;
  scopeDocument: ScopeDocument | undefined;
  executiveSummary: string;
  peerRows: PeerComparisonRow[];
  gaps: GapEntry[];
  roadmap: RoadmapItem[];
  detailedGroups: DetailedObservationGroup[];
}): Promise<void> {
  const { options, scopeDocument, executiveSummary, peerRows, gaps, roadmap, detailedGroups } = params;
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Secure SDLC Assessment';
  pptx.title = 'Secure SDLC Assessment Report';

  addCoverSlide(pptx, scopeDocument);
  if (options.scope) addScopeSlide(pptx, scopeDocument);
  if (options.executiveSummary) addExecutiveSummarySlide(pptx, executiveSummary);
  if (options.initiatives) addInitiativesSlides(pptx, roadmap);
  if (options.observationsGaps) addObservationsGapsSlides(pptx, gaps);
  if (options.maturityIndustry) addMaturityIndustrySlide(pptx, peerRows);
  if (options.roadmap) addRoadmapSlide(pptx, roadmap);
  if (options.detailedDomains) addDetailedDomainSlides(pptx, detailedGroups);

  await pptx.writeFile({ fileName: 'Secure-SDLC-Assessment-Report.pptx' });
}
