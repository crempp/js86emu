         addr      op                inst
; start
     0   00000000  81FC0001          cmp sp,0x100
     1   00000004  7401              jz 0x7             ; jz cont
; hlt
	       00000006  F4                hlt
; cont
     2   00000007  BC0010            mov sp,0x1000
     3   0000000A  B02E              mov al,0x2e        ; mov al, '.'

     4   0000000C  BB0000            mov bx,0x0
     5   0000000F  4B                dec bx
     6   00000010  83FBFF            cmp bx,byte -0x1   ; cmp bx, 0xFFFF
     7   00000013  75F1              jnz 0x6            ; jnz hlt
     8   00000015  E85101            call 0x169         ; call printchar

    19   00000018  43                inc bx
    20   00000019  75EB              jnz 0x6            ; jnz hlt
    21   0000001B  E84B01            call 0x169         ; call printchar

    32   0000001E  31C9              xor cx,cx
    33   00000020  09CB              or bx,cx
    34   00000022  75E2              jnz 0x6            ; jnz hlt
    35   00000024  72E0              jc 0x6             ; jc hlt
    36   00000026  E84001            call 0x169         ; call printchar

    47   00000029  B90080            mov cx,0x8000
    48   0000002C  39D9              cmp cx,bx
    49   0000002E  76D6              jna 0x6            ; jbe hlt
    50   00000030  E83601            call 0x169         ; call printchar

    61   00000033  01CB              add bx,cx
    62   00000035  72CF              jc 0x6             ; jc hlt
    63   00000037  E82F01            call 0x169         ; call printchar

    74   0000003A  01DB              add bx,bx
    75   0000003C  83D100            adc cx,byte +0x0
    76   0000003F  79C5              jns 0x6            ; jns hlt
    77   00000041  72C3              jc 0x6             ; jc hlt
    78   00000043  51                push cx
    79   00000044  83E101            and cx,byte +0x1
    80   00000047  74BD              jz 0x6             ; jz hlt
    81   00000049  E81D01            call 0x169         ; call printchar

    92   0000004C  59                pop cx
    93   0000004D  F9                stc
    94   0000004E  BB0080            mov bx,0x8000
    95   00000051  19D9              sbb cx,bx
    96   00000053  75B1              jnz 0x6            ; jnz hlt
    97   00000055  72AF              jc 0x6             ; jc hlt
    98   00000057  E80F01            call 0x169         ; call printchar

   109   0000005A  E80000            call 0x5d          ; call calltest
; calltest
   110   0000005D  5B                pop bx
   111   0000005E  81FB5D00          cmp bx,0x5d        ; cmp bx, calltest
   112   00000062  75A2              jnz 0x6            ; jnz hlt
   113   00000064  81FC0010          cmp sp,0x1000
   114   00000068  759C              jnz 0x6            ; jnz hlt
   115   0000006A  E8FC00            call 0x169         ; call printchar

   126   0000006D  BB7200            mov bx,0x72        ; mov bx, rettest
   127   00000070  53                push bx
   128   00000071  C3                ret
; rettest
   129   00000072  81FC0010          cmp sp,0x1000
   130   00000076  758E              jnz 0x6            ; jnz hlt
   131   00000078  E8EE00            call 0x169         ; call printchar

   142   0000007B  90                nop
   143   0000007C  90                nop
   144   0000007D  90                nop
   145   0000007E  EB01              jmp short 0x81     ; jmp cont1
         00000080  F4                hlt

; cont1
   146   00000081  E8F800            call 0x17c         ; call printnl

   152   00000084  B8C501            mov ax,0x1c5       ; mov ax, hello
   163   00000087  E8CA00            call 0x154         ; call print
   398   0000008A  E8EF00            call 0x17c         ; call printnl

   406   0000008D  B030              mov al,0x30
; ascii_loop
   407   0000008F  E8D700            call 0x169         ; call printchr
   418   00000092  FEC0              inc al
   419   00000094  3C7F              cmp al,0x7f        ; cmp al, 127
   420   00000096  75F7              jnz 0x8f           ; jnz ascii_loop

  1513   00000098  B023              mov al,0x23        ; mov al, '#'
  1514   0000009A  C706D3019001      mov word [0x1d3],0x190 ; mov word [cursor], 80 * 5
  1515   000000A0  B150              mov cl,0x50        ; mov cl, 80

