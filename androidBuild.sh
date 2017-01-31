rm woozup.apk
echo "Setting real URL"
cat <<EOF >www/js/url.js
var backend_url = "http://woozup.herokuapp.com/";
EOF
cordova plugin rm cordova-plugin-console
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore varioware.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk varioware
${ANDROID_HOME}/build-tools/25.0.2/zipalign  -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk woozup.apk

echo "Reverting to default URL"
git checkout www/js/url.js
