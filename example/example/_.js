(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
//import { Il2Cpp } from "frida-il2cpp-bridge-my";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../src/index");
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
    await index_1.Il2Cpp.initialize(il2cppModuleName, il2cppVersion);
    // Uncomment for REPL access
    // (global as any).Il2Cpp = Il2Cpp;
    index_1.Il2Cpp.dump(dumpPath);
}
main().catch(error => {
    console.log("error");
    console.log(error.stack);
});
console.log(("hello"));
//Il2Cpp.dump();

},{"../src/index":28}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
function cache(target, name, descriptor) {
    var getter = descriptor.get;
    if (!getter)
        throw new TypeError("Getter property descriptor expected");
    descriptor.get = function () {
        var value = getter.call(this);
        Object.defineProperty(this, name, {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            writable: false,
            value: value
        });
        return value;
    };
}
exports.cache = cache;

},{}],3:[function(require,module,exports){
"use strict";
const peq = new Uint32Array(0x10000);
const myers_32 = (a, b) => {
  const n = a.length;
  const m = b.length;
  const lst = 1 << (n - 1);
  let pv = -1;
  let mv = 0;
  let sc = n;
  let i = n;
  while (i--) {
    peq[a.charCodeAt(i)] |= 1 << i;
  }
  for (i = 0; i < m; i++) {
    let eq = peq[b.charCodeAt(i)];
    const xv = eq | mv;
    eq |= ((eq & pv) + pv) ^ pv;
    mv |= ~(eq | pv);
    pv &= eq;
    if (mv & lst) {
      sc++;
    }
    if (pv & lst) {
      sc--;
    }
    mv = (mv << 1) | 1;
    pv = (pv << 1) | ~(xv | mv);
    mv &= xv;
  }
  i = n;
  while (i--) {
    peq[a.charCodeAt(i)] = 0;
  }
  return sc;
};

const myers_x = (a, b) => {
  const n = a.length;
  const m = b.length;
  const mhc = [];
  const phc = [];
  const hsize = Math.ceil(n / 32);
  const vsize = Math.ceil(m / 32);
  let score = m;
  for (let i = 0; i < hsize; i++) {
    phc[i] = -1;
    mhc[i] = 0;
  }
  let j = 0;
  for (; j < vsize - 1; j++) {
    let mv = 0;
    let pv = -1;
    const start = j * 32;
    const end = Math.min(32, m) + start;
    for (let k = start; k < end; k++) {
      peq[b.charCodeAt(k)] |= 1 << k;
    }
    score = m;
    for (let i = 0; i < n; i++) {
      const eq = peq[a.charCodeAt(i)];
      const pb = (phc[(i / 32) | 0] >>> i) & 1;
      const mb = (mhc[(i / 32) | 0] >>> i) & 1;
      const xv = eq | mv;
      const xh = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
      let ph = mv | ~(xh | pv);
      let mh = pv & xh;
      if ((ph >>> 31) ^ pb) {
        phc[(i / 32) | 0] ^= 1 << i;
      }
      if ((mh >>> 31) ^ mb) {
        mhc[(i / 32) | 0] ^= 1 << i;
      }
      ph = (ph << 1) | pb;
      mh = (mh << 1) | mb;
      pv = mh | ~(xv | ph);
      mv = ph & xv;
    }
    for (let k = start; k < end; k++) {
      peq[b.charCodeAt(k)] = 0;
    }
  }
  let mv = 0;
  let pv = -1;
  const start = j * 32;
  const end = Math.min(32, m - start) + start;
  for (let k = start; k < end; k++) {
    peq[b.charCodeAt(k)] |= 1 << k;
  }
  score = m;
  for (let i = 0; i < n; i++) {
    const eq = peq[a.charCodeAt(i)];
    const pb = (phc[(i / 32) | 0] >>> i) & 1;
    const mb = (mhc[(i / 32) | 0] >>> i) & 1;
    const xv = eq | mv;
    const xh = ((((eq | mb) & pv) + pv) ^ pv) | eq | mb;
    let ph = mv | ~(xh | pv);
    let mh = pv & xh;
    score += (ph >>> (m - 1)) & 1;
    score -= (mh >>> (m - 1)) & 1;
    if ((ph >>> 31) ^ pb) {
      phc[(i / 32) | 0] ^= 1 << i;
    }
    if ((mh >>> 31) ^ mb) {
      mhc[(i / 32) | 0] ^= 1 << i;
    }
    ph = (ph << 1) | pb;
    mh = (mh << 1) | mb;
    pv = mh | ~(xv | ph);
    mv = ph & xv;
  }
  for (let k = start; k < end; k++) {
    peq[b.charCodeAt(k)] = 0;
  }
  return score;
};

const distance = (a, b) => {
  if (a.length > b.length) {
    const tmp = b;
    b = a;
    a = tmp;
  }
  if (a.length === 0) {
    return b.length;
  }
  if (a.length <= 32) {
    return myers_32(a, b);
  }
  return myers_x(a, b);
};

const closest = (str, arr) => {
  let min_distance = Infinity;
  let min_index = 0;
  for (let i = 0; i < arr.length; i++) {
    const dist = distance(str, arr[i]);
    if (dist < min_distance) {
      min_distance = dist;
      min_index = i;
    }
  }
  return arr[min_index];
};

module.exports = {
  closest, distance
}

},{}],4:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const extensions_1 = require("../utils/extensions");
const console_1 = require("../utils/console");
const variables_1 = require("./variables");
const native_api_offset_1 = require("./native_api_offset");
/** @internal */
class Api {
    static get _arrayGetElements() {
        return extensions_1.createNF(this.r `array_elements`, "pointer", ["pointer"]);
    }
    static get _arrayGetLength() {
        return extensions_1.createNF(this.r `array_length`, "uint32", ["pointer"]);
    }
    static get _arrayNew() {
        return extensions_1.createNF(this.r `array_new`, "pointer", ["pointer", "uint32"]);
    }
    static get _assemblyGetImage() {
        //return createNF(this.r`assembly_get_image`, "pointer", ["pointer"]);
        return function (assembly) {
            return assembly.readPointer();
        };
    }
    static get _assemblyGetName() {
        return extensions_1.createNF(this.r `assembly_get_name`, "utf8string", ["pointer"]);
    }
    static get _classFromName() {
        return extensions_1.createNF(this.r `class_from_name`, "pointer", ["pointer", "utf8string", "utf8string"]);
    }
    static get _classFromType() {
        // return createNF(this.r`class_from_type`, "pointer", ["pointer"]);
        return function (klass) {
            const il2cpp_class_from_type = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_from_type), "pointer", ["pointer"]);
            return il2cpp_class_from_type(klass);
        };
    }
    static get _classGetArrayClass() {
        return extensions_1.createNF(this.r `array_class_get`, "pointer", ["pointer", "uint32"]);
    }
    static get _classGetArrayElementSize() {
        return extensions_1.createNF(this.r `class_array_element_size`, "int", ["pointer"]);
    }
    static get _classGetAssemblyName() {
        return extensions_1.createNF(this.r `class_get_assemblyname`, "utf8string", ["pointer"]);
    }
    static get _classGetDeclaringType() {
        return extensions_1.createNF(this.r `class_get_declaring_type`, "pointer", ["pointer"]);
    }
    static get _classGetElementClass() {
        return extensions_1.createNF(this.r `class_get_element_class`, "pointer", ["pointer"]);
    }
    static get _classGetFieldCount() {
        return extensions_1.createNF(this.r `class_get_field_count`, "uint16", ["pointer"]);
    }
    static get _classGetFields() {
        // return createNF(this.r`class_get_fields`, "pointer", ["pointer", "pointer"]);
        return function (klass, iter) {
            const il2cpp_class_get_fields = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_get_fields), "pointer", ["pointer", "pointer"]);
            return il2cpp_class_get_fields(klass, iter);
        };
    }
    static get _classGetGenericClass() {
        return extensions_1.createNF(this.r `class_get_generic_class`, "pointer", ["pointer"]);
    }
    static get _classGetImage() {
        // return createNF(this.r`class_get_image`, "pointer", ["pointer"]);
        return function (klass) {
            return klass.readPointer();
        };
    }
    static get _classGetInstanceSize() {
        return extensions_1.createNF(this.r `class_instance_size`, "uint32", ["pointer"]);
    }
    static get _classGetInterfaceCount() {
        return extensions_1.createNF(this.r `class_get_interface_count`, "uint16", ["pointer"]);
    }
    static get _classGetInterfaces() {
        //return createNF(this.r`class_get_interfaces`, "pointer", ["pointer", "pointer"]);
        return function (klass, iter) {
            const il2cpp_class_get_interface = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_get_interfaces), "pointer", ["pointer", "pointer"]);
            return il2cpp_class_get_interface(klass, iter);
        };
    }
    static get _classGetMethodCount() {
        return extensions_1.createNF(this.r `class_get_method_count`, "uint16", ["pointer"]);
    }
    static get _classGetMethods() {
        // return createNF(this.r`class_get_methods`, "pointer", ["pointer", "pointer"]);
        return function (klass, iter) {
            const il2cpp_class_get_methods = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_get_methods), "pointer", ["pointer", "pointer"]);
            return il2cpp_class_get_methods(klass, iter);
        };
    }
    static get _classGetName() {
        return extensions_1.createNF(this.r `class_get_name`, "utf8string", ["pointer"]);
    }
    static get _classGetNamespace() {
        return extensions_1.createNF(this.r `class_get_namespace`, "utf8string", ["pointer"]);
    }
    static get _classGetParent() {
        // return createNF(this.r`class_get_parent`, "pointer", ["pointer"]);
        return function (klass) {
            const il2cpp_class_get_parent = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_get_parent), "pointer", ["pointer"]);
            return il2cpp_class_get_parent(klass);
        };
    }
    static get _classGetStaticFieldData() {
        return extensions_1.createNF(this.r `class_get_static_field_data`, "pointer", ["pointer"]);
    }
    static get _classGetType() {
        //return createNF(this.r`class_get_type`, "pointer", ["pointer"]);
        return function (klass) {
            const il2cpp_class_get_type = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_get_type), "pointer", ["pointer"]);
            return il2cpp_class_get_type(klass);
        };
    }
    static get _classHasStaticConstructor() {
        return extensions_1.createNF(this.r `class_has_static_constructor`, "bool", ["pointer"]);
    }
    static get _classInit() {
        return extensions_1.createNF(this.r `runtime_class_init`, "void", ["pointer"]);
    }
    static get _classIsEnum() {
        //return createNF(this.r`class_is_enum`, "bool", ["pointer"]);
        return function (klass) {
            const il2cpp_class_is_enum = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_is_enum), "bool", ["pointer"]);
            return il2cpp_class_is_enum(klass);
        };
    }
    static get _classIsInterface() {
        // return createNF(this.r`class_is_interface`, "bool", ["pointer"]);
        return function (klass) {
            const il2cpp_class_is_interface = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_is_interface), "bool", ["pointer"]);
            return il2cpp_class_is_interface(klass);
        };
    }
    static get _classIsStaticConstructorFinished() {
        return extensions_1.createNF(this.r `class_is_static_constructor_finished`, "bool", ["pointer"]);
    }
    static get _classIsStruct() {
        //return createNF(this.r`class_is_valuetype`, "bool", ["pointer"]);
        return function (klass) {
            const il2cpp_class_is_valuetype = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_class_is_valuetype), "bool", ["pointer"]);
            return il2cpp_class_is_valuetype(klass);
        };
    }
    static get _domainGet() {
        //return createNF(this.r`domain_get`, "pointer", []);
        return function () {
            const il2cpp_domain_get = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_domain_get), "pointer", []);
            return il2cpp_domain_get();
        };
    }
    static get _domainGetAssemblies() {
        //return createNF(this.r`domain_get_assemblies`, "pointer", ["pointer", "pointer"]);
        return function (domain, psize) {
            const assemblies = variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_s_assemblies).readPointer();
            const endAssemblies = variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_s_assemblies + 0x08).readPointer();
            console.log(`${assemblies}-${endAssemblies}`);
            psize.writeInt(endAssemblies.sub(assemblies).toUInt32() / 8);
            return assemblies;
        };
    }
    static get _domainGetName() {
        return extensions_1.createNF(this.r `domain_get_name`, "utf8string", ["pointer"]);
    }
    static get _fieldGetClass() {
        return extensions_1.createNF(this.r `field_get_parent`, "pointer", ["pointer"]);
    }
    static get _fieldGetName() {
        // return createNF(this.r`field_get_name`, "utf8string", ["pointer"]);
        return function (field) {
            return field.readPointer().readUtf8String();
        };
    }
    static get _fieldGetOffset() {
        // return createNF(this.r`field_get_offset`, "int32", ["pointer"]);
        return function (field) {
            return field.add(0x18).readS32();
        };
    }
    static get _fieldGetStaticValue() {
        //return createNF(this.r`field_static_get_value`, "void", ["pointer", "pointer"]);
        return function (field, value) {
            const il2cpp_field_static_get_value = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_field_static_get_value), "void", ["pointer", "pointer"]);
            il2cpp_field_static_get_value(field, value);
        };
    }
    static get _fieldGetStaticValue2() {
        //return createNF(this.r`field_static_get_value`, "void", ["pointer", "pointer"]);
        return this._fieldGetStaticValue;
    }
    static get _fieldGetType() {
        // return createNF(this.r`field_get_type`, "pointer", ["pointer"]);
        return function (field) {
            return field.add(0x08).readPointer();
        };
    }
    static get _fieldIsInstance() {
        return extensions_1.createNF(this.r `field_is_instance`, "bool", ["pointer"]);
    }
    static get _fieldIsLiteral() {
        return extensions_1.createNF(this.r `field_is_literal`, "bool", ["pointer"]);
    }
    static get _gcCollect() {
        return extensions_1.createNF(this.r `gc_collect`, "void", ["int"]);
    }
    static get _gcCollectALittle() {
        return extensions_1.createNF(this.r `gc_collect_a_little`, "void", []);
    }
    static get _gcDisable() {
        return extensions_1.createNF(this.r `gc_disable`, "void", []);
    }
    static get _gcEnable() {
        return extensions_1.createNF(this.r `gc_enable`, "void", []);
    }
    static get _gcIsDisabled() {
        return extensions_1.createNF(this.r `gc_is_disabled`, "bool", []);
    }
    static get _genericClassGetCachedClass() {
        return extensions_1.createNF(this.r `field_is_literal`, "pointer", ["pointer"]);
    }
    static get _genericClassGetTypesCount() {
        return extensions_1.createNF(this.r `generic_class_get_types_count`, "uint32", ["pointer"]);
    }
    static get _genericClassGetTypes() {
        return extensions_1.createNF(this.r `generic_class_get_types`, "pointer", ["pointer"]);
    }
    static get _imageGetClass() {
        //return createNF(this.r`image_get_class`, "pointer", ["pointer", "uint"]);
        return function (image, index) {
            const GetTypeInfoFromTypeDefinitionIndex = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_image_get_class), "pointer", ["uint32"]);
            return GetTypeInfoFromTypeDefinitionIndex(index + image.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_metadata_typestart).readU32());
        };
    }
    static get _imageGetClassCount() {
        //return createNF(this.r`image_get_class_count`, "uint32", ["pointer"]);
        return function (image) {
            return image.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_image_get_class_count).readU32();
        };
    }
    static get _imageGetClassStart() {
        return extensions_1.createNF(this.r `image_get_class_start`, "uint32", ["pointer"]);
    }
    static get _imageGetName() {
        //return createNF(this.r`image_get_name`, "utf8string", ["pointer"]);
        return function (image) {
            //console.log(image.readPointer().readUtf8String());
            return image.readPointer().readUtf8String();
        };
    }
    static get _init() {
        return this.r `init`;
    }
    static get _livenessCalculationBegin() {
        return extensions_1.createNF(this.r `unity_liveness_calculation_begin`, "pointer", [
            "pointer",
            "int",
            "pointer",
            "pointer",
            "pointer",
            "pointer"
        ]);
    }
    static get _livenessCalculationEnd() {
        return extensions_1.createNF(this.r `unity_liveness_calculation_end`, "void", ["pointer"]);
    }
    static get _livenessCalculationFromStatics() {
        return extensions_1.createNF(this.r `unity_liveness_calculation_from_statics`, "void", ["pointer"]);
    }
    static get _memorySnapshotCapture() {
        return extensions_1.createNF(this.r `capture_memory_snapshot`, "pointer", []);
    }
    static get _memorySnapshotFree() {
        return extensions_1.createNF(this.r `free_captured_memory_snapshot`, "void", ["pointer"]);
    }
    static get _memorySnapshotGetTrackedObjectCount() {
        return extensions_1.createNF(this.r `memory_snapshot_get_tracked_object_count`, "uint64", ["pointer"]);
    }
    static get _memorySnapshotGetObjects() {
        return extensions_1.createNF(this.r `memory_snapshot_get_objects`, "pointer", ["pointer"]);
    }
    static get _methodGetClass() {
        return extensions_1.createNF(this.r `method_get_class`, "pointer", ["pointer"]);
    }
    static get _methodGetName() {
        // return createNF(this.r`method_get_name`, "utf8string", ["pointer"]);
        return function (method) {
            const il2cpp_method_get_name = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_method_get_name), "pointer", ["pointer"]);
            return il2cpp_method_get_name(method).readUtf8String();
        };
    }
    static get _methodGetParamCount() {
        return extensions_1.createNF(this.r `method_get_param_count`, "uint8", ["pointer"]);
    }
    static get _methodGetParameters() {
        return extensions_1.createNF(this.r `method_get_parameters`, "pointer", ["pointer", "pointer"]);
    }
    static get _methodGetPointer() {
        return extensions_1.createNF(this.r `method_get_pointer`, "pointer", ["pointer"]);
    }
    static get _methodGetReturnType() {
        // return createNF(this.r`method_get_return_type`, "pointer", ["pointer"]);
        return function (method) {
            return method.add(0x20).readPointer();
        };
    }
    static get _methodIsGeneric() {
        return extensions_1.createNF(this.r `method_is_generic`, "bool", ["pointer"]);
    }
    static get _methodIsInflated() {
        return extensions_1.createNF(this.r `method_is_inflated`, "bool", ["pointer"]);
    }
    static get _methodIsInstance() {
        // return createNF(this.r`method_is_instance`, "bool", ["pointer"]);
        return function (method) {
            const il2cpp_method_is_instance = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_method_is_instance), "bool", ["pointer"]);
            return il2cpp_method_is_instance(method);
        };
    }
    static get _objectGetClass() {
        return extensions_1.createNF(this.r `object_get_class`, "pointer", ["pointer"]);
    }
    static get _objectGetHeaderSize() {
        return extensions_1.createNF(this.r `object_header_size`, "uint", []);
    }
    static get _objectNew() {
        return extensions_1.createNF(this.r `object_new`, "pointer", ["pointer"]);
    }
    static get _objectUnbox() {
        return extensions_1.createNF(this.r `object_unbox`, "pointer", ["pointer"]);
    }
    static get _parameterGetName() {
        return extensions_1.createNF(this.r `parameter_get_name`, "utf8string", ["pointer"]);
    }
    static get _parameterGetPosition() {
        return extensions_1.createNF(this.r `parameter_get_position`, "int32", ["pointer"]);
    }
    static get _parameterGetType() {
        return extensions_1.createNF(this.r `parameter_get_type`, "pointer", ["pointer"]);
    }
    static get _stringChars() {
        // return createNF(this.r`string_chars`, "pointer", ["pointer"]);
        return function (str) {
            return str.add(0x14);
        };
    }
    static get _stringLength() {
        // return createNF(this.r`string_length`, "int32", ["pointer"]);
        return function (str) {
            return str.add(0x10).readU32();
        };
    }
    static get _stringNew() {
        return extensions_1.createNF(this.r `string_new`, "pointer", ["utf8string"]);
    }
    static get _stringSetLength() {
        return extensions_1.createNF(this.r `string_set_length`, "void", ["pointer", "int32"]);
    }
    static get _valueBox() {
        return extensions_1.createNF(this.r `value_box`, "pointer", ["pointer", "pointer"]);
    }
    static get _threadAttach() {
        //return createNF(this.r`thread_attach`, "void", ["pointer"]);
        return function (domain) {
            const il2cpp_thread_attach = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_thread_attach), "void", ["pointer"]);
            il2cpp_thread_attach(domain);
        };
    }
    static get _typeGetClassOrElementClass() {
        return extensions_1.createNF(this.r `type_get_class_or_element_class`, "pointer", ["pointer"]);
    }
    static get _typeGetDataType() {
        return extensions_1.createNF(this.r `type_get_data_type`, "pointer", ["pointer"]);
    }
    static get _typeGetGenericClass() {
        return extensions_1.createNF(this.r `type_get_generic_class`, "pointer", ["pointer"]);
    }
    static get _typeGetName() {
        // return createNF(this.r`type_get_name`, "utf8string", ["pointer"]);
        return function (type) {
            const il2cpp_type_get_name = new NativeFunction(variables_1.library.base.add(native_api_offset_1.NativeApiOffset.offset_il2cpp_type_get_name), "pointer", ["pointer"]);
            return il2cpp_type_get_name(type).readUtf8String();
        };
    }
    static get _typeGetTypeEnum() {
        // return createNF(this.r`type_get_type`, "int", ["pointer"]);
        return function (type) {
            return type.add(10).readS32();
        };
    }
    static get _typeIsByReference() {
        return extensions_1.createNF(this.r `type_is_byref`, "bool", ["pointer"]);
    }
    static get _typeOffsetOfTypeEnum() {
        return extensions_1.createNF(this.r `type_offset_of_type`, "uint16", []);
    }
    static get sources() {
        return [variables_1.library, createMissingApi()];
    }
    // my: 当r()从导出函数中找不到api时，在这里手动硬编码查找
    static my_r(exportName) {
    }
    static r(exportName) {
        const name = "il2cpp_" + exportName;
        for (const source of this.sources) {
            const result = source instanceof Module ? source.findExportByName(name) : source[name];
            if (result)
                return result;
        }
        console_1.raise(`Couldn't resolve export "${name}".`);
    }
}
__decorate([
    decorator_cache_getter_1.cache
], Api, "_arrayGetElements", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_arrayGetLength", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_arrayNew", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_assemblyGetImage", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_assemblyGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classFromName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classFromType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetArrayClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetArrayElementSize", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetAssemblyName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetDeclaringType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetElementClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetFieldCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetFields", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetGenericClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetImage", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetInstanceSize", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetInterfaceCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetInterfaces", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetMethodCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetMethods", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetNamespace", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetParent", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetStaticFieldData", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classGetType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classHasStaticConstructor", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classInit", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classIsEnum", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classIsInterface", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classIsStaticConstructorFinished", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_classIsStruct", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_domainGet", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_domainGetAssemblies", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_domainGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldGetClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldGetOffset", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldGetStaticValue", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldGetStaticValue2", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldGetType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldIsInstance", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_fieldIsLiteral", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_gcCollect", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_gcCollectALittle", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_gcDisable", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_gcEnable", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_gcIsDisabled", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_genericClassGetCachedClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_genericClassGetTypesCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_genericClassGetTypes", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_imageGetClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_imageGetClassCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_imageGetClassStart", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_imageGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_init", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_livenessCalculationBegin", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_livenessCalculationEnd", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_livenessCalculationFromStatics", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_memorySnapshotCapture", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_memorySnapshotFree", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_memorySnapshotGetTrackedObjectCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_memorySnapshotGetObjects", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodGetClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodGetParamCount", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodGetParameters", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodGetPointer", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodGetReturnType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodIsGeneric", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodIsInflated", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_methodIsInstance", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_objectGetClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_objectGetHeaderSize", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_objectNew", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_objectUnbox", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_parameterGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_parameterGetPosition", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_parameterGetType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_stringChars", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_stringLength", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_stringNew", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_stringSetLength", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_valueBox", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_threadAttach", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeGetClassOrElementClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeGetDataType", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeGetGenericClass", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeGetName", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeGetTypeEnum", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeIsByReference", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "_typeOffsetOfTypeEnum", null);
__decorate([
    decorator_cache_getter_1.cache
], Api, "sources", null);
exports.Api = Api;
function createMissingApi() {
    const isEqualOrAbove_5_3_2 = +variables_1.unityVersion.isEqualOrAbove("5.3.2");
    const isEqualOrAbove_5_3_3 = +variables_1.unityVersion.isEqualOrAbove("5.3.3");
    const isEqualOrAbove_5_3_6 = +variables_1.unityVersion.isEqualOrAbove("5.3.6");
    const isEqualOrAbove_5_4_4 = +variables_1.unityVersion.isEqualOrAbove("5.4.4");
    const isEqualOrAbove_5_5_0 = +variables_1.unityVersion.isEqualOrAbove("5.5.0");
    const isEqualOrAbove_5_6_0 = +variables_1.unityVersion.isEqualOrAbove("5.6.0");
    const isEqualOrAbove_2017_1_0 = +variables_1.unityVersion.isEqualOrAbove("2017.1.0");
    const isEqualOrAbove_2017_1_3 = +variables_1.unityVersion.isEqualOrAbove("2017.1.3");
    const isEqualOrAbove_2018_1_0 = +variables_1.unityVersion.isEqualOrAbove("2018.1.0");
    const isEqualOrAbove_2018_2_0 = +variables_1.unityVersion.isEqualOrAbove("2018.2.0");
    const isEqualOrAbove_2018_3_0 = +variables_1.unityVersion.isEqualOrAbove("2018.3.0");
    const isEqualOrAbove_2018_3_8 = +variables_1.unityVersion.isEqualOrAbove("2018.3.8");
    const isEqualOrAbove_2019_1_0 = +variables_1.unityVersion.isEqualOrAbove("2019.1.0");
    const isEqualOrAbove_2020_2_0 = +variables_1.unityVersion.isEqualOrAbove("2020.2.0");
    const isBelow_5_3_3 = +!isEqualOrAbove_5_3_3;
    const isBelow_5_3_6 = +!isEqualOrAbove_5_3_6;
    const isBelow_5_5_0 = +!isEqualOrAbove_5_5_0;
    const isBelow_2018_1_0 = +!isEqualOrAbove_2018_1_0;
    const isBelow_2018_3_0 = +!isEqualOrAbove_2018_3_0;
    const isBelow_2019_3_0 = +variables_1.unityVersion.isBelow("2019.3.0");
    const isBelow_2020_2_0 = +!isEqualOrAbove_2020_2_0;
    const isNotEqual_2017_2_0 = +!variables_1.unityVersion.isEqual("2017.2.0");
    const isNotEqual_5_5_0 = +!variables_1.unityVersion.isEqual("5.5.0");
    return new CModule(`
#include <stdint.h>

#define FIELD_ATTRIBUTE_STATIC 0x0010
#define FIELD_ATTRIBUTE_LITERAL 0x0040

#define METHOD_ATTRIBUTE_STATIC 0x0010

typedef struct _Il2CppObject Il2CppObject;
typedef struct _Il2CppString Il2CppString;
typedef struct _Il2CppArray Il2CppArray;
#if ${isEqualOrAbove_5_3_3}
typedef struct _Il2CppArraySize Il2CppArraySize;
#endif
typedef struct _Il2CppDomain Il2CppDomain;
typedef struct _Il2CppAssemblyName Il2CppAssemblyName;
typedef struct _Il2CppAssembly Il2CppAssembly;
typedef struct _Il2CppImage Il2CppImage;
typedef struct _Il2CppClass Il2CppClass;
typedef struct _Il2CppType Il2CppType;
typedef struct _FieldInfo FieldInfo;
typedef struct _MethodInfo MethodInfo;
typedef struct _ParameterInfo ParameterInfo;
typedef enum _Il2CppTypeEnum Il2CppTypeEnum;
typedef struct _VirtualInvokeData VirtualInvokeData;
typedef struct _Il2CppGenericInst Il2CppGenericInst;
typedef struct _Il2CppGenericClass Il2CppGenericClass;
typedef struct _Il2CppGenericContext Il2CppGenericContext;
typedef uint16_t Il2CppChar;
typedef struct _Il2CppManagedMemorySnapshot Il2CppManagedMemorySnapshot;
typedef struct _Il2CppMetadataSnapshot Il2CppMetadataSnapshot;
typedef struct _Il2CppManagedMemorySection Il2CppManagedMemorySection;
typedef struct _Il2CppManagedHeap Il2CppManagedHeap;
typedef struct _Il2CppStacks Il2CppStacks;
typedef struct _Il2CppGCHandles Il2CppGCHandles;
typedef struct _Il2CppRuntimeInformation Il2CppRuntimeInformation;

enum _Il2CppTypeEnum
{
    IL2CPP_TYPE_END = 0x00,
    IL2CPP_TYPE_VOID = 0x01,
    IL2CPP_TYPE_BOOLEAN = 0x02,
    IL2CPP_TYPE_CHAR = 0x03,
    IL2CPP_TYPE_I1 = 0x04,
    IL2CPP_TYPE_U1 = 0x05,
    IL2CPP_TYPE_I2 = 0x06,
    IL2CPP_TYPE_U2 = 0x07,
    IL2CPP_TYPE_I4 = 0x08,
    IL2CPP_TYPE_U4 = 0x09,
    IL2CPP_TYPE_I8 = 0x0a,
    IL2CPP_TYPE_U8 = 0x0b,
    IL2CPP_TYPE_R4 = 0x0c,
    IL2CPP_TYPE_R8 = 0x0d,
    IL2CPP_TYPE_STRING = 0x0e,
    IL2CPP_TYPE_PTR = 0x0f,
    IL2CPP_TYPE_BYREF = 0x10,
    IL2CPP_TYPE_VALUETYPE = 0x11,
    IL2CPP_TYPE_CLASS = 0x12,
    IL2CPP_TYPE_VAR = 0x13,
    IL2CPP_TYPE_ARRAY = 0x14,
    IL2CPP_TYPE_GENERICINST = 0x15,
    IL2CPP_TYPE_TYPEDBYREF = 0x16,
    IL2CPP_TYPE_I = 0x18,
    IL2CPP_TYPE_U = 0x19,
    IL2CPP_TYPE_FNPTR = 0x1b,
    IL2CPP_TYPE_OBJECT = 0x1c,
    IL2CPP_TYPE_SZARRAY = 0x1d,
    IL2CPP_TYPE_MVAR = 0x1e,
    IL2CPP_TYPE_CMOD_REQD = 0x1f,
    IL2CPP_TYPE_CMOD_OPT = 0x20,
    IL2CPP_TYPE_INTERNAL = 0x21,
    IL2CPP_TYPE_MODIFIER = 0x40,
    IL2CPP_TYPE_SENTINEL = 0x41,
    IL2CPP_TYPE_PINNED = 0x45,
    IL2CPP_TYPE_ENUM = 0x55
};

struct _Il2CppObject
{
#if ${isEqualOrAbove_2018_1_0}
    union
    {
        Il2CppClass * klass;
        struct Il2CppVTable * vtable;
    };
#else
    Il2CppClass * klass;
#endif
    struct MonitorData * monitor;
};

#if ${isBelow_2019_3_0}
size_t
il2cpp_object_header_size (void)
{
    return sizeof (Il2CppObject);
}
#endif

struct _Il2CppDomain
{
    struct Il2CppAppDomain * domain;
#if ${isEqualOrAbove_5_5_0}
    struct Il2CppAppDomainSetup * setup;
#else
    Il2CppObject * setup;
#endif
    struct Il2CppAppContext * default_context;
    const char * friendly_name;
    uint32_t domain_id;
#if ${isEqualOrAbove_5_5_0}
    volatile int threadpool_jobs;
#endif
#if ${isEqualOrAbove_2018_1_0}
    void * agent_info;
#endif
};

const char *
il2cpp_domain_get_name (const Il2CppDomain* domain)
{
    return domain->friendly_name;
}

struct _Il2CppAssemblyName
{
#if ${isEqualOrAbove_2018_1_0}
    const char * name;
    const char * culture;
    const char * hash_value;
    const char * public_key;
#else
    int32_t nameIndex;
    int32_t cultureIndex;
    int32_t hashValueIndex;
    int32_t publicKeyIndex;
#endif
    uint32_t hash_alg;
    int32_t hash_len;
    uint32_t flags;
    int32_t major;
    int32_t minor;
    int32_t build;
    int32_t revision;
    uint8_t publicKeyToken[8];
};

struct _Il2CppAssembly
{
#if ${isEqualOrAbove_2018_1_0}
    Il2CppImage * image;
#else
    int32_t imageIndex;
#endif
#if ${isEqualOrAbove_2018_3_0}
    uint32_t token;
#else
    int32_t customAttributeIndex;
#endif
#if ${isEqualOrAbove_5_3_3}
    int32_t referencedAssemblyStart;
    int32_t referencedAssemblyCount;
#endif
    Il2CppAssemblyName aname;
};

#if ${isEqualOrAbove_2018_1_0}
const char *
il2cpp_assembly_get_name (const Il2CppAssembly * assembly)
{
    return assembly->aname.name;
}
#endif

struct _Il2CppImage
{
    const char * name;
#if ${isEqualOrAbove_2017_1_3 && isNotEqual_2017_2_0}
    const char * nameNoExt;
#endif
#if ${isEqualOrAbove_2018_1_0}
    Il2CppAssembly * assembly;
#else
    int32_t assemblyIndex;
#endif
#if ${isBelow_2020_2_0}
    int32_t typeStart;
#endif
    uint32_t typeCount;
#if ${isEqualOrAbove_2017_1_0}
#if ${isBelow_2020_2_0}
    int32_t exportedTypeStart;
#endif
    uint32_t exportedTypeCount;
#endif
#if ${isEqualOrAbove_2018_3_0}
#if ${isBelow_2020_2_0}
    int32_t customAttributeStart;
#endif
    uint32_t customAttributeCount;
#endif
#if ${isEqualOrAbove_2020_2_0}
    const struct Il2CppMetadataImageHandle * metadataHandle;
    struct Il2CppNameToTypeHandleHashTable * nameToClassHashTable;
#else
    int32_t entryPointIndex;
    struct Il2CppNameToTypeDefinitionIndexHashTable * nameToClassHashTable;
#endif
#if ${isEqualOrAbove_2019_1_0}
    const struct Il2CppCodeGenModule * codeGenModule;
#endif
#if ${isEqualOrAbove_5_3_2}
    uint32_t token;
#endif
#if ${isEqualOrAbove_2018_1_0}
    uint8_t dynamic;
#endif
};


uint32_t
il2cpp_image_get_class_start (const Il2CppImage * image)
{
#if ${isBelow_2020_2_0}
    return image->typeStart;
#else
    return 0;
#endif
}


#if ${isBelow_2018_3_0}
uint32_t
il2cpp_image_get_class_count (const Il2CppImage * image)
{
    return image->typeCount;
}
#endif

struct _Il2CppType
{
    union
    {
        void * dummy;
        int32_t klassIndex;
#if ${isEqualOrAbove_2020_2_0}
        const struct Il2CppMetadataTypeHandle * typeHandle;
#endif
        const Il2CppType * type;
        struct Il2CppArrayType * array;
        int32_t genericParameterIndex;
#if ${isEqualOrAbove_2020_2_0}
        const struct Il2CppMetadataGenericParameterHandle * genericParameterHandle;
#endif
        Il2CppGenericClass * generic_class;
    } data;
    unsigned int attrs: 16;
    Il2CppTypeEnum type: 8;
    unsigned int num_mods: 6;
    unsigned int byref: 1;
    unsigned int pinned: 1;
};

uint16_t
il2cpp_type_offset_of_type (void)
{
    return (uint16_t) offsetof (Il2CppType, type);
}

const Il2CppType *
il2cpp_type_get_data_type (const Il2CppType * type)
{
    return type->data.type;
}

Il2CppGenericClass *
il2cpp_type_get_generic_class (const Il2CppType * type)
{
    return type->data.generic_class;
}

#if ${isBelow_2018_1_0}
unsigned int
il2cpp_type_is_byref (const Il2CppType * type)
{
    return type->byref;
}
#endif

struct _VirtualInvokeData
{
    void * methodPtr;
    const MethodInfo * method;
};

struct _Il2CppClass
{
    const Il2CppImage * image;
    void * gc_desc;
    const char * name;
    const char * namespaze;
#if ${isEqualOrAbove_2018_1_0}
    Il2CppType byval_arg;
    Il2CppType this_arg;
#else
    const Il2CppType* byval_arg;
    const Il2CppType* this_arg;
#endif
    Il2CppClass * element_class;
    Il2CppClass * castClass;
    Il2CppClass * declaringType;
    Il2CppClass * parent;
    Il2CppGenericClass * generic_class;
#if ${isEqualOrAbove_2020_2_0}
    const struct Il2CppMetadataTypeHandle * typeMetadataHandle;
#else
    const struct Il2CppTypeDefinition * typeDefinition;
#endif
#if ${isEqualOrAbove_5_6_0}
    const struct Il2CppInteropData * interopData;
#endif
#if ${isEqualOrAbove_2018_1_0}
    Il2CppClass * klass;
#endif
    FieldInfo * fields;
    const struct EventInfo* events;
    const struct PropertyInfo * properties;
    const MethodInfo ** methods;
    Il2CppClass ** nestedTypes;
    Il2CppClass ** implementedInterfaces;
#if ${isEqualOrAbove_5_3_6 && isBelow_5_5_0}
    VirtualInvokeData * vtable;
#endif
#if ${isBelow_5_3_6}
    const MethodInfo ** vtable;
#endif
    struct Il2CppRuntimeInterfaceOffsetPair * interfaceOffsets;
    void * static_fields;
    const struct Il2CppRGCTXData * rgctx_data;
    Il2CppClass ** typeHierarchy;
#if ${isEqualOrAbove_2019_1_0}
    void * unity_user_data;
#endif
#if ${isEqualOrAbove_2018_2_0}
    uint32_t initializationExceptionGCHandle;
#endif
    uint32_t cctor_started;
    uint32_t cctor_finished;
#if ${isEqualOrAbove_2019_1_0}
    __attribute__((aligned(8))) size_t cctor_thread;
#else
    __attribute__((aligned(8))) uint64_t cctor_thread;
#endif
#if ${isEqualOrAbove_2020_2_0}
    const struct Il2CppMetadataGenericContainerHandle * genericContainerHandle;
#else
    int32_t genericContainerIndex;
#endif
#if ${isBelow_2018_3_0}
    int32_t customAttributeIndex;
#endif
    uint32_t instance_size;
    uint32_t actualSize;
    uint32_t element_size;
    int32_t native_size;
    uint32_t static_fields_size;
    uint32_t thread_static_fields_size;
    int32_t thread_static_fields_offset;
    uint32_t flags;
#if ${isEqualOrAbove_5_3_2}
    uint32_t token;
#endif
    uint16_t method_count;
    uint16_t property_count;
    uint16_t field_count;
    uint16_t event_count;
    uint16_t nested_type_count;
    uint16_t vtable_count;
    uint16_t interfaces_count;
    uint16_t interface_offsets_count;
    uint8_t typeHierarchyDepth;
#if ${isEqualOrAbove_5_4_4 && isNotEqual_5_5_0}
    uint8_t genericRecursionDepth;
#endif
    uint8_t rank;
    uint8_t minimumAlignment;
#if ${isEqualOrAbove_2018_3_8}
    uint8_t naturalAligment;
#endif
    uint8_t packingSize;
#if ${isEqualOrAbove_2018_3_0}
    uint8_t initialized_and_no_error: 1;
#endif
    uint8_t valuetype: 1;
    uint8_t initialized: 1;
    uint8_t enumtype: 1;
    uint8_t is_generic: 1;
    uint8_t has_references: 1;
    uint8_t init_pending: 1;
    uint8_t size_inited: 1;
    uint8_t has_finalize: 1;
    uint8_t has_cctor: 1;
    uint8_t is_blittable: 1;
#if ${isEqualOrAbove_5_3_3}
    uint8_t is_import_or_windows_runtime: 1;
#endif
#if ${isEqualOrAbove_5_5_0}
    uint8_t is_vtable_initialized: 1;
#endif
#if ${isEqualOrAbove_2018_2_0}
    uint8_t has_initialization_error: 1;
#endif
#if ${isEqualOrAbove_5_5_0}
    VirtualInvokeData vtable[32];
#endif
};

uint16_t
il2cpp_class_get_interface_count (const Il2CppClass * klass)
{
    return klass->interfaces_count;
}

uint16_t
il2cpp_class_get_method_count (const Il2CppClass * klass)
{
    return klass->method_count;
}

uint16_t
il2cpp_class_get_field_count (const Il2CppClass * klass)
{
    return klass->field_count;
}

uint8_t
il2cpp_class_has_static_constructor (const Il2CppClass * klass)
{
    return klass->has_cctor;
}

uint32_t
il2cpp_class_is_static_constructor_finished (const Il2CppClass * klass)
{
    return klass->cctor_finished;
}

#if ${isBelow_2019_3_0}
void *
il2cpp_class_get_static_field_data (const Il2CppClass * klass)
{
    return klass->static_fields;
}
#endif

Il2CppGenericClass *
il2cpp_class_get_generic_class (const Il2CppClass * klass)
{
    return klass->generic_class;
}

struct _Il2CppGenericInst
{
    uint32_t type_argc;
    const Il2CppType ** type_argv;
};

struct _Il2CppGenericContext
{
    const Il2CppGenericInst * class_inst;
    const Il2CppGenericInst * method_inst;
};

struct _Il2CppGenericClass
{
#if ${isEqualOrAbove_2020_2_0}
    const Il2CppType * type;
#else
    int32_t typeDefinitionIndex;
#endif
    Il2CppGenericContext context;
    Il2CppClass * cached_class;
};

Il2CppClass *
il2cpp_generic_class_get_cached_class (Il2CppGenericClass * class)
{
    return class->cached_class;
}

uint32_t
il2cpp_generic_class_get_types_count (Il2CppGenericClass * class)
{
    return class->context.class_inst->type_argc;
}

const Il2CppType **
il2cpp_generic_class_get_types (Il2CppGenericClass * class)
{
    return class->context.class_inst->type_argv;
}

struct _FieldInfo
{
    const char * name;
    const Il2CppType * type;
    Il2CppClass * parent;
    int32_t offset;
#if ${isBelow_2018_3_0}
    int32_t customAttributeIndex;
#endif
#if ${isEqualOrAbove_5_3_2}
    uint32_t token;
#endif
};

uint8_t
il2cpp_field_is_instance (FieldInfo * field)
{
    return (field->type->attrs & FIELD_ATTRIBUTE_STATIC) == 0;
}

#if ${isBelow_2019_3_0}
uint8_t
il2cpp_field_is_literal (FieldInfo * field)
{
    return field->type->attrs & FIELD_ATTRIBUTE_LITERAL;
}
#endif

struct _ParameterInfo
{
    const char * name;
    int32_t position;
    uint32_t token;
#if ${isBelow_2018_3_0}
    int32_t customAttributeIndex;
#endif
    const Il2CppType * parameter_type;
};

const char *
il2cpp_parameter_get_name(const ParameterInfo * parameter)
{
    return parameter->name;
}

const Il2CppType *
il2cpp_parameter_get_type (const ParameterInfo * parameter)
{
    return parameter->parameter_type;
}

int32_t
il2cpp_parameter_get_position (const ParameterInfo * parameter)
{
    return parameter->position;
}

struct _MethodInfo
{
    void * methodPointer;
    void * invoker_method;
    const char * name;
    Il2CppClass * klass;
    const Il2CppType * return_type;
    const ParameterInfo * parameters;
    union
    {
        const struct Il2CppRGCTXData * rgctx_data;
#if ${isEqualOrAbove_2020_2_0}
        const struct Il2CppMetadataMethodDefinitionHandle * methodMetadataHandle;
#else
        const struct Il2CppMethodDefinition * methodDefinition;
#endif
    };
    union
    {
        const struct Il2CppGenericMethod * genericMethod;
#if ${isEqualOrAbove_2020_2_0}
        const struct Il2CppMetadataGenericContainerHandle * genericContainerHandle;
#else
        const struct Il2CppGenericContainer * genericContainer;
#endif
    };
#if ${isBelow_2018_3_0}
    int32_t customAttributeIndex;
#endif
    uint32_t token;
    uint16_t flags;
    uint16_t iflags;
    uint16_t slot;
    uint8_t parameters_count;
    uint8_t is_generic: 1;
    uint8_t is_inflated: 1;
#if ${isEqualOrAbove_2018_1_0}
    uint8_t wrapper_type: 1;
    uint8_t is_marshaled_from_native: 1;
#endif
};

void *
il2cpp_method_get_pointer(const MethodInfo * method)
{
    return method->methodPointer;
}

const ParameterInfo *
il2cpp_method_get_parameters (const MethodInfo * method,
                              void ** iter)
{
    uint16_t parameters_count = method->parameters_count;

    if (iter != 0 && parameters_count > 0)
    {
        void* temp = *iter;
        if (temp == 0)
        {
            *iter = (void**) method->parameters;
            return method->parameters;
        }
        else
        {
            const ParameterInfo * parameterInfo = (ParameterInfo*) *iter + 1;
            if (parameterInfo < method->parameters + parameters_count)
            {
                *iter = (void*) parameterInfo;
                return parameterInfo;
            }
        }
    }
    return 0;
}


struct _Il2CppString
{
    Il2CppObject object;
    int32_t length;
    Il2CppChar chars[32];
};

void
il2cpp_string_set_length (Il2CppString * string,
                          int32_t length)
{
    string->length = length;
}

struct _Il2CppArray
{
    Il2CppObject obj;
    struct Il2CppArrayBounds * bounds;
    uint32_t max_length;
#if ${isBelow_5_3_3}
    double vector[32];
#endif
};

#if ${isEqualOrAbove_5_3_3}
struct _Il2CppArraySize
{
#if ${isEqualOrAbove_2018_1_0}
    Il2CppObject obj;
    struct Il2CppArrayBounds * bounds;
    uint32_t max_length;
    __attribute__((aligned(8))) void * vector[32];
#else
    Il2CppArray Array;
    __attribute__((aligned(8))) void * vector;
#endif
};
#endif

#if ${isEqualOrAbove_5_3_3}
void *
il2cpp_array_elements (Il2CppArraySize * array) {
#if ${isEqualOrAbove_2018_1_0}
    return array->vector;
#else
    return &array->vector;
#endif
}
#else

void *
il2cpp_array_elements (Il2CppArray * array) {
    return (void*) array->vector;
}
#endif

struct _Il2CppMetadataSnapshot
{
    uint32_t typeCount;
    struct Il2CppMetadataType * types;
};

struct _Il2CppManagedMemorySection
{
    uint64_t sectionStartAddress;
    uint32_t sectionSize;
    uint8_t * sectionBytes;
};

struct _Il2CppManagedHeap
{
    uint32_t sectionCount;
    Il2CppManagedMemorySection * sections;
};

struct _Il2CppStacks
{
    uint32_t stackCount;
    Il2CppManagedMemorySection * stacks;
};

struct _Il2CppGCHandles
{
    uint32_t trackedObjectCount;
    Il2CppObject ** pointersToObjects;
};

struct _Il2CppRuntimeInformation
{
    uint32_t pointerSize;
    uint32_t objectHeaderSize;
    uint32_t arrayHeaderSize;
    uint32_t arrayBoundsOffsetInHeader;
    uint32_t arraySizeOffsetInHeader;
    uint32_t allocationGranularity;
};

struct _Il2CppManagedMemorySnapshot
{
    Il2CppManagedHeap heap;
    Il2CppStacks stacks;
    Il2CppMetadataSnapshot metadata;
    Il2CppGCHandles gcHandles;
    Il2CppRuntimeInformation runtimeInformation;
    void * additionalUserInformation;
};

uint32_t
il2cpp_memory_snapshot_get_tracked_object_count (Il2CppManagedMemorySnapshot * snapshot)
{
    return snapshot->gcHandles.trackedObjectCount;
}

Il2CppObject **
il2cpp_memory_snapshot_get_objects (Il2CppManagedMemorySnapshot * snapshot)
{
    return snapshot->gcHandles.pointersToObjects;
}
`);
}

},{"../utils/console":30,"../utils/extensions":31,"./native_api_offset":8,"./variables":26,"decorator-cache-getter":2}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonNullHandle = exports.checkOutOfBounds = exports.nonNullMethodPointer = exports.since = exports.shouldBeInstance = void 0;
const console_1 = require("../utils/console");
const variables_1 = require("./variables");
/** @internal */
function shouldBeInstance(shouldBeInstance) {
    return function (_, __, descriptor) {
        const fn = descriptor.value ?? descriptor.get ?? descriptor.set;
        const key = descriptor.value ? "value" : descriptor.get ? "get" : "set";
        descriptor[key] = function (...args) {
            if (this.isInstance != shouldBeInstance) {
                console_1.raise(`${this.constructor.name} ("${this.name}") is ${shouldBeInstance ? "" : "not "}static.`);
            }
            return fn.apply(this, args);
        };
    };
}
exports.shouldBeInstance = shouldBeInstance;
/** @internal */
function since(version) {
    return function (_, propertyKey, descriptor) {
        const fn = descriptor.value ?? descriptor.get ?? descriptor.set;
        const key = descriptor.value ? "value" : descriptor.get ? "get" : "set";
        descriptor[key] = function (...args) {
            if (variables_1.unityVersion.isBelow(version)) {
                console_1.raise(`${this.constructor.name}.${propertyKey.toString()} is available from version ${version} onwards.`);
            }
            return fn.apply(this, args);
        };
    };
}
exports.since = since;
/** @internal */
function nonNullMethodPointer(_, propertyKey, descriptor) {
    const fn = descriptor.value ?? descriptor.get ?? descriptor.set;
    const key = descriptor.value ? "value" : descriptor.get ? "get" : "set";
    descriptor[key] = function (...args) {
        if (this.actualPointer.isNull()) {
            console_1.raise(`Can't ${propertyKey.toString()} method ${this.name} from ${this.class.type.name}: pointer is NULL.`);
        }
        return fn.apply(this, args);
    };
}
exports.nonNullMethodPointer = nonNullMethodPointer;
/** @internal */
function checkOutOfBounds(_, __, descriptor) {
    const fn = descriptor.value;
    descriptor.value = function (...args) {
        const index = args[0];
        if (index < 0 || index >= this.length) {
            console_1.raise(`${this.constructor.name} element index '${index}' out of bounds (length: ${this.length}).`);
        }
        return fn.apply(this, args);
    };
}
exports.checkOutOfBounds = checkOutOfBounds;
/** @internal */
function nonNullHandle(Class) {
    return new Proxy(Class, {
        construct(Class, args) {
            const constructed = new Class(...args);
            if (constructed.handle.isNull()) {
                console_1.raise(`Handle for "${Class.name}" cannot be NULL.`);
            }
            return constructed;
        }
    });
}
exports.nonNullHandle = nonNullHandle;
// export function nonNullHandle<T extends { new (...args: any[]): { handle: NativePointer } }>(Class: T) {
//     const NewClass = class extends Class {
//         constructor(...args: any[]) {
//             super(...args);
//             if (this.handle.isNull()) raise(`Handle for "${this.constructor.name}" cannot be NULL.`);
//         }
//     };
//     Reflect.defineProperty(NewClass, "name", { get: () => Class.name });
//     return NewClass;
// }

},{"../utils/console":30,"./variables":26}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValueType = exports.TypeEnum = exports.Type = exports.String = exports.Parameter = exports.Object = exports.Method = exports.MemorySnapshot = exports.Image = exports.GenericClass = exports.GC = exports.Field = exports.Domain = exports.Class = exports.Assembly = exports.Array = exports.dump = exports.initialize = exports.domain = exports.unityVersion = exports.library = void 0;
var variables_1 = require("./variables");
Object.defineProperty(exports, "library", { enumerable: true, get: function () { return variables_1.library; } });
Object.defineProperty(exports, "unityVersion", { enumerable: true, get: function () { return variables_1.unityVersion; } });
Object.defineProperty(exports, "domain", { enumerable: true, get: function () { return variables_1.domain; } });
Object.defineProperty(exports, "initialize", { enumerable: true, get: function () { return variables_1.initialize; } });
var utils_1 = require("./utils");
Object.defineProperty(exports, "dump", { enumerable: true, get: function () { return utils_1.dump; } });
var array_1 = require("./structs/array");
Object.defineProperty(exports, "Array", { enumerable: true, get: function () { return array_1._Il2CppArray; } });
var assembly_1 = require("./structs/assembly");
Object.defineProperty(exports, "Assembly", { enumerable: true, get: function () { return assembly_1._Il2CppAssembly; } });
var class_1 = require("./structs/class");
Object.defineProperty(exports, "Class", { enumerable: true, get: function () { return class_1._Il2CppClass; } });
var domain_1 = require("./structs/domain");
Object.defineProperty(exports, "Domain", { enumerable: true, get: function () { return domain_1._Il2CppDomain; } });
var field_1 = require("./structs/field");
Object.defineProperty(exports, "Field", { enumerable: true, get: function () { return field_1._Il2CppField; } });
var gc_1 = require("./structs/gc");
Object.defineProperty(exports, "GC", { enumerable: true, get: function () { return gc_1._Il2CppGC; } });
var generic_class_1 = require("./structs/generic-class");
Object.defineProperty(exports, "GenericClass", { enumerable: true, get: function () { return generic_class_1._Il2CppGenericClass; } });
var image_1 = require("./structs/image");
Object.defineProperty(exports, "Image", { enumerable: true, get: function () { return image_1._Il2CppImage; } });
var memory_snapshot_1 = require("./structs/memory-snapshot");
Object.defineProperty(exports, "MemorySnapshot", { enumerable: true, get: function () { return memory_snapshot_1._Il2CppMemorySnapshot; } });
var method_1 = require("./structs/method");
Object.defineProperty(exports, "Method", { enumerable: true, get: function () { return method_1._Il2CppMethod; } });
var object_1 = require("./structs/object");
Object.defineProperty(exports, "Object", { enumerable: true, get: function () { return object_1._Il2CppObject; } });
var parameter_1 = require("./structs/parameter");
Object.defineProperty(exports, "Parameter", { enumerable: true, get: function () { return parameter_1._Il2CppParameter; } });
var string_1 = require("./structs/string");
Object.defineProperty(exports, "String", { enumerable: true, get: function () { return string_1._Il2CppString; } });
var type_1 = require("./structs/type");
Object.defineProperty(exports, "Type", { enumerable: true, get: function () { return type_1._Il2CppType; } });
var type_enum_1 = require("./structs/type-enum");
Object.defineProperty(exports, "TypeEnum", { enumerable: true, get: function () { return type_enum_1._Il2CppTypeEnum; } });
var value_type_1 = require("./structs/value-type");
Object.defineProperty(exports, "ValueType", { enumerable: true, get: function () { return value_type_1._Il2CppValueType; } });

},{"./structs/array":9,"./structs/assembly":10,"./structs/class":11,"./structs/domain":12,"./structs/field":13,"./structs/gc":14,"./structs/generic-class":15,"./structs/image":16,"./structs/memory-snapshot":17,"./structs/method":18,"./structs/object":19,"./structs/parameter":20,"./structs/string":21,"./structs/type":23,"./structs/type-enum":22,"./structs/value-type":24,"./utils":25,"./variables":26}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeStruct = void 0;
class NativeStruct {
    constructor(handle) {
        this.handle = handle;
    }
}
exports.NativeStruct = NativeStruct;

},{}],8:[function(require,module,exports){
"use strict";
//Test Unity Project 2018.3
// export class NativeApiOffset {
//     public static offset_s_assemblies = 0x000D5EE90;
//     public static offset_il2cpp_image_get_class_count = 0x1c;
//     public static offset_il2cpp_image_get_class = 0x0005ceec4;
//     public static offset_il2cpp_metadata_typestart = 0x18;
//     public static offset_il2cpp_class_get_interfaces = 0x0005c96f4;
//     public static offset_il2cpp_field_static_get_value = 0x0005c64e4;
//     public static offset_il2cpp_domain_get = 0x0005bcf64;
//     public static offset_il2cpp_thread_attach = 0x0005be13c;
//     public static offset_il2cpp_class_get_type = 0x0005cbefc;
// }
Object.defineProperty(exports, "__esModule", { value: true });
exports.NativeApiOffset = void 0;
//热血航线
class NativeApiOffset {
}
exports.NativeApiOffset = NativeApiOffset;
NativeApiOffset.offset_s_assemblies = 0x005b918d0;
NativeApiOffset.offset_il2cpp_image_get_class_count = 0x1c;
NativeApiOffset.offset_il2cpp_image_get_class = 0x0014ce05c;
NativeApiOffset.offset_il2cpp_metadata_typestart = 0x18;
NativeApiOffset.offset_il2cpp_class_get_interfaces = 0x001505b38;
NativeApiOffset.offset_il2cpp_field_static_get_value = 0x0014c151c;
NativeApiOffset.offset_il2cpp_domain_get = 0x0014b6b28;
NativeApiOffset.offset_il2cpp_thread_attach = 0x0014b7b30;
NativeApiOffset.offset_il2cpp_class_get_type = 0x001507d18;
NativeApiOffset.offset_il2cpp_type_get_name = 0x0014814e4;
NativeApiOffset.offset_il2cpp_class_is_enum = 0x0015081dc;
NativeApiOffset.offset_il2cpp_class_is_valuetype = 0x00150664c;
NativeApiOffset.offset_il2cpp_class_is_interface = 0x001506434;
NativeApiOffset.offset_il2cpp_class_get_parent = 0x001505f00;
NativeApiOffset.offset_il2cpp_class_get_fields = 0x001505960;
NativeApiOffset.offset_il2cpp_class_get_methods = 0x001505c14;
NativeApiOffset.offset_il2cpp_method_get_name = 0x0014b6e64;
NativeApiOffset.offset_il2cpp_method_is_instance = 0x0014b6fc0;
NativeApiOffset.offset_il2cpp_class_from_type = 0x001505074;

},{}],9:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _Il2CppArray_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppArray = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const object_1 = require("./object");
/**
 * Represents a `Il2CppArraySize`.
 */
