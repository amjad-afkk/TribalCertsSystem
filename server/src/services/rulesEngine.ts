import { Scheme, Applicant, SchemeMatchResult } from '../types/index.js';

export interface ApplicantCriteria {
  category: string; // 'PVTG' | 'DIVYANGJAN' | 'FEMALE_ST' | 'ST_OTHER' | 'GENERAL' | 'OBC' | 'SC'
  annualIncome: number;
  age?: number;
  academicPercentage: number;
  courseLevel: string; // 'Class IX-X' | 'Class XI-XII' | 'UG' | 'PG' | 'M.Phil/Ph.D' | 'Overseas'
  isPwD?: boolean;
  isPVTG?: boolean;
  hasAdmitOffer?: boolean;
  qsRank?: number;
}

export class RulesEngine {
  /**
   * Evaluate an applicant against a given scheme's configurable rule set.
   * Completely deterministic, explainable, and scheme-agnostic.
   */
  static evaluateSchemeEligibility(scheme: Scheme, criteria: ApplicantCriteria): SchemeMatchResult {
    const reasons: string[] = [];
    const blockers: string[] = [];
    let score = 100;

    // 1. ST Category Requirement Check
    const isST = ['PVTG', 'DIVYANGJAN', 'FEMALE_ST', 'ST_OTHER'].includes(criteria.category);
    if (!isST) {
      blockers.push('Scheme strictly reserved for Scheduled Tribe (ST) candidates.');
      score = 0;
      return {
        schemeId: scheme.id,
        schemeName: scheme.name,
        schemeCode: scheme.code,
        matchScore: 0,
        isEligible: false,
        reasons,
        blockers
      };
    }
    reasons.push('Scheduled Tribe community status verified.');

    // 2. Course Level Alignment
    const courseMatch = this.matchesCourseLevel(scheme.level, criteria.courseLevel);
    if (!courseMatch.isMatch) {
      blockers.push(`Requires ${scheme.level}, but applicant is in ${criteria.courseLevel}.`);
      score -= 50;
    } else {
      reasons.push(`Course level matches scheme target (${scheme.level}).`);
    }

    // 3. Income Ceiling Check
    if (scheme.incomeCeiling !== null) {
      if (criteria.annualIncome > scheme.incomeCeiling) {
        const diff = criteria.annualIncome - scheme.incomeCeiling;
        blockers.push(
          `Annual family income ₹${criteria.annualIncome.toLocaleString('en-IN')} exceeds the ceiling limit of ₹${scheme.incomeCeiling.toLocaleString('en-IN')} (by ₹${diff.toLocaleString('en-IN')}).`
        );
        score -= 40;
      } else {
        reasons.push(
          `Family income ₹${criteria.annualIncome.toLocaleString('en-IN')} is within permissible limit of ₹${scheme.incomeCeiling.toLocaleString('en-IN')}.`
        );
      }
    } else {
      reasons.push('No income ceiling restriction for this scheme.');
    }

    // 4. Age Ceiling Check
    if (scheme.ageCeiling !== null && criteria.age !== undefined) {
      if (criteria.age > scheme.ageCeiling) {
        blockers.push(`Age ${criteria.age} years exceeds maximum permissible age of ${scheme.ageCeiling} years.`);
        score -= 30;
      } else {
        reasons.push(`Age ${criteria.age} satisfies the age criterion (max ${scheme.ageCeiling} yrs).`);
      }
    }

    // 5. Academic Threshold Check (with conditional waivers)
    if (scheme.academicThreshold !== null) {
      // Conditional override: NOS allows 55% mark waiver if candidate holds an admit from a QS Top-1000 university
      const hasQsTopWaiver = scheme.code === 'AZKMI' && criteria.qsRank && criteria.qsRank <= 1000;

      if (criteria.academicPercentage < scheme.academicThreshold && !hasQsTopWaiver) {
        blockers.push(
          `Qualifying percentage (${criteria.academicPercentage}%) is below the required threshold of ${scheme.academicThreshold}%.`
        );
        score -= 25;
      } else if (hasQsTopWaiver) {
        reasons.push(`Academic percentage waiver applied due to admission in QS Top 1000 institution (Rank #${criteria.qsRank}).`);
      } else {
        reasons.push(`Academic score (${criteria.academicPercentage}%) satisfies threshold (${scheme.academicThreshold}%).`);
      }
    }

    // 6. Sub-category bonus & prioritization
    if (criteria.isPVTG) {
      reasons.push('Particularly Vulnerable Tribal Group (PVTG) priority quota applies.');
    }
    if (criteria.isPwD) {
      reasons.push('Divyangjan (PwD) statutory reservation applies.');
    }

    const finalScore = Math.max(0, Math.min(100, score));
    const isEligible = blockers.length === 0;

    return {
      schemeId: scheme.id,
      schemeName: scheme.name,
      schemeCode: scheme.code,
      matchScore: isEligible ? finalScore : Math.min(finalScore, 45),
      isEligible,
      reasons,
      blockers
    };
  }

  /**
   * Evaluates match across all active schemes (Scholarship Twin Simulator)
   */
  static simulateAllSchemes(schemes: Scheme[], criteria: ApplicantCriteria): SchemeMatchResult[] {
    return schemes
      .filter(s => s.isActive)
      .map(scheme => this.evaluateSchemeEligibility(scheme, criteria))
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  private static matchesCourseLevel(schemeLevel: string, userLevel: string): { isMatch: boolean } {
    const s = schemeLevel.toLowerCase().replace(/['']/g, '');
    const u = userLevel.toLowerCase().replace(/['']/g, '');

    // Helper: word-boundary-aware match to avoid false positives (e.g. 'x' matching 'Oxford')
    const wordMatch = (text: string, word: string) => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(text);
    };

    if (s.includes('overseas') || s.includes('abroad')) {
      return { isMatch: u.includes('overseas') || u.includes('abroad') || u.includes('master') || u.includes('phd') || u.includes('ph.d') };
    }
    if (s.includes('ix') || s.includes('pre-matric')) {
      return { isMatch: wordMatch(u, 'ix') || wordMatch(u, 'class 9') || wordMatch(u, 'class 10') || u.includes('pre-matric') || u.includes('class ix') || u.includes('class x') };
    }
    if (s.includes('top class') || s.includes('notified')) {
      // Top class education strictly targets UG/PG in 252 notified institutes (IITs, NITs, IIMs, AIIMS, etc.)
      const isSchoolStudent = u.includes('xi') || u.includes('xii') || u.includes('class 9') || u.includes('class 10') || u.includes('class 11') || u.includes('class 12');
      if (isSchoolStudent) return { isMatch: false };
      return { isMatch: wordMatch(u, 'ug') || wordMatch(u, 'pg') || u.includes('b.tech') || u.includes('m.tech') || u.includes('mba') || u.includes('mbbs') || u.includes('undergraduate') || u.includes('bachelor') || u.includes('master') || u.includes('premier') };
    }
    if (s.includes('post-graduate') || s.includes('xi') || s.includes('post-matric')) {
      return { isMatch: u.includes('xi') || u.includes('xii') || wordMatch(u, 'ug') || wordMatch(u, 'pg') || u.includes('bachelor') || u.includes('master') || u.includes('class 11') || u.includes('class 12') };
    }
    if (s.includes('m.phil') || s.includes('ph.d') || s.includes('fellowship')) {
      return { isMatch: u.includes('ph.d') || u.includes('phd') || u.includes('m.phil') || u.includes('research') };
    }

    return { isMatch: true };
  }
}
