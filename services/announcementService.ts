import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '@/constants/Config';

export interface Announcement {
  _id: string;
  title: string;
  image: string;
  altDesc: string;
  isExternal: boolean;
  linkPath: string;
}

const ANNOUNCEMENTS_STORAGE_KEY = 'announcements_checked_date';
const ANNOUNCEMENTS_INDEX_KEY = 'announcements_current_index';
const ANNOUNCEMENTS_CACHE_KEY = 'announcements_cache';

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export async function fetchTodaysAnnouncements(): Promise<Announcement[]> {
  try {
    console.log('[Announcements] 🟡 Fetching announcements from backend:', `${BACKEND_URL}/api/announcements/today`);
    const response = await fetch(`${BACKEND_URL}/api/announcements/today`);
    
    if (!response.ok) {
      console.error(`[Announcements] ❌ Failed to fetch announcements: ${response.statusText}`);
      return [];
    }
    
    const data = await response.json();
    console.log('[Announcements] ✅ Fetched from backend:', data);
    
    const announcements = data.data || [];
    console.log(`[Announcements] 📊 Total announcements received: ${announcements.length}`);
    
    if (announcements.length > 0) {
      console.log('[Announcements] 📦 Caching announcements');
      await AsyncStorage.setItem(ANNOUNCEMENTS_CACHE_KEY, JSON.stringify(announcements));
    }
    
    return announcements;
  } catch (error) {
    console.error('[Announcements] ❌ Error fetching announcements:', error);
    // Try to return cached announcements if available
    try {
      const cached = await AsyncStorage.getItem(ANNOUNCEMENTS_CACHE_KEY);
      if (cached) {
        console.log('[Announcements] 📦 Using cached announcements');
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('[Announcements] ❌ Error reading cache:', e);
    }
    return [];
  }
}

export async function hasCheckedAnnouncementsToday(): Promise<boolean> {
  try {
    const storedDate = await AsyncStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    const today = getTodayDateString();
    const hasChecked = storedDate === today;
    console.log(`[Announcements] 🔍 Checking if already viewed today: stored="${storedDate}", today="${today}", hasChecked=${hasChecked}`);
    return hasChecked;
  } catch (error) {
    console.error('[Announcements] ❌ Error checking announcements date:', error);
    return false;
  }
}

export async function markAnnouncementsAsCheckedToday(): Promise<void> {
  try {
    const today = getTodayDateString();
    console.log(`[Announcements] ✅ Marking announcements as checked for date: ${today}`);
    await AsyncStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, today);
    // Reset index when starting a new day
    await AsyncStorage.setItem(ANNOUNCEMENTS_INDEX_KEY, '0');
    console.log('[Announcements] ✅ Index reset to 0');
  } catch (error) {
    console.error('[Announcements] ❌ Error marking announcements as checked:', error);
  }
}

export async function getCurrentAnnouncementIndex(): Promise<number> {
  try {
    const index = await AsyncStorage.getItem(ANNOUNCEMENTS_INDEX_KEY);
    const currentIndex = index ? parseInt(index, 10) : 0;
    console.log(`[Announcements] 📍 Current announcement index: ${currentIndex}`);
    return currentIndex;
  } catch (error) {
    console.error('[Announcements] ❌ Error getting announcement index:', error);
    return 0;
  }
}

export async function incrementAnnouncementIndex(): Promise<void> {
  try {
    const currentIndex = await getCurrentAnnouncementIndex();
    const newIndex = currentIndex + 1;
    await AsyncStorage.setItem(ANNOUNCEMENTS_INDEX_KEY, String(newIndex));
    console.log(`[Announcements] ➡️ Incremented announcement index: ${currentIndex} -> ${newIndex}`);
  } catch (error) {
    console.error('[Announcements] ❌ Error incrementing announcement index:', error);
  }
}

/**
 * Get announcements to display for today
 * Automatically fetches and manages the display queue
 */
