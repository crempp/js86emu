define([], function(){

    Blobs = [
        {
            "id"   : "codegolf",
            "name" : "SE Codegolf",
            "file" : "files/program-blobs/codegolf",
            "selected" : false,
            "address" : 0,
            "cpu-init" : {
                "type" : "8086",
                "registers" : {
                    "sp" : 256,
                    "ip" : 0
                }
            }
        },
        {
            "id"   : "branch",
            "name" : "Branch Test",
            "file" : "files/program-blobs/branch.BIN",
            "selected" : true,
            "address" : 0,
            "cpu-init" : {
                "type" : "8086",
                "registers" : {
                    "sp" : 256,
                    "ip" : 0
                }
            }
        },
        {
            "id"   : "addressing",
            "name" : "Addressing Test",
            "file" : "files/program-blobs/testea.BIN",
            "selected" : false,
            "address" : 0,
            "cpu-init" : {
                "type" : "8086",
                "registers" : {
                    "sp" : 256,
                    "ip" : 0
                }
            }
        }
    ];

    return Blobs;
});