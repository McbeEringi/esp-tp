const
img2bin=({
	genctx,img,printer_width=384,
	background_color:bg='#fff',
	transform:{rotate=0,scale=1}={},
})=>((
	imgwh=[img.naturalWidth,img.naturalHeight],
	[bb,sc]=((
		rwh=((
			[x,y]=imgwh,t=rotate,
			c=Math.cos(t),s=Math.sin(t),
			cx=c*x,sx=s*x,cy=c*y,sy=s*y
		)=>[
			[0,cx,cx-sy,-sy],
			[0,sx,sx+cy,cy]
		].map(w=>Math.max(...w)-Math.min(...w)))(),
		s=printer_width*scale/rwh[0]
	)=>[rwh.map(x=>x*s),s])(),
	cs=bb.map(Math.ceil),
	ctx=genctx(...cs),
	gs
)=>(
	ctx.imageSmoothingEnabled=false,
	ctx.fillStyle=bg,
	ctx.fillRect(0,0,...cs),
	ctx.translate(...bb.map(x=>x/2)),
	ctx.rotate(-rotate),ctx.scale(sc,sc),
	ctx.drawImage(img,...imgwh.map(x=>x/-2)),
	// gs=((
	// 	a=[...ctx.getImageData(0,0,...cs).data],
	// 	pal=[.299,.587,.114]
	// )=>[...Array(cs[1])].map((_,y)=>[...Array(cs[0])].map((i,x,{length:w})=>(
	// 	i=(w*y+x)*4,
	// 	a.slice(i,i+=3).reduce((a,x,i)=>a+x*pal[i],0)*(a[i]/255)
	// ))))(),
	gs=ctx.getImageData(0,0,...cs).data.reduce((a,x,i)=>(
		i%=4,
		i==3?(a.a.push(a.x*x/255),a.x=0):(a.x+=x*[.299,.587,.114][i]),
		a
	),{x:0,a:[]}).a,

	// dither
	// [...Array(cs[1])].forEach((_,y)=>[...Array(cs[0])].forEach((e,x)=>(
	// 	e=gs[y][x]-(gs[y][x]=128<=gs[y][x]?255:0),
	// 	[
	// 		[ 1,0,1/8],[ 2,0,1/8],
	// 		[-1,1,1/8],[ 0,1,1/8],[ 1,1,1/8],
	// 		[ 0,2,1/8]
	// 	].forEach(([dx,dy,d])=>(dy+=y)<cs[1]&&(dx+=x)<cs[0]&&(gs[dy][dx]+=d*e))
	// ))),
	gs.forEach((e,i,a)=>(
		e=e-(a[i]=128<=e?255:0),
		[
			[ 1,0,1/8],[ 2,0,1/8],
			[-1,1,1/8],[ 0,1,1/8],[ 1,1,1/8],
			[ 0,2,1/8]
		].forEach(([dx,dy,d])=>(i+(dy*=cs[0]))<a.length&&(dx+i%cs[0])<cs[0]&&(a[i+dx+dy]+=d*e))
	)),

	Object.assign([
		0x1d,0x76,0x30,
		0,
		...[Math.ceil(cs[0]/8),cs[1]].flatMap(x=>[x&0xff,x>>8]),
		// ...gs.flatMap(x=>[...Array(Math.ceil(x.length/8))].map((_,i)=>(
		// 	x.slice(i*=8,i+8).reduce((a,x,i)=>((a<<1)|(x<128)),0)
		// )))
		...gs.reduce((a,x,i)=>(
			i%=cs[0],
			a.x|=(x<128)<<(7-i%8),
			(i%8==7||i==cs[0]-1)&&(a.a.push(a.x),a.x=0),
			a
		),{x:0,a:[]}).a
	],{size:cs,data:gs})
))();

export{img2bin};