let _Il2CppArray = _Il2CppArray_1 = class _Il2CppArray extends native_struct_1.NativeStruct {
    /**
     * @return The size of each element.
     */
    get elementSize() {
        return this.object.class.type.dataType.class.arrayElementSize;
    }
    /**
     * @return The type of its elements.
     */
    get elementType() {
        return this.object.class.type.dataType;
    }
    /** @internal */
    get elements() {
        return api_1.Api._arrayGetElements(this.handle);
    }
    /**
     * @return Its length.
     */
    get length() {
        return api_1.Api._arrayGetLength(this.handle);
    }
    /**
     * @return The same array as an object.
     */
    get object() {
        return new object_1._Il2CppObject(this.handle);
    }
    /**
     * Creates a new array.
     * @param klass The class of the elements.
     * @param elements The elements.
     * @return A new array.
     */
    static from(klass, elements) {
        const handle = api_1.Api._arrayNew(klass.handle, elements.length);
        const array = new _Il2CppArray_1(handle);
        elements.forEach((e, i) => array.set(i, e));
        return array;
    }
    /**
     * @param index The index of the element. It must be between the array bounds.
     * @return The element at the given index.
     */
    get(index) {
        return utils_1.readFieldValue(this.elements.add(index * this.elementSize), this.elementType);
    }
    /**
     * @param index The index of the element. It must be between the array bounds.
     * @param value The value of the element.
     */
    set(index, value) {
        utils_1.writeFieldValue(this.elements.add(index * this.elementSize), value, this.elementType);
    }
    /**
     * Iterable.
     */
    *[Symbol.iterator]() {
        for (let i = 0; i < this.length; i++)
            yield this.get(i);
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppArray.prototype, "elementSize", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppArray.prototype, "elementType", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppArray.prototype, "elements", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppArray.prototype, "length", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppArray.prototype, "object", null);
__decorate([
    decorators_1.checkOutOfBounds
], _Il2CppArray.prototype, "get", null);
__decorate([
    decorators_1.checkOutOfBounds
], _Il2CppArray.prototype, "set", null);
_Il2CppArray = _Il2CppArray_1 = __decorate([
    decorators_1.nonNullHandle
], _Il2CppArray);
exports._Il2CppArray = _Il2CppArray;

},{"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"./object":19,"decorator-cache-getter":2}],10:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppAssembly = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const variables_1 = require("../variables");
const image_1 = require("./image");
/**
 * Represents a `Il2CppAssembly`.
 */
let _Il2CppAssembly = class _Il2CppAssembly extends native_struct_1.NativeStruct {
    /**
     * @return Its image.
     */
    get image() {
        return new image_1._Il2CppImage(api_1.Api._assemblyGetImage(this.handle));
    }
    /**
     * @return Its name.
     */
    get name() {
        if (variables_1.unityVersion.isLegacy) {
            return this.image.name.replace(".dll", "");
        }
        else {
            return api_1.Api._assemblyGetName(this.handle);
        }
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppAssembly.prototype, "image", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppAssembly.prototype, "name", null);
_Il2CppAssembly = __decorate([
    decorators_1.nonNullHandle
], _Il2CppAssembly);
exports._Il2CppAssembly = _Il2CppAssembly;

},{"../api":4,"../decorators":5,"../native-struct":7,"../variables":26,"./image":16,"decorator-cache-getter":2}],11:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _Il2CppClass_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppClass = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const accessor_1 = require("../../utils/accessor");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const field_1 = require("./field");
const generic_class_1 = require("./generic-class");
const image_1 = require("./image");
const method_1 = require("./method");
const type_1 = require("./type");
const type_enum_1 = require("./type-enum");
/**
 * Represents a `Il2CppClass`.
 */
