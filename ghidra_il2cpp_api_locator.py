#TODO write a description for this script
#@author 
#@category Examples.Python
#@keybinding 
#@menupath 
#@toolbar 


#TODO Add User Code Here

from ghidra.program.util import *
from ghidra.program.model.symbol import *
from ghidra.program.model.listing import *
from ghidra.util.task import *


def search_defined_string(str):
    defStrings = DefinedDataIterator.definedStrings(currentProgram);
    while defStrings.hasNext():
        curr = defStrings.next()
        if curr.getValue() == str:
            return curr
        
def search_instruct_combine(start_addr, instructs, search_count, direction):
    listing = currentProgram.getListing()
    forward = direction == "down"
    current = listing.getCodeUnits(start_addr, forward)
    count = 0
    while current.hasNext():
        code = current.next()
        # print code.getMnemonicString()
        count = count + 1
        if count > search_count + 1:
            break
        
        if code.getMnemonicString() == instructs[0]:
            # search combine
            ok = True
            p = listing.getCodeUnits(code.getAddress(), True)
            # print '----'
            for i in range(0, len(instructs)):
                if p.hasNext():
                    n = p.next()
                    # print n.getMnemonicString()
                    if n.getMnemonicString() != instructs[i]:
                        ok = False
                        break
            # print '----'
            if ok:
                #  print 'combine found! at %s' % (code.getAddress())
                return code.getAddress()
            
            
def search_insturct(start_addr, instructs, count, search_count, direction):
    listing = currentProgram.getListing()
    forward = direction == "down"
    current = listing.getCodeUnits(start_addr, forward)
    found_count = 0
    n = 0
    while current.hasNext():
        code = current.next()
        # print code.getMnemonicString()
        n = n + 1
        if n > search_count:
            break
        
        if code.getMnemonicString() == instructs:
            found_count = found_count + 1
            if found_count == count:
                # print found_count
                return code.getAddress()
    
            
def locate_s_Assemblies():
    str = search_defined_string('.exe')
    if not str:
        print 'not found .exe'
        return
    
    # print '.exe string at %s' % str.getAddress()
    
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print '.exe reference from %s' % ref
        
        address = search_instruct_combine(ref.getFromAddress(), ["adrp", "add", "ldr"], 30, "up")
        if not address:
            print 'not found instruction combine'
            return
        
        '''
            1005acc58 95 3d 00 d0     adrp       x21,0x100d5e000
            1005acc5c b5 42 3a 91     add        x21,x21,#0xe90  // x21 is s_Assemblies
            1005acc60 b6 02 40 f9     ldr        x22,[x21]=>il2cpp::vm::s_Assemblies              = ??
        '''
        listing = currentProgram.getListing()
        adrp = listing.getCodeUnitAt(address)
        return adrp.getScalar(1).getValue() + adrp.next.getScalar(2).getValue()
        

def locate_il2cpp_image_get_class_count():
    str = search_defined_string('<Module>')
    if not str:
        print 'not found <Module>'
        return
    
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print '<Module> reference from %s' % ref
        
        address = search_instruct_combine(ref.getFromAddress(), ["ldr", "cbz", "mov"], 30, "up")
        if not address:
            print 'not found instruction combine'
            return
        
        '''
                   1005c11fc 97 1e 40 b9     ldr        w23,[x20, #0x1c]   //0x1c is the Image::GetNumType() -> image->typeCount offset
                   1005c1200 77 03 00 34     cbz        w23,LAB_1005c126c
                   1005c1204 18 00 80 d2     mov        x24,#0x0
        '''
        listing = currentProgram.getListing()
        adrp = listing.getCodeUnitAt(address)
        
        return adrp.getInputObjects()[1].getValue()
    

