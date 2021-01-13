; testea.asm - A program to test the Intel 8086 CPU's
; various addressing mode calculations. Designed to
; verify correct functionality of my 8086 PC emulator, Fake86.

.code

org 100h

;cli
push cs
pop ds

mov si, offset banner
call printmsg
;call printmsg

mov ax, 0F000h   ; 1179
mov es, ax       ; 1180
jmp loopmain

disptest dw 1234h

loopmain:       ; 1181
mov cx, oper1
add cx, oper2

mov bx, oper1
mov si, oper2
lea ax, [bx+si]
cmp ax, cx
jz bxdi
mov si, offset strfailbxsi
call printmsg

bxdi:
mov bx, oper1
mov di, oper2
lea ax, [bx+di]
cmp ax, cx
jz bpsi
mov si, offset strfailbxdi
call printmsg

bpsi:
mov bp, oper1
mov si, oper2
lea ax, [bp+si]
cmp ax, cx
jz bpdi
mov si, offset strfailbpsi
call printmsg

bpdi:
mov bp, oper1
mov di, oper2
lea ax, [bp+di]
cmp ax, cx
jz testsi
mov si, offset strfailbpdi
call printmsg

testsi:
mov si, oper1
lea ax, [si]
cmp ax, oper1
jz testdi
mov si, offset strfailsi
call printmsg

testdi:
mov di, oper1
lea ax, [di]
cmp ax, oper1
jz testbx
mov si, offset strfaildi
call printmsg

testbx:
mov bx, oper1
lea ax, [bx]
cmp ax, oper1
jz disp16
mov si, offset strfailbx
call printmsg

disp16:
mov bx, oper1
lea ax, [bx+8000h]
add bx, 8000h
cmp ax, bx
jz disp8
mov si, offset strfaildisp16
call printmsg

disp8:
mov bx, oper1
db 8Dh, 01000111b, 80h ;lea ax, [bx+80h]
add bx, 0FF80h
cmp ax, bx
jz nexttest
mov si, offset strfaildisp8
call printmsg

nexttest:
add oper2, 80h
cmp oper2, 0
jnz loopmain
mov si, offset dot
call printmsg
add oper1, 80h
cmp oper1, 0h
jnz loopmain

mov si, offset strgood
call printmsg



finished:
ret

pass:
mov si, offset strgood
call printmsg
ret

fail:
mov si, offset strfail
call printmsg
jmp finished

printmsg:
mov ah, 0Eh
cld
lodsb
cmp al, 0
jz done
int 10h
jmp printmsg
done:
ret

banner   db '8086 CPU effective address calculation test utility',13,10
         db 'Written on 3/4/2011 by Mike Chambers',13,10,13,10
         db 'Testing EA calcs, this may take several minutes.',13,10
         db 'Testing addressing modes', 0

strgood  db 'passed!',13,10,0
strfail  db 'FAILED!',13,10,0     
dot      db '.',0

strfailbxsi   db 'failure in [BX+SI]',13,10,0
strfailbxdi   db 'failure in [BX+DI]',13,10,0
strfailbpsi   db 'failure in [BP+SI]',13,10,0
strfailbpdi   db 'failure in [BP+DI]',13,10,0
strfailsi     db 'failure in [SI]',13,10,0
strfaildi     db 'failure in [DI]',13,10,0
strfaildisp16 db 'failure in [BX+Disp16]',13,10,0
strfaildisp8  db 'failure in [BX+Disp8]',13,10,0
strfailbx     db 'failure in [BX]',13,10,0

oper1 dw 0
oper2 dw 0
disp  dw 0

end
