export interface OfflineApplication {
  localId: string;
  studentName: string;
  applicantId?: string;
  schemeId: string;
  schemeName: string;
  academicYear: string;
  ashramSchoolCode: string;
  claimedIncome: number;
  academicPercentage: number;
  standard: string;
  localSha256Hash: string;
  queuedAt: string;
}

const STORAGE_KEY = 'mota_ashram_offline_queue';

export const offlineQueueService = {
  getQueue: (): OfflineApplication[] => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  enqueue: (app: Omit<OfflineApplication, 'localId' | 'localSha256Hash' | 'queuedAt'>): OfflineApplication => {
    const queue = offlineQueueService.getQueue();
    const localId = `OFFLINE-APP-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const queuedAt = new Date().toISOString();
    // Simulate lightweight digest of entry
    const localSha256Hash = `SHA256-${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 10)}`;

    const newEntry: OfflineApplication = {
      ...app,
      localId,
      queuedAt,
      localSha256Hash
    };

    queue.push(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    return newEntry;
  },

  clear: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  remove: (localId: string): void => {
    const queue = offlineQueueService.getQueue().filter(item => item.localId !== localId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
  },

  seedSampleApp: (): OfflineApplication => {
    const sampleNames = ['Sunita Madkami', 'Ramesh Netam', 'Pooja Maravi', 'Kavita Jamatia', 'Suresh Hembram'];
    const sampleSchools = ['EMRS-BASTAR-CENTRAL', 'ASHRAM-SCHOOL-GADCHIROLI-04', 'EMRS-RAYAGADA-TRIBAL'];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomSchool = sampleSchools[Math.floor(Math.random() * sampleSchools.length)];

    return offlineQueueService.enqueue({
      studentName: randomName,
      applicantId: 'app-user-01',
      schemeId: 'scheme-pre-matric',
      schemeName: 'Pre-Matric Scholarship for ST Students',
      academicYear: '2026-2027',
      ashramSchoolCode: randomSchool,
      claimedIncome: 140000,
      academicPercentage: 84.5,
      standard: 'Class IX'
    });
  }
};
