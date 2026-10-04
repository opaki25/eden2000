import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.mp4':'video/mp4','.svg':'image/svg+xml'};
http.createServer((req,res)=>{
const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
try{const size=fs.statSync(file).size;const range=req.headers.range;res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');res.setHeader('Accept-Ranges','bytes');
if(range){const match=/bytes=(\d+)-(\d*)/.exec(range);if(!match){res.writeHead(416).end();return;}const start=Number(match[1]),end=Math.min(match[2]?Number(match[2]):size-1,size-1);if(start> end){res.writeHead(416).end();return;}res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}
else{res.writeHead(200,{'Content-Length':size});fs.createReadStream(file).pipe(res);}}catch{res.writeHead(404).end('Not found');}
}).listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
