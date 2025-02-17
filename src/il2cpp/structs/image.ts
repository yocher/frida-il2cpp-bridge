import { cache } from "decorator-cache-getter";

import { Accessor } from "../../utils/accessor";

import { Api } from "../api";
import { nonNullHandle } from "../decorators";
import { NativeStruct } from "../native-struct";
import { getOrNull } from "../utils";
import { unityVersion } from "../variables";

import { _Il2CppClass } from "./class";
import { _Il2CppType } from "./type";

/**
 * Represents a `Il2CppImage`.
 */
@nonNullHandle
export class _Il2CppImage extends NativeStruct {
    /**
     * @return The count of its classes.
     */
    @cache get classCount() {
        return Api._imageGetClassCount(this.handle);
    }

    /**
     * Non-generic types are stored in sequence.
     * @return The start index of its classes, `0` if this information
     * is not available (since Unity version `2020.2.0`).
     */
    @cache get classStart() {
        return Api._imageGetClassStart(this.handle);
    }

    /**
     * We can iterate over its classes using a `for..of` loop,
     * or access a specific assembly using its full type name.
     * ```typescript
     * const mscorlib = assemblies.mscorlib.image;
     * for (const klass of mscorlib.classes) {
     * }
     * const BooleanClass = mscorlib.classes["System.Boolean"];
     * ```
     * @return Its classes.
     */
    @cache get classes() {
        const accessor = new Accessor<_Il2CppClass>();
        if (unityVersion.isLegacy) {
            const start = this.classStart;
            const end = start + this.classCount;
            const globalIndex = Memory.alloc(Process.pointerSize);
            globalIndex.add(_Il2CppType.offsetOfTypeEnum).writeInt(0x20);
            for (let i = start; i < end; i++) {
                const klass = new _Il2CppClass(Api._typeGetClassOrElementClass(globalIndex.writeInt(i)));
                accessor[klass.type!.name!] = klass;
            }
        } else {
            const end = this.classCount;
            for (let i = 0; i < end; i++) {
                const klass = new _Il2CppClass(Api._imageGetClass(this.handle, i));
                accessor[klass.type.name] = klass;
            }
        }
        return accessor;
    }

    /**
     * @return Its name, equals to the name of its assembly plus its
     * extension.
     */
    @cache get name() {
        return Api._imageGetName(this.handle)!;
    }

    /**
     * @param namespace The class namespace.
     * @param name The class name.
     * @return The class for the given namespace and name or `null` if
     * not found.
     */
    getClassFromName(namespace: string, name: string) {
        return getOrNull(Api._classFromName(this.handle, namespace, name), _Il2CppClass);
    }
}
