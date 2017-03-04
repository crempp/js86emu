export default {
  "cpu"    : [
    {
      "id"   : "cpu-8086",
      "name" : "8086/8088",
      "module" : "cpus/8086",
      "description": 'The 8086 ("eighty-eighty-six", also called iAPX 86) is a 16-bit microprocessor chip designed by Intel between early 1976 and mid-1978, when it was released. The Intel 8088, released in 1979, was a slightly modified chip with an external 8-bit data bus (allowing the use of cheaper and fewer supporting ICs[note 1]), and is notable as the processor used in the original IBM PC design, including the widespread version called IBM PC XT.',
      "link": "http://en.wikipedia.org/wiki/Intel_8086",
      "status": ""
    },
    {
      "id"   : "cpu-186",
      "name" : "186",
      "module" : "cpus/186"
    },
    {
      "id"   : "cpu-286",
      "name" : "286",
      "module" : "cpus/286"
    },
    {
      "id"   : "cpu-386",
      "name" : "386",
      "module" : "cpus/386"
    },
    {
      "id"   : "cpu-486",
      "name" : "486",
      "module" : "cpus/486"
    }
  ],
    "bios"   : [
      {
        "id"   : "bios-8086tiny",
        "name" : "8086tiny BIOS",
        "file" : "8086tiny_bios",
        "src"  : "https://github.com/adriancable/8086tiny",
        "type" : "system"
      },

      {
        "id"   : "bios-xtbios",
        "name" : "Super PC/Turbo XT BIOS",
        "file" : "xtbios.bin",
        "src"  : "http://www.phatcode.net/downloads.php?id=101",
        "type" : "system"
      },
      {
        "id"   : "bios-et4000",
        "name" : "TsengLabs International ET4000 BIOS",
        "file" : "et4000.bin",
        "src"  : "?",
        "type" : "gfx"
      },
      {
        "id"   : "bios-asciicga",
        "name" : "",
        "file" : "asciicga.dat",
        "src"  : "?",
        "type" : "gfx"
      },
      {
        "id"   : "bios-asciivga",
        "name" : "",
        "file" : "asciivga.dat",
        "src"  : "?",
        "type" : "gfx"
      }
    ],
    "hd"     : [],
    "floppy" : [],
    "gfx"    : [
    {
      "id"   : "gfx-mda",
      "name" : "MDA (Monochrome Display Adapter)",
      "module" : "gfx/mda"
    },
    {
      "id"   : "gfx-cga",
      "name" : "CGA (Color Graphics Adapter)",
      "module" : "gfx/cga"
    },
    {
      "id"   : "gfx-ega",
      "name" : "EGA (Enhanced Graphics Adapter)",
      "module" : "gfx/ega"
    },
    {
      "id"   : "gfx-vga",
      "name" : "VGA (Video Graphics Array)",
      "module" : "gfx/vga"
    }
  ],
  "input"  : []
}