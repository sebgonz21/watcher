var wmi = require('node-wmi');
var debug = require('debug')('perfmon');

const component = ["ram","disk","os","processor","netstat"];

var createVerifyAndReturnFunction = (returnToServer) =>{
    
    return (returnObject) =>{
        debug("Trying to return");
        for(var i = 0; i < component.length; i++){
            debug("checking " + component[i]);
            if(!returnObject[component[i]]){
                debug(component[i] + " is null");
                return;
            }
        }
        debug("returnning perfmon");
        returnToServer(null,JSON.stringify(returnObject));
        return;
    };
};

var createNetworkFunction = (returnObject,verifyFunction)=>{
    return (err,res) =>{

        if(err || res == null || res.length < 1){
            debug(err);
            returnObject['netstat'] = {'error':'Error Getting Network details'};
            verifyFunction(returnObject);
            return;
        }

        returnObject['netstat'] = {
            'bytes_rec_psec':res[0].BytesReceivedPersec,
            'bytes_sent_psec':res[0].BytesSentPersec,
            'bandwidth':res[0].CurrentBandwidth
        }; 
        verifyFunction(returnObject);
        return;
    };
};

var createProcessorFunction = (returnObject,verifyFunction)=>{

    return (err,res)=>{

        if(err || res == null || res.length < 1){
            debug(err);
            returnObject['processor'] = {'error':'Error Getting Processor details'};
            verifyFunction(returnObject);
            return;
        }
        returnObject['processor'] = {'idle_time':res[0].PercentIdleTime};
        verifyFunction(returnObject);
        return;
    };
};

var createRAMFunction = (returnObject,verifyFunction) => {
    return(err,res) => {
        if(err || res.length < 1){
            debug(err);
            returnObject["ram"] = {"error":"Error Getting Free RAM"};
            verifyFunction(returnObject);
            return;
        }


        returnObject["ram"] = {
            "free_ram":res[0].FreePhysicalMemory,
            "total_ram":res[0].TotalVisibleMemorySize
        };
        
        verifyFunction(returnObject);
        return;
    };
};

var createDiskFunction = (returnObject,verifyFunction) => {
    return(err,res) => {
        if(err || res == null || res.length < 1){
            debug(err);
            returnObject["disk"] = {"error":"Error Getting drive info"};
            verifyFunction(returnObject);
            return;
        }


        returnObject["disk"] = {"drives":res};
        
        verifyFunction(returnObject);
        return;
    };
};

var createOSFunction = (returnObject,verifyFunction) =>{

    return(err,res) =>{
        if(err || res == null || res.length < 1){
            debug(err);
            returnObject['os'] = {"error":"Error Getting OS info"};
            verifyFunction(returnObject);
            return;
        }
        
        var opsys = (res[0].CSDVersion) ? res[0].Caption + ' ' + res[0].CSDVersion: res[0].Caption;
        
        returnObject['os'] = {
            'name_ver':opsys
        };

        verifyFunction(returnObject);
        return;
    };
};

var runWmiQuery = (options,returnFunction)=>{

    wmi.Query(options,returnFunction);

};

module.exports = {

    run: (server,params,returnToServer) =>{
        
        var returnObject = {};
        var verifyFunction = createVerifyAndReturnFunction(returnToServer);

        var ramOptions = {
            class: 'Win32_OperatingSystem',
            host: server,
            props: ['TotalVisibleMemorySize','FreePhysicalMemory']
        };
        runWmiQuery(ramOptions, createRAMFunction(returnObject,verifyFunction));

        var diskOptions = {
            class: 'Win32_LogicalDisk',
            host: server,
            where: 'DriveType=3',
            props: ['Caption','Size','FreeSpace']
        };
        
        runWmiQuery(diskOptions, createDiskFunction(returnObject,verifyFunction));
        
        var osOptions = {
            class: 'Win32_OperatingSystem',
            host: server,
            props: ['Caption','CSDVersion']
        };

        runWmiQuery(osOptions, createOSFunction(returnObject,verifyFunction));

        var procOptions = {
            class: 'Win32_PerfFormattedData_PerfOS_Processor',
            host: server,
            where: 'Name="_Total"',
            props: ['PercentIdleTime']
        };

        runWmiQuery(procOptions,createProcessorFunction(returnObject,verifyFunction));

        var netOptions = {
            class: 'Win32_PerfFormattedData_Tcpip_Networkinterface',
            host: server,
            where: 'Name LIKE "%Ethernet%"',
            props: ['CurrentBandwidth','BytesReceivedPersec','BytesSentPersec']
        };
        runWmiQuery(netOptions,createNetworkFunction(returnObject,verifyFunction));
    }

};
