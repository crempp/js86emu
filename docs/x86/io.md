asdf

* The 8086/8088 I/O space can accommodate up to 64k 8-bit ports or up to 32k 
  16-bit ports.
* F8H through FFH (eight of the 64k locations) in the 1/0 space are reserved
* 8086 can transfer either 8 or 16 bits at a time
* A 16-bit device should be located at an even address
* An 8-bit device may be located at odd or even addresses in the 8088
* If a 16-bit device is used in the 8088 I/O space, it must be capable of transferring words eight bits at a time in two bus cycles.
* make mem-mapped a config option for the system

