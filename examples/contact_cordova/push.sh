#!/bin/bash

APK=platforms/android/build/outputs/apk/android-debug.apk
rm ${APK}
cordova build android
if [ ! -f ${APK} ]; then
    echo "Build failed, aborting"
    exit 1
fi

echo "Uninstall"
$ANDROID_HOME/platform-tools/adb uninstall org.murlock.cordova.sample
echo "Install"
$ANDROID_HOME/platform-tools/adb install -r ${APK}
echo "Launch"
$ANDROID_HOME/platform-tools/adb shell monkey -p org.murlock.cordova.sample -c android.intent.category.LAUNCHER 1
