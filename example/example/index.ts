//import { Il2Cpp } from "frida-il2cpp-bridge-my";

import {Il2Cpp} from "../src/index";

/*
const il2cppModuleName = "NewUnityProject";
const il2cppVersion = "2018.4.13";
const dumpPath = "/User/Containers/Data/Application/A15A1935-9E94-45F2-A1FB-24DDDDC62186/Documents/dump.cs";
*/

const il2cppModuleName = "h1gameop";
const il2cppVersion = "2018.4.13";
const dumpPath = "/var/mobile/Documents/dump.cs";


/*
const il2cppModuleName = "Yuanshen";
const il2cppVersion = "2018.4.13";
const dumpPath = "/var/mobile/Documents/dump.cs";*/


async function main() {
    await Il2Cpp.initialize(il2cppModuleName, il2cppVersion);
    // Uncomment for REPL access
    // (global as any).Il2Cpp = Il2Cpp;
    Il2Cpp.dump(dumpPath);
}

main().catch(error => {
    console.log("error");
    console.log(error.stack);
});

console.log(("hello"));
//Il2Cpp.dump();