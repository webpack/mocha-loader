import { getOptions } from 'loader-utils';
import { validate } from 'schema-utils';

import schema from './options.json';

const startScriptPath = require.resolve('./start.js');
const mochaJs = require.resolve('mocha/mocha.js');
const mochaCss = require.resolve('mocha/mocha.css');
const { stringify } = JSON;

export default function mochaLoader(source) {
  return source;
}

mochaLoader.pitch = pitch;

export function pitch(req) {
  const options = getOptions(this) || {};

  validate(schema, options, {
    name: 'Mocha Loader',
    baseDataPath: 'options',
  });

  options.ui = options.ui || 'bdd';

  const source = [];
  if (this.target === 'web' || this.target === 'electron-renderer') {
    source.push(
      `require(${stringify(`!!style-loader!css-loader!${mochaCss}`)});`
    );
    source.push(`var mochaModule = require(${stringify(`!!${mochaJs}`)});`);
    source.push(`var mochaInstance = window.mocha || mochaModule;`);
    source.push(`mochaInstance.setup(${stringify(options)});`);
    source.push(`require(${stringify(`!!${req}`)});`);
    source.push(`require(${stringify(`!!${startScriptPath}`)});`);
    source.push('if(module.hot) {');
    source.push('\tmodule.hot.accept();');
    source.push('\tmodule.hot.dispose(function() {');
    source.push('\t\tmochaInstance.suite.suites.length = 0;');
    source.push("\t\tvar stats = document.getElementById('mocha-stats');");
    source.push("\t\tvar report = document.getElementById('mocha-report');");
    source.push('\t\tstats && stats.parentNode.removeChild(stats);');
    source.push('\t\treport && report.parentNode.removeChild(report);');
    source.push('\t});');
    source.push('}');
  } else {
    throw new Error(`Unsupported target environment ${this.target}`);
  }

  return source.join('\n');
}
