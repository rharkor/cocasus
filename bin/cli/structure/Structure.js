const fs = require('fs');
const util = require('util');
const inquirer = require('inquirer');
const path = require('path');
const exec = util.promisify(require('child_process').exec);

class Structure {
  constructor(path) {
    // Read the file struct.json
    this.structure = JSON.parse(
      fs.readFileSync(`${__dirname}/struct.json`, 'utf8')
    );

    this.path = path;
    this.loader = ['|', '/', '-', '\\'];
  }

  createStructure(
    only = null,
    force = false,
    options = {},
    type = 'web',
    installDeps = true
  ) {
    this.create(this.structure, this.path, only, force, options, installDeps);
  }

  create(
    object,
    absPath = this.path,
    only = null,
    force = false,
    options = {},
    installDeps,
    relPath = ''
  ) {
    // Create the structure
    Object.keys(object).forEach((key) => {
      const value = object[key];
      // Test if path.join(relPath, value.name) begins with only
      let valid = false;
      const validPath = path.join(relPath, value.name);
      if (!only) {
        valid = true;
      } else {
        only.forEach((item) => {
          if (item.startsWith(validPath)) {
            valid = true;
          }
        });
      }
      if (!only || valid) {
        if (value.type === 'directory') {
          try {
            fs.mkdirSync(path.join(absPath, value.name));
          } catch (error) {
            if (error.code !== 'EEXIST') {
              throw error;
            }
          }
          if (value.childrens) {
            this.create(
              value.childrens,
              path.join(absPath, value.name),
              only,
              force,
              options,
              installDeps,
              path.join(relPath, value.name)
            );
          }
        } else if (value.type === 'file') {
          // Read the content from value.path file
          let content = null;
          try {
            content = fs.readFileSync(`${__dirname}/../${value.path}`, 'utf8');
          } catch (error) {
            console.error(error);
            return;
          }
          if (value.replace && Object.keys(value.replace).length > 0) {
            Object.keys(value.replace).forEach((key) => {
              const rkey = key.replace('$', '\\$');
              const regex = new RegExp(rkey, 'g');
              if (
                value.replace[key].indexOf('$') !== -1 &&
                options[key.slice(1)]
              ) {
                content = content.replace(regex, options[key.slice(1)]);
              } else {
                content = content.replace(regex, value.replace[key]);
              }
            });
          }
          // Check if the file already exists
          if (!fs.existsSync(path.join(absPath, value.name)) || force) {
            fs.writeFileSync(path.join(absPath, value.name), content, 'utf8');
            console.log(colors.success(`Creating ${value.name}`));
          }
        } else if (
          value.type === 'command' &&
          !(!installDeps && value.name !== 'npm install')
        ) {
          let i = 0;
          const ui = new inquirer.ui.BottomBar({ bottomBar: this.loader[0] });
          const installInterval = setInterval(() => {
            i++;
            ui.updateBottomBar(
              `Installing dependencies ${this.loader[i % this.loader.length]}`
            );
          }, 300);
          // run the command
          exec(value.name, { cwd: absPath })
            .then(() => {
              clearInterval(installInterval);
              ui.updateBottomBar(`Installation completed\n`);
              ui.close();
            })
            .catch((error) => {
              console.error(error);
            });
        }
      }
    });
  }
}

module.exports = Structure;
