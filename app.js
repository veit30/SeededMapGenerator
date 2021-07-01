const http = require('http')
const fs = require('fs')
const path = require('path')

const server = http.createServer((req, res) => {

  if(req.url === "/") {
    fs.readFile("index.html", "utf-8", function(err, html){
      res.writeHead(200, {"Content-Type": "text/html"});
      res.end(html);
    });
  } else if(req.url.match("\.css$")) {
    var cssPath = path.join(__dirname, req.url);
    var fileStream = fs.createReadStream(cssPath, "utf-8");
    res.writeHead(200, {"Content-Type": "text/css"});
    fileStream.pipe(res);
  } else if(req.url.match("\.js$")) {
    var cssPath = path.join(__dirname, req.url);
    var fileStream = fs.createReadStream(cssPath, "utf-8");
    res.writeHead(200, {"Content-Type": "text/javascript"});
    fileStream.pipe(res);
  } else {
    res.writeHead(404, {"Content-Type": "text/html"});
    res.end("No Page Found");
  }

  // res.writeHead(200, { 'content-type': 'text/html' })
  // fs.createReadStream('index.html').pipe(res)
})

server.listen(process.env.PORT || 3002)
