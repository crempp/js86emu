define([], function(){

    Components = {
        "cpu"    : [
            {
                "id"          : "8086",
                "name"        : "8086/8088",
                "module"      : "cpus/8086",
                "description" : 'The 8086 ("eighty-eighty-six", also called iAPX 86) is a 16-bit microprocessor chip designed by Intel between early 1976 and mid-1978, when it was released. The Intel 8088, released in 1979, was a slightly modified chip with an external 8-bit data bus (allowing the use of cheaper and fewer supporting ICs[note 1]), and is notable as the processor used in the original IBM PC design, including the widespread version called IBM PC XT.',
                "link"        : "http://en.wikipedia.org/wiki/Intel_8086",
                "status"      : ""
            },
            {
                "id"   : "186",
                "name" : "186",
                "module" : "cpus/186"
            },
            {
                "id"   : "286",
                "name" : "286",
                "module" : "cpus/286"
            },
            {
                "id"   : "386",
                "name" : "386",
                "module" : "cpus/386"
            },
            {
                "id"   : "486",
                "name" : "486",
                "module" : "cpus/486"
            }
        ],
        "bios"   : [],
        "hd"     : [],
        "floppy" : [],
        "gfx"    : [
            {
                "id"   : "mda",
                "name" : "MDA (Monochrome Display Adapter)",
                "module" : "gfx/mda"
            },
            {
                "id"   : "cga",
                "name" : "CGA (Color Graphics Adapter)",
                "module" : "gfx/cga"
            },
            {
                "id"   : "ega",
                "name" : "EGA (Enhanced Graphics Adapter)",
                "module" : "gfx/ega"
            },
            {
                "id"   : "vga",
                "name" : "VGA (Video Graphics Array)",
                "module" : "gfx/vga"
            }
        ],
        "input"  : []
    };

    return Components;
});