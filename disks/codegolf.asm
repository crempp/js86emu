
start:
	cmp sp, 100h
	jz cont

hlt:
	hlt

cont:
	mov sp, 1000h
	mov al, '.'

	mov bx, 0
	dec bx
	cmp bx, 0ffffh
	jnz hlt
	call printchr

	inc bx
	jnz hlt
	call printchr

	xor cx, cx
	or bx, cx
	jnz hlt
	jc hlt
	call printchr

	mov cx, 08000h
	cmp cx, bx
	jbe hlt
	call printchr

	add bx, cx
	jc hlt
	call printchr

	add bx, bx
	adc cx, 0
	jns hlt
	jc hlt
	push cx
	and cx, 1
	jz hlt
	call printchr

	pop cx
	stc
	mov bx, 08000h
	sbb cx, bx
	jnz hlt
	jc hlt
	call printchr
	
	call calltest
calltest:
	pop bx
	cmp bx, calltest
	jnz hlt
	cmp sp, 1000h
	jnz hlt
	call printchr

	mov bx, rettest
	push bx
	ret
rettest:
	cmp sp, 1000h
	jnz hlt
	call printchr

	nop
	nop
	nop
	jmp cont1
	hlt

cont1:
	call printnl

	mov ax, hello
	call print
	call printnl


	mov al, 30h
ascii_loop:
	call printchr
	inc al
	cmp al, 127
	jnz ascii_loop


	mov al, '#'
	mov word [cursor], 80 * 5
	mov cl, 80

boxloop:
	call printchr
	dec cl
	jnz boxloop
	cmp word [cursor], 480
	jnz cont2
	mov cl, 80
	mov word [cursor], 80 * 24
	jmp boxloop

cont2:

	mov word [cursor], 80 * 6
	mov cl, 18
	
boxloop2:
	call printchr
	call printchr
	add word [cursor], 76
	call printchr
	call printchr
	dec cl
	jnz boxloop2


	mov word [cursor], 80 * 7 + 4
	xor ax, ax
	mov dx, 1
	mov cx, 17

fibloop:
	add dx, ax
	call printnum
	push ax
	mov ax, ' '
	call printchr
	pop ax
	xchg ax, dx
	dec cx
	jnz fibloop


	mov word [cursor], 80 * 9 + 4
	mov cx, 0

squareloop:
	mov ax, cx
	call calcsq
	call printnum
	mov ax, ' '
	call printchr
	inc cx
	cmp cx, 20
	jbe squareloop
	


	%define count 100
	mov word [cursor], 80 * 11 + 4
	mov bx, 2

primeloop:
	or byte [memory + bx], 0
	jnz primecont
	mov ax, bx
	call printnum
	mov ax, ' '
	call printchr
	mov di, bx
primeloop_inner:
	or byte [memory + di], 1
	add di, bx
	cmp di, count + 1
	jbe primeloop_inner

primecont:
	inc bx
	cmp bx, count
	jbe primeloop


	hlt


calcsq:
	mov bx, ax
	xor dx, dx
	or bx, bx
calcsqloop:
	jz calcsqfinish
	add dx, ax
	dec bx
	jmp calcsqloop
calcsqfinish:
	mov ax, dx
	ret


print:
	push bx
	push dx
	mov bx, ax
printloop:
	mov dl, [bx]
	inc bx
	xchg al, dl
	call printchr
	xchg al, dl
	and dl, dl
	jnz printloop
	pop dx
	pop bx
	ret

printchr:
	push bx
	push di
	mov bx, 8000h
	mov di, [cursor]
	mov [bx+di], al
	inc di
	mov [cursor], di
	pop di
	pop bx
	ret

printnl:
	mov di, [cursor]
printnlloop:
	sub di, 80
	jns printnlloop
	sub [cursor], di
	ret

printnum:
	push bx
	push ax
	mov bl, '0'
	cmp ax, 9
	jbe numcont_1digit
	cmp ax, 99
	jbe numloop_2digit
numloop_3digit:
	sub ax, 100
	inc bl
	cmp ax, 99
	jnbe numloop_3digit
	xchg bl, al
	call printchr
	xchg bl, al
	mov bl, '0'
numloop_2digit:
	cmp ax, 9
	jbe numcont_2digit
	sub ax, 10
	inc bx
	jmp numloop_2digit
numcont_2digit:
	xchg al, bl
	call printchr
	mov al, bl
numcont_1digit:
	add al, '0'
	call printchr
	pop ax
	pop bx
	ret

	

hello:
	db 'Hello, world!', 0

cursor:
	dw 0

memory:

