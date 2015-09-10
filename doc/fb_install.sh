#!/bin/sh

# since ionic state reset fails to restore facebook plugin
# (due to missing required APP_ID and APP_NAME variables)
# let use this external script to do it 
# not tested on Mac OS X

ionic plugin add com.phonegap.plugins.facebookconnect --variable APP_ID="948253448566545" --variable APP_NAME="MurlockTest"
