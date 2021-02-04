import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
export default () => {
    const [isAppInitialized, setAppInitialized] = useState(false);
    useEffect(() => {
        (async () => {
            await SplashScreen.preventAutoHideAsync();
            try {
            } finally {
                setAppInitialized(true);
                SplashScreen.hideAsync();
            }

        })()
    })
    return [isAppInitialized];
}