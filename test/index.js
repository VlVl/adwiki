require('adwiki').run({
  http_port     : 3000,
  user          : 'admin',
  password      : '',
  project       : {
    path        : require('path').join( __dirname, 'files' ),
    start_page  : 'Autodafé',
    name        : 'Autodafé',
    description : 'node.js mvc framework',
    twitter     : 'https://twitter.com/node_autodafe',
    github      : 'https://github.com/jifeon/autodafe',
    copy        : '2012 Andrey Balakirev (MIT License)',
    author      : 'Andrey Balakirev, Vladimir Balakirev'
  },
  db            : {
    user          : 'test',
    password      : 'test',
    database      : 'autodafe_site',
    host          : 'localhost'
  }
});
