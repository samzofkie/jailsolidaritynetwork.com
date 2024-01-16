### jailsolidaritynetwork.com

This project is currently up at [jailsolidaritynetwork.github.io](jailsolidaritynetwork.github.io)! 

This repository contains the source code used to create the Webpack bundle that is then copied to a different GitHub repository that hosts the site. This complex move is so this (sometimes) private repo can hold stuff that shouldn't necessarily be GETable from the deployment.

I like to create the bundle with `npx webpack` and run `webpack-dev-server` at `localhost:8080` with `npx webpack serve` after running `docker run --rm -itv .:/app -w /app -p 8080:8080 node bash`.
