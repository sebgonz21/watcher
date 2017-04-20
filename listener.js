(function(){
    
    var apps = {
        watcher: require("./watcher_main.js") 
    }

    var http = require('http');

    var listener = http.createServer(function(req,res){

        var returnResult = (err,data)=>{
            if(err){
                return res.end(err);
            }

            return res.end(data);
        };

        var url = req.url;

        if(url == "/favicon.ico"){
            res.end("");
            return;
        }
        
        var urlArr = url.split("/");
        var urlHash = {};
        var component;
        var value;
        for(var i = 1; i < urlArr.length; i++){
           
            if(urlArr[i].indexOf('=') < 0){
                res.end("Missing value for URL component " + urlArr[i]);
                return;
            }
            
            component = urlArr[i].substring(0,urlArr[i].indexOf("="));
            value = urlArr[i].substring(urlArr[i].indexOf("=") + 1);
            urlHash[component] = value;

        }
        
        if(!urlHash['application']){
            return res.end('Missing Application in URL');
        }
        if(!urlHash['query']){
            return res.end('Missing Query in URL');
        }
       
        var query = urlHash['query'];
        
        var application = urlHash['application'];
        apps[application].run(query,returnResult);

    });

    listener.listen(9999);
})();