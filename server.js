import _ from "lodash";
import { config as dotenv_config } from "dotenv";
import Blynk from "blynk-library";
// import Telegraf, { Telegram } from "telegraf";

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
    if (param === 1) {
      // Runs the CLI command if the button on V10 is pressed
      process.exec("tvservice -p", function (msg) {
        console.log(msg);
      });
    }
  });
  v11.on("write", async function (param) {
    // turn HDMI off
    if (param === 1) {
      // Runs the CLI command if the button on V10 is pressed
      process.exec("tvservice -o", function (msg) {
        console.log(msg);
      });
    }
  });
  blynkRPiReboot.on("write", function (param) {
    if (param === 1) {
      // Runs the CLI command if the button on V10 is pressed
      process.exec("sudo /sbin/reboot -r", function (msg) {
        console.log(msg);
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
