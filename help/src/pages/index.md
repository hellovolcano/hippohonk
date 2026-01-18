---
title: Hippohonk Help
---

# Hippohonk Help

Hippohonk was built by a group of friends who wanted to find and share the best bands to see at SXSW. In our hey day, we listened to, rated, and documented 300+ bands for the festival in our search for greatness. Hippohonk.com is now defunct, but we still listen to as many bands as we can before the festival.

## Why document this API?

We wrote Hipphonk in Ruby on Rails in 2011, using handlebars for our front end. Unfortunately, we had day jobs, and the Hipphonk tech stack fell out of support in Heroku. I took it upon myself to slowly migrate Hippohonk to a more modern stack, using Node.js/Express on the backend, and React for the frontend. We kept the same PostgresSQL database filled with all of those sweet, sweet bands.

This work was only partially complete, but I'm using it now to familiarize myself with OpenAPI, and as a playground to write an OpenAPI spec from which to automatically generate help files.

## What if I want to use this sweet, sweet API?

If you stumble on this site: hi! Unfortunately, you can't actually use this API, and we're not currently hosting the database  anywhere. The path to the github project is linked below though; you are free to fork and run with it with you're feeling it.