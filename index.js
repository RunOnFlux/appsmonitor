const log = require('./src/lib/log');

const mailMonitor = require('./src/services/mailer');

mailMonitor.start();

log.info('Apps Monitor started');
