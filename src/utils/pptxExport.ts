// Builds the engagement's downloadable PowerPoint report entirely in the
// browser (pptxgenjs), following the same five-section story as a typical
// consulting SSDLC assessment deck (Executive Summary, Assessment Overview,
// Roadmap & Initiatives, Program Domains Detailed Assessment, Appendix) —
// but composed only from this engagement's own real data (or data a
// reviewer explicitly typed in, like a peer benchmark). No client names,
// logos, or photography: every slide is generic and sanitized so it's safe
// to generate for any engagement.

import pptxgen from 'pptxgenjs';
import type { Evidence, Framework, MaturityRating, Observation, ScopeDocument } from '../types';
import { MATURITY_LABELS } from '../types';
import type { FrameworkScore, GapEntry } from './scoring';
import type { DetailedObservationGroup, PeerComparisonRow, RoadmapItem, RoadmapPhase } from './report';
import {
  buildDocumentationReviewed,
  buildFrameworkOverview,
  buildFunctionObservations,
  buildInterviewsReviewed,
  buildRadarData,
} from './reportSections';

const BRAND_DARK = '282728';
const BRAND_GREEN = '86BC25';
const BRAND_NEON = '86EB22';
const BRAND_BLUE = '00A3E0';
const WHITE = 'FFFFFF';
const FONT = 'Arial';

const PHASE_LIST: RoadmapPhase[] = ['Now (0 to 30 days)', 'Next (31 to 90 days)', 'Later (90+ days)'];

const PHASE_COLOR: Record<RoadmapPhase, string> = {
  'Now (0 to 30 days)': 'E0A96D',
  'Next (31 to 90 days)': 'F0D264',
  'Later (90+ days)': '8FBFDE',
};

export interface PptxExportOptions {
  executiveSummary: boolean;
  assessmentOverview: boolean;
  roadmapInitiatives: boolean;
  domainsDetailed: boolean;
  appendix: boolean;
}

export const DEFAULT_PPTX_OPTIONS: PptxExportOptions = {
  executiveSummary: true,
  assessmentOverview: true,
  roadmapInitiatives: true,
  domainsDetailed: true,
  appendix: true,
};

