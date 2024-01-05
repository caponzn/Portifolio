const express = require('express');


const app = express();

app.use( "/atividades",  express.static(__dirname + '/public/projects/Atividades'));
app.use( "/Notes",  express.static(__dirname + '/public/projects/caponNotes'));
app.listen(2224)