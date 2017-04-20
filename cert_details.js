var fs = require('fs');
var cmd = require('./cmd');
var debug = require('debug')('cert_details');

const dir = "C:/Watcher2/Tools/batch/";

var createReturnCMDFunction = (returnToServer) =>{
    return (error,response)=>{
        debug("Jar Response");
        debug(response);
        if(error){
            returnToServer(error,response);
            return;
        }
        return returnToServer(null,response);

    };
};


var getCertDetails = (server,certPath,returnResult) => {
    
    certPath = "\\\\"+server+"\\"+certPath;
    debug("Getting cert " + certPath);
    
    var returnCMDValue = createReturnCMDFunction(returnResult);
    cmd.run(dir+'getCertificateDetails.bat',[certPath],returnCMDValue);
};

module.exports = {
    
    run:(server,params,returnResult) => {
        var certPath = params.cert_path;
        if(certPath == null){
            returnResult("ERROR:","No certificate path specified");
            return;
        }
        var pos = 0;
        while(certPath.indexOf('%5C') >= 0){
            pos = certPath.indexOf('%5C');
            if(pos == 0){
                certPath = '\\'+certPath.substring(3);
            }else if(pos + 3 == certPath.length){
                certPath = cerPath.substring(0,pos)+'\\';
            }else{
                certPath = certPath.substring(0,pos) + '\\' + certPath.substring(pos+3);
            }
        }
        
        getCertDetails(server,certPath,returnResult);
    }
};