let _Il2CppClass = _Il2CppClass_1 = class _Il2CppClass extends native_struct_1.NativeStruct {
    /**
     * The inverse of {@link _Il2CppClass.elementClass}.
     * @return The array class which has the caller as element class.
     */
    get arrayClass() {
        return new _Il2CppClass_1(api_1.Api._classGetArrayClass(this.handle, 1));
    }
    /**
     * @return The size as array element.
     */
    get arrayElementSize() {
        return api_1.Api._classGetArrayElementSize(this.handle);
    }
    /**
     * @returns The name of the assembly it belongs to.
     */
    get assemblyName() {
        return api_1.Api._classGetAssemblyName(this.handle);
    }
    /**
     * ```csharp
     * namespace System.Threading
     * {
     *     class ExecutionContext
     *     {
     *         class Flags
     *         {
     *         }
     *     }
     * }
     * ```
     * @return Its outer class if its a nested class, `null` otherwise.
     */
    get declaringClass() {
        return utils_1.getOrNull(api_1.Api._classGetDeclaringType(this.handle), _Il2CppClass_1);
    }
    /**
     * Its element class if it's an array.
     */
    get elementClass() {
        return utils_1.getOrNull(api_1.Api._classGetElementClass(this.handle), _Il2CppClass_1);
    }
    /**
     * @return The count of its fields.
     */
    get fieldCount() {
        return api_1.Api._classGetFieldCount(this.handle);
    }
    /**
     * We can iterate over the fields a `for..of` loop, or access
     * a specific field using its name.
     * ```typescript
     * const MathClass = mscorlib.classes["System.Math"];
     * for (const fields of MathClass.fields) {
     * }
     * const PI = MathClass.fields.PI;
     * ```
     * @return Its fields.
     */
    get fields() {
        const iterator = Memory.alloc(Process.pointerSize);
        const accessor = new accessor_1.Accessor();
        let handle;
        let field;
        while (!(handle = api_1.Api._classGetFields(this.handle, iterator)).isNull()) {
            field = new field_1._Il2CppField(handle);
            accessor[field.name] = field;
        }
        return accessor;
    }
    /**
     * @returns If it's a generic class, its generic class, `null` otherwise.
     */
    get genericClass() {
        return utils_1.getOrNull(api_1.Api._classGetGenericClass(this.handle), generic_class_1._Il2CppGenericClass);
    }
    /**
     * @return `true` if it has a static constructor, `false` otherwise.
     */
    get hasStaticConstructor() {
        return api_1.Api._classHasStaticConstructor(this.handle);
    }
    /**
     * @return The image it belongs to.
     */
    get image() {
        return new image_1._Il2CppImage(api_1.Api._classGetImage(this.handle));
    }
    /**
     * @return The size of its instance.
     */
    get instanceSize() {
        return api_1.Api._classGetInstanceSize(this.handle);
    }
    /**
     * @return `true` if it's an `enum`, `false` otherwise.
     */
    get isEnum() {
        return api_1.Api._classIsEnum(this.handle);
    }
    /**
     * @return `true` if it's an `interface`, `false` otherwise.
     */
    get isInterface() {
        return api_1.Api._classIsInterface(this.handle);
    }
    /**
     * @return `true` If its static constructor has been already called,
     * so if its static data has been initialized, `false` otherwise.
     */
    get isStaticConstructorFinished() {
        return api_1.Api._classIsStaticConstructorFinished(this.handle);
    }
    /**
     * @return `true` if it's a value type (aka struct), `false` otherwise.
     */
    get isStruct() {
        return api_1.Api._classIsStruct(this.handle) && !this.isEnum;
    }
    /**
     * @return The count of its implemented interfaces.
     */
    get interfaceCount() {
        return api_1.Api._classGetInterfaceCount(this.handle);
    }
    /**
     * We can iterate over the interfaces using a `for..of` loop,
     * or access a specific method using its name.
     * ```typescript
     * const StringClass = mscorlib.classes["System.String"];
     * for (const klass of StringClass.interfaces) {
     * }
     * const IComparable = StringClass.interfaces["System.IComparable"];
     * ```
     * @return Its interfaces.
     */
    get interfaces() {
        const iterator = Memory.alloc(Process.pointerSize);
        const accessor = new accessor_1.Accessor();
        let handle;
        let klass;
        while (!(handle = api_1.Api._classGetInterfaces(this.handle, iterator)).isNull()) {
            klass = new _Il2CppClass_1(handle);
            accessor[klass.type.name] = klass;
        }
        return accessor;
    }
    /**
     * @return The count of its methods.
     */
    get methodCount() {
        return api_1.Api._classGetMethodCount(this.handle);
    }
    /**
     * We can iterate over the methods using a `for..of` loop,
     * or access a specific method using its name.
     * ```typescript
     * const MathClass = mscorlib.classes["System.Math"];
     * for (const method of MathClass.methods) {
     * }
     * const Log10 = MathClass.methods.Log10;
     * ```
     * @return Its methods.
     */
    get methods() {
        const iterator = Memory.alloc(Process.pointerSize);
        const accessor = new accessor_1.Accessor(true);
        let handle;
        let method;
        while (!(handle = api_1.Api._classGetMethods(this.handle, iterator)).isNull()) {
            method = new method_1._Il2CppMethod(handle);
            accessor[method.name] = method;
        }
        return accessor;
    }
    /**
     * @return Its name.
     */
    get name() {
        return api_1.Api._classGetName(this.handle);
    }
    /**
     * @return Its namespace.
     */
    get namespace() {
        return api_1.Api._classGetNamespace(this.handle);
    }
    /**
     * @return Its parent if there is, `null.` otherwise.
     */
    get parent() {
        return utils_1.getOrNull(api_1.Api._classGetParent(this.handle), _Il2CppClass_1);
    }
    /**
     * @return A pointer to its static fields.
     */
    get staticFieldsData() {
        return api_1.Api._classGetStaticFieldData(this.handle);
    }
    /**
     * @return Its type.
     */
    get type() {
        return new type_1._Il2CppType(api_1.Api._classGetType(this.handle));
    }
    /**
     * It makes sure its static data has been initialized.\
     * See {@link isStaticConstructorFinished} for an example.
     */
    ensureInitialized() {
        api_1.Api._classInit(this.handle);
    }
    /**
     * It traces all its methods.\
     * See {@link Method.trace | trace} for more details.
     */
    trace() {
        for (const method of this.methods)
            method.trace();
    }
    /**
     * @return The class dump.
     */
    toString() {
        const spacer = "\n    ";
        let text = "// " + this.image.name + "\n";
        text += this.isEnum ? "enum" : this.isStruct ? "struct" : this.isInterface ? "interface" : "class";
        text += " " + this.type.name;
        if (this.parent != null || this.interfaceCount > 0)
            text += " : ";
        if (this.parent != null) {
            text += this.parent.type.name;
            if (this.interfaceCount > 0)
                text += ", ";
        }
        if (this.interfaceCount > 0)
            text += Object.keys(this.interfaces).join(", ");
        text += "\n{";
        for (const field of this.fields) {
            text += spacer + (this.isEnum && field.name != "value__" ? "" : field.type.name + " ") + field.name;
            if (field.isLiteral) {
                text += " = ";
                if (field.type.typeEnum == type_enum_1._Il2CppTypeEnum.STRING)
                    text += '"';
                text += field.value;
                if (field.type.typeEnum == type_enum_1._Il2CppTypeEnum.STRING)
                    text += '"';
            }
            text += this.isEnum && field.name != "value__" ? "," : "; // 0x" + field.offset.toString(16);
        }
        if (this.fieldCount + this.methodCount > 0)
            text += "\n";
        for (const method of this.methods) {
            text += spacer;
            if (!method.isInstance)
                text += "static ";
            text += method.returnType.name + " " + method.name + "(";
            for (const parameter of method.parameters) {
                if (parameter.position > 0)
                    text += ", ";
                text += parameter.type.name + " " + parameter.name;
            }
            text += ");";
            if (!method.actualPointer.isNull())
                text += " // " + method.relativePointerAsString + ";";
        }
        text += "\n}\n\n";
        return text;
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "arrayClass", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "arrayElementSize", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "assemblyName", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "declaringClass", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "elementClass", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "fieldCount", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "fields", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "genericClass", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "hasStaticConstructor", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "image", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "instanceSize", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "isEnum", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "isInterface", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "isStruct", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "interfaceCount", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "interfaces", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "methodCount", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "methods", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "name", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "namespace", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "parent", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "staticFieldsData", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppClass.prototype, "type", null);
_Il2CppClass = _Il2CppClass_1 = __decorate([
    decorators_1.nonNullHandle
], _Il2CppClass);
exports._Il2CppClass = _Il2CppClass;

},{"../../utils/accessor":29,"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"./field":13,"./generic-class":15,"./image":16,"./method":18,"./type":23,"./type-enum":22,"decorator-cache-getter":2}],12:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _Il2CppDomain_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppDomain = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const accessor_1 = require("../../utils/accessor");
const console_1 = require("../../utils/console");
const api_1 = require("../api");
const native_struct_1 = require("../native-struct");
const decorators_1 = require("../decorators");
const assembly_1 = require("./assembly");
/**
 * Represents a `Il2CppDomain`.
 */
let _Il2CppDomain = _Il2CppDomain_1 = class _Il2CppDomain extends native_struct_1.NativeStruct {
    /**
     * @return Its name. Probably `IL2CPP Root Domain`.
     */
    get name() {
        return api_1.Api._domainGetName(this.handle);
    }
    /**
     * We can iterate over the assemblies using a `for..of` loop,
     * or access a specific assembly using its name, extension omitted.
     * @return Its assemblies.
     */
    get assemblies() {
        const accessor = new accessor_1.Accessor();
        const sizePointer = Memory.alloc(Process.pointerSize);
        const startPointer = api_1.Api._domainGetAssemblies(NULL, sizePointer);
        if (startPointer.isNull()) {
            console_1.raise("First assembly pointer is NULL.");
        }
        const count = sizePointer.readInt();
        for (let i = 0; i < count; i++) {
            const assembly = new assembly_1._Il2CppAssembly(startPointer.add(i * Process.pointerSize).readPointer());
            accessor[assembly.name] = assembly;
        }
        return accessor;
    }
    /**
     * This is potentially asynchronous because the domain could
     * be initialized at any time, e.g. after `il2cpp_init` is
     * being called.\
     * The domain will already be attached to the caller thread.
     * You don't actually need to call this.
     * @return The current application domain.
     */
    static get reference() {
        return (async () => {
            const domainPointer = await new Promise(resolve => {
                const start = api_1.Api._domainGetAssemblies(NULL, Memory.alloc(Process.pointerSize));
                if (!start.isNull()) {
                    resolve(api_1.Api._domainGet());
                }
                else {
                    const interceptor = Interceptor.attach(api_1.Api._init, {
                        onLeave() {
                            setTimeout(() => interceptor.detach());
                            resolve(api_1.Api._domainGet());
                        }
                    });
                }
            });
            api_1.Api._threadAttach(domainPointer);
            return new _Il2CppDomain_1(domainPointer);
        })();
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppDomain.prototype, "name", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppDomain.prototype, "assemblies", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppDomain, "reference", null);
_Il2CppDomain = _Il2CppDomain_1 = __decorate([
    decorators_1.nonNullHandle
], _Il2CppDomain);
exports._Il2CppDomain = _Il2CppDomain;

},{"../../utils/accessor":29,"../../utils/console":30,"../api":4,"../decorators":5,"../native-struct":7,"./assembly":10,"decorator-cache-getter":2}],13:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppField = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const console_1 = require("../../utils/console");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const class_1 = require("./class");
const type_1 = require("./type");
/**
 * Represents a `FieldInfo`.
 */
