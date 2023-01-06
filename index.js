const log = require('./src/lib/log');

const appsMonitor = require('./src/services/appsMonitor');

appsMonitor.start();

log.info('Apps Monitor started');
