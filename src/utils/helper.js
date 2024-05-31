const { spawn } = require('child_process');
const fs = require('fs-extra');

const installDependencies = async (dependencies) => {
  return new Promise((resolve, reject) => {
    const install = spawn(`npm i ${dependencies}`, {
      shell: true,
      stdio: 'inherit',
    });

    install.on('close', (code) => {
      if (code === 0) {
        resolve(`Installation process exited with code ${code}`);
      } else {
        reject(new Error(`Installation process failed with code ${code}`));
      }
    });
  });
};

const copyFiles = async (fileSource, fileDestination, condition = null) => {
  try {
    if (condition && condition.target !== condition.input) return false;
    await fs.copy(fileSource, fileDestination);
  } catch (err) {
    console.error('Ops, something went wrong: ', err);
  }
};

module.exports = {
  installDependencies,
  copyFiles,
};
