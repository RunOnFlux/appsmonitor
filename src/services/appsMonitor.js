const axios = require('axios');
const log = require('../lib/log');
const mailer = require('./mailer');
const discordNotifier = require('./discordNotifier');
const serviceHelper = require('./serviceHelper');

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
        if (app.height + app.expire < height + 3500) {
          const emails = app.contacts.filter((contact) => contact.includes('@'));
          if (!emails.length) {
            log.warn(`${app.name} expiring soon but no email provided to notify`);
          } else if (app.height + app.expire < height + 3500 && app.height + app.expire < height + 3470) {
            emails.forEach((email) => {
              mailer.sendMail(email, `Application ${app.name} is expiring`, `Your application ${app.name} is expiring in less than 5 day. Please update your application specifications now otherwise the application will be removed from the network`);
            });
          } else if (app.height + app.expire < height + 2160 && app.height + app.expire < height + 2130) {
            emails.forEach((email) => {
              mailer.sendMail(email, `Application ${app.name} is expiring`, `Your application ${app.name} is expiring in less than 3 day. Please update your application specifications now otherwise the application will be removed from the network`);
            });
          } else if (app.height + app.expire < height + 1440 && app.height + app.expire < height + 1410) {
            emails.forEach((email) => {
              mailer.sendMail(email, `Application ${app.name} is expiring`, `Your application ${app.name} is expiring in the next 48 hours. Please update your application specifications now otherwise the application will be removed from the network`);
            });
          } else if (app.height + app.expire < height + 720 && app.height + app.expire > height + 690) {
            emails.forEach((email) => {
              mailer.sendMail(email, `Application ${app.name} is expiring`, `Your application ${app.name} is expiring today! Please update your application specifications now otherwise the application will be removed from the network`);
            });
          } else if (app.height + app.expire < height + 360 && app.height + app.expire > height + 330) {
            emails.forEach((email) => {
              mailer.sendMail(email, `Application ${app.name} is expiring`, `Your application ${app.name} is expiring within next hour! Please update your application specifications now otherwise the application will be removed from the network`);
            });
          }
          const expireIn = app.height + app.expire - height;
          discordNotifier.sendHook(app.name, expireIn, app.owner);
          // eslint-disable-next-line no-await-in-loop
          await serviceHelper.delay(15000);
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
  }, 1 * 60 * 60 * 1000); // every 1 hour
}

module.exports = {
  start,
};
