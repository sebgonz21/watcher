var tools = {
    perfmon: require('./perfmon.js'),
    logs: require('./logs.js'),
    app_restart: require('./app_restart.js'),
    cert_details: require('./cert_details.js'),
    forward: require('./forward.js'),
    url_checker: require('./url_checker.js')
}


var createReturnResult = function(returnToListener){
    return function(error,result){
        
        returnToListener(error,result);
        
    }
}

module.exports = {

    run: (query,returnResult) =>{
        console.log("watcher got query " + query);
        var queryPairs = query.split('%5E'); // split by ^ symbol
        var queryHash = {};
        var key;
        var val;
        var eqPos; //Position of '=' in string

        for(var i = 0; i < queryPairs.length; i++){
            eqPos = queryPairs[i].indexOf('=');
            key = queryPairs[i].substring(0,eqPos);
            val = queryPairs[i].substring(eqPos+1);
            queryHash[key] = val;
        }

        var server = queryHash["server"];
        var command = queryHash["command"];
        var paramsString = queryHash["params"]
        var params = {};
        var paramsArray = paramsString.split('%26');// split params on &

        for(var i = 0; i < paramsArray.length; i++){
            eqPos = paramsArray[i].indexOf('=');
            key = paramsArray[i].substring(0,eqPos);
            val = paramsArray[i].substring(eqPos+1);
            if(key == 'forward_params'){
                params[key] = paramsString.substring(paramsString.indexOf('forward_params') + 15);
                break;
            }
            params[key] = val;
        }
		//console.log('running command ' +command + ' on server ' + server);
        if(command == 'forward'){
            params['application'] = 'watcher';
        }
        tools[command].run(server,params,createReturnResult(returnResult));
    }

};
