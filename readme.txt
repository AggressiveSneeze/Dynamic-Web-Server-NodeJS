James Adams 777635004 cs: jadams
Alon Perl 200630887 cs: alonperl


(1)
Understanding the construction of the http requests and how the protocol itself was okay, but of course the implementation was a little bit more involved. Tasks/aspects that were difficult include:
Making use of the callback functionality in node to have everything run asynchronously. 
Error handling.
Diagnostics/Troubleshooting bugs during development.
(2) Redacted.
(3) To make things efficient,  we:
Focused on having everything run asynchronously (a strong point of node.)
More towards efficiency in regards to maintenance/later debugging, but tried to make the code as readable and commented as possible.
Avoided bloated code and unnecessary passing of variables all over the place. 
(4) For the concurrency/scalability testing,(through load.js), the server was thrown 1000 get requests in a row (asynchronously of course), which it handled fine.
For testing whether it could serve ex2 files, initially it was confirmed, through accessing the server on chrome, whether it could access the files. Also made sure to attempt accessing files above the root, which it couldn't do, as required. 
Additionally, test.js performs the same task of accessing 4 particular files from ex2 through get requests and confirming they were accessed okay.
