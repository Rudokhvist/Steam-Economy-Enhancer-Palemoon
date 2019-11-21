#!/bin/bash
filename='content/Steam-Economy-Enhancer/code.user.js'
while read line; do
# reading each line
if [[ "${line:0:2}" == "//" ]];
then
  if [[ "${line:0:16}" == "// @require     " ]];
  then
    s=${line:16:-1};
    mkdir -p content/scripts
    cd content/scripts
    curl -O -L $s
    cd -
  fi
else
  break
fi
done < $filename