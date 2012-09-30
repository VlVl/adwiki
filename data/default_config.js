module.exports = {
  http_port     : 3000,
  user          : 'admin',
  password      : '',
  project       : {
    path        : require('path').join( __dirname, '../node_modules/autodafe/framework' ),
    start_page  : 'About project',
    name        : 'The project',
    description : 'project description',
    twitter     : '',
    github      : '',
    copy        : '',
    author      : ''
  },
  db            : {
    user          : 'root',
    password      : '',
    database      : 'adwiki',
    host          : 'localhost',
    port          : 3306
  }
}