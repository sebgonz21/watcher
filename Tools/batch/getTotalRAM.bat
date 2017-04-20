@ECHO OFF
wmic /node:%1 ComputerSystem get TotalPhysicalMemory