let _Il2CppField = class _Il2CppField extends native_struct_1.NativeStruct {
    /**
     * @return The class it belongs to.
     */
    get class() {
        return new class_1._Il2CppClass(api_1.Api._fieldGetClass(this.handle));
    }
    /**
     * @return `true` if it's a instance field, `false` otherwise.
     */
    get isInstance() {
        return api_1.Api._fieldIsInstance(this.handle);
    }
    /**
     * @return `true` if it's literal field, `false` otherwise.
     */
    get isLiteral() {
        return api_1.Api._fieldIsLiteral(this.handle);
    }
    /**
     * @return `true` if it's a thread  field, `false` otherwise.
     */
    get isThreadStatic() {
        return this.offset == -1;
    }
    /**
     * @return Its name.
     */
    get name() {
        return api_1.Api._fieldGetName(this.handle);
    }
    /**
     * A static field offsets is meant as the offset between it's class
     * {@link _Il2CppClass.staticFieldsData} and its location.
     * A static field offsets is meant as the offset between it's object
     * {@link Object.handle | handle} and its location.
     * @return Its offset.
     */
    get offset() {
        return api_1.Api._fieldGetOffset(this.handle);
    }
    /**
     * @return Its type.
     */
    get type() {
        return new type_1._Il2CppType(api_1.Api._fieldGetType(this.handle));
    }
    /**
     * @return Its value.
     */
    get value() {
        return utils_1.readFieldValue(this.valueHandle, this.type);
    }
    /**
     * NOTE: Thread static or literal values cannot be altered yet.
     * @param value Its new value.
     */
    set value(value) {
        if (this.isThreadStatic || this.isLiteral) {
            console_1.raise(`Cannot edit the thread static or literal field "${this.name}".`);
        }
        utils_1.writeFieldValue(this.valueHandle, value, this.type);
    }
    /**
     * @return The actual location of its value.
     */
    get valueHandle() {
        let handle;
        if (this.isThreadStatic || this.isLiteral) {
            handle = Memory.alloc(Process.pointerSize);
            api_1.Api._fieldGetStaticValue(this.handle, handle);
        }
        else {
            handle = this.class.staticFieldsData.add(this.offset);
        }
        return handle;
    }
    asHeld(handle) {
        const type = this.type;
        return {
            valueHandle: handle,
            get value() {
                return utils_1.readFieldValue(handle, type);
            },
            set value(value) {
                utils_1.writeFieldValue(handle, value, type);
            }
        };
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "class", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "isInstance", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "isLiteral", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "isThreadStatic", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "name", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "offset", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppField.prototype, "type", null);
__decorate([
    decorators_1.shouldBeInstance(false)
], _Il2CppField.prototype, "value", null);
__decorate([
    decorators_1.shouldBeInstance(false)
], _Il2CppField.prototype, "valueHandle", null);
__decorate([
    decorators_1.shouldBeInstance(true)
], _Il2CppField.prototype, "asHeld", null);
_Il2CppField = __decorate([
    decorators_1.nonNullHandle
], _Il2CppField);
exports._Il2CppField = _Il2CppField;

},{"../../utils/console":30,"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"./class":11,"./type":23,"decorator-cache-getter":2}],14:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppGC = void 0;
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const array_1 = require("./array");
const memory_snapshot_1 = require("./memory-snapshot");
const object_1 = require("./object");
const string_1 = require("./string");
const type_enum_1 = require("./type-enum");
/**
 * Garbage collector utility functions.
 */
class _Il2CppGC {
    /**
     * Forces the GC to collect object from the given
     * [generation](https://docs.microsoft.com/en-us/dotnet/standard/garbage-collection/fundamentals#generations).
     * @param generation The category of objects to collect.
     */
    static collect(generation) {
        api_1.Api._gcCollect(generation);
    }
    /**
     * Like {@link _Il2CppGC.collect | collect}, but I don't know which
     * generation it collects.
     */
    static collectALittle() {
        api_1.Api._gcCollectALittle();
    }
    /**
     * Disables the GC.
     */
    static disable() {
        api_1.Api._gcDisable();
    }
    /**
     * Enables the GC.
     */
    static enable() {
        api_1.Api._gcEnable();
    }
    /**
     * @return `true` if the GC is disabled, `false` otherwise.
     */
    static isDisabled() {
        return api_1.Api._gcIsDisabled();
    }
    /**
     * It reads the GC descriptor of the given class and looks for its objects
     * on the heap. During this process, it may stop and start the GC world
     * multiple times.\
     * A version with callbacks is not really needed because:
     * - There aren't performance issues;
     * - It cannot be stopped;
     * - The `onMatch` callback can only be called when the GC world starts again,
     * but the whole thing is enough fast it doesn't make any sense to have
     * callbacks.
     *
     * ```typescript
     * const StringClass = Il2Cpp.domain.assemblies.mscorlib.image.classes["System.String"];
     * const matches = Il2Cpp.GC.choose<Il2Cpp.String>(StringClass);
     * for (const match of matches) {
     *     console.log(match);
     * }
     * ```
     * @template T Type parameter to automatically cast the objects to other object-like
     * entities, like string and arrays. Default is {@link _Il2CppObject}.
     * @param klass The class of the objects you are looking for.
     * @return An array of ready-to-use objects, strings or arrays. Value types are boxed.
     */
    static choose(klass) {
        const isString = klass.type.typeEnum == type_enum_1._Il2CppTypeEnum.STRING;
        const isArray = klass.type.typeEnum == type_enum_1._Il2CppTypeEnum.SZARRAY;
        const matches = [];
        const callback = (objects, size, _) => {
            for (let i = 0; i < size; i++) {
                const pointer = objects.add(i * Process.pointerSize).readPointer();
                if (isString)
                    matches.push(new string_1._Il2CppString(pointer));
                else if (isArray)
                    matches.push(new array_1._Il2CppArray(pointer));
                else
                    matches.push(new Object(pointer));
            }
        };
        const chooseCallback = new NativeCallback(callback, "void", ["pointer", "int", "pointer"]);
        const onWorld = new NativeCallback(() => { }, "void", []);
        const state = api_1.Api._livenessCalculationBegin(klass.handle, 0, chooseCallback, NULL, onWorld, onWorld);
        api_1.Api._livenessCalculationFromStatics(state);
        api_1.Api._livenessCalculationEnd(state);
        return matches;
    }
    /**
     * It takes a memory snapshot and scans the current tracked objects of the given class.\
     * It leads to different results if compared to {@link _Il2CppGC.choose}.
     * @template T Type parameter to automatically cast the objects to other object-like
     * entities, like string and arrays. Default is {@link _Il2CppObject}.
     * @param klass The class of the objects you are looking for.
     * @return An array of ready-to-use objects, strings or arrays. Value types are boxed.
     */
    static choose2(klass) {
        const isString = klass.type.typeEnum == type_enum_1._Il2CppTypeEnum.STRING;
        const isArray = klass.type.typeEnum == type_enum_1._Il2CppTypeEnum.SZARRAY;
        const matches = [];
        const snapshot = new memory_snapshot_1._Il2CppMemorySnapshot();
        const count = snapshot.trackedObjectCount.toNumber();
        const start = snapshot.objectsPointer;
        for (let i = 0; i < count; i++) {
            const pointer = start.add(i * Process.pointerSize).readPointer();
            const object = new object_1._Il2CppObject(pointer);
            if (object.class.handle.equals(klass.handle)) {
                if (isString)
                    matches.push(new string_1._Il2CppString(pointer));
                else if (isArray)
                    matches.push(new array_1._Il2CppArray(pointer));
                else
                    matches.push(object);
            }
        }
        snapshot.free();
        return matches;
    }
}
__decorate([
    decorators_1.since("5.3.5")
], _Il2CppGC, "collectALittle", null);
__decorate([
    decorators_1.since("5.3.5")
], _Il2CppGC, "disable", null);
__decorate([
    decorators_1.since("5.3.5")
], _Il2CppGC, "enable", null);
__decorate([
    decorators_1.since("2018.3.0")
], _Il2CppGC, "isDisabled", null);
exports._Il2CppGC = _Il2CppGC;

},{"../api":4,"../decorators":5,"./array":9,"./memory-snapshot":17,"./object":19,"./string":21,"./type-enum":22}],15:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppGenericClass = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const class_1 = require("./class");
/**
 * Represents a `Il2CppGenericClass`.
 */
