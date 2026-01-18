---
title: Hippohonk Help
---

# Hippohonk Help

Hippohonk was a project a group of friends built around finding and sharing the best bands to see at SXSW. In its hey day, we listened to, rated, and documented 300+ bands for the festival in our search for great bands. Hippohonk.com is now defunct, but we still listen to as many bands as we can before the festival.

## Why document this API?

We originally wrote Hipphonk in Ruby on Rails, using handlebars for our front end. Unfortunately, we had day jobs, and the Hipphonk tech stack fell out of support in Heroku. I took it upon myself to slowly migrate Hippohonk to a more modern stack, using Node.js/Express on the backend, and React for the frontend. We kept the same PostgresSQL database.

This work was only partially complete, but I'm using it now to familiarize myself with OpenAPI, and as a playground to write an OpenAPI spec from which to automatically generate help files.

## What if I want to use this sweet, sweet API?

If you stumble on this site: hi! Unfortunately, you can't actually use this API, and we're not currently hosting the data anywhere. The path to the github project is linked below though; feel free to fork and run with it. 