/** Everything the export needs for one in-scope framework: its scoped controls, per-function scores, real observations, and its own top gaps (for the swimlane, grouped by that framework's own functions). */
export interface FrameworkBundle {
  framework: Framework;
  functionScores: FrameworkScore['functionScores'];
  observations: Observation[];
  gaps: GapEntry[];
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}...` : trimmed;
}

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

function addSectionDivider(pptx: pptxgen, title: string, subtitle: string) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND_DARK };
  slide.addShape(pptx.ShapeType.ellipse, { x: 11.6, y: -1.1, w: 2.6, h: 2.6, fill: { color: BRAND_BLUE } });
  slide.addShape(pptx.ShapeType.ellipse, { x: -0.8, y: 5.6, w: 2, h: 2, fill: { color: BRAND_GREEN } });
  slide.addText(title, { x: 0.8, y: 3.0, w: 11.5, h: 1.2, fontFace: FONT, fontSize: 30, bold: true, color: WHITE });
  slide.addText(subtitle, { x: 0.8, y: 4.1, w: 11.5, h: 0.6, fontFace: FONT, fontSize: 15, color: BRAND_NEON });
}

function addCoverSlide(pptx: pptxgen, scopeDocument: ScopeDocument | undefined) {
  const slide = pptx.addSlide();
  slide.background = { color: BRAND_DARK };
  slide.addShape(pptx.ShapeType.ellipse, { x: 10.8, y: 4.6, w: 3.2, h: 3.2, fill: { color: BRAND_GREEN } });
  slide.addShape(pptx.ShapeType.ellipse, { x: -1, y: -1.2, w: 2.2, h: 2.2, fill: { color: BRAND_BLUE } });
  slide.addText('Secure SDLC Assessment Report', { x: 0.7, y: 2.6, w: 10, h: 1.4, fontFace: FONT, fontSize: 36, bold: true, color: WHITE });
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

function addContentsSlide(pptx: pptxgen, sections: string[]) {
  const slide = pptx.addSlide();
  slide.background = { color: WHITE };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: 0.9, fill: { color: BRAND_DARK } });
  slide.addText('Contents', { x: 0.4, y: 0, w: 11, h: 0.9, fontFace: FONT, fontSize: 22, bold: true, color: WHITE, valign: 'middle' });
  const bullets: pptxgen.TextProps[] = sections.map((s) => ({ text: s, options: { bullet: true, breakLine: true, fontSize: 18, color: BRAND_DARK } }));
  slide.addText(bullets, { x: 0.8, y: 1.4, w: 10, h: 4.5, fontFace: FONT, valign: 'top', lineSpacingMultiple: 1.6 });
  slide.addText(
    'This assessment report is intended solely for internal use by this engagement’s stakeholders. It is not intended to be, and should not be, used or relied upon by any other person or entity.',
    { x: 0.4, y: 6.9, w: 12.4, h: 0.5, fontFace: FONT, fontSize: 9, italic: true, color: '888888' },
  );
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
  slide.addText(executiveSummary, { x: 0.6, y: 1.4, w: 12.1, h: 5.4, fontFace: FONT, fontSize: 16, color: BRAND_DARK, valign: 'top', lineSpacingMultiple: 1.3 });
}

function addFrameworkOverviewSlide(pptx: pptxgen, bundle: FrameworkBundle) {
  const columns = buildFrameworkOverview(bundle.framework);
  if (columns.length === 0) return;
  const slide = addHeaderSlide(pptx, `Assessment Framework: ${bundle.framework.shortName}`);
  const colWidth = 12.1 / columns.length;
  columns.forEach((col, i) => {
    const x = 0.6 + i * colWidth;
    slide.addShape(pptx.ShapeType.rect, { x, y: 1.3, w: colWidth - 0.15, h: 0.55, fill: { color: BRAND_DARK } });
    slide.addText(col.functionName, {
      x,
      y: 1.3,
      w: colWidth - 0.15,
      h: 0.55,
      fontFace: FONT,
      fontSize: 12,
      bold: true,
      color: WHITE,
      valign: 'middle',
      align: 'center',
    });
    const bullets: pptxgen.TextProps[] = col.controlNames.map((name) => ({
      text: name,
      options: { bullet: true, breakLine: true, fontSize: 10, color: BRAND_DARK },
    }));
    slide.addText(bullets, { x, y: 2.0, w: colWidth - 0.15, h: 4.8, fontFace: FONT, valign: 'top' });
  });
}

const FUNCTION_PALETTE = [BRAND_BLUE, BRAND_GREEN, '6B5B95', '5A5A5A', BRAND_DARK, BRAND_NEON];

function addTakeawaysSlide(pptx: pptxgen, aggregatedGaps: GapEntry[], strengthCount: number) {
  const slide = addHeaderSlide(pptx, 'Assessment Takeaways');
  slide.addText('Strengths', { x: 0.6, y: 1.2, w: 5.8, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: BRAND_GREEN });
  slide.addText(
    strengthCount > 0
      ? [{ text: `✓ ${strengthCount} control(s) are rated Largely or Fully Implemented across in-scope frameworks.`, options: { fontSize: 13 } }]
      : [{ text: 'No controls have reached Largely or Fully Implemented yet.', options: { fontSize: 13 } }],
    { x: 0.6, y: 1.7, w: 5.8, h: 4.8, fontFace: FONT, color: BRAND_DARK, valign: 'top' },
  );
  slide.addText('Opportunity Areas', { x: 6.7, y: 1.2, w: 5.8, h: 0.5, fontFace: FONT, fontSize: 16, bold: true, color: BRAND_BLUE });
  const oppBullets: pptxgen.TextProps[] =
    aggregatedGaps.length > 0
      ? aggregatedGaps.slice(0, 8).map((g) => ({
          text: `${g.frameworkShortName} ${g.controlCode}: ${g.controlName}`,
          options: { bullet: { characterCode: '25B8' }, breakLine: true, fontSize: 12 },
        }))
      : [{ text: 'No significant gaps identified.', options: { fontSize: 13 } }];
  slide.addText(oppBullets, { x: 6.7, y: 1.7, w: 5.8, h: 4.8, fontFace: FONT, color: BRAND_DARK, valign: 'top' });
}

function addRadarSlide(pptx: pptxgen, bundle: FrameworkBundle) {
  const radar = buildRadarData(bundle.functionScores);
  if (!radar) return;
  const slide = addHeaderSlide(pptx, `Maturity by Function: ${bundle.framework.shortName}`);
  slide.addChart(pptx.ChartType.radar, [{ name: 'Current maturity', labels: radar.categories, values: radar.values }], {
    x: 0.8,
    y: 1.2,
    w: 7.5,
    h: 5.6,
    valAxisMaxVal: 3,
    chartColors: [BRAND_GREEN],
    radarStyle: 'filled',
    showLegend: false,
  });
  const rows: pptxgen.TableRow[] = [
    [
      { text: 'Function', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
      { text: 'Average', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
    ],
    ...bundle.functionScores.map(
      (fs, i): pptxgen.TableRow => [
        { text: fs.name, options: { bold: true, color: FUNCTION_PALETTE[i % FUNCTION_PALETTE.length] } },
        { text: `${fs.averageRating.toFixed(1)} / 3` },
      ],
    ),
  ];
  slide.addTable(rows, { x: 8.6, y: 1.3, w: 4.1, fontFace: FONT, fontSize: 10, colW: [2.7, 1.4] });
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
      { x: 0.6, y: 1.3, w: 12.1, h: 5.4, barDir: 'col', valAxisMaxVal: 3, chartColors: [BRAND_GREEN, BRAND_BLUE], showLegend: true, legendPos: 'b' },
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
    slide.addText('No industry benchmark values were entered for this engagement.', { x: 0.6, y: 5.6, w: 12, h: 0.5, fontFace: FONT, fontSize: 12, italic: true, color: '666666' });
  }
}

function addObservationsByFunctionSlides(pptx: pptxgen, bundle: FrameworkBundle) {
  const groups = buildFunctionObservations(bundle.framework, bundle.observations);
  for (const group of groups) {
    if (group.strengths.length === 0 && group.opportunities.length === 0) continue;
    const slide = addHeaderSlide(pptx, `Observations: ${bundle.framework.shortName} · ${group.functionName}`);
    slide.addText('Strengths', { x: 0.6, y: 1.2, w: 5.8, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: BRAND_GREEN });
    const strengthBullets: pptxgen.TextProps[] =
      group.strengths.length > 0
        ? group.strengths.map((it) => ({
            text: `${it.code}: ${it.name}.${it.notes ? ` ${truncate(it.notes, 90)}` : ''}`,
            options: { bullet: true, breakLine: true, fontSize: 11 },
          }))
        : [{ text: 'None yet.', options: { fontSize: 11 } }];
    slide.addText(strengthBullets, { x: 0.6, y: 1.6, w: 5.8, h: 5.4, fontFace: FONT, color: BRAND_DARK, valign: 'top' });

    slide.addText('Opportunity Areas', { x: 6.7, y: 1.2, w: 5.8, h: 0.4, fontFace: FONT, fontSize: 15, bold: true, color: BRAND_BLUE });
    const oppBullets: pptxgen.TextProps[] =
      group.opportunities.length > 0
        ? group.opportunities.map((it) => ({
            text: `${it.code}: ${it.name}.${it.notes ? ` ${truncate(it.notes, 90)}` : ''}`,
            options: { bullet: true, breakLine: true, fontSize: 11 },
          }))
        : [{ text: 'None. Every control here is rated Largely or Fully Implemented.', options: { fontSize: 11 } }];
    slide.addText(oppBullets, { x: 6.7, y: 1.6, w: 5.8, h: 5.4, fontFace: FONT, color: BRAND_DARK, valign: 'top' });
  }
}

function addRoadmapSwimlaneSlide(pptx: pptxgen, bundle: FrameworkBundle) {
  if (bundle.framework.functions.length === 0 || bundle.gaps.length === 0) return;

  const slide = addHeaderSlide(pptx, `Roadmap: ${bundle.framework.shortName}`);
  const laneLabelW = 1.8;
  const chartX = 0.6 + laneLabelW;
  const chartW = 12.1 - laneLabelW;
  const colW = chartW / 3;
  const topY = 1.3;
  const laneH = Math.min(0.95, 5.6 / bundle.framework.functions.length);

  PHASE_LIST.forEach((phase, i) => {
    slide.addText(phase, { x: chartX + i * colW, y: topY - 0.35, w: colW, h: 0.35, fontFace: FONT, fontSize: 11, bold: true, align: 'center', color: BRAND_DARK });
  });

  const byFunctionAndPhase = new Map<string, GapEntry[]>();
  for (const gap of bundle.gaps) {
    const phase: RoadmapPhase = gap.rating === null || gap.rating === 0 ? 'Now (0 to 30 days)' : gap.rating === 1 ? 'Next (31 to 90 days)' : 'Later (90+ days)';
    const key = `${gap.functionCode}:${phase}`;
    const list = byFunctionAndPhase.get(key) ?? [];
    list.push(gap);
    byFunctionAndPhase.set(key, list);
  }

  bundle.framework.functions.forEach((fn, laneIndex) => {
    const laneY = topY + laneIndex * laneH;
    slide.addShape(pptx.ShapeType.rect, { x: 0.6, y: laneY, w: laneLabelW - 0.1, h: laneH - 0.08, fill: { color: BRAND_DARK } });
    slide.addText(fn.name, { x: 0.6, y: laneY, w: laneLabelW - 0.1, h: laneH - 0.08, fontFace: FONT, fontSize: 10, bold: true, color: WHITE, valign: 'middle', align: 'center' });

    PHASE_LIST.forEach((phase, phaseIndex) => {
      const items = byFunctionAndPhase.get(`${fn.code}:${phase}`) ?? [];
      if (items.length === 0) return;
      const cellX = chartX + phaseIndex * colW + 0.05;
      const cellW = colW - 0.1;
      const maxShown = 3;
      items.slice(0, maxShown).forEach((item, itemIndex) => {
        const barY = laneY + itemIndex * ((laneH - 0.08) / maxShown);
        const barH = (laneH - 0.08) / maxShown - 0.03;
        slide.addShape(pptx.ShapeType.roundRect, { x: cellX, y: barY, w: cellW, h: barH, fill: { color: PHASE_COLOR[phase] }, rectRadius: 0.04 });
        slide.addText(item.controlCode, { x: cellX, y: barY, w: cellW, h: barH, fontFace: FONT, fontSize: 8, color: BRAND_DARK, valign: 'middle', align: 'center' });
      });
      if (items.length > maxShown) {
        slide.addText(`+${items.length - maxShown} more`, {
          x: cellX,
          y: laneY + laneH - 0.28,
          w: cellW,
          h: 0.2,
          fontFace: FONT,
          fontSize: 7,
          italic: true,
          color: '666666',
          align: 'center',
        });
      }
    });
  });
}

function addInitiativeCardSlides(pptx: pptxgen, roadmap: RoadmapItem[]) {
  for (const phase of PHASE_LIST) {
    const items = roadmap.filter((r) => r.phase === phase);
    if (items.length === 0) continue;
    for (const group of chunk(items, 9)) {
      const slide = addHeaderSlide(pptx, `Initiatives: ${phase}`);
      const cols = 3;
      const cardW = 3.95;
      const cardH = 1.7;
      const gapX = 0.15;
      const gapY = 0.2;
      group.forEach((item, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = 0.5 + col * (cardW + gapX);
        const y = 1.2 + row * (cardH + gapY);
        slide.addShape(pptx.ShapeType.roundRect, { x, y, w: cardW, h: cardH, fill: { color: 'F5F5F5' }, line: { color: PHASE_COLOR[phase], width: 2 }, rectRadius: 0.08 });
        slide.addText(`${item.frameworkShortName} ${item.controlCode}`, { x: x + 0.15, y: y + 0.1, w: cardW - 0.3, h: 0.3, fontFace: FONT, fontSize: 11, bold: true, color: BRAND_DARK });
        slide.addText(item.controlName, { x: x + 0.15, y: y + 0.45, w: cardW - 0.3, h: cardH - 0.6, fontFace: FONT, fontSize: 9, color: '444444', valign: 'top' });
      });
    }
  }
}

const RATING_BADGE_COLOR: Record<MaturityRating, string> = {
  0: 'C97B3D',
  1: 'D9A521',
  2: BRAND_BLUE,
  3: BRAND_GREEN,
};

/** A compact 4-level scale strip (our real 0-3 labels), the current level highlighted, in the spirit of a maturity ladder legend. */
function addMaturityScaleStrip(pptx: pptxgen, slide: pptxgen.Slide, x: number, y: number, w: number, h: number, current: MaturityRating | null) {
  const ratings: MaturityRating[] = [3, 2, 1, 0];
  const rowH = h / ratings.length;
  ratings.forEach((r, i) => {
    const isCurrent = r === current;
    slide.addShape(pptx.ShapeType.rect, {
      x,
      y: y + i * rowH,
      w,
      h: rowH - 0.04,
      fill: { color: isCurrent ? RATING_BADGE_COLOR[r] : 'F0F0F0' },
    });
    slide.addText(`${r}: ${MATURITY_LABELS[r]}`, {
      x: x + 0.08,
      y: y + i * rowH,
      w: w - 0.16,
      h: rowH - 0.04,
      fontFace: FONT,
      fontSize: 9,
      bold: isCurrent,
      color: isCurrent ? WHITE : '666666',
      valign: 'middle',
    });
  });
}

function addDetailedDomainSlides(pptx: pptxgen, detailedGroups: DetailedObservationGroup[], roadmap: RoadmapItem[]) {
  const recommendationByKey = new Map<string, string>();
  for (const item of roadmap) recommendationByKey.set(`${item.frameworkShortName}:${item.controlCode}`, item.recommendation);

  for (const group of detailedGroups) {
    const assessed = group.entries.filter((e) => e.ratingLabel !== 'Not yet rated' || e.notes.trim() || e.evidenceTitles.length > 0);
    if (assessed.length === 0) continue;

    addSectionDivider(pptx, group.frameworkShortName, 'Detailed observations');

    for (const entry of assessed) {
      const slide = addHeaderSlide(pptx, `${group.frameworkShortName}: ${entry.code}`);
      slide.addText(entry.name, { x: 2.4, y: 1.1, w: 7.7, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: BRAND_DARK });
      const ratingMatch = /^(\d)/.exec(entry.ratingLabel)?.[1];
      const ratingNum = ratingMatch ? (Number(ratingMatch) as MaturityRating) : null;
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 10.4,
        y: 1.05,
        w: 2.3,
        h: 0.65,
        fill: { color: ratingNum !== null ? RATING_BADGE_COLOR[ratingNum] : '9AA0A6' },
        rectRadius: 0.08,
      });
      slide.addText(ratingNum !== null ? `${ratingNum} / 3` : 'N/R', {
        x: 10.4,
        y: 1.05,
        w: 2.3,
        h: 0.65,
        fontFace: FONT,
        fontSize: 18,
        bold: true,
        color: WHITE,
        valign: 'middle',
        align: 'center',
      });

      addMaturityScaleStrip(pptx, slide, 0.6, 1.05, 1.6, 5.9, ratingNum);

      const recommendation = recommendationByKey.get(`${group.frameworkShortName}:${entry.code}`);
      const textRuns: pptxgen.TextProps[] = [
        { text: 'Question asked: ', options: { bold: true, fontSize: 13 } },
        { text: `${entry.question}\n`, options: { fontSize: 13 } },
        { text: 'Observations: ', options: { bold: true, fontSize: 13 } },
        { text: `${entry.notes || 'No observations recorded.'}\n`, options: { fontSize: 13 } },
        { text: 'Evidence: ', options: { bold: true, fontSize: 13 } },
        { text: `${entry.evidenceTitles.length > 0 ? entry.evidenceTitles.join(', ') : 'No evidence linked yet.'}\n`, options: { fontSize: 13 } },
      ];
      if (recommendation) {
        textRuns.push({ text: 'Recommendation: ', options: { bold: true, fontSize: 13, color: BRAND_BLUE } });
        textRuns.push({ text: recommendation, options: { fontSize: 13 } });
      }
      slide.addText(textRuns, { x: 2.4, y: 1.9, w: 10.3, h: 5, fontFace: FONT, color: BRAND_DARK, valign: 'top', lineSpacingMultiple: 1.25 });
    }
  }
}

function addAppendixSlides(pptx: pptxgen, evidence: Evidence[]) {
  addSectionDivider(pptx, 'Appendix', 'Maturity scale, documentation reviewed, and interviews conducted');

  const scaleSlide = addHeaderSlide(pptx, 'Maturity Ratings');
  const ratings: MaturityRating[] = [3, 2, 1, 0];
  const RATING_DESCRIPTION: Record<MaturityRating, string> = {
    3: 'The practice is fully in place, consistently followed, and supported by evidence.',
    2: 'The practice is largely in place, with minor gaps in consistency or coverage.',
    1: 'The practice exists in part, informally, or on an ad hoc basis.',
    0: 'The practice is not yet in place, or no evidence has been reviewed for it.',
  };
  const rows: pptxgen.TableRow[] = [
    [
      { text: 'Rating', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
      { text: 'Definition', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
    ],
    ...ratings.map(
      (r): pptxgen.TableRow => [
        { text: `${r}: ${MATURITY_LABELS[r]}`, options: { bold: true, color: WHITE, fill: { color: RATING_BADGE_COLOR[r] } } },
        { text: RATING_DESCRIPTION[r] },
      ],
    ),
  ];
  scaleSlide.addTable(rows, { x: 0.6, y: 1.3, w: 12.1, fontFace: FONT, fontSize: 13, colW: [4, 8.1] });

  const docs = buildDocumentationReviewed(evidence);
  for (const group of chunk(docs.length > 0 ? docs : [{ ref: '', title: 'No documentation uploaded yet.' }], 20)) {
    const slide = addHeaderSlide(pptx, 'Documentation Reviewed');
    const docRows: pptxgen.TableRow[] = [
      [
        { text: 'Ref', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Document', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
      ],
      ...group.map((d): pptxgen.TableRow => [{ text: d.ref }, { text: d.title }]),
    ];
    slide.addTable(docRows, { x: 0.6, y: 1.3, w: 12.1, fontFace: FONT, fontSize: 11, colW: [1.5, 10.6] });
  }

  const interviews = buildInterviewsReviewed(evidence);
  for (const group of chunk(interviews.length > 0 ? interviews : [{ ref: '', title: 'No meeting notes recorded yet.', date: '' }], 20)) {
    const slide = addHeaderSlide(pptx, 'Interviews Conducted');
    const intRows: pptxgen.TableRow[] = [
      [
        { text: 'Ref', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Date', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
        { text: 'Topic', options: { bold: true, color: WHITE, fill: { color: BRAND_DARK } } },
      ],
      ...group.map((it): pptxgen.TableRow => [{ text: it.ref }, { text: it.date ?? '' }, { text: it.title }]),
    ];
    slide.addTable(intRows, { x: 0.6, y: 1.3, w: 12.1, fontFace: FONT, fontSize: 11, colW: [1.2, 1.8, 9.1] });
  }
}

function countStrengths(bundles: FrameworkBundle[]): number {
  return bundles.reduce(
    (sum, b) => sum + buildFunctionObservations(b.framework, b.observations).reduce((s, g) => s + g.strengths.length, 0),
    0,
  );
}

export async function exportEngagementPptx(params: {
  options: PptxExportOptions;
  scopeDocument: ScopeDocument | undefined;
  executiveSummary: string;
  peerRows: PeerComparisonRow[];
  aggregatedGaps: GapEntry[];
  roadmap: RoadmapItem[];
  detailedGroups: DetailedObservationGroup[];
  frameworkBundles: FrameworkBundle[];
  evidence: Evidence[];
}): Promise<void> {
  const { options, scopeDocument, executiveSummary, peerRows, aggregatedGaps, roadmap, detailedGroups, frameworkBundles, evidence } = params;
  const pptx = new pptxgen();
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Secure SDLC Assessment';
  pptx.title = 'Secure SDLC Assessment Report';

  const sections: string[] = [];
  if (options.executiveSummary) sections.push('Executive summary');
  if (options.assessmentOverview) sections.push('Assessment overview');
  if (options.roadmapInitiatives) sections.push('Roadmap & initiatives');
  if (options.domainsDetailed) sections.push('SSDLC program domains detailed assessment report');
  if (options.appendix) sections.push('Appendix');

  addCoverSlide(pptx, scopeDocument);
  addContentsSlide(pptx, sections);

  if (options.executiveSummary) {
    addSectionDivider(pptx, 'Executive Summary', 'Scope, framework, and overall maturity');
    addScopeSlide(pptx, scopeDocument);
    for (const bundle of frameworkBundles) addFrameworkOverviewSlide(pptx, bundle);
    addExecutiveSummarySlide(pptx, executiveSummary);
    addTakeawaysSlide(pptx, aggregatedGaps, countStrengths(frameworkBundles));
    for (const bundle of frameworkBundles) addRadarSlide(pptx, bundle);
    addMaturityIndustrySlide(pptx, peerRows);
  }

  if (options.assessmentOverview) {
    addSectionDivider(pptx, 'Assessment Overview', 'Strengths and opportunity areas by function');
    for (const bundle of frameworkBundles) addObservationsByFunctionSlides(pptx, bundle);
  }

  if (options.roadmapInitiatives) {
    addSectionDivider(pptx, 'Roadmap & Initiatives', 'Prioritized remediation timeline');
    for (const bundle of frameworkBundles) addRoadmapSwimlaneSlide(pptx, bundle);
    addInitiativeCardSlides(pptx, roadmap);
  }

  if (options.domainsDetailed) {
    addSectionDivider(pptx, 'Program Domains', 'Detailed assessment report');
    addDetailedDomainSlides(pptx, detailedGroups, roadmap);
  }

  if (options.appendix) {
    addAppendixSlides(pptx, evidence);
  }

  await pptx.writeFile({ fileName: 'Secure-SDLC-Assessment-Report.pptx' });
}