let _Il2CppGenericClass = class _Il2CppGenericClass extends native_struct_1.NativeStruct {
    /**
     * @return Its class.
     */
    get cachedClass() {
        return utils_1.getOrNull(api_1.Api._genericClassGetCachedClass(this.handle), class_1._Il2CppClass);
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppGenericClass.prototype, "cachedClass", null);
_Il2CppGenericClass = __decorate([
    decorators_1.nonNullHandle
], _Il2CppGenericClass);
exports._Il2CppGenericClass = _Il2CppGenericClass;

},{"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"./class":11,"decorator-cache-getter":2}],16:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppImage = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const accessor_1 = require("../../utils/accessor");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const variables_1 = require("../variables");
const class_1 = require("./class");
const type_1 = require("./type");
/**
 * Represents a `Il2CppImage`.
 */
let _Il2CppImage = class _Il2CppImage extends native_struct_1.NativeStruct {
    /**
     * @return The count of its classes.
     */
    get classCount() {
        return api_1.Api._imageGetClassCount(this.handle);
    }
    /**
     * Non-generic types are stored in sequence.
     * @return The start index of its classes, `0` if this information
     * is not available (since Unity version `2020.2.0`).
     */
    get classStart() {
        return api_1.Api._imageGetClassStart(this.handle);
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
    get classes() {
        const accessor = new accessor_1.Accessor();
        if (variables_1.unityVersion.isLegacy) {
            const start = this.classStart;
            const end = start + this.classCount;
            const globalIndex = Memory.alloc(Process.pointerSize);
            globalIndex.add(type_1._Il2CppType.offsetOfTypeEnum).writeInt(0x20);
            for (let i = start; i < end; i++) {
                const klass = new class_1._Il2CppClass(api_1.Api._typeGetClassOrElementClass(globalIndex.writeInt(i)));
                accessor[klass.type.name] = klass;
            }
        }
        else {
            const end = this.classCount;
            for (let i = 0; i < end; i++) {
                const klass = new class_1._Il2CppClass(api_1.Api._imageGetClass(this.handle, i));
                accessor[klass.type.name] = klass;
            }
        }
        return accessor;
    }
    /**
     * @return Its name, equals to the name of its assembly plus its
     * extension.
     */
    get name() {
        return api_1.Api._imageGetName(this.handle);
    }
    /**
     * @param namespace The class namespace.
     * @param name The class name.
     * @return The class for the given namespace and name or `null` if
     * not found.
     */
    getClassFromName(namespace, name) {
        return utils_1.getOrNull(api_1.Api._classFromName(this.handle, namespace, name), class_1._Il2CppClass);
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppImage.prototype, "classCount", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppImage.prototype, "classStart", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppImage.prototype, "classes", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppImage.prototype, "name", null);
_Il2CppImage = __decorate([
    decorators_1.nonNullHandle
], _Il2CppImage);
exports._Il2CppImage = _Il2CppImage;

},{"../../utils/accessor":29,"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"../variables":26,"./class":11,"./type":23,"decorator-cache-getter":2}],17:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppMemorySnapshot = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
/**
 * Represents a `Il2CppMemorySnapshot`.
 */
let _Il2CppMemorySnapshot = class _Il2CppMemorySnapshot extends native_struct_1.NativeStruct {
    constructor() {
        super(api_1.Api._memorySnapshotCapture());
    }
    get trackedObjectCount() {
        return api_1.Api._memorySnapshotGetTrackedObjectCount(this.handle);
    }
    get objectsPointer() {
        return api_1.Api._memorySnapshotGetObjects(this.handle);
    }
    free() {
        api_1.Api._memorySnapshotFree(this.handle);
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMemorySnapshot.prototype, "trackedObjectCount", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMemorySnapshot.prototype, "objectsPointer", null);
_Il2CppMemorySnapshot = __decorate([
    decorators_1.nonNullHandle
], _Il2CppMemorySnapshot);
exports._Il2CppMemorySnapshot = _Il2CppMemorySnapshot;

},{"../api":4,"../decorators":5,"../native-struct":7,"decorator-cache-getter":2}],18:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppMethod = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const accessor_1 = require("../../utils/accessor");
const console_1 = require("../../utils/console");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const variables_1 = require("../variables");
const utils_1 = require("../utils");
const class_1 = require("./class");
const object_1 = require("./object");
const type_1 = require("./type");
const parameter_1 = require("./parameter");
/**
 * Represents a `MethodInfo`.
 */
let _Il2CppMethod = class _Il2CppMethod extends native_struct_1.NativeStruct {
    /**
     * ```typescript
     * const MathClass = mscorlib.classes["System.Math"];
     * Interceptor.attach(MathClass.actualPointer, {
     *     // ...
     * });
     * ```
     * @return Its actual pointer in memory.
     */
    get actualPointer() {
        return api_1.Api._methodGetPointer(this.handle);
    }
    /**
     * @return The class it belongs to.
     */
    get class() {
        return new class_1._Il2CppClass(api_1.Api._methodGetClass(this.handle));
    }
    /**
     * @return `true` if it's generic, `false` otherwise.
     */
    get isGeneric() {
        return api_1.Api._methodIsGeneric(this.handle);
    }
    /**
     * @return `true` if it's inflated (a generic with a concrete type parameter),
     * false otherwise.
     */
    get isInflated() {
        return api_1.Api._methodIsInflated(this.handle);
    }
    /**
     *  @return `true` if it's an instance method, `false` otherwise.
     */
    get isInstance() {
        return api_1.Api._methodIsInstance(this.handle);
    }
    /**
     * @return Its name.
     */
    get name() {
        return api_1.Api._methodGetName(this.handle);
    }
    /**
     * @return The count of its parameters.
     */
    get parameterCount() {
        return api_1.Api._methodGetParamCount(this.handle);
    }
    /**
     * We can iterate over the parameters using a `for..of` loop,
     * or access a specific parameter using its name.
     * @return Its parameters.
     */
    get parameters() {
        const iterator = Memory.alloc(Process.pointerSize);
        const accessor = new accessor_1.Accessor();
        let handle;
        let parameter;
        while (!(handle = api_1.Api._methodGetParameters(this.handle, iterator)).isNull()) {
            parameter = new parameter_1._Il2CppParameter(handle);
            accessor[parameter.name] = parameter;
        }
        return accessor;
    }
    /**
     * @return Its static fixed offset, useful for static analysis.
     */
    get relativePointerAsString() {
        return `0x${this.actualPointer.sub(variables_1.library.base).toString(16).padStart(8, "0")}`;
    }
    /**
     * @return Its return type.
     */
    get returnType() {
        return new type_1._Il2CppType(api_1.Api._methodGetReturnType(this.handle));
    }
    /** @internal */
    get nativeFunction() {
        const parametersTypesAliasesForFrida = Array(this.parameterCount).fill("pointer");
        if (this.isInstance || variables_1.unityVersion.isLegacy) {
            parametersTypesAliasesForFrida.push("pointer");
        }
        if (this.isInflated) {
            parametersTypesAliasesForFrida.push("pointer");
        }
        return new NativeFunction(this.actualPointer, this.returnType.aliasForFrida, parametersTypesAliasesForFrida);
    }
    /**
     * Abstraction over `Interceptor.replace`.
     * @param callback The new method implementation. `null` if you want to
     * revert it.
     */
    set implementation(callback) {
        Interceptor.revert(this.actualPointer);
        if (callback == null)
            return;
        if (this.actualPointer.isNull()) {
            console_1.raise(`Can't replace method ${this.name} from ${this.class.type.name}: pointer is NULL.`);
        }
        const parametersTypesAliasesForFrida = [];
        if (this.isInstance) {
            parametersTypesAliasesForFrida.push(this.class.type.aliasForFrida);
        }
        for (const parameterInfo of this.parameters) {
            parametersTypesAliasesForFrida.push(parameterInfo.type.aliasForFrida);
        }
        const methodInfo = this;
        const replaceCallback = function (...invocationArguments) {
            const instance = methodInfo.isInstance ? new object_1._Il2CppObject(invocationArguments[0]) : null;
            const startIndex = +methodInfo.isInstance | +variables_1.unityVersion.isLegacy;
            const args = methodInfo.parameters[accessor_1.filterAndMap](() => true, parameter => parameter.asHeld(invocationArguments, startIndex));
            return callback.call(this, instance, args);
        };
        const nativeCallback = new NativeCallback(replaceCallback, this.returnType.aliasForFrida, parametersTypesAliasesForFrida);
        Interceptor.replace(this.actualPointer, nativeCallback);
        Interceptor.flush();
    }
    /** @internal */
    get parametersTypesAliasesForFrida() {
        const parametersTypesAliasesForFrida = new Array(this.parameterCount).fill("pointer");
        if (this.isInstance || variables_1.unityVersion.isLegacy) {
            parametersTypesAliasesForFrida.push("pointer");
        }
        if (this.isInflated) {
            parametersTypesAliasesForFrida.push("pointer");
        }
        return parametersTypesAliasesForFrida;
    }
    /**
     * Invokes the method.
     * @param parameters The parameters required by the method.
     * @return A value, if any.
     */
    invoke(...parameters) {
        return this._invoke(NULL, ...parameters);
    }
    /**
     * Abstraction over `Interceptor.attach`.
     * @param onEnter The callback to execute when the method is invoked.
     * @param onLeave The callback to execute when the method is about to return.
     * @return Frida's `InvocationListener`.
     */
    intercept({ onEnter, onLeave }) {
        if (this.actualPointer.isNull()) {
            console_1.raise(`Can't intercept method ${this.name} from ${this.class.type.name}: pointer is NULL.`);
        }
        const interceptorCallbacks = {};
        if (onEnter != undefined) {
            const methodInfo = this;
            interceptorCallbacks.onEnter = function (invocationArguments) {
                const instance = methodInfo.isInstance ? new object_1._Il2CppObject(invocationArguments[0]) : null;
                const startIndex = +methodInfo.isInstance | +variables_1.unityVersion.isLegacy;
                const args = methodInfo.parameters[accessor_1.filterAndMap](() => true, parameter => parameter.asHeld(invocationArguments, startIndex));
                onEnter.call(this, instance, args);
            };
        }
        if (onLeave != undefined) {
            const methodInfo = this;
            interceptorCallbacks.onLeave = function (invocationReturnValue) {
                onLeave.call(this, {
                    valueHandle: invocationReturnValue.add(0),
                    get value() {
                        return utils_1.readRawValue(invocationReturnValue, methodInfo.returnType);
                    },
                    set value(v) {
                        invocationReturnValue.replace(utils_1.allocRawValue(v, methodInfo.returnType));
                    }
                });
            };
        }
        return Interceptor.attach(this.actualPointer, interceptorCallbacks);
    }
    /**
     * Prints a message when the method is invoked.
     */
    trace() {
        if (this.actualPointer.isNull()) {
            console_1.warn(`Can't trace method ${this.name} from ${this.class.type.name}: pointer is NULL.`);
        }
        try {
            Interceptor.attach(this.actualPointer, () => console_1.inform(`${this.relativePointerAsString} ${this.name}`));
        }
        catch (e) {
            console_1.warn(`Can't trace method ${this.name} from ${this.class.type.name}: ${e.message}.`);
        }
    }
    /** @internal */
    asHeld(holder) {
        const invoke = this._invoke.bind(this, holder);
        return {
            invoke(...parameters) {
                return invoke(...parameters);
            }
        };
    }
    /** @internal */
    _invoke(instance, ...parameters) {
        if (this.parameterCount != parameters.length) {
            console_1.raise(`This method takes ${this.parameterCount} parameters, but ${parameters.length} were supplied.`);
        }
        const allocatedParameters = Array.from(this.parameters).map((parameter, i) => utils_1.allocRawValue(parameters[i], parameter.type));
        if (this.isInstance || variables_1.unityVersion.isLegacy)
            allocatedParameters.unshift(instance);
        if (this.isInflated)
            allocatedParameters.push(this.handle);
        return utils_1.readRawValue(this.nativeFunction(...allocatedParameters), this.returnType);
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "actualPointer", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "class", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "isGeneric", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "isInflated", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "isInstance", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "name", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "parameterCount", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "parameters", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "relativePointerAsString", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "returnType", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "nativeFunction", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppMethod.prototype, "parametersTypesAliasesForFrida", null);
__decorate([
    decorators_1.shouldBeInstance(false)
], _Il2CppMethod.prototype, "invoke", null);
__decorate([
    decorators_1.shouldBeInstance(true)
], _Il2CppMethod.prototype, "asHeld", null);
_Il2CppMethod = __decorate([
    decorators_1.nonNullHandle
], _Il2CppMethod);
exports._Il2CppMethod = _Il2CppMethod;

},{"../../utils/accessor":29,"../../utils/console":30,"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"../variables":26,"./class":11,"./object":19,"./parameter":20,"./type":23,"decorator-cache-getter":2}],19:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppObject = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const accessor_1 = require("../../utils/accessor");
const console_1 = require("../../utils/console");
const api_1 = require("../api");
const native_struct_1 = require("../native-struct");
const class_1 = require("./class");
const value_type_1 = require("./value-type");
/**
 * Represents a `Il2CppObject`.
 */
class _Il2CppObject extends native_struct_1.NativeStruct {
    /** @internal */
    static get headerSize() {
        return api_1.Api._objectGetHeaderSize();
    }
    /**
     * @return The same object as an instance of its parent.
     */
    get base() {
        if (this.class.parent == null) {
            console_1.raise(`Class "${this.class.type.name}" has no parent.`);
        }
        const object = new _Il2CppObject(this.handle);
        Reflect.defineProperty(object, "class", { get: () => this.class.parent });
        return object;
    }
    /**
     * @return Its class.
     */
    get class() {
        return new class_1._Il2CppClass(api_1.Api._objectGetClass(this.handle));
    }
    /**
     * See {@link _Il2CppClass.fields} for an example.
     * @return Its fields.
     */
    get fields() {
        return this.class.fields[accessor_1.filterAndMap](field => field.isInstance, field => field.asHeld(this.handle.add(field.offset)));
    }
    /**
     * See {@link _Il2CppClass.methods} for an example.
     * @return Its methods.
     */
    get methods() {
        return this.class.methods[accessor_1.filterAndMap](method => method.isInstance, method => method.asHeld(this.handle));
    }
    /**
     * NOTE: the object will be allocated only.
     * @param klass The class of the object to allocate.
     * @return A new object.
     */
    static from(klass) {
        return new _Il2CppObject(api_1.Api._objectNew(klass.handle));
    }
    /**
     * @return The unboxed value type.
     */
    unbox() {
        if (!this.class.isStruct)
            console_1.raise(`Cannot unbox a non value type object of class "${this.class.type.name}"`);
        return new value_type_1._Il2CppValueType(api_1.Api._objectUnbox(this.handle), this.class);
    }
}
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppObject.prototype, "base", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppObject.prototype, "class", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppObject.prototype, "fields", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppObject.prototype, "methods", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppObject, "headerSize", null);
exports._Il2CppObject = _Il2CppObject;

},{"../../utils/accessor":29,"../../utils/console":30,"../api":4,"../native-struct":7,"./class":11,"./value-type":24,"decorator-cache-getter":2}],20:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppParameter = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const type_1 = require("./type");
/**
 * Represents a `ParameterInfo`.
 */
