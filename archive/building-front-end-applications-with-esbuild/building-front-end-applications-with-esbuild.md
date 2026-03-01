:title Building Front End Applications with esbuild
:description front-end build server without the hassle
:date 2022-08-01
:slug Building Front End Applications with esbuild
:category Web Development

Browser front end applications are composed of a wide variety of kinds of files.
Image assets, third-party dependencies, and source code written in a variety of languages[^1].
The most common process for deploying this collection of resources is to use a build system which packages the entire collection in to a single file[^2] that can then be copied to the server.
Many tools[^3] exist for this process with different tradeoffs and I find that [esbuild](https://esbuild.github.io/) has the least impedance with my priorities[^4].
Let's see how I configure esbuild for a typical front end application.

I structure my front end projects with three directories, `bin`, `src`, and `public`.
`bin` contains the esbuild script an any other ad hoc data transformation tools or convenience scripts.
`src` contains the source code for the application - the raw material esbuild will combine into a bundle.
`public` is the destination director for esbuild - all artifacts land here.
`public` also contains the `index.html` file that is the entry point for the browser to execute the bundled application.

The build script offers two modes[^5]: `bundle` the application as a single artifact to publish or `serve` to run a file watcher and hot reloading web server.
Typically during development I have the `serve` command running on the bottom right side of my screen with the browser open above it and the code editor to the left.
The `serve` command will recompile the entire application when any input file changes and report any errors detected.
The `serve` command will also automatically open the default web browser and load the application.
The following message sequence diagram outlines the entire `serve` process.

![`serve` message sequence diagram](hotreload.jpg)

The following code block shows the contents of a typical `./bin/build.js` script from [one of my recent projects](/writing/pokémon-first-generation-map).
Try it out and [let me know](/contact) how it goes for you.

    // contents of `./bin/build.js`

    const path = require('path')

    const sharedConfig = {
      bundle: true,
      define: { global: 'window' },
      outdir: 'public',
      loader: {
        '.glsl': 'text',
        '.vert': 'text',
        '.frag': 'text',
        '.png': 'dataurl',
      },
      entryPoints: [
        'index',
      ].flatMap(p => [
        path.join(
          __dirname,
          '..',
          'src',
          `${p}.js`
        ),
        path.join(
          __dirname,
          '..',
          'src',
          `${p}.css`
        ),
      ]),
    }

    const serve = (sharedConfig) => {
      const clients = []
      const http = require('http')
      const esbuild = require('esbuild')
      esbuild.build({
        ...sharedConfig,
        banner: {
          js: ' (() => new EventSource("http://localhost:6788/esbuild").onmessage = () => location.reload())();'
        },
        watch: {
          onRebuild(error, result) {
            clients.forEach((res) => res.write('data: update\n\n'))
            clients.length = 0
            console.log(error ? error : '...')
          }
        },
      }).catch(() => process.exit(1))

      esbuild.serve({ port: 6789, servedir: path.join(__dirname, '..', 'public' }, {})
        .then(() => {
          http.createServer((req, res) => {
            const { url, method, headers } = req
            if(req.url === '/esbuild') {
              return clients.push(
                res.writeHead(200, {
                  'Content-Type': 'text/event-stream',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache',
                    Connection: 'keep-alive',
                }))
            }
          }).listen(6788)
        })

      setTimeout(() => {
        const { spawn } = require('child_process')
        const op = { darwin: ['open'], linux: ['xdg-open'], win32: ['cmd', '/c', 'start'] }
        if(clients.length === 0)
          spawn(
            op[process.platform][0],
            [...[op[process.platform].slice(1)], 'http://localhost:6789'].flatMap(x => x)
          )
      }, 1000)
    }

    switch(process.argv[2]) {
      case 'serve': {
        serve(sharedConfig)
      } break;
      case 'bundle': {
        require('esbuild').build(sharedConfig).catch(() => process.exit(1))
      } break;
    }

[^1]: JavaScript, TypeScript, CSS, GLSL to name a few.
[^2]: Frequently there are operational concerns (mostly around minimizing bandwidth or reducing load times) that cause the output to be multiple files. `tar czvf` and now you have a single file.
[^3]: I have a particular fondness for `make` from my time in grad school and the one paper I published, [Automated Packaging of Bioinformatics Workflows for Portability and Durability using Makeflow](/files/automated-packaging-works13.pdf). I don't recommend reading that paper - much has changed in the decade since publication. It is referenced here mostly for the nostalgia.
[^4]: Speed without caching eliminates the fan noise while also not introducing an additional debugging step. I am also comfortable with `go` which eliminates concerns about expanding the tooling outside of JavaScript/node for me.
[^5]: There is usually a third mode, `watch`, that runs the entire compilation step without the web server for backend work. This is particularly useful when using TypeScript since it will also run typechecking.
