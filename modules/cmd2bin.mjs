import{txt2bin}from'./txt2bin.mjs';
const
op=`NUL SOH STX ETX EOT ENQ ACK BEL BS HT LF VT FF CR SO SI
DLE DC1 DC2 DC3 DC4 NAK SYN ETB CAN EM SUB ESC FS GS RS US
SP`.split(/\s/).reduce((a,x,i)=>(a[x]=[i],a),{}),
cmd2bin=w=>w.split(/\s/).flatMap(x=>op[x]??(/^[0-9a-f]{2}$/i.test(x)?[+('0x'+x)]:txt2bin(x)));

export{cmd2bin};
