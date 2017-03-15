#!/bin/sh

echo "first you need to remove platforms from package.json"
ionic platform remove ios
ionic platform remove android
ionic platform remove browser
cordova platform remove ios
cordova platform remove browser
cordova platform remove android
bower install
cordova platform add ios
cordova platform update ios
ionic platform add ios
ionic resources
ionic prepare ios
ionic state reset
echo "now you can open .xcworkspace in xcode"