; boxloop
  1516   000000A2  E8C400            call 0x169         ; call printchar
  1527   000000A5  FEC9              dec cl
  1528   000000A7  75F9              jnz 0xa2           ; jnz boxloop
     ?   000000A9  813ED301E001      cmp word [0x1d3],0x1e0 ; cmp word [cursor], 480
     ?   000000AF  750A              jnz 0xbb           ; jnz cont2
     ?   000000B1  B150              mov cl,0x50        ; mov cl, 80
     ?   000000B3  C706D3018007      mov word [0x1d3],0x780 ; mov word [cursor], 80 * 24
     ?   000000B9  EBE7              jmp short 0xa2     ; jmp boxloop

; cont2
     ?   000000BB  C706D301E001      mov word [0x1d3],0x1e0 ; mov word [cursor] 80 * 6
     ?   000000C1  B112              mov cl,0x12        ; mov cl, 18

; boxloop2
     ?   000000C3  E8A300            call 0x169         ; call printchr
     ?   000000C6  E8A000            call 0x169         ; call printchr
     ?   000000C9  8306D3014C        add word [0x1d3],byte +0x4c ; add word [cursor], 76
     ?   000000CE  E89800            call 0x169         ; call printchr
     ?   000000D1  E89500            call 0x169         ; call printchr
     ?   000000D4  FEC9              dec cl
     ?   000000D6  75EB              jnz 0xc3           ; jnz boxloop2

     ?   000000D8  C706D3013402      mov word [0x1d3],0x234 ; mov word [cursor], 80 * 7 + 4
     ?   000000DE  31C0              xor ax,ax
     ?   000000E0  BA0100            mov dx,0x1
  4454   000000E3  B91100            mov cx,0x11        ; mov cx, 17

; fibloop
  4455   000000E6  01C2              add dx,ax
  4456   000000E8  E89F00            call 0x18a         ; call printnum
  4477   000000EB  50                push ax
  4478   000000EC  B82000            mov ax,0x20        ; mov ax, ' '
  4479   000000EF  E87700            call 0x169         ; call printchr
  4490   000000F2  58                pop ax
  4491   000000F3  92                xchg ax,dx
  4492   000000F4  49                dec cx
  4493   000000F5  75EF              jnz 0xe6           ; jnz fibloop

     -   000000F7  C706D301D402      mov word [0x1d3],0x2d4 ; mov word [cursor], 80 * 9 + 4
     -   000000FD  B90000            mov cx,0x0

; squareloop
     -   00000100  89C8              mov ax,cx
     -   00000102  E83F00            call 0x144         ; call calcsq
     -   00000105  E88200            call 0x18a         ; call printnum
     -   00000108  B82000            mov ax,0x20        ; mov ax, ' '
     -   0000010B  E85B00            call 0x169         ; call printchr
     -   0000010E  41                inc cx
     -   0000010F  83F914            cmp cx,byte +0x14  ; cmp cx, 20
     -   00000112  76EC              jna 0x100          ; jbe squareloop

  %define count 100
     -   00000114  C706D3017403      mov word [0x1d3],0x374 ; mov word [cursor], 80 * 11 + 4
     -   0000011A  BB0200            mov bx,0x2

; primeloop
     -   0000011D  808FD50100        or byte [bx+0x1d5],0x0
     -   00000122  7519              jnz 0x13d          ; jnz primecont
     -   00000124  89D8              mov ax,bx
     -   00000126  E86100            call 0x18a         ; call printnum
     -   00000129  B82000            mov ax,0x20        ; mov ax, ' '
     -   0000012C  E83A00            call 0x169         ; call printchr
     -   0000012F  89DF              mov di,bx
; primeloop_inner
     -   00000131  808DD50101        or byte [di+0x1d5],0x1 ; or byte [memory + di], 1
     -   00000136  01DF              add di,bx
     -   00000138  83FF65            cmp di,byte +0x65  ; cmp di, count + 1
     -   0000013B  76F4              jna 0x131          ; jbe primeloop_inner

; primecont
     -   0000013D  43                inc bx
     -   0000013E  83FB64            cmp bx,byte +0x64  ; cmp bx, count
     -   00000141  76DA              jna 0x11d          ; jbe primeloop

     -   00000143  F4                hlt

