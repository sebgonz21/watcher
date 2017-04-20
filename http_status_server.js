(function(){
    var http = require('http');
    var spawn = require('child_process').spawn;
    var fs = require('fs');
    //var request = require("request");
    

    var server = http.createServer(function(req, res) {
        
        var url = req.url;
        
        if(url == "/favicon.ico"){
            res.end("");
            return;
        }

        res.writeHead(200);
        //console.log("Hello");

        //console.log(" URL " + url);

        if(url == "" || url == null || url.indexOf('/query=')!= 0){
            res.end("invalid request");
            return;
        }
        //http://vsecscomms1.katespade.net:8080/query=server=%3Cserver_name%3E%5Edate=%3Cdate%3E%5Etime=%3Ctime%20HH:mm:ss%3E
        var query = url.substring(7);
        console.log(query);
        var query_pairs = query.split("%5E");
        var query_hash = {};
        var key;
        var val;
        var eq_pos;//Location of "=" symbol

        for(var i = 0; i < query_pairs.length; i++){
            eq_pos = query_pairs[i].indexOf("=");
            key = query_pairs[i].substring(0, eq_pos);
            val = query_pairs[i].substring(eq_pos+1);
            query_hash[key] = val;
        }

        var monitor = query_hash["server"];

        var options = {
            host: 'https://isc.sans.edu//newssummaryrss.xml',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        var answer;
        console.log("Sending request");
        var request = http.request(options, function(response) {
            var output = '';
            console.log(options.host + ':' + res.statusCode);
            res.setEncoding('utf8');

            res.on('data', function (chunk) {
                output += chunk;
            });

            res.on('end', function() {
                var obj = JSON.parse(output);
                onResult(res.statusCode, obj);
            });
        });

        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
        });
        // write data to request body
        //request.write('{"string": "Hello, World"}');
        request.end();
        
        
    });
    server.listen(8084);

})();