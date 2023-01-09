const { Webhook } = require('discord-webhook-node');
const config = require('config');
const log = require('../lib/log');

const hook = new Webhook(config.discord.hook);

const IMAGE_URL = 'https://raw.githubusercontent.com/RunOnFlux/flux/master/HomeUI/public/logo.png';
hook.setUsername('Flux Apps Bot');
hook.setAvatar(IMAGE_URL);

function testHook() {
  hook.send('Test Message, TEST AGAIN');
}

function sendHook(appName, expireBlocks, owner) {
  try {
    let title = `Application ***${appName}*** expires in ___${expireBlocks}___ blocks\n`;
    let value = `\n
    Time left: ${((expireBlocks * 2) / 60).toFixed(2)} hours
    Blocks left: ${expireBlocks}
    Owner: ${owner}
    \n`;
    if (owner === config.discord.monitoredOwner) {
      try {
        hook.send('@everyone');
      } catch (error) {
        log.error(error);
      }
      title = `!!! OUR Application ***${appName}*** expires in ___${expireBlocks}___ blocks !!!\n`;
      value += '**!!!THIS IS OUR APPLICATION !!!**';
    }
    hook.warning(`**${appName} Expires soon**`, title, value);
    log.info(`Discord notified about ${appName}`);
  } catch (error) {
    log.error(error);
  }
}

module.exports = { sendHook, testHook };
