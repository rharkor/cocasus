const fs = require('fs');
const util = require('util');
const inquirer = require('inquirer');
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

  createStructure(only = null, force = false, options = {}) {
    this.#create(this.structure, this.path, only, force, options);
  }

  #create(object, path = this.path, only = null, force = false, options = {}) {
    // Create the structure
    Object.keys(object).forEach((key) => {
      const value = object[key];
      if (value.type === 'directory') {
        if (!only || only.indexOf(value.name) !== -1) {
          try {
            fs.mkdirSync(`${path}/${value.name}`);
          } catch (error) {
            if (error.code !== 'EEXIST') {
              throw error;
            }
          }
          if (value.childrens) {
            this.#create(value.childrens, `${path}/${value.name}`, only, force);
          }
        }
      } else if (value.type === 'file') {
        // Read the content from value.path file
        let content = fs.readFileSync(`${__dirname}/../${value.path}`, 'utf8');
        if (value.replace && Object.keys(value.replace).length > 0) {
          Object.keys(value.replace).forEach((key) => {
            const rkey = key.replace('$', '\\$');
            const regex = new RegExp(rkey, 'g');
            if (value.replace[key].indexOf('$') !== -1) {
              content = content.replace(regex, options[key.slice(1)]);
            } else {
              content = content.replace(regex, value.replace[key]);
            }
          });
        }
        // Check if the file already exists
        if (!fs.existsSync(`${path}/${value.name}`) || force) {
          console.log(`Creating ${value.name}`);
          fs.writeFileSync(`${path}/${value.name}`, content, 'utf8');
        }
      } else if (value.type === 'command') {
        let i = 0;
        const ui = new inquirer.ui.BottomBar({ bottomBar: this.loader[0] });
        const installInterval = setInterval(() => {
          i++;
          ui.updateBottomBar(
            `Installing dependencies ${this.loader[i % this.loader.length]}`
          );
        }, 300);
        // run the command
        exec(value.name, { cwd: path })
          .then(() => {
            clearInterval(installInterval);
            ui.updateBottomBar(`Installation completed\n`);
            ui.close();
          })
          .catch((error) => {
            console.error(error);
          });
      }
    });
  }
}

module.exports = Structure;
