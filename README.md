# ADWiki

ADWiki is a system to display JavaScript documentation online. Your code should be documented by
[JSDoc](http://en.wikipedia.org/wiki/JSDoc) rules.

##Demo

Live demo is [here](http://autodafe.ws/class/Application) (you can see the source code of that file
[here](code on http://autodafe.ws/file/Application)) There is also a blog system to write articles for your project on the
same site.

For example the site [autodafe.ws](http://autodafe.ws) ([code on github](https://github.com/jifeon/autodafe_docs)) uses **only** ADWiki

##Installation

ADWiki uses [nodejs](http://nodejs.org) as engine and DBMS [MySQL](http://www.mysql.com/) The simplest way to install
ADWiki is to use [npm](http://npmjs.org)

First, create a folder for your project documentation site

```bash
$ mkdir your_project_docs
$ cd your_project_docs
```
Then install ADWiki
```bash
$ npm install adwiki
```
Make sure you are running mysql server
```bash
$ sudo service mysql start
```
Run a script to prepare DB and make configuration file
```bash
$ node node_modules/adwiki/install
```
It will be necessary to enter settings for DB connection (specified user must have permissions to create DB schemas)

##Configurations

You can adjust your project changing settings in `your_project_docs/index.js`

###http_port
_default:_ 3000

The HTTP port to server starts on.

###user 
_default:_ "admin"

Administrator nickname. Administrator can create, edit and remove an articles on the site.

###password
_default:_ ""

Admin password

###project.path
_default:_ ""

**It's a directory which recursive search of documented files start from**

###project.start_page
_default:_ "About project"

The title of article which is shown on the site main page. There is a blank space because the article does not exist
initially. So you should login in the site using login and password above and create that article.

###project.name
_default:_ "The project"

Project name

###project.description
_default:_ "project description"

Short project description

###project.twitter
_default:_ ""

Link to your project on twitter. A twitter bird appears on the site top panel if the link is specified.

###project.github
_default:_ ""

Link to your project on GitHub. It appears on the site top panel

###project.copy
_default:_ ""

Copyright is in the footer of every site page.

###project.author
_default:_ ""

Author of a project.

###db
A database connection configuration. By default there are settings you entered while the site installation

##Advancing settings
ADWiki uses nodejs framework Autodafe ([link to documentation](http://autodafe.ws)) And to quick change the site
appearance just edit the templates in `adwiki/views` folder

##Feedback
If you found an error or you have any questions or suggestions, please feel free to contact us at
balakirev.andrey@gmail.com and balakirev.vladimir@gmail.com. We also can help you to organize your project
documentation.

We are on twitter [@node_autodafe](http://twitter.com/node_autodafe)