def locate_il2cpp_image_get_class():
    str = search_defined_string('<Module>')
    if not str:
        print 'not found <Module>'
        return
    
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print '<Module> reference from %s' % ref
        
        address = search_instruct_combine(ref.getFromAddress(), ["bl"], 10, "up")
        if not address:
            print 'not found instruction combine'
            return
        
        '''
                    1005c1218 2b 37 00 94     bl         0x1005ceec4 // *
                    1005c121c f6 03 00 aa     mov        x22,param_1
        '''
        listing = currentProgram.getListing()
        bl = listing.getCodeUnitAt(address)
        get_class = bl.getOpObjects(0)[0].getOffset()
        
        address = search_instruct_combine(ref.getFromAddress(), ["ldr", "add"], 10, "up")
        if not address:
            print 'not found instruction combine'
            return
        
        '''
           1005c1210 88 1a 40 b9     ldr        w8,[x20, #0x18] // 0x18 is MetaData->typeStart
           1005c1214 00 03 08 0b     add        param_1,w24,w8
        '''
        ldr = listing.getCodeUnitAt(address)
        return get_class, ldr.getInputObjects()[1].getValue()
    

def locate_il2cpp_class_get_interfaces():
    memory = currentProgram.getMemory()
    addr = memory.findBytes(memory.getMinAddress(), b"\x88\x56\x40\xf9\x68\x02\x00\xf9\x88\x56\x40\xf9", b"\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff", True, TaskMonitor.DUMMY)
    if not addr:
        print 'memory not found'
        return
    
    func = currentProgram.getListing().getFunctionContaining(addr)
    return func.getEntryPoint().getOffset()
        

def locate_il2cpp_field_static_get_value():
    memory = currentProgram.getMemory()
    addr = memory.findBytes(memory.getMinAddress(), b"\x88\x0a\x40\xf9\x15\x05\x41\xb9", b"\xff\xff\xff\xff\xff\xff\xff\xff", True, TaskMonitor.DUMMY)
    if not addr:
        print 'memory not found'
        return
    
    func = currentProgram.getListing().getFunctionContaining(addr)
    return func.getEntryPoint().getOffset()


def locate_il2cpp_domain_get():
    str = find("System.Runtime.Remoting.Contexts")
    if not str:
        print "str not found"
        return

    listing = currentProgram.getListing()
    refs = listing.getCodeUnitAt(str).getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        
        funcs = listing.getFunctions(ref.getFromAddress(), False)
        funcs.hasNext()
        funcs.next()
        funcs.hasNext()
        func = funcs.next()
        
        return func.getEntryPoint().getOffset()
        
        
def locate_il2cpp_thread_attach():
    memory = currentProgram.getMemory()
    addr = memory.findBytes(memory.getMinAddress(), b"\x1f\x08\x00\x71\xe0\x27\x9f\x1a\xbf\x43\x00\xd1", b"\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff", True, TaskMonitor.DUMMY)
    if not addr:
        print 'memory not found'
        return
    
    listing = currentProgram.getListing()
    register_thread_func = listing.getFunctionContaining(addr)
    refs = listing.getCodeUnitAt(register_thread_func.getEntryPoint()).getReferenceIteratorTo();
    while refs.hasNext():
        ref = refs.next()
        # print ref
        
        if search_instruct_combine(ref.getFromAddress(), ["cbnz", "str", "add"], 5, "up"):
            thread_attach = listing.getFunctionContaining(ref.getFromAddress())
            return thread_attach.getEntryPoint().getOffset()
        
        
def locate_il2cpp_class_get_type():
    str = search_defined_string("The type initializer for '%s' threw an exception.")
    if not str:
        print 'not found <Module>'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_insturct(ref.getFromAddress(), "bl", 2, 20, "up")
        
        code = currentProgram.getListing().getCodeUnitAt(addr)
        return code.getOpObjects(0)[0].getOffset()


def locate_il2cpp_type_get_name():
    str = search_defined_string("The type initializer for '%s' threw an exception.")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_insturct(ref.getFromAddress(), "bl", 1, 20, "up")
        
        listing = currentProgram.getListing()
        get_name_func_addr = listing.getCodeUnitAt(addr).getOpObjects(0)[0]
        
        # print "Type::GetName at %s" % get_name_func_addr
        
        refs = listing.getCodeUnitAt(get_name_func_addr).getReferenceIteratorTo()
        while refs.hasNext():
            ref = refs.next()
            # print ref
            
            if search_instruct_combine(ref.getFromAddress(), ["sub", "add", "add", "mov"], 8, "up"):
                func = listing.getFunctionContaining(ref.getFromAddress())
                return func.getEntryPoint().getOffset()


