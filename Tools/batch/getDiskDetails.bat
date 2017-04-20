@ECHO OFF
wmic /node:%1 logicaldisk where "DeviceID='%2'" get DeviceID,FreeSpace,Size /format:value