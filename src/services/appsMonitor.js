const axios = require('axios');
const log = require('../lib/log');
const mailer = require('./mailer');

let cachedHeight = 0;

async function getGlobalApps() {
  try {
    const response = await axios.get('https://api.runonflux.io/apps/globalappsspecifications');
    const apps = response.data.data;
    apps.forEach((app) => {
      // eslint-disable-next-line no-param-reassign
      app.expire = app.expire || 22000;
      // eslint-disable-next-line no-param-reassign
      app.contacts = app.contacts || [];
    });
    return apps;
  } catch (error) {
    log.error(error);
    return [];
  }
}

async function getCurrentBlockHeight() {
  try {
    const response = await axios.get('https://api.runonflux.io/daemon/getinfo');
    cachedHeight = response.data.data.blocks;
    return cachedHeight;
  } catch (error) {
    log.error(error);
    return cachedHeight;
  }
}

async function notifyExpiringApps() {
  try {
    const height = await getCurrentBlockHeight();
    if (!height) {
      log.error('No obtained block height! PANIC!!!');
      return;
    }
    const apps = await getGlobalApps();
    // eslint-disable-next-line no-restricted-syntax
    for (const app of apps) {
      try {
        if (app.height + app.expire < height + 2160) {
          let hours = 72;
          if (app.height + app.expire < height + 1440) {
            hours = 48;
          } else if (app.height + app.expire < height + 720) {
            hours = 24;
          } else if (app.height + app.expire < height + 360) {
            hours = 12;
          }
          const emails = app.contacts.filter((contact) => contact.includes('@'));
          if (!emails.length) {
            log.warn(`${app.name} expiring soon but no email provided to notify`);
          }
          emails.forEach((email) => {
            mailer.sendMail(email, `Application ${app.name} is expiring`, `Your application ${app.name} is expiring in less than ${hours} hours. Update your application specifications now otherwise the application will be removed from the network`);
          });
        }
      } catch (error) {
        log.error(error);
      }
    }
  } catch (error) {
    log.error(error);
  }
}

function start() {
  notifyExpiringApps();
  setInterval(() => {
    notifyExpiringApps();
  }, 8 * 60 * 60 * 1000); // every 8 hours;
}

module.exports = {
  start,
};
