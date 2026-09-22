import { DatabaseSync } from 'node:sqlite';
import { QSUniversity } from '../types/index.js';

export interface ForexAllowanceCalculation {
  targetCountry: string;
  currency: 'GBP' | 'USD' | 'EUR';
  annualMaintenanceForex: number;
  contingencyAllowanceForex: number;
  equipmentAllowanceForex: number;
  airfareInr: number;
  estimatedExchangeRateInr: number;
  totalAnnualDisbursementInr: number;
}

export class NosService {
  /**
   * Looks up an institution in the QS World Rankings Top-1000
   */
  static lookupQsRank(db: DatabaseSync, instituteName: string): QSUniversity | null {
    const query = `%${instituteName.trim()}%`;
    const stmt = db.prepare(`
      SELECT rank, name, country, city
      FROM qs_universities
      WHERE name LIKE ?
      ORDER BY rank ASC
      LIMIT 1
    `);

    const result = stmt.get(query) as any;
    if (result) {
      return {
        rank: result.rank,
        name: result.name,
        country: result.country,
        city: result.city
      };
    }

    return null;
  }

  /**
   * Computes foreign currency maintenance & fellowship entitlement per MoTA NOS statutory guidelines.
   * NOTE: Exchange rates below represent the statutory benchmark rates for budgeting and simulation.
   * In a live ministry deployment with PFMS integration, these can be pulled dynamically via
   * RBI reference rate feed or SBI foreign exchange card rates.
   */
  static computeForexAllowance(country: string): ForexAllowanceCalculation {
    const c = country.toLowerCase();

    if (c.includes('united kingdom') || c.includes('uk') || c.includes('england') || c.includes('scotland')) {
      const exchangeRate = 108.5; // INR per GBP
      const maintenance = 15400; // GBP
      const contingency = 1500; // GBP
      const equipment = 1000; // GBP
      const airfareInr = 95000;

      const totalInr = (maintenance + contingency + equipment) * exchangeRate + airfareInr;

      return {
        targetCountry: 'United Kingdom',
        currency: 'GBP',
        annualMaintenanceForex: maintenance,
        contingencyAllowanceForex: contingency,
        equipmentAllowanceForex: equipment,
        airfareInr,
        estimatedExchangeRateInr: exchangeRate,
        totalAnnualDisbursementInr: Math.round(totalInr)
      };
    }

    // Default to US / Rest of the World (USD)
    const exchangeRate = 86.2; // INR per USD
    const maintenance = 17400; // USD
    const contingency = 2000; // USD
    const equipment = 1200; // USD
    const airfareInr = 120000;

    const totalInr = (maintenance + contingency + equipment) * exchangeRate + airfareInr;

    return {
      targetCountry: country || 'United States',
      currency: 'USD',
      annualMaintenanceForex: maintenance,
      contingencyAllowanceForex: contingency,
      equipmentAllowanceForex: equipment,
      airfareInr,
      estimatedExchangeRateInr: exchangeRate,
      totalAnnualDisbursementInr: Math.round(totalInr)
    };
  }
}
