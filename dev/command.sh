#!/bin/sh

if [ "$APP_CONTEXT" = "dev"   ]; then npm start; fi
if [ "$APP_CONTEXT" = "tests" ]; then sleep infinity; fi
