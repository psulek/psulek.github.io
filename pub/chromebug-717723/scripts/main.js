var elemLog;
var elemProgress;
var elemProgressText;
var btnLoadOgg;
var btnLoadMp3;
var loadingErrorCount;
var loadedCount;
var soundsQueue;
var totalProgress;

var files = [];
for(var i = 1; i <= 13; i++) {
    files.push('sounds/'+i);
}

document.addEventListener('DOMContentLoaded', function (event) {
    elemLog = document.getElementById('log');
    elemProgress = document.getElementById('progress');
    elemProgressText = document.getElementById('progress-text');

    btnLoadOgg = document.getElementById('btnLoadOgg');
    //btnLoadOgg.style.display = 'inline-block';
    btnLoadMp3 = document.getElementById('btnLoadMp3');
    btnLoadMp3.style.display = 'inline-block';

    createjs.Sound.registerPlugins([createjs.WebAudioPlugin]);
    createjs.Sound.alternateExtensions = ['mp3'];

    var audiotype = getParameterByName('audiotype');
    if (audiotype) {
        setTimeout(function () {loadAudioFiles(audiotype);}, 100);
    } else {
        updateButtons(true);
    }
});

function loadAudioFiles(audioType) {
    clearLog();
    resetProgress();
    soundsQueue = new createjs.LoadQueue(true);
    soundsQueue.installPlugin(createjs.Sound);

    soundsQueue.addEventListener('fileload', handleFileLoad);
    soundsQueue.addEventListener('filestart', handleFilestart);
    soundsQueue.addEventListener('progress', handleProgress);
    soundsQueue.addEventListener('error', handleError);
    soundsQueue.addEventListener('complete', handleComplete);

    loadingErrorCount = 0;
    loadedCount = 0;
    totalProgress = 0;

    for (var i = 0; i < files.length; i++) {
        var file = files[i] + '.' + audioType;
        soundsQueue.loadFile(file, false);
    }

    soundsQueue.load();
}

function log(msg, isError) {
    elemLog.innerHTML += '<span class="' + (isError ? 'err' : '') + '">' + msg + '</span><br/>';
}

function clearLog() {
    elemLog.innerHTML = '';
    elemProgressText.innerText = '';
}

var fileLoadStarted = 0;
function handleFilestart(e) {
    var itemSrc = e.item.src;
    var itemType = e.item.type;

    if (e.item) {
        fileLoadStarted++;
        console.log('Preloader -> Audio resource "' + itemSrc + '" [' + itemType + '] file load started ('
                    + fileLoadStarted + '/' + files.length + ')');
    } else {
        console.log('Preloader -> Unknown audio resource');
    }
}

function handleFileLoad(e) {
    var itemId = e.item.id;
    var itemSrc = e.item.src;
    var itemType = e.item.type;
    var itemResult = e.result;

    if (itemResult != null && itemId != null) {
        loadedCount++;
        log('Preloader -> Audio resource "' + itemSrc + '" [' + itemType + '] loaded ' + ' (loaded ' + loadedCount +
            '/' + files.length + ')');
    }
}

function handleProgress(e) {
    totalProgress = e.loaded * 100;
    var progress = totalProgress + '%';
    elemProgress.style.width = progress;
    updateProgressText();
}

function updateProgressText() {
    elemProgressText.innerText = totalProgress + '% (' + loadedCount + '/' + files.length + ')';
}

function resetProgress() {
    elemProgress.style.width = '0%';
}


function handleError(e) {
    loadingErrorCount++;
    log('Preloader -> Audio resource load error: ' + e.data.src + ' (total ' + loadingErrorCount + ' load errors)',
        true);
}

function handleComplete(e) {
    //debugger;
    log('Preloader -> Completed audio resources load');

    soundsQueue.removeAllEventListeners();

    log('Preloader -> Successfully: ' + loadedCount + ', failed: ' + loadingErrorCount + ' from total ' +
        files.length + ' files.');

    updateProgressText();
}

function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}