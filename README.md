# GPS 2 UDP

Report Geo location to a remote server using UDP/IP.

# Goal of the project

Consume device resources as less as possible, delegating
data processing to the data receiver, so there is no
advertising, no expensive protocols and inter-process
communications.

The only task of the application is to collect Geo location
data in background and send them to the remote server with
defined time period.
