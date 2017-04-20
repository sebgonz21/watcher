@ECHO OFF
wmic /node:%1 logicaldisk where "DeviceID='C:'" get FreeSpace