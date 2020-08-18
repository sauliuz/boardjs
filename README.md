[![Build Status](https://travis-ci.org/sauliuz/boardjs.svg?branch=master)](https://travis-ci.org/sauliuz/boardjs)

# boardjs

> Boardjs is a small and lean framework for building and hosting web dashboards. Built with nodejs. With inspiration from [dashing](http://dashing.io/) and [dashingjs](https://github.com/fabiocaseri/dashing-js).

## How To

To run the skelethon app clone this git repo. Install the dependencies from `package-lock.json` and start the app.

    npm npm ci
    npm start

To add new dashboards or edit the existing ones take a look at [/dashboards](/dashboards) and [/jobs](/jobs) directories within the project.

Boardjs template exposes *{domain}/metrics* endpoint for performance stats collection with [prometheus](https://prometheus.io/).
  
## The Look & Feel

The following is the look & feel of the example dashboard you get after the above steps.

![Boardjs dashboard view](https://github.com/sauliuz/dashing-app/blob/master/public/example-dashboard.png "Boardjs dashboard view")

## Improvements

Submit a pull request.

created by [@sauliuz](https://twitter.com/sauliuz) @ [popularowl.com](http://www.popularowl.com "apis made simple")
