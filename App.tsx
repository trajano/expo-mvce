import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { AppState, Button, LogBox, StyleSheet, Text, View } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useInitializeApp from './hooks/useInitializeApp';
import { getPermissionsAsync, NotificationPermissionsStatus } from 'expo-notifications';
import { BackgroundFetchStatus } from 'expo-background-fetch/build/BackgroundFetch.types';

LogBox.ignoreLogs(["Native splash screen is already hidden. Call this method before rendering any view."])
const BACKGROUND_FETCH_TASK = "background-fetch-task";

export default function App() {
  const [isAppInitialized] = useInitializeApp();
  const [isRunning, setRunning] = useState(false);
  const [fetchDate, setFetchDate] = useState<string | null>(null);

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionsStatus>();
  const [backgroundStatus, setBackgroundStatus] = useState<BackgroundFetchStatus | null>();

  const checkStatusAsync = async () => {
    setBackgroundStatus(await BackgroundFetch.getStatusAsync());
    setRunning(await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK));
    setNotificationPermission(await getPermissionsAsync());
  };

  const handleToggle = async () => {
    if (isRunning) {
      await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    } else {
      await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 60,
        startOnBoot: true,
        stopOnTerminate: false
      })
    }
    setRunning(!isRunning);
  }

  const handleNotifyMe = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        data: { data: 'goes here' },
      },
      trigger: null,
    });
  }

  const renderText = () => {
    if (!fetchDate) {
      return <Text>There was no BackgroundFetch call yet.</Text>;
    }
    return (
      <View style={{ flexDirection: 'column', alignItems: 'center' }}>
        <Text>Last background fetch was invoked at:</Text>
        <Text style={styles.boldText}>{fetchDate}</Text>
      </View>
    );
  };

  const refreshLastFetchDateAsync = async () => {
    const lastFetchDateStr = await AsyncStorage.getItem(BACKGROUND_FETCH_TASK);

    if (lastFetchDateStr) {
      setFetchDate(lastFetchDateStr);
    }
  };

  const handleAppStateChange = () => {
    if (AppState.currentState === "active") {
      refreshLastFetchDateAsync();
      checkStatusAsync();
    }
  }

  useEffect(() => {
    AppState.addEventListener("change", handleAppStateChange);
    return () => {
      AppState.removeEventListener("change", handleAppStateChange);
    };
  }, []);

  useEffect(() => {
    refreshLastFetchDateAsync();
    checkStatusAsync();
  }, []);

  if (!isAppInitialized) {
    return null;
  }
  return (

    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text>
          Background fetch status:{' '}
          <Text style={styles.boldText}>{backgroundStatus ? BackgroundFetch.Status[backgroundStatus] : null}</Text>
        </Text>
      </View>
      <View style={styles.textContainer}>
        <Text>
          Notification Permission:{' '}
          <Text style={styles.boldText}>{notificationPermission?.status}</Text>
        </Text>
      </View>
      <View style={styles.textContainer}>{renderText()}</View>
      <Button
        title={isRunning ? 'Unregister BackgroundFetch task' : 'Register BackgroundFetch task'}
        onPress={handleToggle}
      />
      <Button title="Notify Me" onPress={handleNotifyMe} />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    margin: 10,
  },
  boldText: {
    fontWeight: 'bold',
  },
});
