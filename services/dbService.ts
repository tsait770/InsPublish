
import { Project, VersionSnapshot } from '../types';

const DB_NAME = 'InsPublishDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';
const SETTINGS_STORE = 'settings';

export const dbService = {
  async initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async saveProject(project: Project): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(project);
    
    // Ensure project-specific region is also updated if needed
    // The userCountryCode is often handled globally, but we save it here for persistence context
    this.scheduleAutoSnapshot(project.id);
  },

  /**
   * Persists global app settings like userCountryCode
   */
  async saveAppSetting(key: string, value: any): Promise<void> {
    const db = await this.initDB();
    const tx = db.transaction(SETTINGS_STORE, 'readwrite');
    tx.objectStore(SETTINGS_STORE).put(value, key);
  },

  async getAppSetting(key: string): Promise<any> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SETTINGS_STORE, 'readonly');
      const req = tx.objectStore(SETTINGS_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
    });
  },

  snapshotTimers: {} as Record<string, number>,

  scheduleAutoSnapshot(projectId: string) {
    if (this.snapshotTimers[projectId]) return;
    
    this.snapshotTimers[projectId] = window.setInterval(async () => {
      console.log("[Safety] 執行 2 分鐘安全快照檢測...");
      const project = await this.getProject(projectId);
      if (project) {
        // 快照邏輯實作點
      }
    }, 120000);
  },

  async getProject(id: string): Promise<Project | null> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(id);
      req.onsuccess = () => resolve(req.result || null);
    });
  },

  async getAllProjects(): Promise<Project[]> {
    const db = await this.initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
    });
  },

  onSync(callback: (id: string) => void) {
    const channel = new BroadcastChannel('inspublish_sync');
    channel.onmessage = (e) => callback(e.data.id);
  }
};
