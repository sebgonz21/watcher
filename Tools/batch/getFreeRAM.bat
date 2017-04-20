@ECHO OFF
wmic /node:%1 OS get FreePhysicalMemory