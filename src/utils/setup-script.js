const fs = require('fs/promises');
const path = require('path');

async function updatePackageJson(appPath, appType) {
  try {
    const packageJsonPath = path.resolve(appPath + '/package.json');
    const data = await fs.readFile(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(data);

    packageJson.scripts = {
      ...packageJson.scripts,
      start: 'node index.js',
      dev: 'nodemon index.js',
      test: 'echo "Error: no test specified" && exit 1',
    };

    if (appType !== 'api') {
      packageJson.scripts.watch =
        'npx tailwindcss -i ./src/assets/css/input.css -o ./public/css/main.css --watch';
    }

    const updatedData = JSON.stringify(packageJson, null, 2);
    await fs.writeFile(packageJsonPath, updatedData, 'utf8');

    return packageJson;
  } catch (error) {
    console.error('Error updating package.json:', error);
  }
}

module.exports = {
  updatePackageJson,
};
