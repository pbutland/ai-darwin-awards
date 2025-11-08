import fs from 'fs';
import path from 'path';

export interface Nominee {
  id: string;
  title: string;
  category: string;
  reportedDate: string;
  badge: string;
  summary?: string;
  sections?: Array<{ heading: string; content: string }>;
}

export interface SecondaryPoints {
  type: string;
  points: number;
  reason: string;
}

export interface ResultsNominee {
  id: string;
  eligible: boolean;
  scores: {
    lethality: number;
    lethalityReason: string;
    hubris: number;
    hubrisReason: string;
    stupidity: number;
    stupidityReason: string;
    impact: number;
    impactReason: string;
    baseScore: number;
    bonuses: SecondaryPoints[];
    penalties: SecondaryPoints[];
    finalScore: number;
  };
  overallRationale: string;
}

export interface YearSummary {
  totalNominees: number;
  eligibleNominees: number;
  excludedIneligible: string[];
  winner: string;
}

export interface WinnerInfo {
  year: string;
  winnerId: string;
  winnerScore: number;
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function getDisplayName(nominee: Nominee): string {
  const dashIndex = nominee.title.indexOf(' - ');
  return dashIndex > 0 ? nominee.title.substring(0, dashIndex) : nominee.title;
}

function getHeatClass(score: number): string {
  return `heat-${Math.floor(score / 10)}`;
}

function getHeatTextClass(score: number): string {
  return `heat-text-${Math.min(Math.floor(score / 10), 10)}`;
}

function generateBonusPenaltyIcons(bonuses: SecondaryPoints[], penalties: SecondaryPoints[]): string {
  let iconsHtml = '';
  
  if (bonuses?.length > 0) {
    const bonusTooltip = bonuses.map((bonus) =>
      `${escapeHtml(bonus.type)}: ${escapeHtml(bonus.reason)}`
    ).join('&#10;');
    const bonusSum = bonuses.reduce((sum, b) => sum + (typeof b.points === 'number' ? b.points : 0), 0);
    iconsHtml += `<span class="tooltip-icon bonus-icon" title="${bonusTooltip}">+${bonusSum}</span>`;
  }
  
  if (penalties?.length > 0) {
    const penaltyTooltip = penalties.map((penalty) =>
      `${escapeHtml(penalty.type)}: ${escapeHtml(penalty.reason)}`
    ).join('&#10;');
    const penaltySum = penalties.reduce((sum, p) => sum + (typeof p.points === 'number' ? p.points : 0), 0);
    iconsHtml += `<span class="tooltip-icon penalty-icon" title="${penaltyTooltip}">${penaltySum > 0 ? '-' : ''}${penaltySum}</span>`;
  }
  
  return iconsHtml ? `<span class="bonus-penalty-icons">${iconsHtml}</span>` : '';
}

function generateHeatMapRows(heatMapData: any[]): string {
  return heatMapData.map(nominee => {
    const penaltyIcons = generateBonusPenaltyIcons(nominee.bonuses, nominee.penalties);
    const nomineePage = `${nominee.id}.html`;
    
    return `
      <tr>
        <td class="col-nominee">
          <span class="nominee-flex">
            <a href="${nomineePage}" class="nominee-name">${escapeHtml(nominee.name)}</a>
            ${penaltyIcons}
          </span>
        </td>
        <td class="col-stupidity ${getHeatClass(nominee.stupidity)}">${nominee.stupidity}</td>
        <td class="col-hubris ${getHeatClass(nominee.hubris)}">${nominee.hubris}</td>
        <td class="col-impact ${getHeatClass(nominee.impact)}">${nominee.impact}</td>
        <td class="col-lethality ${getHeatClass(nominee.lethality)}">${nominee.lethality}</td>
        <td class="col-final-score ${getHeatClass(nominee.finalScore)}" style="font-weight: bold;">${nominee.finalScore}</td>
      </tr>
    `;
  }).join('\n');
}

function generateNomineeResultPage(
  result: ResultsNominee,
  nominee: Nominee | undefined,
  year: string,
  nomineeTemplate: string
): string {
  const displayName = nominee ? getDisplayName(nominee) : result.id;
  const scores = result.scores;
  
  const nomineeRadarData = [{
    name: displayName,
    data: [
      scores.stupidity,
      scores.hubris,
      scores.impact,
      scores.lethality
    ],
    finalScore: scores.finalScore
  }];

  const bonuses = scores.bonuses.reduce((sum, b) => sum + (typeof b.points === 'number' ? b.points : 0), 0);
  const penalties = scores.penalties.reduce((sum, p) => sum + (typeof p.points === 'number' ? p.points : 0), 0);
  
  const bonusReasonsHtml = scores.bonuses.length
    ? `<ul class="supplementary-points-reasons">` + scores.bonuses.map((b) => `<li>${escapeHtml(b.reason)}</li>`).join('') + `</ul>`
    : '';
  
  const penaltyReasonsHtml = scores.penalties.length
    ? `<ul class="supplementary-points-reasons">` + scores.penalties.map((p) => `<li>${escapeHtml(p.reason)}</li>`).join('') + `</ul>`
    : '';

  return nomineeTemplate
    .replace(/\[YEAR\]/g, year)
    .replace(/\[NOMINEE_NAME\]/g, escapeHtml(displayName))
    .replace(/\[NOMINEE_ID\]/g, result.id?.replace(/-nominee$/, ''))
    .replace(/\[LETHALITY\]/g, String(scores.lethality))
    .replace(/\[LETHALITY_CLASS\]/g, getHeatTextClass(scores.lethality))
    .replace(/\[HUBRIS\]/g, String(scores.hubris))
    .replace(/\[HUBRIS_CLASS\]/g, getHeatTextClass(scores.hubris))
    .replace(/\[STUPIDITY\]/g, String(scores.stupidity))
    .replace(/\[STUPIDITY_CLASS\]/g, getHeatTextClass(scores.stupidity))
    .replace(/\[IMPACT\]/g, String(scores.impact))
    .replace(/\[IMPACT_CLASS\]/g, getHeatTextClass(scores.impact))
    .replace(/\[BASE_SCORE\]/g, String(scores.baseScore))
    .replace(/\[BASE_SCORE_CLASS\]/g, getHeatTextClass(scores.baseScore))
    .replace(/\[BONUSES\]/g, `<span class="bonus-green">${bonuses > 0 ? `+${bonuses}` : ''}</span>`)
    .replace(/\[PENALTIES\]/g, `<span class="penalty-red">${penalties < 0 ? penalties : ''}</span>`)
    .replace(/\[BONUS_REASONS\]/g, bonusReasonsHtml)
    .replace(/\[PENALTY_REASONS\]/g, penaltyReasonsHtml)
    .replace(/\[FINAL_SCORE\]/g, `<strong>${scores.finalScore}</strong>`)
    .replace(/\[FINAL_SCORE_CLASS\]/g, getHeatTextClass(scores.finalScore))
    .replace(/\[LETHALITY_REASON\]/g, escapeHtml(scores.lethalityReason))
    .replace(/\[HUBRIS_REASON\]/g, escapeHtml(scores.hubrisReason))
    .replace(/\[STUPIDITY_REASON\]/g, escapeHtml(scores.stupidityReason))
    .replace(/\[IMPACT_REASON\]/g, escapeHtml(scores.impactReason))
    .replace(/\[FINAL_SCORE_RATIONALE\]/g, escapeHtml(result.overallRationale))
    .replace(/\[OVERALL_RATIONALE\]/g, escapeHtml(result.overallRationale))
    .replace(/\[RADAR_DATA\]/g, JSON.stringify(nomineeRadarData, null, 2));
}

export function generateResultsPages(
  year: string,
  yearResults: ResultsNominee[],
  nominees: Nominee[],
  templatePath: string,
  outputDir: string,
  nomineeTemplatePath: string,
  summary: YearSummary
): void {
  const template = fs.readFileSync(templatePath, 'utf-8');
  const nomineeTemplate = fs.readFileSync(nomineeTemplatePath, 'utf-8');

  // Create nominee lookup map
  const nomineeMap = new Map<string, Nominee>();
  nominees.forEach(nominee => {
    nomineeMap.set(nominee.id, nominee);
  });

  // Filter eligible nominees and sort by final score (descending)
  const eligibleResults = yearResults
    .filter((result) => result.eligible)
    .sort((a, b) => b.scores.finalScore - a.scores.finalScore);

  // Find the winner
  const winner = eligibleResults.find((result) => result.id === summary.winner);
  const winnerName = winner && nomineeMap.get(winner.id)
    ? getDisplayName(nomineeMap.get(winner.id)!)
    : 'Unknown';

  // Generate heat map data
  const heatMapData = eligibleResults.map((result) => {
    const nominee = nomineeMap.get(result.id);
    return {
      id: nominee ? nominee.id : result.id,
      name: nominee ? getDisplayName(nominee) : result.id,
      lethality: result.scores.lethality,
      hubris: result.scores.hubris,
      stupidity: result.scores.stupidity,
      impact: result.scores.impact,
      finalScore: result.scores.finalScore,
      overallRationale: result.overallRationale,
      bonuses: result.scores.bonuses,
      penalties: result.scores.penalties
    };
  });

  // Generate static heat map table rows
  const heatMapRowsHtml = generateHeatMapRows(heatMapData);

  // Generate radar chart data (for client-side JS)
  const radarData = eligibleResults.map((result) => {
    const nominee = nomineeMap.get(result.id);
    return {
      name: nominee ? getDisplayName(nominee) : result.id,
      data: [
        result.scores.stupidity,
        result.scores.hubris,
        result.scores.impact,
        result.scores.lethality
      ],
      finalScore: result.scores.finalScore
    };
  });

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Write main results.html
  const mainHtml = template
    .replace(/\[YEAR\]/g, year)
    .replace(/\[WINNER_NAME\]/g, winnerName)
    .replace(/\[WINNER_SCORE\]/g, winner ? winner.scores.finalScore.toString() : '0')
    .replace(/\[ELIGIBLE_COUNT\]/g, eligibleResults.length.toString())
    .replace(
      '<tbody id="heat-map-body">\n                        <!-- Heat map rows will be generated by JavaScript -->\n                    </tbody>',
      `<tbody id="heat-map-body">${heatMapRowsHtml}\n                    </tbody>`
    )
    .replace('[RADAR_DATA]', JSON.stringify(radarData, null, 2));

  const mainOutputPath = path.join(outputDir, 'results.html');
  fs.writeFileSync(mainOutputPath, mainHtml, 'utf-8');
  console.log(`Generated results page: ${mainOutputPath}`);

  // Generate individual nominee pages
  eligibleResults.forEach((result) => {
    const nominee = nomineeMap.get(result.id);
    const nomineeHtml = generateNomineeResultPage(result, nominee, year, nomineeTemplate);
    const nomineeFile = path.join(outputDir, `${result.id}.html`);
    fs.writeFileSync(nomineeFile, nomineeHtml, 'utf-8');
    console.log(`Generated nominee page: ${nomineeFile}`);
  });
}

export function groupResultsByYear(
  allResults: ResultsNominee[],
  nominees: Nominee[]
): Map<string, ResultsNominee[]> {
  const nomineeMap = new Map<string, Nominee>();
  nominees.forEach(nominee => {
    nomineeMap.set(nominee.id, nominee);
  });

  const resultsByYear = new Map<string, ResultsNominee[]>();
  allResults.forEach(result => {
    const nominee = nomineeMap.get(result.id);
    if (nominee?.reportedDate) {
      const year = nominee.reportedDate.split('-')[0];
      if (!resultsByYear.has(year)) {
        resultsByYear.set(year, []);
      }
      resultsByYear.get(year)!.push(result);
    }
  });

  return resultsByYear;
}

export function calculateYearSummary(yearResults: ResultsNominee[]): YearSummary {
  const eligibleResults = yearResults.filter(r => r.eligible);
  const ineligibleResults = yearResults.filter(r => !r.eligible);
  
  const winner = eligibleResults.length > 0
    ? eligibleResults.reduce((max, r) => r.scores.finalScore > max.scores.finalScore ? r : max)
    : null;

  return {
    totalNominees: yearResults.length,
    eligibleNominees: eligibleResults.length,
    excludedIneligible: ineligibleResults.map(r => r.id),
    winner: winner ? winner.id : ''
  };
}

export function extractWinnerInfo(
  resultsByYear: Map<string, ResultsNominee[]>
): WinnerInfo[] {
  const winners: WinnerInfo[] = [];
  
  resultsByYear.forEach((yearResults, year) => {
    const summary = calculateYearSummary(yearResults);
    if (summary.winner) {
      const winnerResult = yearResults.find(r => r.id === summary.winner);
      if (winnerResult) {
        winners.push({
          year,
          winnerId: summary.winner,
          winnerScore: winnerResult.scores.finalScore
        });
      }
    }
  });
  
  return winners;
}
