var request = require('request');
var debug = require('debug')('url_checker');

var createURLCheck = (returnToServer) =>{
    return (url_test)=>{
        
        request({
            url: url_test,
            "rejectUnauthorized": false,
            method:"GET",
            headers:{
                'Content-Type':'application/json'
            },
            timeout:5000
        },function(error,response,body){
            if(error){
                return returnToServer(error.toString(),null);
            }
            return returnToServer(null,response.statusCode.toString());
        });
        
        //returnToServer(null,url_test);
    };
    
};


module.exports = {

    run: (server,params,returnToServer)=>{
        var url = params.url;
        var pos;
        while(url.indexOf('%2F') > 0){
            pos = url.indexOf('%2F');
            url = url.substring(0,pos)+'/'+ url.substring(pos+3);
        }
        var runURLCheck = createURLCheck(returnToServer);
        runURLCheck(url);
    }

};