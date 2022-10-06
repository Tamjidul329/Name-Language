const http = require('http');
const https = require('https');
const fs = require('fs');
const port = 3000;
const server = http.createServer();

const credentials = require("./auth/credentials.json");

server.on("request", connection_handler);
function connection_handler(req, res){
	console.log(`New Request for ${req.url} from ${req.socket.remoteAddress}`);
	if(req.url === "/"){
		const main = fs.createReadStream('html/website.html');
		res.writeHead(200, {"Content-Type":"text/html"});
		main.pipe(res);
	}
/*	
	else if (req.url === "/images/banner.jpg"){
		const banner = fs.createReadStream('images/banner.jpg');
		res.writeHead(200, {"Content-Type":"image/jpeg"});
		banner.pipe(res);
	}
	
	 */
	else if (req.url.startsWith("/search")){
		const input = new URL(req.url, `https://${req.headers.host}`).searchParams;
	//	const input = url.searchParams.get("input")
		console.log(input);
		const word = input.get('word');
		get_name(word,res);

	}
	else{
		res.writeHead(404, {"Content-Type":"text/plain}"});
		res.write("404 Not Found", () => res.end());
	}

}

server.on("listening", listening_handler);
function listening_handler(){
	console.log(`Now Listening on Port ${port}`);
}

server.listen(port);


function get_name(word,res){
	if (word == null || word == ""){
		res.writeHead(404, {"Content-Type":"text/plain"});
		res.write("404 Not Found", () => res.end());
	}

	else {
		const age_api = https.request(`https://api.agify.io?name=${word}`);
		age_api.on("response", age_res => process_stream(age_res, parse_results, res));
		console.log('Api 1 has been called');
		age_api.end();
	}
}

function process_stream(stream, callback, ...args){
	let body = "";
	stream.on("data", chunk => body += chunk);
	stream.on("end", () => callback(body, ...args));
}

function parse_results(data, res){
    const lookup = JSON.parse(data);
	//let results = "<h1>No Results Found</h1>";
    if(typeof lookup === `object`){
        let name = lookup.name;
		console.log(name);
        get_lang(name,res);
    }
}



function get_lang(word,res){
	if (word == null || word == ""){
		res.writeHead(404, {"Content-Type":"text/plain"});
		res.write("404 Not Found", () => res.end());
	}

	else {
		const lang_api = https.request(`https://ws.detectlanguage.com/0.2/detect?q=${word}&key=${credentials['Authorization-Key']}`);
		lang_api.on("response", lang_res => process_stream(lang_res, parse_results2, res));
		console.log('API 2 has been called');
		lang_api.end();
	}
}


function parse_results2(data, res){
    const lookup = JSON.parse(data);
	let results = "<h1>No Results Found</h1>";
    if(typeof lookup === `object`){
        let language = lookup.data.detections[0].language;
		console.log(language);
        results = `<h1>Your name's language is: ${language}</h1>`;
    }
    res.writeHead(200, {"Content-Type": "text/html"})
	res.end(results);
}