let _Il2CppParameter = class _Il2CppParameter extends native_struct_1.NativeStruct {
    /**
     * @return Its name.
     */
    get name() {
        return api_1.Api._parameterGetName(this.handle);
    }
    /**
     * @return Its position.
     */
    get position() {
        return api_1.Api._parameterGetPosition(this.handle);
    }
    /**
     *  @return Its type.
     */
    get type() {
        return new type_1._Il2CppType(api_1.Api._parameterGetType(this.handle));
    }
    /** @internal */
    asHeld(holder, startIndex) {
        const position = this.position;
        const type = this.type;
        return {
            valueHandle: holder[startIndex + position],
            get value() {
                return utils_1.readRawValue(holder[startIndex + position], type);
            },
            set value(v) {
                holder[startIndex + position] = utils_1.allocRawValue(v, type);
            }
        };
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppParameter.prototype, "name", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppParameter.prototype, "position", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppParameter.prototype, "type", null);
_Il2CppParameter = __decorate([
    decorators_1.nonNullHandle
], _Il2CppParameter);
exports._Il2CppParameter = _Il2CppParameter;

},{"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"./type":23,"decorator-cache-getter":2}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppString = void 0;
const api_1 = require("../api");
const native_struct_1 = require("../native-struct");
const object_1 = require("./object");
/**
 * Represents a `Il2CppString`.
 */
class _Il2CppString extends native_struct_1.NativeStruct {
    /**
     * @return Its actual content.
     */
    get content() {
        if (this.handle.isNull()) {
            return null;
        }
        return api_1.Api._stringChars(this.handle).readUtf16String(this.length);
    }
    /**
     * @param value The new content.
     */
    set content(value) {
        if (value != null && !this.handle.isNull()) {
            api_1.Api._stringChars(this.handle).writeUtf16String(value);
            api_1.Api._stringSetLength(this.handle, value.length);
        }
    }
    /**
     * @return Its length.
     */
    get length() {
        if (this.handle.isNull()) {
            return 0;
        }
        return api_1.Api._stringLength(this.handle);
    }
    /**
     * @return The same string as an object.
     */
    get object() {
        return new object_1._Il2CppObject(this.handle);
    }
    /**
     * Creates a new string.
     * @param content The string content.
     * @return A new string.
     */
    static from(content) {
        return new _Il2CppString(api_1.Api._stringNew(content));
    }
    /**
     * @return The string content.
     */
    toString() {
        return this.content;
    }
}
exports._Il2CppString = _Il2CppString;

},{"../api":4,"../native-struct":7,"./object":19}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppTypeEnum = void 0;
/**
 * Represents the enum `Il2CppTypeEnum`.
 */
