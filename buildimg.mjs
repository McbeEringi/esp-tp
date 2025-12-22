#!/bin/bun
import{createCanvas,loadImage}from'@napi-rs/canvas';
import{img2bin}from'./modules/img2bin';

await Promise.all(new Bun.Glob('img/*').scanSync('.').map(async x=>(
	console.log(x),
	await Bun.write(`./data/public/${x}.bin`,new Uint8Array(img2bin({
		genctx:(w,h)=>createCanvas(w,h).getContext('2d'),
		img:await loadImage(x)
	})))
)));

