'use strict';

var ipc = require('electron').ipcRenderer;
const buttonCreated = document.getElementById('upload');
const process = require('child_process')
const $ = require('jquery')
const path = require('path')
var randomString = require('random-string');
const fs = require('fs')
var {shell } = require('electron');

var format = 'mp4'

var dir = './media';
var filename;
var folder;

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
$("#loader").hide();

buttonCreated.addEventListener('click', function (event) {
    format = $("#format option:selected").text();
    ipc.send('open-file-dialog-for-file')

});

$("#format").change(function(){
    format = $("#format option:selected").text();
})

ipc.on('selected-file', function (event, paths) {
    console.log(event)
    var randomId = randomString();
    
    $("#loader").show();

    $("#info").append(`
        <div id=${randomId} class="alert alert-success">
          ${paths} is converting So Please Wait
         </div>
    `
    )
    console.log('Full path: ', paths)
    filename = paths.split("\\").pop();
    console.log(filename);
    folder = paths.substring(0,paths.lastIndexOf("\\")+1);
    console.log(folder);
    process.exec(`ffmpeg -i "${paths}" -vcodec libx265 -crf 28 ${folder}${filename}_compressed.${format}`,function(error,stdout, stderr){

        console.log('stdout: ' + stdout);
        $(`#${randomId}`).detach()
        Notification.requestPermission().then(function(result){
            shell.showItemInFolder(dir);
            var myNotification = new Notification('Conversion Completed',{
                body:"Your file was successfully converted"
            });
            $("#loader").hide();
            $("#info").append(`
            <div id=${randomId} class="alert alert-info">
              Compressed File saved at ${folder}${filename}_compressed.${format}
             </div>
            `
            );     
        })
        if (error !== null) {
             console.log('exec error: ' + error);
             $("#loader").hide();
        }
    
    })
});