var _Il2CppTypeEnum;
(function (_Il2CppTypeEnum) {
    _Il2CppTypeEnum[_Il2CppTypeEnum["END"] = 0] = "END";
    _Il2CppTypeEnum[_Il2CppTypeEnum["VOID"] = 1] = "VOID";
    _Il2CppTypeEnum[_Il2CppTypeEnum["BOOLEAN"] = 2] = "BOOLEAN";
    _Il2CppTypeEnum[_Il2CppTypeEnum["CHAR"] = 3] = "CHAR";
    _Il2CppTypeEnum[_Il2CppTypeEnum["I1"] = 4] = "I1";
    _Il2CppTypeEnum[_Il2CppTypeEnum["U1"] = 5] = "U1";
    _Il2CppTypeEnum[_Il2CppTypeEnum["I2"] = 6] = "I2";
    _Il2CppTypeEnum[_Il2CppTypeEnum["U2"] = 7] = "U2";
    _Il2CppTypeEnum[_Il2CppTypeEnum["I4"] = 8] = "I4";
    _Il2CppTypeEnum[_Il2CppTypeEnum["U4"] = 9] = "U4";
    _Il2CppTypeEnum[_Il2CppTypeEnum["I8"] = 10] = "I8";
    _Il2CppTypeEnum[_Il2CppTypeEnum["U8"] = 11] = "U8";
    _Il2CppTypeEnum[_Il2CppTypeEnum["R4"] = 12] = "R4";
    _Il2CppTypeEnum[_Il2CppTypeEnum["R8"] = 13] = "R8";
    _Il2CppTypeEnum[_Il2CppTypeEnum["STRING"] = 14] = "STRING";
    _Il2CppTypeEnum[_Il2CppTypeEnum["PTR"] = 15] = "PTR";
    _Il2CppTypeEnum[_Il2CppTypeEnum["BYREF"] = 16] = "BYREF";
    _Il2CppTypeEnum[_Il2CppTypeEnum["VALUETYPE"] = 17] = "VALUETYPE";
    _Il2CppTypeEnum[_Il2CppTypeEnum["CLASS"] = 18] = "CLASS";
    _Il2CppTypeEnum[_Il2CppTypeEnum["VAR"] = 19] = "VAR";
    _Il2CppTypeEnum[_Il2CppTypeEnum["ARRAY"] = 20] = "ARRAY";
    _Il2CppTypeEnum[_Il2CppTypeEnum["GENERICINST"] = 21] = "GENERICINST";
    _Il2CppTypeEnum[_Il2CppTypeEnum["TYPEDBYREF"] = 22] = "TYPEDBYREF";
    _Il2CppTypeEnum[_Il2CppTypeEnum["I"] = 24] = "I";
    _Il2CppTypeEnum[_Il2CppTypeEnum["U"] = 25] = "U";
    _Il2CppTypeEnum[_Il2CppTypeEnum["FNPTR"] = 27] = "FNPTR";
    _Il2CppTypeEnum[_Il2CppTypeEnum["OBJECT"] = 28] = "OBJECT";
    _Il2CppTypeEnum[_Il2CppTypeEnum["SZARRAY"] = 29] = "SZARRAY";
    _Il2CppTypeEnum[_Il2CppTypeEnum["MVAR"] = 30] = "MVAR";
    _Il2CppTypeEnum[_Il2CppTypeEnum["CMOD_REQD"] = 31] = "CMOD_REQD";
    _Il2CppTypeEnum[_Il2CppTypeEnum["CMOD_OPT"] = 32] = "CMOD_OPT";
    _Il2CppTypeEnum[_Il2CppTypeEnum["INTERNAL"] = 33] = "INTERNAL";
    _Il2CppTypeEnum[_Il2CppTypeEnum["MODIFIER"] = 64] = "MODIFIER";
    _Il2CppTypeEnum[_Il2CppTypeEnum["SENTINEL"] = 65] = "SENTINEL";
    _Il2CppTypeEnum[_Il2CppTypeEnum["PINNED"] = 69] = "PINNED";
    _Il2CppTypeEnum[_Il2CppTypeEnum["ENUM"] = 85] = "ENUM";
})(_Il2CppTypeEnum = exports._Il2CppTypeEnum || (exports._Il2CppTypeEnum = {}));

},{}],23:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var _Il2CppType_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppType = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const api_1 = require("../api");
const decorators_1 = require("../decorators");
const native_struct_1 = require("../native-struct");
const utils_1 = require("../utils");
const class_1 = require("./class");
const generic_class_1 = require("./generic-class");
const type_enum_1 = require("./type-enum");
/**
 * Represents a `Il2CppType`.
 */
let _Il2CppType = _Il2CppType_1 = class _Il2CppType extends native_struct_1.NativeStruct {
    /** @internal */
    static get offsetOfTypeEnum() {
        return api_1.Api._typeOffsetOfTypeEnum();
    }
    /** @internal */
    get aliasForFrida() {
        switch (this.typeEnum) {
            case type_enum_1._Il2CppTypeEnum.VOID:
                return "void";
            case type_enum_1._Il2CppTypeEnum.BOOLEAN:
                return "bool";
            case type_enum_1._Il2CppTypeEnum.CHAR:
                return "char";
            case type_enum_1._Il2CppTypeEnum.I1:
                return "int8";
            case type_enum_1._Il2CppTypeEnum.U1:
                return "uint8";
            case type_enum_1._Il2CppTypeEnum.I2:
                return "int16";
            case type_enum_1._Il2CppTypeEnum.U2:
                return "uint16";
            case type_enum_1._Il2CppTypeEnum.I4:
                return "int32";
            case type_enum_1._Il2CppTypeEnum.U4:
                return "uint32";
            case type_enum_1._Il2CppTypeEnum.I8:
                return "int64";
            case type_enum_1._Il2CppTypeEnum.U8:
                return "uint64";
            case type_enum_1._Il2CppTypeEnum.R4:
                return "float";
            case type_enum_1._Il2CppTypeEnum.R8:
                return "double";
            default:
                return "pointer";
        }
    }
    /**
     * @return Its class.
     */
    get class() {
        return new class_1._Il2CppClass(api_1.Api._classFromType(this.handle));
    }
    /**
     * @return If it's an array, the type of its elements, `null` otherwise.
     */
    get dataType() {
        return utils_1.getOrNull(api_1.Api._typeGetDataType(this.handle), _Il2CppType_1);
    }
    /**
     * @returns If it's a generic type, its generic class, `null` otherwise.
     */
    get genericClass() {
        return utils_1.getOrNull(api_1.Api._typeGetGenericClass(this.handle), generic_class_1._Il2CppGenericClass);
    }
    /**
     *  @returns `true` if it's passed by reference, `false` otherwise.
     */
    get isByReference() {
        return api_1.Api._typeIsByReference(this.handle);
    }
    /**
     * @returns Its name, namespace included and declaring class excluded. If its class is nested,
     * it corresponds to the class name.
     */
    get name() {
        return api_1.Api._typeGetName(this.handle);
    }
    /**
     * @returns Its corresponding type.
     */
    get typeEnum() {
        return api_1.Api._typeGetTypeEnum(this.handle);
    }
};
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "aliasForFrida", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "class", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "dataType", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "genericClass", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "isByReference", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "name", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType.prototype, "typeEnum", null);
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppType, "offsetOfTypeEnum", null);
_Il2CppType = _Il2CppType_1 = __decorate([
    decorators_1.nonNullHandle
], _Il2CppType);
exports._Il2CppType = _Il2CppType;

},{"../api":4,"../decorators":5,"../native-struct":7,"../utils":25,"./class":11,"./generic-class":15,"./type-enum":22,"decorator-cache-getter":2}],24:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports._Il2CppValueType = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const accessor_1 = require("../../utils/accessor");
const api_1 = require("../api");
const native_struct_1 = require("../native-struct");
const object_1 = require("./object");
/**
 * Abstraction over the a value type (`struct`).
 * NOTE: you may experience few problems with value types.
 */
class _Il2CppValueType extends native_struct_1.NativeStruct {
    constructor(handle, klass) {
        super(handle);
        this.klass = klass;
    }
    /**
     * NOTE: the class is hardcoded when a new instance is created.\
     * It's not completely reliable.
     * @return Its class.
     */
    get class() {
        return this.klass;
    }
    /**
     * @return Its fields.
     */
    get fields() {
        return this.class.fields[accessor_1.filterAndMap](field => field.isInstance, field => field.asHeld(this.handle.add(field.offset).sub(object_1._Il2CppObject.headerSize)));
    }
    /**
     * See {@link _Il2CppObject.unbox} for an example.
     * @return The boxed value type.
     */
    box() {
        return new object_1._Il2CppObject(api_1.Api._valueBox(this.klass.handle, this.handle));
    }
}
__decorate([
    decorator_cache_getter_1.cache
], _Il2CppValueType.prototype, "fields", null);
exports._Il2CppValueType = _Il2CppValueType;

},{"../../utils/accessor":29,"../api":4,"../native-struct":7,"./object":19,"decorator-cache-getter":2}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dump = exports.allocRawValue = exports.readRawValue = exports.writeFieldValue = exports.readFieldValue = exports.getOrNull = void 0;
const console_1 = require("../utils/console");
const variables_1 = require("./variables");
const array_1 = require("./structs/array");
const object_1 = require("./structs/object");
const string_1 = require("./structs/string");
const value_type_1 = require("./structs/value-type");
const type_enum_1 = require("./structs/type-enum");
/** @internal */
function getOrNull(handle, Class) {
    return handle.isNull() ? null : new Class(handle);
}
exports.getOrNull = getOrNull;
/** @internal */
function isCoherent(value, type) {
    switch (type.typeEnum) {
        case type_enum_1._Il2CppTypeEnum.VOID:
            return value == undefined;
        case type_enum_1._Il2CppTypeEnum.BOOLEAN:
            return typeof value == "boolean";
        case type_enum_1._Il2CppTypeEnum.I1:
        case type_enum_1._Il2CppTypeEnum.U1:
        case type_enum_1._Il2CppTypeEnum.I2:
        case type_enum_1._Il2CppTypeEnum.U2:
        case type_enum_1._Il2CppTypeEnum.I4:
        case type_enum_1._Il2CppTypeEnum.U4:
        case type_enum_1._Il2CppTypeEnum.CHAR:
        case type_enum_1._Il2CppTypeEnum.R4:
        case type_enum_1._Il2CppTypeEnum.R8:
            return typeof value == "number";
        case type_enum_1._Il2CppTypeEnum.I8:
            return typeof value == "number" || value instanceof Int64;
        case type_enum_1._Il2CppTypeEnum.U8:
            return typeof value == "number" || value instanceof UInt64;
        case type_enum_1._Il2CppTypeEnum.I:
        case type_enum_1._Il2CppTypeEnum.U:
        case type_enum_1._Il2CppTypeEnum.PTR:
            return value instanceof NativePointer;
        case type_enum_1._Il2CppTypeEnum.VALUETYPE:
            if (type.class.isEnum)
                return typeof value == "number";
            return value instanceof value_type_1._Il2CppValueType;
        case type_enum_1._Il2CppTypeEnum.CLASS:
        case type_enum_1._Il2CppTypeEnum.GENERICINST:
        case type_enum_1._Il2CppTypeEnum.OBJECT:
            return value instanceof object_1._Il2CppObject;
        case type_enum_1._Il2CppTypeEnum.STRING:
            return value instanceof string_1._Il2CppString;
        case type_enum_1._Il2CppTypeEnum.SZARRAY:
            return value instanceof array_1._Il2CppArray;
        default:
            console_1.raise(`isCoherent: "${type.name}" (${type_enum_1._Il2CppTypeEnum[type.typeEnum]}) has not been handled yet. Please file an issue!`);
    }
}
/** @internal */
function readFieldValue(pointer, type) {
    if (pointer.isNull()) {
        return undefined;
    }
    switch (type.typeEnum) {
        case type_enum_1._Il2CppTypeEnum.VOID:
            return undefined;
        case type_enum_1._Il2CppTypeEnum.BOOLEAN:
            return !!pointer.readS8();
        case type_enum_1._Il2CppTypeEnum.I1:
            return pointer.readS8();
        case type_enum_1._Il2CppTypeEnum.U1:
            return pointer.readU8();
        case type_enum_1._Il2CppTypeEnum.I2:
            return pointer.readS16();
        case type_enum_1._Il2CppTypeEnum.U2:
            return pointer.readU16();
        case type_enum_1._Il2CppTypeEnum.I4:
            return pointer.readS32();
        case type_enum_1._Il2CppTypeEnum.U4:
            return pointer.readU32();
        case type_enum_1._Il2CppTypeEnum.CHAR:
            return pointer.readU16();
        case type_enum_1._Il2CppTypeEnum.I8:
            return pointer.readS64();
        case type_enum_1._Il2CppTypeEnum.U8:
            return pointer.readU64();
        case type_enum_1._Il2CppTypeEnum.R4:
            return pointer.readFloat();
        case type_enum_1._Il2CppTypeEnum.R8:
            return pointer.readDouble();
        case type_enum_1._Il2CppTypeEnum.I:
        case type_enum_1._Il2CppTypeEnum.U:
        case type_enum_1._Il2CppTypeEnum.PTR:
            return pointer.readPointer();
        case type_enum_1._Il2CppTypeEnum.VALUETYPE:
            return type.class.isEnum ? pointer.readS32() : new value_type_1._Il2CppValueType(pointer, type.class);
        case type_enum_1._Il2CppTypeEnum.CLASS:
        case type_enum_1._Il2CppTypeEnum.GENERICINST:
        case type_enum_1._Il2CppTypeEnum.OBJECT:
            return new object_1._Il2CppObject(pointer.readPointer());
        case type_enum_1._Il2CppTypeEnum.STRING:
            return new string_1._Il2CppString(pointer.readPointer());
        case type_enum_1._Il2CppTypeEnum.SZARRAY:
            return new array_1._Il2CppArray(pointer.readPointer());
        default:
            console_1.raise(`readFieldValue: "${type.name}" (${type_enum_1._Il2CppTypeEnum[type.typeEnum]}) has not been handled yet. Please file an issue!`);
    }
}
exports.readFieldValue = readFieldValue;
/** @internal */
function writeFieldValue(pointer, value, type) {
    if (!isCoherent(value, type)) {
        console_1.raise(`A "${type.name}" is required, but a "${Object.getPrototypeOf(value).constructor.name}" was supplied.`);
    }
    switch (type.typeEnum) {
        case type_enum_1._Il2CppTypeEnum.VOID:
            pointer.writePointer(NULL);
            break;
        case type_enum_1._Il2CppTypeEnum.BOOLEAN: {
            pointer.writeU8(+value);
            break;
        }
        case type_enum_1._Il2CppTypeEnum.I1:
            pointer.writeS8(value);
            break;
        case type_enum_1._Il2CppTypeEnum.U1:
            pointer.writeU8(value);
            break;
        case type_enum_1._Il2CppTypeEnum.I2:
            pointer.writeS16(value);
            break;
        case type_enum_1._Il2CppTypeEnum.U2:
            pointer.writeU16(value);
            break;
        case type_enum_1._Il2CppTypeEnum.I4:
            pointer.writeS32(value);
            break;
        case type_enum_1._Il2CppTypeEnum.U4:
            pointer.writeU32(value);
            break;
        case type_enum_1._Il2CppTypeEnum.CHAR:
            pointer.writeU16(value);
            break;
        case type_enum_1._Il2CppTypeEnum.I8: {
            const v = value instanceof Int64 ? value.toNumber() : value;
            pointer.writeS64(v);
            break;
        }
        case type_enum_1._Il2CppTypeEnum.U8: {
            const v = value instanceof UInt64 ? value.toNumber() : value;
            pointer.writeS64(v);
            break;
        }
        case type_enum_1._Il2CppTypeEnum.R4:
            pointer.writeFloat(value);
            break;
        case type_enum_1._Il2CppTypeEnum.R8:
            pointer.writeDouble(value);
            break;
        case type_enum_1._Il2CppTypeEnum.I:
        case type_enum_1._Il2CppTypeEnum.U:
        case type_enum_1._Il2CppTypeEnum.PTR:
            pointer.writePointer(value);
            break;
        case type_enum_1._Il2CppTypeEnum.VALUETYPE:
            if (type.class.isEnum)
                pointer.writeS32(value);
            else
                pointer.writePointer(value.handle);
            break;
        case type_enum_1._Il2CppTypeEnum.STRING:
            pointer.writePointer(value.handle);
            break;
        case type_enum_1._Il2CppTypeEnum.CLASS:
        case type_enum_1._Il2CppTypeEnum.OBJECT:
        case type_enum_1._Il2CppTypeEnum.GENERICINST:
            pointer.writePointer(value.handle);
            break;
        case type_enum_1._Il2CppTypeEnum.SZARRAY:
            pointer.writePointer(value.handle);
            break;
        default:
            console_1.raise(`writeFieldValue: "${type.name}" (${type_enum_1._Il2CppTypeEnum[type.typeEnum]}) has not been handled yet. Please file an issue!`);
    }
}
exports.writeFieldValue = writeFieldValue;
/** @internal */
function readRawValue(pointer, type) {
    if (pointer == undefined) {
        return;
    }
    switch (type.typeEnum) {
        case type_enum_1._Il2CppTypeEnum.VOID:
            return;
        case type_enum_1._Il2CppTypeEnum.BOOLEAN:
            return !!+pointer;
        case type_enum_1._Il2CppTypeEnum.I1:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.U1:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.I2:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.U2:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.I4:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.U4:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.CHAR:
            return +pointer;
        case type_enum_1._Il2CppTypeEnum.I8:
            return int64(pointer.toString());
        case type_enum_1._Il2CppTypeEnum.U8:
            return int64(pointer.toString());
        case type_enum_1._Il2CppTypeEnum.R4:
            return pointer.readFloat();
        case type_enum_1._Il2CppTypeEnum.R8:
            return pointer.readDouble();
        case type_enum_1._Il2CppTypeEnum.I:
        case type_enum_1._Il2CppTypeEnum.U:
        case type_enum_1._Il2CppTypeEnum.PTR:
            return pointer.isNull() ? NULL : pointer.readPointer();
        case type_enum_1._Il2CppTypeEnum.VALUETYPE:
            return type.class.isEnum ? +pointer : new value_type_1._Il2CppValueType(pointer, type.class);
        case type_enum_1._Il2CppTypeEnum.STRING:
            return pointer.isNull() ? undefined : new string_1._Il2CppString(pointer);
        case type_enum_1._Il2CppTypeEnum.CLASS:
        case type_enum_1._Il2CppTypeEnum.GENERICINST:
        case type_enum_1._Il2CppTypeEnum.OBJECT:
            return new object_1._Il2CppObject(pointer);
        case type_enum_1._Il2CppTypeEnum.SZARRAY:
            return new array_1._Il2CppArray(pointer);
        default:
            console_1.raise(`readRawValue: "${type.name}" (${type_enum_1._Il2CppTypeEnum[type.typeEnum]}) has not been handled yet. Please file an issue!`);
    }
}
exports.readRawValue = readRawValue;
/** @internal */
function allocRawValue(value, type) {
    if (!isCoherent(value, type)) {
        console_1.raise(`A "${type.name}" is required, but a "${Object.getPrototypeOf(value).constructor.name}" was supplied.`);
    }
    switch (type.typeEnum) {
        case type_enum_1._Il2CppTypeEnum.VOID:
            return NULL;
        case type_enum_1._Il2CppTypeEnum.BOOLEAN:
            return ptr(+value);
        case type_enum_1._Il2CppTypeEnum.I1:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.U1:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.I2:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.U2:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.I4:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.U4:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.CHAR:
            return ptr(value);
        case type_enum_1._Il2CppTypeEnum.I8: {
            const v = value instanceof Int64 ? value.toNumber() : value;
            return ptr(v);
        }
        case type_enum_1._Il2CppTypeEnum.U8: {
            const v = value instanceof UInt64 ? value.toNumber() : value;
            return ptr(v);
        }
        case type_enum_1._Il2CppTypeEnum.R4:
            return Memory.alloc(4).writeFloat(value);
        case type_enum_1._Il2CppTypeEnum.R8:
            return Memory.alloc(8).writeDouble(value);
        case type_enum_1._Il2CppTypeEnum.PTR:
        case type_enum_1._Il2CppTypeEnum.I:
        case type_enum_1._Il2CppTypeEnum.U:
            return value;
        case type_enum_1._Il2CppTypeEnum.VALUETYPE:
            return type.class.isEnum ? ptr(value) : value.handle;
        case type_enum_1._Il2CppTypeEnum.STRING:
            return value.handle;
        case type_enum_1._Il2CppTypeEnum.CLASS:
        case type_enum_1._Il2CppTypeEnum.OBJECT:
        case type_enum_1._Il2CppTypeEnum.GENERICINST:
            return value.handle;
        case type_enum_1._Il2CppTypeEnum.SZARRAY:
            return value.handle;
        default:
            console_1.raise(`allocRawValue: "${type.name}" (${type_enum_1._Il2CppTypeEnum[type.typeEnum]}) has not been handled yet. Please file an issue!`);
    }
}
exports.allocRawValue = allocRawValue;
/**
 * Performs a dump of the assemblies.\
 * It's implemented is pure JS (which is a lot slower than the `CModule`
 * implementation).
 * Since `QuickJS` is not mature yet (and not ready for string concatenation),
 * remember to pick `V8` instead.
 * @param filePath Where to save the dump. The caller has to
 * make sure the application has a write permission for that location.
 * If undefined, it will be automatically calculated. For instance, this will be
 * `/storage/emulated/0/Android/data/com.example.application/files/com.example.application_1.2.3.cs` on Android.
 */
