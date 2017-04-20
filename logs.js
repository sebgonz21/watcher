var fs = require('fs');
var debug = require('debug')('logs');

var createReadLogsFunction = (returnToServer) =>{

    return (server,filePath) => {

        if(filePath.indexOf('C:') == 0 ){
            filePath = "c$"+filePath.substring(2);
        }

        filePath = "//"+server+"/"+filePath;
        debug("New Path");
        debug(filePath);
        var readableStream = fs.createReadStream(filePath);
        
        var data = '';
        readableStream.on('data', (chunk) =>{
            data+=chunk;
        });

        readableStream.on('error',(err)=>{
            returnToServer("Error Reading log file " + filePath + " error: " + err);
            return;
        });

        readableStream.on('end', ()=> {
            returnToServer(null, data);
            return;
        });    
    };
    

};


module.exports = {

    run: (server,params,returnResult)=> {
        var getLogs = createReadLogsFunction(returnResult);
        var filePath = params.file_path;
        var pos;
        while(filePath.indexOf('%2F') > 0){
            pos = filePath.indexOf('%2F');
            filePath = filePath.substring(0,pos)+'/'+ filePath.substring(pos+3);
        }
        debug("Path");
        debug(filePath);
        getLogs(server,filePath);
    }


};