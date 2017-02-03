rm woozup.apk
echo "Setting real URL"
cat <<EOF >www/js/url.js
var backend_url = "http://woozup.herokuapp.com/";
EOF
ionic platform remove android && ionic platform add android
ionic resources android
ionic platform update android
cp -r resources/android/ic_notification/* platforms/android/res/
cordova plugin rm cordova-plugin-console
cordova build --release android
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore varioware.keystore ./platforms/android/build/outputs/apk/android-release-unsigned.apk varioware
${ANDROID_HOME}/build-tools/25.0.2/zipalign  -v 4 ./platforms/android/build/outputs/apk/android-release-unsigned.apk woozup.apk

echo "Reverting to default URL"
git checkout www/js/url.js
