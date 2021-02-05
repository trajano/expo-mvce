import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = "background-fetch-task";

const backgroundFetch = async (body: TaskManager.TaskManagerTaskBody): Promise<BackgroundFetch.Result> => {
    // the executor code should not be accessing any
    // React-Native context data

    // This is the test text
    const text = new Date(Date.now()).toLocaleTimeString();
    console.log(BACKGROUND_FETCH_TASK, body);
    await AsyncStorage.setItem(BACKGROUND_FETCH_TASK, text)
    await Notifications.scheduleNotificationAsync(
        {
            content: {
                title: "Time's up!",
                body: `Set value to ${text}`,
            },
            trigger: null
        }
    );
    return BackgroundFetch.Result.NewData;
}


const registerTask = async (executor: TaskManager.TaskManagerTaskExecutor) => {
    // if (!TaskManager.isTaskDefined(BACKGROUND_FETCH_TASK)) {
    //     TaskManager.defineTask(BACKGROUND_FETCH_TASK, executor);
    // }

    // Presume that the task is not defined
    // (it really shouldn't be, but if can be use the above code)
    TaskManager.defineTask(BACKGROUND_FETCH_TASK, executor);

    // await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    //     minimumInterval: 60,
    //     startOnBoot: true,
    //     stopOnTerminate: false
    //   })

}

const requestNeededPermissionsAsync = async () => {
    await Notifications.requestPermissionsAsync({
        android: {},
        ios: {
            allowAlert: true,
            allowBadge: true,
            allowSound: true,
            allowAnnouncements: true,
            provideAppNotificationSettings: true,
        },
    });
}

const registerNotificationHandler = () => {
    Notifications.setNotificationHandler({
        handleNotification: async (notification) => {
            console.log(notification);
            return {
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
            }
        },
    });
}

export default () => {
    const [isAppInitialized, setAppInitialized] = useState(false);
    useEffect(() => {
        (async () => {
            try {
                await SplashScreen.preventAutoHideAsync();
                await requestNeededPermissionsAsync();
                await registerTask(backgroundFetch);
                registerNotificationHandler();
                await BackgroundFetch.setMinimumIntervalAsync(60);
            } finally {
                setAppInitialized(true);
                SplashScreen.hideAsync();
            }

        })()
    })
    return [isAppInitialized];
}