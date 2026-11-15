import { useSyncExternalStore } from 'react';
import { getInstallState, InstallState, subscribeInstall } from '../utils/install';

/** The install state (see utils/install), kept current as the browser offers or drops its prompt */
export function useInstall(): InstallState {
  return useSyncExternalStore(subscribeInstall, getInstallState);
}
