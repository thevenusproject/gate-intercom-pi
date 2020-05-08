import _ from "lodash";
import { config as dotenv_config } from "dotenv";
import Blynk from "blynk-library";
// import Telegraf, { Telegram } from "telegraf";
import {exec} from 'child_process';

dotenv_config();
const {
  MY_CHAT_ID,
  GATE_GROUP_CHAT_ID,
  BLYNK_AUTH_TOKEN,
  TELEGRAM_TOKEN,
} = process.env;
// const telegraf = new Telegraf(TELEGRAM_TOKEN); // required for replying to messages
// const telegram = new Telegram(TELEGRAM_TOKEN); // required for initiating conversation
var blynk = new Blynk.Blynk(BLYNK_AUTH_TOKEN);

const v10 = new blynk.VirtualPin(10);
const v11 = new blynk.VirtualPin(11);
const blynkRPiReboot = new blynk.VirtualPin(21); // Setup Reboot Button

async function setupBlynkPins() {
  v10.on("write", async function (param) {
    // const value = _.get(param, "[0]") !== "0";
    // turn HDMI on
    if (param[0] === '1') {
      // Runs the CLI command if the button on V10 is pressed
      exec("tvservice -p", function (err, stdout, stderr) {
        console.log(stdout);
      });
    }
  });
  v11.on("write", async function (param) {
    // turn HDMI off
    if (param[0] === '1') {
      // Runs the CLI command if the button on V10 is pressed
      exec("tvservice -o", function  (err, stdout, stderr) {
        console.log(stdout);
      });
    }
  });
  blynkRPiReboot.on("write", function (param) {
    if (param[0] === '1') {
      // Runs the CLI command if the button on V10 is pressed
      exec("sudo /sbin/reboot -r", function  (err, stdout, stderr) {
        if (err) console.log(stderr)
        else console.log(stdout);
      });
    }
  });
}

// function writePinFromBlynk({ pin, params }) {
//   const value = _.get(params, "[0]") !== "1";
//   // do something
// }

// async function readPinFromBlynk({ pin }) {
  // blynk.virtualWrite(4, value);
// }

async function setup() {
  await setupBlynkPins().catch(e => killProcess(e));
}


function killProcess(msg) {
  console.log('killing process', msg)
  process.kill(process.pid, 'SIGTERM')
}

setup().catch((e) => console.log("err in setup", e));
