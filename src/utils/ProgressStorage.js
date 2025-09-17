import AsyncStorage from '@react-native-async-storage/async-storage';

const PROGRESS_KEY = 'user_progress';

export async function loadProgress() {
  try {
    const data = await AsyncStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : { packs: {} };
  } catch (e) {
    console.error('Failed to load progress', e);
    return { packs: {} };
  }
}

export async function saveProgress(progress) {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress', e);
  }
}

export async function updateLevelProgress(packId, levelIndex, newData) {
  const progress = await loadProgress();
  if (!progress.packs[packId]) progress.packs[packId] = {};
  progress.packs[packId][levelIndex] = {
    ...progress.packs[packId][levelIndex],
    ...newData,
  };
  await saveProgress(progress);
  return progress.packs[packId][levelIndex];
}


export const test = async () => {
  console.log("Starting test...");
  await updateLevelProgress('pack1', 0, { status: 'inProgress', guessesRemaining: 3 });
  const loaded = await loadProgress();
  console.log("Loaded progress:", loaded);
};