function dump(filePath) {
    if (variables_1.domain == undefined) {
        console_1.raise("Not yet initialized!");
    }
    if (filePath == undefined) {
        const coreModuleName = "UnityEngine.CoreModule" in variables_1.domain.assemblies ? "UnityEngine.CoreModule" : "UnityEngine";
        const applicationMethods = variables_1.domain.assemblies[coreModuleName].image.classes["UnityEngine.Application"].methods;
        //console.log("applicationMethods:", Object.keys(applicationMethods));
        const persistentDataPath = applicationMethods.get_persistentDataPath.invoke().content;
        const getIdentifierName = "get_identifier" in applicationMethods ? "get_identifier" : "get_bundleIdentifier";
        const identifier = applicationMethods[getIdentifierName].invoke().content;
        const version = applicationMethods.get_version.invoke().content;
        filePath = `${persistentDataPath}/${identifier}_${version}.cs`;
    }
    const file = new File(filePath, "w");
    for (const assembly of variables_1.domain.assemblies) {
        console_1.inform(`Dumping ${assembly.name}...`);
        for (const klass of assembly.image.classes) {
            file.write(klass.toString());
        }
    }
    file.flush();
    file.close();
    console_1.ok(`Dump saved to ${filePath}.`);
}
exports.dump = dump;

},{"../utils/console":30,"./structs/array":9,"./structs/object":19,"./structs/string":21,"./structs/type-enum":22,"./structs/value-type":24,"./variables":26}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = exports.domain = exports.unityVersion = exports.library = void 0;
const native_wait_1 = require("../utils/native-wait");
const version_1 = require("./version");
const domain_1 = require("./structs/domain");
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
async function initialize(mainLibName, unityVerString) {
    exports.library = await native_wait_1.forModule(mainLibName);
    //unityVersion = await getUnityVersion();
    exports.unityVersion = new version_1.UnityVersion(unityVerString);
    exports.domain = await domain_1._Il2CppDomain.reference;
}
exports.initialize = initialize;
async function getUnityVersion() {
    return new version_1.UnityVersion("2018.4.13f1");
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

},{"../utils/native-wait":32,"./structs/domain":12,"./version":27}],27:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnityVersion = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const console_1 = require("../utils/console");
const matchPattern = /(20\d{2}|\d)\.(\d)\.(\d{1,2})(?:([abcfp]|rc){0,2}\d?)/;
/**
 * Represent the Unity version of the current application.
 */
class UnityVersion {
    /** @internal */
    constructor(source) {
        this.toString = () => this.source;
        /** @internal */ this.isEqual = (other) => this.compare(other) == 0;
        /** @internal */ this.isAbove = (other) => this.compare(other) == 1;
        /** @internal */ this.isBelow = (other) => this.compare(other) == -1;
        /** @internal */ this.isEqualOrAbove = (other) => this.compare(other) >= 0;
        /** @internal */ this.isEqualOrBelow = (other) => this.compare(other) <= 0;
        const matches = source.match(matchPattern);
        this.source = matches ? matches[0] : source;
        this.major = matches ? Number(matches[1]) : -1;
        this.minor = matches ? Number(matches[2]) : -1;
        this.revision = matches ? Number(matches[3]) : -1;
        if (matches == null) {
            console_1.warn(`"${source}" is not a valid Unity version.`);
        }
    }
    /**
     *  @internal
     * `true` if the current version is older than 2018.3.0.
     */
    get isLegacy() {
        return this.isBelow("2018.3.0");
    }
    /** @internal */
    compare(otherSource) {
        const other = new UnityVersion(otherSource);
        if (this.major > other.major)
            return 1;
        if (this.major < other.major)
            return -1;
        if (this.minor > other.minor)
            return 1;
        if (this.minor < other.minor)
            return -1;
        if (this.revision > other.revision)
            return 1;
        if (this.revision < other.revision)
            return -1;
        return 0;
    }
}
__decorate([
    decorator_cache_getter_1.cache
], UnityVersion.prototype, "isLegacy", null);
exports.UnityVersion = UnityVersion;

},{"../utils/console":30,"decorator-cache-getter":2}],28:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Il2Cpp = void 0;
/**
 * Every `Il2Cpp.${...}` class has a `handle` property,
 * which is its `NativePointer`.
 */
exports.Il2Cpp = __importStar(require("./il2cpp"));

},{"./il2cpp":6}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accessor = exports.filterAndMap = void 0;
const fastest_levenshtein_1 = require("fastest-levenshtein");
const console_1 = require("./console");
/** @internal */
exports.filterAndMap = Symbol();
/**
 * An iterable class with a string index signature.\
 * Upon key clashes, a suffix `_${number}`is appended to the latest key.
 * ```typescript
 * const accessor = new Accessor<string>();
 * accessor.hello = 0;
 * accessor.hello = 1; // Adding the same key!
 * accessor.hello = 2; // Adding the same key, again!
 * Object.keys(accessor); // hello, hello_1, hello_2
 * ```
 */
class Accessor {
    /** @internal */
    constructor(keyClashProtection = false) {
        return new Proxy(this, {
            set(target, key, value) {
                if (typeof key == "string") {
                    // const basename = key.replace(/^[^a-zA-Z$_]|[^a-zA-Z0-9$_]/g, "_");
                    let name = key;
                    if (keyClashProtection) {
                        let count = 0;
                        while (Reflect.has(target, name))
                            name = key + "_" + ++count;
                    }
                    Reflect.set(target, name, value);
                }
                else {
                    Reflect.set(target, key, value);
                }
                return true;
            },
            get(target, key) {
                if (typeof key != "string" || Reflect.has(target, key))
                    return Reflect.get(target, key);
                const closestMatch = fastest_levenshtein_1.closest(key, Object.keys(target));
                if (closestMatch)
                    console_1.raise(`Couldn't find property "${key}", did you mean "${closestMatch}"?`);
                else
                    console_1.raise(`Couldn't find property "${key}"`);
            }
        });
    }
    /**
     * Iterable.
     */
    *[Symbol.iterator]() {
        for (const value of Object.values(this))
            yield value;
    }
    /** @internal */
    [exports.filterAndMap](filter, map) {
        const accessor = new Accessor();
        for (const [key, value] of Object.entries(this))
            if (filter(value))
                accessor[key] = map(value);
        return accessor;
    }
}
exports.Accessor = Accessor;

},{"./console":30,"fastest-levenshtein":3}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.platformNotSupported = exports.inform = exports.warn = exports.ok = exports.raise = void 0;
const NAME = "il2cpp";
const RED = `\x1b[31m[${NAME}]\x1b[0m`;
const GREEN = `\x1b[32m[${NAME}]\x1b[0m`;
const YELLOW = `\x1b[33m[${NAME}]\x1b[0m`;
const BLUE = `\x1b[34m[${NAME}]\x1b[0m`;
const MAGENTA = `\x1b[35m[${NAME}]\x1b[0m`;
/** @internal */
function raise(message) {
    const error = new Error(message);
    error.stack = error.stack?.replace("Error:", RED);
    throw error;
}
exports.raise = raise;
/** @internal */
function ok(message) {
    console.log(GREEN + " " + message);
}
exports.ok = ok;
/** @internal */
function warn(message) {
    console.log(YELLOW + " " + message);
}
exports.warn = warn;
/** @internal */
function inform(message) {
    console.log(BLUE + " " + message);
}
exports.inform = inform;
/** @internal */
function platformNotSupported() {
    raise(`Platform "${Process.platform}" is not supported yet.`);
}
exports.platformNotSupported = platformNotSupported;

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNC = exports.createNF = void 0;
function getTypeAliasForFrida(type) {
    switch (type) {
        case "ansistring":
        case "utf8string":
        case "utf16string":
        case "cstring":
            return "pointer";
        default:
            return type;
    }
}
function refinedToRaw(value, type) {
    switch (typeof value) {
        case "boolean":
            return +value;
        case "string": {
            switch (type) {
                case "utf8string":
                    return Memory.allocUtf8String(value);
                case "utf16string":
                    return Memory.allocUtf16String(value);
                case "ansistring":
                    return Memory.allocAnsiString(value);
            }
            break;
        }
    }
    return value;
}
function rawToRefined(value, type) {
    switch (typeof value) {
        case "number":
            if (type == "bool")
                return !!value;
            break;
        case "object": {
            if (value instanceof NativePointer) {
                switch (type) {
                    case "utf8string":
                        return value.readUtf8String();
                    case "utf16string":
                        return value.readUtf16String();
                    case "ansistring":
                        return value.readAnsiString();
                    case "cstring":
                        return value.readCString();
                }
            }
            break;
        }
    }
    return value;
}
/**
 * @internal
 * Creates a `NativeFunction`.
 * @param address The function
 * @param retType The callback return type.
 * @param argTypes The callback arguments types.
 * @param options Follows Frida API.
 */
function createNF(address, retType, argTypes, options) {
    const fn = new NativeFunction(address, getTypeAliasForFrida(retType), argTypes.map(getTypeAliasForFrida), options);
    return (...args) => rawToRefined(fn(...args.map((v, i) => refinedToRaw(v, argTypes[i]))), retType);
}
exports.createNF = createNF;
/**
 * @internal
 * Creates a `NativeCallback`.
 * @param callback The function to execute.
 * @param retType The callback return type.
 * @param argTypes The callback arguments types.
 * @param abi Follows Frida API.
 */
function createNC(callback, retType, argTypes, abi) {
    const cb = (...params) => refinedToRaw(callback(...params.map((v, i) => rawToRefined(v, argTypes[i]))), retType);
    return new NativeCallback(cb, getTypeAliasForFrida(retType), argTypes.map(getTypeAliasForFrida), abi);
}
exports.createNC = createNC;

},{}],32:[function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forModule = void 0;
const decorator_cache_getter_1 = require("decorator-cache-getter");
const console_1 = require("./console");
class Target {
    constructor(responsible, name, stringEncoding) {
        this.stringEncoding = stringEncoding;
        this.address = Module.findExportByName(responsible, name) ?? NULL;
    }
    static get targets() {
        function info() {
            switch (Process.platform) {
                case "linux":
                    try {
                        const _ = Java.androidVersion;
                        return ["libdl.so", ["dlopen", "utf8"], ["android_dlopen_ext", "utf8"]];
                    }
                    catch (e) {
                        return [null, ["dlopen", "utf8"]];
                    }
                case "darwin":
                    return ["libdyld.dylib", ["dlopen", "utf8"]];
                case "windows":
                    const ll = "LoadLibrary";
                    return ["kernel32.dll", [`${ll}W`, "utf16"], [`${ll}ExW`, "utf16"], [`${ll}A`, "ansi"], [`${ll}ExA`, "ansi"]];
                case "qnx":
                default:
                    console_1.platformNotSupported();
            }
        }
        const [responsible, ...targets] = info();
        return targets.map(([name, encoding]) => new Target(responsible, name, encoding)).filter(target => !target.address.isNull());
    }
    readString(pointer) {
        switch (this.stringEncoding) {
            case "utf8":
                return pointer.readUtf8String();
            case "utf16":
                return pointer.readUtf16String();
            case "ansi":
                return pointer.readAnsiString();
        }
    }
}
__decorate([
    decorator_cache_getter_1.cache
], Target, "targets", null);
/**
 * @internal
 * It waits for a `Module` to be loaded.
 * @param moduleName The name of the target module.
 */
function forModule(moduleName) {
    return new Promise(resolve => {
        const module = Process.findModuleByName(moduleName);
        if (module) {
            resolve(module);
        }
        else {
            const interceptors = Target.targets.map(target => Interceptor.attach(target.address, {
                onEnter(args) {
                    this.modulePath = target.readString(args[0]);
                },
                onLeave(returnValue) {
                    if (returnValue.isNull() || !this.modulePath || !this.modulePath.endsWith(moduleName))
                        return;
                    setTimeout(() => interceptors.forEach(i => i.detach()));
                    resolve(Process.getModuleByName(moduleName));
                }
            }));
        }
    });
}
exports.forModule = forModule;

},{"./console":30,"decorator-cache-getter":2}]},{},[1]);
