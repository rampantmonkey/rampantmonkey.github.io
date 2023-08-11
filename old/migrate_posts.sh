#!/usr/bin/env bash

for f in posts/*
do
  bn=${f##*/}
#  echo $bn
  year=$(echo $bn | cut -c1-4)
  month=$(echo $bn | cut -c5-6)
  day=$(echo $bn | cut -c7-8)
  title=$(echo $bn | cut -c10-)
  slug=${title%.*}
  dir=content/$year/$month
  mkdir -p $dir
  tmppost=$(cat $f |\
  grep -v '====' |\
  grep -v '^Filename:' |\
  sed -e '1 s/^\(.*\)/title = "\1"/' |\
  sed -e '1i+++' |\
  sed -e 's/^[Tt]ype:\s*\(.*\)/type = "\1"/' |\
  sed -e "s/^[Pp]ublished:\s*\(.*\)/date = \"$year-$month-$day\"/" |\
  sed -e 's/^[Ss]ummary:\s*\(.*\)/description = \1/' |\
  sed -e 's/^[Ee]xternal:\s*\(.*\)/external = "\1"/' |\
  sed -e 's/^[Tt]ags:\s*\(.*\)/tags = [ \1 ]/' |\
  sed -e 's/^[Tt]itle:\s*\(.*\)/title = [ \1 ]/' |\
  sed -e "0,/^$/ s/^$/slug = \"${slug}\"\n+++\n/" |\
  cat -)
  description="description = \"$(echo "$tmppost" |\
    grep -m 1 '^description =' |\
    cut -d'=' -f2- |\
    sed -e 's/^\s*//' |\
    sed -e 's/\//\\\//g' |\
    sed -e 's/\"/\\\\"/g' |\
    cat -)\""
  tagline="tags = [ $(echo "$tmppost" |\
    grep -m 1 '^tags = \[' |\
    awk -F'=' '{print $2}' |\
    sed -e "s/\s*\[\s*\(.*\)\s*\]/\1/" |\
    sed -e "s/^\s*//" |\
    sed -e "s/\s*$//" |\
    sed -e "s/\s*,\s*/,/" |\
    sed -e 's/"//g' -e 's/^\|$/"/g' -e 's/,/","/g' |\
    cat -) ]"
  contents=$(echo "$tmppost" |\
    sed -e "s/^tags = \[.*\]/${tagline}/" |\
    sed -e "s/^description =.*/${description}/" |\
    cat -)

  echo "$contents" > $dir/$title
done
