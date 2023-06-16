module.exports = {
  apps : [{
    name   : "Foothill",
    script : "index.js",
    // other properties...

    // Specify the directories or files to watch
    watch: ['commands', 'events', 'models'],

    // Exclude "data.sqlite" from being watched
    ignore_watch: ['data.sqlite']
  }]
}
