import { Request, Response } from 'express';
import { getDb } from '../db/connection.js';

export const getMoTaAnalytics = (req: Request, res: Response) => {
  try {
    const db = getDb();

    // 1. Overall stats
    const totalApps = (db.prepare('SELECT COUNT(*) as count FROM applications').get() as any).count;
    const totalSelected = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE status IN ('SELECTED', 'DISBURSED')").get() as any).count;
    const totalFlagged = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE status = 'DEFICIENCY_FLAGGED'").get() as any).count;
    const totalUnderScrutiny = (db.prepare("SELECT COUNT(*) as count FROM applications WHERE status IN ('SUBMITTED', 'UNDER_SCRUTINY', 'RESUBMITTED')").get() as any).count;

    // 2. Scheme distribution
    const schemeStats = db.prepare(`
      SELECT s.code, s.name, COUNT(a.id) as application_count
      FROM schemes s
      LEFT JOIN applications a ON s.id = a.scheme_id
      GROUP BY s.id
    `).all();

    // 3. Bottleneck Detection: Average Scrutiny Turnaround Time (in Days) by State & Tier
    const stateTurnaround = [
      { state: 'Jharkhand', avgDaysInScrutiny: 3.2, pendingVolume: 420, bottleneckStatus: 'OPTIMAL' },
      { state: 'Madhya Pradesh', avgDaysInScrutiny: 4.1, pendingVolume: 510, bottleneckStatus: 'OPTIMAL' },
      { state: 'Odisha', avgDaysInScrutiny: 2.8, pendingVolume: 340, bottleneckStatus: 'OPTIMAL' },
      { state: 'Chhattisgarh', avgDaysInScrutiny: 8.7, pendingVolume: 890, bottleneckStatus: 'BOTTLENECK_HIGH' }, // 8.7 days vs national median of 3.4
      { state: 'Rajasthan', avgDaysInScrutiny: 3.5, pendingVolume: 290, bottleneckStatus: 'OPTIMAL' },
      { state: 'Assam', avgDaysInScrutiny: 6.4, pendingVolume: 415, bottleneckStatus: 'MODERATE_DELAY' }
    ];

    // 4. Deficiency Heatmap: Rejection / Deficiency Rate by Document Type & State
    const deficiencyHeatmap = [
      {
        state: 'Chhattisgarh',
        docType: 'INCOME_CERT',
        flagRatePercent: 24.5,
        primaryReason: 'Income format mismatch: Local revenue circle format lacks state e-District digital signature validation.'
      },
      {
        state: 'Jharkhand',
        docType: 'CASTE_CERT',
        flagRatePercent: 6.2,
        primaryReason: 'PVTG sub-tribe endorsement not explicitly specified on older state certificates.'
      },
      {
        state: 'Madhya Pradesh',
        docType: 'BANK_PASSBOOK',
        flagRatePercent: 14.8,
        primaryReason: 'Account not seeded with Aadhaar for DBT NPCI mapper.'
      },
      {
        state: 'Odisha',
        docType: 'INCOME_CERT',
        flagRatePercent: 8.1,
        primaryReason: 'Certificate validity exceeded 1 financial year.'
      },
      {
        state: 'Assam',
        docType: 'PREV_MARKSHEET',
        flagRatePercent: 11.3,
        primaryReason: 'Cumulative grade point conversion formula missing on university sheet.'
      }
    ];

    // 5. PVTG & Divyangjan Inclusion Metrics
    const inclusionMetrics = {
      pvtgApplications: 184,
      pvtgSelectionRate: '94.2%',
      divyangjanApplications: 45,
      divyangjanSelectionRate: '100%',
      femaleStRepresentation: '46.8%'
    };

    // 6. Tribal Saturation GIS Radar (District Saturation Index - DSI)
    const districtSaturationRadar = [
      {
        district: 'Mayurbhanj',
        state: 'Odisha',
        tribalCensusPopulation: 1479795,
        eligibleStStudents: 142000,
        actualBeneficiaries: 112180,
        dsiPercent: 79.0,
        status: 'SATURATED',
        dominantTribe: 'Santhal, Kolha',
        mobileVanDispatched: false,
        recommendedAction: 'Optimal saturation: Auto-renewal fast-track active; establish regional tribal mentoring cluster.'
      },
      {
        district: 'Bastar',
        state: 'Chhattisgarh',
        tribalCensusPopulation: 958313,
        eligibleStStudents: 89000,
        actualBeneficiaries: 21360,
        dsiPercent: 24.0,
        status: 'COLD_SPOT',
        dominantTribe: 'Maria, Muria Gond',
        mobileVanDispatched: true,
        recommendedAction: 'CRITICAL COLD SPOT: Deploy 3 Mobile CSC Vans; dispatch offline biometric sync kit to Tokapal & Darbha blocks.'
      },
      {
        district: 'Rayagada',
        state: 'Odisha',
        tribalCensusPopulation: 541905,
        eligibleStStudents: 52000,
        actualBeneficiaries: 34840,
        dsiPercent: 67.0,
        status: 'MODERATE',
        dominantTribe: 'Kondh, Dongria Kondh (PVTG)',
        mobileVanDispatched: false,
        recommendedAction: 'Target PVTG hamlet clusters with multilingual Jan-Jatiya Sahayak audio nudges.'
      },
      {
        district: 'Nandurbar',
        state: 'Maharashtra',
        tribalCensusPopulation: 1111282,
        eligibleStStudents: 98000,
        actualBeneficiaries: 27440,
        dsiPercent: 28.0,
        status: 'COLD_SPOT',
        dominantTribe: 'Bhil, Pawara',
        mobileVanDispatched: true,
        recommendedAction: 'COLD SPOT ALERT: Low female enrolment in Dhadgaon block. Dispatch outreach camp with offline mesh sync.'
      },
      {
        district: 'Mandla',
        state: 'Madhya Pradesh',
        tribalCensusPopulation: 579607,
        eligibleStStudents: 56000,
        actualBeneficiaries: 44240,
        dsiPercent: 79.0,
        status: 'SATURATED',
        dominantTribe: 'Gond, Baiga (PVTG)',
        mobileVanDispatched: false,
        recommendedAction: 'Benchmark district: Replicate Baiga community peer-volunteer model in neighbouring Dindori.'
      },
      {
        district: 'Paschim Medinipur',
        state: 'West Bengal',
        tribalCensusPopulation: 880015,
        eligibleStStudents: 74000,
        actualBeneficiaries: 23680,
        dsiPercent: 32.0,
        status: 'COLD_SPOT',
        dominantTribe: 'Santhal, Lodha (PVTG)',
        mobileVanDispatched: true,
        recommendedAction: 'COLD SPOT: Deploy Mobile CSC Bus to Binpur & Jhargram fringe border hamlets.'
      },
      {
        district: 'Ranchi',
        state: 'Jharkhand',
        tribalCensusPopulation: 1042000,
        eligibleStStudents: 95000,
        actualBeneficiaries: 72200,
        dsiPercent: 76.0,
        status: 'SATURATED',
        dominantTribe: 'Munda, Oraon',
        mobileVanDispatched: false,
        recommendedAction: 'High saturation in urban blocks. Ensure spillover camps reach rural Sonahatu block.'
      }
    ];

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalApplications: totalApps + 2580, // Real-time seed + simulated base volume
        totalSelected: totalSelected + 1920,
        totalUnderScrutiny: totalUnderScrutiny + 410,
        totalDeficiencyFlagged: totalFlagged + 250,
        totalDbtDisbursedInr: '₹48,72,50,000',
        averageDsiPercent: 55.0,
        coldSpotsCount: 3,
        activeMobileVans: 3
      },
      schemeDistribution: schemeStats,
      bottleneckAnalytics: stateTurnaround,
      deficiencyHeatmap,
      inclusionMetrics,
      districtSaturationRadar
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const dispatchMobileVan = (req: Request, res: Response): void => {
  try {
    const { district, blocks } = req.body;
    const cleanDistrict = district || 'Target Tribal District';
    res.json({
      success: true,
      message: `Mobile CSC Outreach Van successfully dispatched to ${cleanDistrict} (${blocks || 'All tribal fringe blocks'}). Offline biometric sync activated.`,
      dispatchId: `CSC-VAN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};
