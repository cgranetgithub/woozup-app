rm woozup.apk
cordova plugin rm cordova-plugin-console
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore varioware.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk varioware
${ANDROID_HOME}/build-tools/25.0.2/zipalign  -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk woozup.apk

echo "Reverting to default URL"
git checkout www/js/url.js