// export async function getTodaysAnnouncementsToDisplay(): Promise<Announcement[]> {
//   try {
//     console.log('[Announcements] 🚀 Starting getTodaysAnnouncementsToDisplay');
    
//     // Check if already viewed today
//     const alreadyChecked = await hasCheckedAnnouncementsToday();
//     if (alreadyChecked) {
//       console.log('[Announcements] ⏭️ User already checked announcements today, skipping');
//       return [];
//     }

//     // Fetch announcements from backend
//     const announcements = await fetchTodaysAnnouncements();
//     console.log(`[Announcements] 📋 Received ${announcements.length} announcements from backend`);
    
//     // If at least 1 announcement, display them
//     if (announcements.length > 0) {
//       console.log('[Announcements] ✅ Announcements found, will display them');
//       return announcements;
//     }

//     // If none found
//     console.log('[Announcements] ℹ️ No announcements available');
//     await markAnnouncementsAsCheckedToday();
//     return [];

//   } catch (error) {
//     console.error('[Announcements] ❌ Error in getTodaysAnnouncementsToDisplay:', error);
//     return [];
//   }
// }

export async function getTodaysAnnouncementsToDisplay(): Promise<Announcement[]> {
  try {
    console.log('[Announcements] 🚀 Starting getTodaysAnnouncementsToDisplay');

    // Always fetch announcements (no more "already viewed today" check)
    const announcements = await fetchTodaysAnnouncements();
    console.log(`[Announcements] 📋 Received ${announcements.length} announcements`);

    // If announcements exist, reset index so we always start from the first announcement
    if (announcements.length > 0) {
      console.log('[Announcements] 🔄 Resetting index so announcements always display from start');
      await AsyncStorage.setItem(ANNOUNCEMENTS_INDEX_KEY, "0");
      return announcements;
    }

    // No announcements available
    console.log('[Announcements] ℹ️ No announcements available');
    return [];

  } catch (error) {
    console.error('[Announcements] ❌ Error in getTodaysAnnouncementsToDisplay:', error);
    return [];
  }
}



/**
 * Get the next announcement to display
 */
export async function getNextAnnouncement(
  announcements: Announcement[]
): Promise<Announcement | null> {
  try {
    if (announcements.length === 0) {
      console.log('[Announcements] ⚠️ No announcements in list');
      return null;
    }

    const currentIndex = await getCurrentAnnouncementIndex();
    console.log(`[Announcements] 🔎 Getting announcement at index ${currentIndex} (total: ${announcements.length})`);
    
    // If we've gone through all announcements, mark as checked
    if (currentIndex >= announcements.length) {
      console.log('[Announcements] ✅ All announcements viewed, marking as checked');
      await markAnnouncementsAsCheckedToday();
      return null;
    }

    const announcement = announcements[currentIndex];
    console.log(`[Announcements] 📌 Returning announcement: ${announcement.title}`);
    return announcement;
  } catch (error) {
    console.error('[Announcements] ❌ Error getting next announcement:', error);
    return null;
  }
}

export async function handleNextAnnouncement(
  announcements: Announcement[]
): Promise<Announcement | null> {
  try {
    console.log('[Announcements] ➡️ Moving to next announcement');
    await incrementAnnouncementIndex();
    return getNextAnnouncement(announcements);
  } catch (error) {
    console.error('[Announcements] ❌ Error handling next announcement:', error);
    return null;
  }
}

export async function resetAnnouncementsStorage(): Promise<void> {
  try {
    console.log('[Announcements] 🔄 Resetting announcements storage');
    await AsyncStorage.removeItem(ANNOUNCEMENTS_STORAGE_KEY);
    await AsyncStorage.removeItem(ANNOUNCEMENTS_INDEX_KEY);
    await AsyncStorage.removeItem(ANNOUNCEMENTS_CACHE_KEY);
    console.log('[Announcements] ✅ Storage reset complete');
  } catch (error) {
    console.error('[Announcements] ❌ Error resetting announcements storage:', error);
  }
}
