[![Build Status](https://travis-ci.org/sauliuz/boardjs.svg?branch=master)](https://travis-ci.org/sauliuz/boardjs)

## boardjs

Boardjs is a small and lean framework for building and hosting web dashboards. Built with nodejs. With inspiration from [dashing](http://dashing.io/) and [dashingjs](https://github.com/fabiocaseri/dashing-js).

Application is using yarn for dependency management and *{domain}/metrics* endpoint for performance stats collection with [prometheus](https://prometheus.io/).

## How To

To run the sckelethon app clone this git repo, install the dependencies and start the app.

    yarn
    node app.js

To add new dashboards or edit the existing ones take a look at [/dasjboards](/dasjboards) and [/jobs](/jobs) directories within the project.
  
### The Look & Feel

The following is the look & feel of the example dashboard you get after the above steps.

![Boardjs dashboard view](https://github.com/sauliuz/dashing-app/blob/master/public/example-dashboard.png "Boardjs dashboard view")

### Contributions

Contibutions and pull requests are welcome. Created by [sauliuz](http://www.popularowl.com/author/saulius/)
  
