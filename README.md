# splash-screen 

I have implemented a SplashScreen similar to the one from the tabs template.  When viewing on the device with a Expo Go client I get the "Native splash screen is already hidden. Call this method before rendering any view." warning.  I think I can safely ignore it for the most part, but it is a bit annoying.

Note this is only on reloads, I just use LogBox.ignoreLogs to ignore it for now.

# background-fetch

This is a stand alone implemention of background fetch.  It is based off https://github.com/expo/expo/blob/master/apps/native-component-list/src/screens/BackgroundFetchScreen.tsx

However, it does not appear to work on iOS 14.4.
