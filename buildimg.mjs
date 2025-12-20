#!/bin/bun
import{createCanvas,loadImage,ImageData}from'@napi-rs/canvas';
import{img2bin}from'./modules/img2bin';
console.log(1)

await Promise.all(new Bun.Glob('img/*').scanSync('.').map(async x=>(
	x=await loadImage(x),
	x=img2bin({
		genctx:(w,h)=>createCanvas(w,h).getContext('2d'),
		img:x,ImageData
	}),
	console.log(x),
	// await Bun.write(`./data/public/img/`,new Uint8Array(x)),
	0
)));