def locate_il2cpp_class_is_enum():
    str = search_defined_string("At least one element in the source array could not be cast down to the destination array type.")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_insturct(ref.getFromAddress(), "bl", 6, 30, "up")
        
        code = currentProgram.getListing().getCodeUnitAt(addr)
        return code.getOpObjects(0)[0].getOffset()
    
    
def locate_il2cpp_class_is_valuetype():
    str = search_defined_string("At least one element in the source array could not be cast down to the destination array type.")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_insturct(ref.getFromAddress(), "bl", 7, 35, "up")
        
        code = currentProgram.getListing().getCodeUnitAt(addr)
        return code.getOpObjects(0)[0].getOffset()
    

def locate_il2cpp_class_is_interface():
    memory = currentProgram.getMemory()
    addr = None
    while True:
        if addr:
            start_addr = addr.add(12)
        else:
            start_addr = memory.getMinAddress()
        addr = memory.findBytes(start_addr, b"\x1f\x4d\x00\x71\xe9\x17\x9f\x1a\x1f\x79\x00\x71", b"\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff", True, TaskMonitor.DUMMY)
        if not addr:
            print 'memory not found'
            return
    
        # print addr
        
        if search_instruct_combine(addr, ["ldrb"], 1, "up"):
            func = currentProgram.getListing().getFunctionContaining(addr)
            return func.getEntryPoint().getOffset()
        
        
def locate_il2cpp_class_get_parent():
    memory = currentProgram.getMemory()
    addr = None
    while True:
        if addr:
            start_addr = addr.add(12)
        else:
            start_addr = memory.getMinAddress()
        addr = memory.findBytes(start_addr, b"\x08\x1d\x10\x12\x1f\x41\x47\x71", b"\xff\xff\xff\xff\xff\xff\xff\xff", True, TaskMonitor.DUMMY)
        if not addr:
            print 'memory not found'
            return
    
        # print addr
        
        if search_instruct_combine(addr, ["stp", "str", "ldr"], 5, "up"):
            bl = search_insturct(addr, "bl", 1, 10, "up")
            code = currentProgram.getListing().getCodeUnitAt(bl)
            return code.getOpObjects(0)[0].getOffset()


def locate_il2cpp_class_get_fields():
    str = search_defined_string("value__")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_instruct_combine(ref.getFromAddress(), ["bl", "mov", "cbz"], 70, "up")
        
        code = currentProgram.getListing().getCodeUnitAt(addr)
        return code.getOpObjects(0)[0].getOffset()
    

def locate_il2cpp_class_get_methods():
    str = search_defined_string("InternalArray__")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_instruct_combine(ref.getFromAddress(), ["bl", "mov", "cbz"], 20, "up")
        
        code = currentProgram.getListing().getCodeUnitAt(addr)
        return code.getOpObjects(0)[0].getOffset()
    

def locate_il2cpp_method_get_name():
    str = search_defined_string("Attempt to access method '")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    if refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_insturct(ref.getFromAddress(), "bl", 3, 30, "down")
        
        code = currentProgram.getListing().getCodeUnitAt(addr)
        return code.getOpObjects(0)[0].getOffset()
    
    
def locate_il2cpp_method_is_instance():
    memory = currentProgram.getMemory()
    addr = None
    while True:
        if addr:
            start_addr = addr.add(12)
        else:
            start_addr = memory.getMinAddress()
        addr = memory.findBytes(start_addr, b"\x1f\x01\x1c\x72\xe0\x17\x9f\x1a\xc0\x03\x5f\xd6", b"\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff\xff", True, TaskMonitor.DUMMY)
        if not addr:
            print 'memory not found'
            return
    
        # print addr
        
        addr = search_instruct_combine(addr, ["ret", "ldrb"], 2, "up")
        if addr:
            return addr.add(4).getOffset()


