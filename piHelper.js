import {sleep} from "./server"
import {exec} from 'child_process';


export async function turnOnHDMI() {
  console.log('turnOnHDMI')
  exec("tvservice -p", function  (err, stdout, stderr) {
    console.log(stdout);
  });
  await sleep(3000);
  exec("sudo /bin/chvt 2", function  (err, stdout, stderr) {
    console.log(stdout);
  });
}

export async function turnOffHDMI() {
  console.log('turnOffHDMI')

  exec("tvservice -o", function (err, stdout, stderr) {
    console.log(stdout);
  });
}

export async function rebootRPi() {
  exec("sudo /sbin/reboot", function  (err, stdout, stderr) {
    if (err) console.log(stderr)
    else console.log(stdout);
  });
}
