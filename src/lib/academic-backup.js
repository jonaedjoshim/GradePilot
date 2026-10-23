const BACKUP_PREFIX = "gradepilot_academic_backup_";

function getBackupKey(userId) {
  return `${BACKUP_PREFIX}${encodeURIComponent(userId)}`;
}

export function backupAcademicData(userId, data, reason = "cloud-selection") {
  if (!userId || !data) {
    return false;
  }

  try {
    const key = getBackupKey(userId);

    const existing = localStorage.getItem(key);

    if (existing) {
      const parsed = JSON.parse(existing);

      if (parsed?.data) {
        return true;
      }
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        reason,
        createdAt: new Date().toISOString(),
        data,
      }),
    );

    return true;
  } catch {
    return false;
  }
}

export function getAcademicBackup(userId) {
  if (!userId) {
    return null;
  }

  try {
    const raw = localStorage.getItem(getBackupKey(userId));

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    return parsed?.data ? parsed : null;
  } catch {
    return null;
  }
}

export function clearAcademicBackup(userId) {
  if (!userId) {
    return false;
  }

  try {
    localStorage.removeItem(getBackupKey(userId));
    return true;
  } catch {
    return false;
  }
}
