var request = require('request');
var debug = require('debug')('forward');
var createRequest = () => {

    return (urlCommand,returnToServer) => {
        console.log("sending request out to " + urlCommand);
        
        request(
            {
                url: urlCommand,
                "rejectUnauthorized": false,
                method:"GET",
                headers:{
                    'Content-Type':'application/json'
                },
                timeout:30000
            },function(error,response,body){
            
                if(error){         
                    console.log("Error in forward");     
                    console.log(error);      
                    return returnToServer(error.toString(),response+' '+body);                    
                }

                if(response && response.statusCode == 200){
                    console.log("Success in forward");   
                    return returnToServer(null,body);
                }else{
                    return returnToServer("ERROR","Error Forwarding request`");
                }
                
            }
        );
    }
};

module.exports = {

    run: (server,params,returnToServer)=>{
        //http://vsecsntools1.katespade.net:9999/query=server=vusasecloc05%5Ecommand=forward%5Eparams=command=perfmon%26forward_params=
        var command = params.command;
        var forwardUrl = "http://vsecsntools2.katespade.net:8500/";
        forwardUrl += 'application=';
        forwardUrl += params.application + '/';
        forwardUrl += 'query=server=';
        forwardUrl += server;
        forwardUrl += "%5E";
        forwardUrl += "command=";
        forwardUrl += command;
        forwardUrl += "%5E";
        forwardUrl += "params=";
        forwardUrl += params.forward_params;
        debug("Forwarding");
        debug("URL:" + forwardUrl);
        var  forwardRequest = createRequest();
        forwardRequest(forwardUrl,returnToServer);
    }

};