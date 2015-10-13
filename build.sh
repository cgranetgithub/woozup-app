rm meetme.apk
cordova plugin rm cordova-plugin-console
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore varioware.keystore ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk varioware
/home/charles/android-sdk-linux/build-tools/22.0.1/zipalign  -v 4 ./platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk meetme.apk

