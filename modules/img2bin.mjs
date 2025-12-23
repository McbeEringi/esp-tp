const
img2bin=({
	genctx,img,printer_width=384,
	background_color:bg='#fff',
	dither_mode=2,ellipse_fit=false,
	transform:{rotate=0,scale=1}={},
})=>((
	imgwh=[img.naturalWidth,img.naturalHeight],
	[bb,sc]=((
		rwh=((
			[x,y]=imgwh,t=rotate,
			c=Math.cos(t),s=Math.sin(t),
			cx=c*x,sx=s*x,cy=c*y,sy=s*y
		)=>ellipse_fit?[
			(cx*cx+sy*sy)**.5,
			(sx*sx+cy*cy)**.5
		]:[
			[0,cx,cx-sy,-sy],
			[0,sx,sx+cy,cy]
		].map(w=>Math.max(...w)-Math.min(...w)))(),
		s=printer_width*scale/rwh[0]
	)=>[rwh.map(x=>x*s),s])(),
	cs=bb.map(Math.ceil),
	ctx=genctx(...cs),
	gs,
	errd=m=>w=>w.forEach((e,i,a)=>(
		e=e-(a[i]=128<=e?255:0),
		m.forEach(([dx,dy,d])=>(i+(dy*=cs[0]))<a.length&&(dx+i%cs[0])<cs[0]&&(a[i+dx+dy]+=d*e))
	))
)=>(
	ctx.imageSmoothingEnabled=false,
	ctx.fillStyle=bg,
	ctx.fillRect(0,0,...cs),
	ctx.translate(...bb.map(x=>x/2)),
	ctx.rotate(-rotate),ctx.scale(sc,sc),
	ctx.drawImage(img,...imgwh.map(x=>x/-2)),
	gs=ctx.getImageData(0,0,...cs).data.reduce((a,x,i)=>(
		i%=4,
		i==3?(a.a.push(a.x*x/255),a.x=0):(a.x+=x*[.299,.587,.114][i]),
		a
	),{x:0,a:[]}).a,

	// dither
	
	[
		_=>gs=gs.map(x=>128<=x?255:0),
		_=>gs=gs.map((x,i)=>(
			([
				0,8,2,10,
				12,4,14,6,
				3,11,1,9,
				15,7,13,5
			][(i%cs[0])%4+(Math.floor(i/cs[0])%4)*4]+1)/17*255<x?255:0
		)),
		_=>errd([
			//Floyd-Steinberg
			[ 1,0,7/16],
			[-1,1,3/16],[ 0,1,5/16],[ 1,1,1/16]
		])(gs),
		_=>errd([
			//Atkinson
			[ 1,0,1/8],[ 2,0,1/8],
			[-1,1,1/8],[ 0,1,1/8],[ 1,1,1/8],
			[ 0,2,1/8]
		])(gs)
	][dither_mode](),

	Object.assign([
		0x1d,0x76,0x30,
		0,
		...[Math.ceil(cs[0]/8),cs[1]].flatMap(x=>[x&0xff,x>>8]),
		...gs.reduce((a,x,i)=>(
			i%=cs[0],
			a.x|=(x<128)<<(7-i%8),
			(i%8==7||i==cs[0]-1)&&(a.a.push(a.x),a.x=0),
			a
		),{x:0,a:[]}).a
	],{size:cs,data:gs})
))();

export{img2bin};
