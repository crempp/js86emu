import winston from 'winston';

export default class Operations {
  constructor(cpu) {
    this.cpu = cpu;
  }

  aaa (dst, src) {
    winston.log("debug", "operations - aaa(dst:" + dst.name + ", src:" + src.name + ")");
  }
  aad (dst, src) {
    winston.log("debug", "operations - aad(dst:" + dst.name + ", src:" + src.name + ")");
  }
  aam (dst, src) {
    winston.log("debug", "operations - aam(dst:" + dst.name + ", src:" + src.name + ")");
  }
  aas (dst, src) {
    winston.log("debug", "operations - aas(dst:" + dst.name + ", src:" + src.name + ")");
  }
  adc (dst, src) {
    winston.log("debug", "operations - adc(dst:" + dst.name + ", src:" + src.name + ")");
  }
  add (dst, src) {
    winston.log("debug", "operations - add(dst:" + dst.name + ", src:" + src.name + ")");
    let val = dst() + src();
    // console.log(val);
    dst(val);
    //dst.equal(dst() + src())
  };
  and (dst, src) {
    winston.log("debug", "operations - and(dst:" + dst.name + ", src:" + src.name + ")");
  }
  call (dst, src) {
    winston.log("debug", "operations - call(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cbw (dst, src) {
    winston.log("debug", "operations - cbw(dst:" + dst.name + ", src:" + src.name + ")");
  }
  clc (dst, src) {
    winston.log("debug", "operations - clc(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cld (dst, src) {
    winston.log("debug", "operations - cld(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cli (dst, src) {
    winston.log("debug", "operations - cli(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cmc (dst, src) {
    winston.log("debug", "operations - cmc(dst:" + dst.name + ", src:" + src.name + ")");
  }

  /**
   * CMP (Compare) subtracts the source from the destination, which may be bytes
   * or words, but does not return the result. The operands are unchanged but
   * the flags are updated and can be tested by a subsequent conditional jump
   * instruction. CMP updates AF, CF, OF, PF, SF, and ZF. The comparison
   * reflected in the flags is that of the destination to the source. If a CMP
   * instruction is followed by a JG (jump if greater) instruction, for
   * example, the jump is taken if the destination operand is greater than the
   * source operand.
   *   - [1] p.2-36
   *
   * @param dst
   * @param src
   */
  cmp (dst, src) {
    winston.log("debug", "operations - cmp(dst:" + dst.name + ", src:" + src.name + ")");
    let result = dst() - src();
    console.log("cmp result: " + result);

    // set flags
  }
  cmpsb (dst, src) {
    winston.log("debug", "operations - cmpsb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cmpsw (dst, src) {
    winston.log("debug", "operations - cmpsw(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cs (dst, src) {
    winston.log("debug", "operations - cs(dst:" + dst.name + ", src:" + src.name + ")");
  }
  cwd (dst, src) {
    winston.log("debug", "operations - cwd(dst:" + dst.name + ", src:" + src.name + ")");
  }
  daa (dst, src) {
    winston.log("debug", "operations - daa(dst:" + dst.name + ", src:" + src.name + ")");
  }
  das (dst, src) {
    winston.log("debug", "operations - das(dst:" + dst.name + ", src:" + src.name + ")");
  }
  dec (dst, src) {
    winston.log("debug", "operations - dec(dst:" + dst.name + ", src:" + src.name + ")");
  }
  div (dst, src) {
    winston.log("debug", "operations - div(dst:" + dst.name + ", src:" + src.name + ")");
  }
  ds (dst, src) {
    winston.log("debug", "operations - ds(dst:" + dst.name + ", src:" + src.name + ")");
  }
  es (dst, src) {
    winston.log("debug", "operations - es(dst:" + dst.name + ", src:" + src.name + ")");
  }
  hlt (dst, src) {
    winston.log("debug", "operations - hlt(dst:" + dst.name + ", src:" + src.name + ")");
  }
  idiv (dst, src) {
    winston.log("debug", "operations - idiv(dst:" + dst.name + ", src:" + src.name + ")");
  }
  imul (dst, src) {
    winston.log("debug", "operations - imul(dst:" + dst.name + ", src:" + src.name + ")");
  }
  in (dst, src) {
    winston.log("debug", "operations - in(dst:" + dst.name + ", src:" + src.name + ")");
  }
  iin (dst, src) {
    winston.log("debug", "operations - iin(dst:" + dst.name + ", src:" + src.name + ")");
  }
  inc (dst, src) {
    winston.log("debug", "operations - inc(dst:" + dst.name + ", src:" + src.name + ")");
  }
  int (dst, src) {
    winston.log("debug", "operations - int(dst:" + dst.name + ", src:" + src.name + ")");
  }
  into (dst, src) {
    winston.log("debug", "operations - into(dst:" + dst.name + ", src:" + src.name + ")");
  }
  iret (dst, src) {
    winston.log("debug", "operations - iret(dst:" + dst.name + ", src:" + src.name + ")");
  }
  ja (dst, src) {
    winston.log("debug", "operations - ja(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jb (dst, src) {
    winston.log("debug", "operations - jb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jbe (dst, src) {
    winston.log("debug", "operations - jbe(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jcxz (dst, src) {
    winston.log("debug", "operations - jcxz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jg (dst, src) {
    winston.log("debug", "operations - jg(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jge (dst, src) {
    winston.log("debug", "operations - jge(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jl (dst, src) {
    winston.log("debug", "operations - jl(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jle (dst, src) {
    winston.log("debug", "operations - jle(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jmp (dst, src) {
    winston.log("debug", "operations - jmp(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jnb (dst, src) {
    winston.log("debug", "operations - jnb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jno (dst, src) {
    winston.log("debug", "operations - jno(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jns (dst, src) {
    winston.log("debug", "operations - jns(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jnz (dst, src) {
    winston.log("debug", "operations - jnz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jo (dst, src) {
    winston.log("debug", "operations - jo(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jpe (dst, src) {
    winston.log("debug", "operations - jpe(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jpo (dst, src) {
    winston.log("debug", "operations - jpo(dst:" + dst.name + ", src:" + src.name + ")");
  }
  js (dst, src) {
    winston.log("debug", "operations - js(dst:" + dst.name + ", src:" + src.name + ")");
  }
  jz (dst, src) {
    winston.log("debug", "operations - jz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  lahf (dst, src) {
    winston.log("debug", "operations - lahf(dst:" + dst.name + ", src:" + src.name + ")");
  }
  lds (dst, src) {
    winston.log("debug", "operations - lds(dst:" + dst.name + ", src:" + src.name + ")");
  }
  lea (dst, src) {
    winston.log("debug", "operations - lea(dst:" + dst.name + ", src:" + src.name + ")");
  }
  les (dst, src) {
    winston.log("debug", "operations - les(dst:" + dst.name + ", src:" + src.name + ")");
  }
  lock (dst, src) {
    winston.log("debug", "operations - lock(dst:" + dst.name + ", src:" + src.name + ")");
  }
  lodsb (dst, src) {
    winston.log("debug", "operations - lodsb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  lodsw (dst, src) {
    winston.log("debug", "operations - lodsw(dst:" + dst.name + ", src:" + src.name + ")");
  }
  loopnz (dst, src) {
    winston.log("debug", "operations - loopnz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  loopz (dst, src) {
    winston.log("debug", "operations - loopz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  loop (dst, src) {
    winston.log("debug", "operations - loop(dst:" + dst.name + ", src:" + src.name + ")");
  }
  mov (dst, src) {
    winston.log("debug", "operations - mov(dst:" + dst.name + ", src:" + src.name + ")");
  }
  movb (dst, src) {
    winston.log("debug", "operations - movb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  movsb (dst, src) {
    winston.log("debug", "operations - movsb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  movsw (dst, src) {
    winston.log("debug", "operations - movsw(dst:" + dst.name + ", src:" + src.name + ")");
  }
  mul (dst, src) {
    winston.log("debug", "operations - mul(dst:" + dst.name + ", src:" + src.name + ")");
  }
  neg (dst, src) {
    winston.log("debug", "operations - neg(dst:" + dst.name + ", src:" + src.name + ")");
  }
  nop (dst, src) {
    winston.log("debug", "operations - nop(dst:" + dst.name + ", src:" + src.name + ")");
  }
  not (dst, src) {
    winston.log("debug", "operations - not(dst:" + dst.name + ", src:" + src.name + ")");
  }
  or (dst, src) {
    winston.log("debug", "operations - or(dst:" + dst.name + ", src:" + src.name + ")");
  }
  out (dst, src) {
    winston.log("debug", "operations - out(dst:" + dst.name + ", src:" + src.name + ")");
  }
  pop (dst, src) {
    winston.log("debug", "operations - pop(dst:" + dst.name + ", src:" + src.name + ")");
  }
  popf (dst, src) {
    winston.log("debug", "operations - popf(dst:" + dst.name + ", src:" + src.name + ")");
  }
  push (dst, src) {
    winston.log("debug", "operations - push(dst:" + dst.name + ", src:" + src.name + ")");
  }
  pushf (dst, src) {
    winston.log("debug", "operations - pushf(dst:" + dst.name + ", src:" + src.name + ")");
  }
  rcl (dst, src) {
    winston.log("debug", "operations - rcl(dst:" + dst.name + ", src:" + src.name + ")");
  }
  rcr (dst, src) {
    winston.log("debug", "operations - rcr(dst:" + dst.name + ", src:" + src.name + ")");
  }
  repnz (dst, src) {
    winston.log("debug", "operations - repnz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  repz (dst, src) {
    winston.log("debug", "operations - repz(dst:" + dst.name + ", src:" + src.name + ")");
  }
  ret (dst, src) {
    winston.log("debug", "operations - ret(dst:" + dst.name + ", src:" + src.name + ")");
  }
  retf (dst, src) {
    winston.log("debug", "operations - retf(dst:" + dst.name + ", src:" + src.name + ")");
  }
  rol (dst, src) {
    winston.log("debug", "operations - rol(dst:" + dst.name + ", src:" + src.name + ")");
  }
  ror (dst, src) {
    winston.log("debug", "operations - ror(dst:" + dst.name + ", src:" + src.name + ")");
  }
  sahf (dst, src) {
    winston.log("debug", "operations - sahf(dst:" + dst.name + ", src:" + src.name + ")");
  }
  sar (dst, src) {
    winston.log("debug", "operations - sar(dst:" + dst.name + ", src:" + src.name + ")");
  }
  sbb (dst, src) {
    winston.log("debug", "operations - sbb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  scasb (dst, src) {
    winston.log("debug", "operations - scasb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  scasw (dst, src) {
    winston.log("debug", "operations - scasw(dst:" + dst.name + ", src:" + src.name + ")");
  }
  shl (dst, src) {
    winston.log("debug", "operations - shl(dst:" + dst.name + ", src:" + src.name + ")");
  }
  shr (dst, src) {
    winston.log("debug", "operations - shr(dst:" + dst.name + ", src:" + src.name + ")");
  }
  ss (dst, src) {
    winston.log("debug", "operations - ss(dst:" + dst.name + ", src:" + src.name + ")");
  }
  stc (dst, src) {
    winston.log("debug", "operations - stc(dst:" + dst.name + ", src:" + src.name + ")");
  }
  std (dst, src) {
    winston.log("debug", "operations - std(dst:" + dst.name + ", src:" + src.name + ")");
  }
  sti (dst, src) {
    winston.log("debug", "operations - sti(dst:" + dst.name + ", src:" + src.name + ")");
  }
  stosb (dst, src) {
    winston.log("debug", "operations - stosb(dst:" + dst.name + ", src:" + src.name + ")");
  }
  stosw (dst, src) {
    winston.log("debug", "operations - stosw(dst:" + dst.name + ", src:" + src.name + ")");
  }
  sub (dst, src) {
    winston.log("debug", "operations - sub(dst:" + dst.name + ", src:" + src.name + ")");
  }
  test (dst, src) {
    winston.log("debug", "operations - test(dst:" + dst.name + ", src:" + src.name + ")");
  }
  wait (dst, src) {
    winston.log("debug", "operations - wait(dst:" + dst.name + ", src:" + src.name + ")");
  }
  xchg (dst, src) {
    winston.log("debug", "operations - xchg(dst:" + dst.name + ", src:" + src.name + ")");
  }
  xlat (dst, src) {
    winston.log("debug", "operations - xlat(dst:" + dst.name + ", src:" + src.name + ")");
  }
  xor (dst, src) {
    winston.log("debug", "operations - xor(dst:" + dst.name + ", src:" + src.name + ")");
  }

  notimp () {
    winston.log("info", "instruction - Instruction not implemented");
  };
}