; calcsq:
     -   00000144  89C3              mov bx,ax
     -   00000146  31D2              xor dx,dx
     -   00000148  09DB              or bx,bx
; calcsqloop
     -   0000014A  7405              jz 0x151           ; jz calcsqfinish
     -   0000014C  01C2              add dx,ax
     -   0000014E  4B                dec bx
     -   0000014F  EBF9              jmp short 0x14a    ; jmp calcsqloop
; calcsqfinish
     -   00000151  89D0              mov ax,dx
     -   00000153  C3                ret

; print
   154   00000154  53                push bx
   155   00000155  52                push dx
   156   00000156  89C3              mov bx,ax
; printloop
   157   00000158  8A17              mov dl,[bx]
   158   0000015A  43                inc bx
   159   0000015B  86C2              xchg al,dl
   160   0000015D  E80900            call 0x169         ; printchr
   171   00000160  86C2              xchg al,dl
   172   00000162  20D2              and dl,dl
   173   00000164  75F2              jnz 0x158          ; jnz printloop
   395   00000166  5A                pop dx
   396   00000167  5B                pop bx
   397   00000168  C3                ret

; printchr
     9   00000169  53                push bx
    10   0000016A  57                push di
    11   0000016B  BB0080            mov bx,0x8000
    12   0000016E  8B3ED301          mov di,[0x1d3]     ; mov di, [cursor]
    13   00000172  8801              mov [bx+di],al
    14   00000174  47                inc di
    15   00000175  893ED301          mov [0x1d3],di     ; mov [cursor], di
    16   00000179  5F                pop di
    17   0000017A  5B                pop bx
    18   0000017B  C3                ret

; printnl
   147   0000017C  8B3ED301          mov di,[0x1d3]     ; mov di, [cursor]
; printnlloop
   148   00000180  83EF50            sub di,byte +0x50  ; sub di, 80
   149   00000183  79FB              jns 0x180          ; jns printnlloop
   150   00000185  293ED301          sub [0x1d3],di     ; sub [cursor], di
   151   00000189  C3                ret

; printnum
     -   0000018A  53                push bx
     -   0000018B  50                push ax
     -   0000018C  B330              mov bl,0x30        ; mov bl, '0'
  4499   0000018E  83F809            cmp ax,byte +0x9   ; cmp ax, 9
     -   00000191  762A              jna 0x1bd          ; jbe numcont_1digit
     -   00000193  83F863            cmp ax,byte +0x63  ; cmp ax, 99
     -   00000196  7613              jna 0x1ab          ; jbe numcont_2digit
; numloop_3digit
     -   00000198  83E864            sub ax,byte +0x64  ; sub ax, 100
     -   0000019B  FEC3              inc bl
     -   0000019D  83F863            cmp ax,byte +0x63  ; cmp ax, 99
     -   000001A0  77F6              ja 0x198           ; jnbe numloop_3digit
     -   000001A2  86D8              xchg bl,al
     -   000001A4  E8C2FF            call 0x169         ; call printchr
     -   000001A7  86D8              xchg bl,al
     -   000001A9  B330              mov bl,0x30        ; mov bl, '0'
; numloop_2digit
     -   000001AB  83F809            cmp ax,byte +0x9   ; cmp ax, 9
     -   000001AE  7606              jna 0x1b6          ; jbe numcont_2digit
     -   000001B0  83E80A            sub ax,byte +0xa   ; sub ax, 10
     -   000001B3  43                inc bx
     -   000001B4  EBF5              jmp short 0x1ab    ; jmp numloop_2digit
; numcont_2digit
     -   000001B6  86C3              xchg al,bl
     -   000001B8  E8AEFF            call 0x169         ; call printchr
     -   000001BB  88D8              mov al,bl
; numcont_1digit
  4501   000001BD  0430              add al,0x30        ; add al, '0'
     -   000001BF  E8A7FF            call 0x169         ; call printchr
     -   000001C2  58                pop ax
     -   000001C3  5B                pop bx
     -   000001C4  C3                ret

; hello
  000001C5  48 65 6C 6C 6F 2C 20 77 6F 72 6C 64 21 00
  ; db 'Hello, world!', 0

; cursor
  000001D3  00 00
  ; dw 0

; memory
  000001D5
