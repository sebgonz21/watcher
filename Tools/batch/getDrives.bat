@ECHO OFF
wmic /node:%1 logicaldisk where drivetype=3 get caption