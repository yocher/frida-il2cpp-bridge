import { platformNotSupported, raise } from "../utils/console";
import { forModule } from "../utils/native-wait";

import { UnityVersion } from "./version";

import { _Il2CppDomain } from "./structs/domain";

/**
 * The Il2Cpp library (`libil2cpp.so`, `GameAssembly.dll` ...).
 */
export let library: Module;

/**
 * The Unity version of the current application.
 */
export let unityVersion: UnityVersion;

/**
 * The application `Il2CppDomain`.
 * ```typescript
 * Il2Cpp.domain.(...)
 * ```
 */
export let domain: _Il2CppDomain;

/**
 * The whole thing must be initialized first.
 * This is potentially asynchronous because
 * the `IL2CPP` library could be loaded at any
 * time, so we just make sure it's loaded.
 * The current Unity version will also be
 * detected.
 * ```typescript
 * import "frida-il2cpp-bridge";
 * async function main() {
 *   await Il2Cpp.initialize();
 *   console.log(Il2Cpp.unityVersion);
 * }
 * main().catch(error => console.log(error.stack));
 ```
 */
// my: 改成自己输入libname和版本，因为ios的il2cpp模块名不一样
// android: libil2cpp.so
// windows: GameAssembly.dll
// ios: xxxxx
// my: 改成自己输入unity版本号,如"2018.4.13f1"
export async function initialize(mainLibName: string, unityVerString: string) {
    library = await forModule(mainLibName);
    //unityVersion = await getUnityVersion();
    unityVersion = new UnityVersion(unityVerString);
    domain = await _Il2CppDomain.reference;
}

async function getUnityVersion() {
    return new UnityVersion("2018.4.13f1");
    /*
    let unityLibraryName =
        Process.platform == "linux" ? "libunity.so" : Process.platform == "windows" ? "UnityPlayer.dll" : "";

    let unityVersion: UnityVersion | undefined;
    const searchStringHex = "45787065637465642076657273696f6e3a"; // "Expected version: "
    try {
        const unityLibrary = await forModule(unityLibraryName);
        for (const range of unityLibrary.enumerateRanges("r--")) {
            const result = Memory.scanSync(range.base, range.size, searchStringHex)[0];
            if (result !== undefined) {
                unityVersion = new UnityVersion(result.address.readUtf8String()!);
                break;
            }
        }
    } catch (e) {
        raise("Couldn't obtain the Unity version: " + e);
    }
    if (unityVersion == undefined) {
        raise("Couldn't obtain the Unity version.");
    } else if (unityVersion.isBelow("5.3.0") || unityVersion.isEqualOrAbove("2021.1.0")) {
        raise(`Unity version "${unityVersion}" is not valid or supported.`);
    }

    return unityVersion;*/
}
