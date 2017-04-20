var request = require('request');
var cmd = require('./cmd');
var debug = require('debug')('app_restart');

const dir = 'C:/Watcher2/Tools/batch/';

var verify = (server,returnResult) => {

    var url_verify = 'https://'+server+':8443/LocateUI/';
    request(
        {
            url: url_verify,
            "rejectUnauthorized": false,
            method:"GET",
            headers:{
                'Content-Type':'application/json'
            },
            timeout:5000
        },function(error,response,body){
            debug("Restarting app on server " + server);
           
            if(response && response.statusCode == 200){
                debug("Will not restart app. Application on " + server + " is still up");
                returnResult(null,"Will not restart app. Application on " + server + " is still up");
                return;
            }else{
                debug("Restarting app on server " + server);
                getProcessId(server,returnResult);
            }
            
        }
    );
    
};

var createStartService = (server,returnResult) => { 
    return () => {
        
        debug("starting service on " + server);
        cmd.run(dir+'startService.bat',[server],returnResult);
    }
};

var createWaitAfterKill = (server,returnResult)=>{
   
    return  (error,response) => {
        if(returnResult == null){
            debug("Return Function is null");
        }else{
            debug("Return Function OK");
        }
        if(error){
            debug('Error Killing task ' + error);
            debug(response);

            return returnResult(error,response);
        }
        debug("Success Killing task");
        debug(response);//SUCCSES Killing
        var startService = createStartService(server,returnResult);
        setTimeout(startService,5000);
    }
};

var killTask = (server,returnResult,locatePid)=> {
    var waitAfterKill = createWaitAfterKill(server,returnResult);
    cmd.run(dir+'killTask.bat',[server,locatePid],waitAfterKill);
};

var createCheckProcessID = (server,returnResult)=>{
   
    return (error,locatePid) => {
        if(returnResult == null){
            debug("Return Function is null");
        }else{
            debug("Return Function OK");
        }
        if(error){
            debug("Error Getting Process ID: " + error);
            debug(locatePid);
            debug("Locate not found running, Starting Service");
           var startService = createStartService(server,returnResult);
           startService();
        }else{
            debug("Obtained Process Info: " + locatePid);
            if(locatePid.indexOf("TomEE") == 0){

                locatePid = locatePid.substring(locatePid.indexOf(' '));
                locatePid = locatePid.substring(0,locatePid.indexOf('Services'));
                locatePid = locatePid.trim();
            
                debug("Locate Process ID " + locatePid + " on server " + server);
            }
            killTask(server,returnResult,locatePid);
           
        }
    }
};

var getProcessId = (server,returnResult)=>{
    
    var checkProcessID = createCheckProcessID(server,returnResult);
    cmd.run(dir+'getProcessID.bat',[server],checkProcessID);
};

module.exports = {

    run: (server,params,returnResult) =>{
        
        verify(server,returnResult);
        //getProcessId();
    }

};