def locate_il2cpp_class_from_type():
    str = search_defined_string("Type must be a type provided by the runtime.")
    if not str:
        print 'not found str'
        return

    # print str
    refs = str.getReferenceIteratorTo()
    while refs.hasNext():
        ref = refs.next()
        # print ref
        addr = search_instruct_combine(ref.getFromAddress(), ["bl", "bl"], 30, "up")
        
        if addr:
            code = currentProgram.getListing().getCodeUnitAt(addr)
            return code.getOpObjects(0)[0].getOffset()


base = 0x100000000
s_Assemblies = locate_s_Assemblies()
print 'public static offset_s_assemblies = 0x%x' % (s_Assemblies - base)

il2cpp_image_get_class_count = locate_il2cpp_image_get_class_count()
print 'public static offset_il2cpp_image_get_class_count = 0x%x' % il2cpp_image_get_class_count

il2cpp_image_get_class, metadata_typestart = locate_il2cpp_image_get_class()
print 'public static offset_il2cpp_image_get_class = 0x%x' % (il2cpp_image_get_class - base)
print 'public static offset_metadata_typestart = 0x%x' % metadata_typestart

il2cpp_class_get_interfaces = locate_il2cpp_class_get_interfaces()
print 'public static offset_il2cpp_class_get_interfaces = 0x%x' % (il2cpp_class_get_interfaces - base)

il2cpp_field_static_get_value = locate_il2cpp_field_static_get_value()
print 'public static offset_il2cpp_field_static_get_value = 0x%x' % (il2cpp_field_static_get_value - base)

il2cpp_domain_get = locate_il2cpp_domain_get()
print 'public static offset_il2cpp_domain_get = 0x%x' % (il2cpp_domain_get - base)
       
il2cpp_thread_attach = locate_il2cpp_thread_attach()
print 'public static offset_il2cpp_thread_attach = 0x%x' % (il2cpp_thread_attach - base)


il2cpp_class_get_type = locate_il2cpp_class_get_type()
print 'public static offset_il2cpp_class_get_type = 0x%x' % (il2cpp_class_get_type - base)

il2cpp_type_get_name = locate_il2cpp_type_get_name()
print 'public static offset_il2cpp_type_get_name = 0x%x' % (il2cpp_type_get_name - base)

il2cpp_class_is_enum = locate_il2cpp_class_is_enum();
print 'public static offset_il2cpp_class_is_enum = 0x%x' % (il2cpp_class_is_enum - base)

il2cpp_class_is_valuetype = locate_il2cpp_class_is_valuetype();
print 'public static offset_il2cpp_class_is_valuetype = 0x%x' % (il2cpp_class_is_valuetype - base)

il2cpp_class_is_interface = locate_il2cpp_class_is_interface()
print 'public static offset_il2cpp_class_is_interface = 0x%x' % (il2cpp_class_is_interface - base)

il2cpp_class_get_parent = locate_il2cpp_class_get_parent()
print 'public static offset_il2cpp_class_get_parent = 0x%x' % (il2cpp_class_get_parent - base)

il2cpp_class_get_fields = locate_il2cpp_class_get_fields()
print 'public static offset_il2cpp_class_get_fields = 0x%x' % (il2cpp_class_get_fields - base)

il2cpp_class_get_methods = locate_il2cpp_class_get_methods()
print 'public static offset_il2cpp_class_get_methods = 0x%x' % (il2cpp_class_get_methods - base)

il2cpp_method_get_name = locate_il2cpp_method_get_name()
print 'public static offset_il2cpp_method_get_name = 0x%x' % (il2cpp_method_get_name - base)

il2cpp_method_is_instance = locate_il2cpp_method_is_instance()
print 'public static offset_il2cpp_method_is_instance = 0x%x' % (il2cpp_method_is_instance - base)

il2cpp_class_from_type = locate_il2cpp_class_from_type()
print 'public static offset_il2cpp_class_from_type = 0x%x' % (il2cpp_class_from_type - base)

