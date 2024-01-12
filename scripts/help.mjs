// help.mjs:
//   Print a help message, since all of these npm scripts can become confusing

console.log(`npm run <command>: Runs a command from package.json

  Note that in some cases, you will want to pass some information to the
  command.  You can do this by typing TUT=<info> npm run <command>.  For
  example, to serve the "storage" tutorial, you could type:
      TUT=storage npm run start

  Commands for Building and Serving Tutorials
    start       Build and serve the tutorial specified by the TUT environment
                variable
    build-all   Build all the tutorials
    serve-all   Start serving the tutorials (call build-all first!)

  Commands for Type Checking
    check   Run TypeScript's type checker on all game and tutorial code in the
            repository

  Commands for Cleaning Up
    clean   Remove any built files that aren't tracked by git

  Other Commands
    help    Print this message
`);
