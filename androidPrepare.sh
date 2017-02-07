echo "Setting real URL"
cat <<EOF >www/js/url.js
var backend_url = "http://woozup.herokuapp.com/";
EOF
ionic platform remove android && ionic platform add android
ionic resources android
ionic platform update android
cp -r resources/android/ic_notification/* platforms/android/res/

