// Subtitles Reader .srt

// GLOBAL VARS
var file = new File;
var check = 0;

(function createSubtitlesText (thisObj) {


    //Build UI
    function buildUI(thisObj) {
        var mainWindow = (thisObj instanceof Panel)? thisObj : new Window('palette', "FileReader", undefined);
            mainWindow.orientation = "column";
            var groupOne = mainWindow.add("group", undefined, "groupOne");
                groupOne.orientation = "row";
            var fileLocBox = groupOne.add("edittext", undefined, "Selected File Location");
                fileLocBox.size = [150, 20];
            var getFileButton = groupOne.add("button", undefined, "File...");
                getFileButton.helpTip = "Select a .txt, .json, or .xml file to change the comp";
            
            var groupTwo = mainWindow.add("group", undefined, "groupTwo");
                groupTwo.orientation = "row";
            var starsCheckbox = groupTwo.add("checkbox", undefined, "Stars");
            var effectTextCheckbox = groupTwo.add("checkbox", undefined, "Text effect");
            var applyButton = groupTwo.add("button", undefined, "Generate");


            getFileButton.onClick = function() {
                file = file.openDlg("Open a file", "Acceptable Files:*.srt");
                fileLocBox.text = file.fsName;
                check = 1;
            }

            applyButton.onClick = function() {
                //app.beginUndoGroup("Comp Changes");
                var fileExtension = fileLocBox.text;
                var fileData;
                
                if(fileExtension.substring(fileExtension.length-4, fileExtension.length) == ".srt") {
                    fileLocBox.text = ".str";
                    fileData = readFile(starsCheckbox, effectTextCheckbox);
                }
            }



        mainWindow.layout.layout(true);

        return mainWindow;
    }
    
    // Show the Panel
    var w = buildUI(thisObj);
    if (w.toString() == "[object Panel]") {
        w;
    } else {
        w.show();
    }



    function readFile(myCheckbox, myText) {
        var txtArray = [];
        var currentLine;

        //Reading file
        file.open("r");
        while(!file.eof){
                currentLine = file.readln();
                txtArray.push(currentLine);
            }
        file.close();

        var curComp = app.project.activeItem;
        if (!curComp || !(curComp instanceof CompItem)) {
            alert('noComp');
            return;
        }
        var musicLayer = app.project.activeItem.selectedLayers[0];
        //fileLocBox.text = musicLayer.marker.lenght.toString();
        //var markers = musicLayer.marker;

        
        /*for(var i = 1; i <= markerLayer.marker.numKeys; i++ ){
            //var comment = markerLayer.marker.keyValue(i).comment;
            var time = markerLayer.marker.keyTime(i);
            createText(comment, time);
        }*/

        //Get formatted subtitles data
        var subsArray = [];

        //Add Background
        var mySolid = curComp.layers.addSolid([0,0,0], "Background", curComp.width, curComp.height,1);
        var stars;
        if (myCheckbox.value == true) {
            var stars = curComp.layers.addSolid([255,255,255], "Stars", curComp.width, curComp.height,1);

            var eff = stars.Effects.addProperty("CC Star Burst");
                eff.property(1).setValue(900);
                eff.property(2).setValue(0.1);
                eff.property(5).setValue(50);
        }
        //Add watermark
        var escuchandome  = curComp.layers.addText("escuchandome");
        escuchandome.startTime = musicLayer.marker.keyTime(1) - 0.55;
        escuchandome.name = "escuchandome";
        var textLayer_prop = escuchandome.property("Source Text");
        var textLayer_doc = textLayer_prop.value;
            textLayer_doc.font = "Caladea-Regular";
            textLayer_doc.fontSize = 46;
            textLayer_prop.setValue(textLayer_doc);

        
        //Add Audio espectre
        var myEspecAudio = curComp.layers.addSolid([0,0,0], "Espectro Audio", curComp.width, curComp.height,1);
        myEspecAudio.startTime = musicLayer.marker.keyTime(1) - 0.55;
        myEspecAudio.Effects.addProperty("Audio Spectrum");

        //Añadir Title;
        var firstLine = txtArray[0].split(";");
        var title = curComp.layers.addText(firstLine[1]);
        var textLayer_prop = title.property("Source Text");
        var textLayer_doc = textLayer_prop.value;
            textLayer_doc.font = "Poppins-Black";
            textLayer_doc.fontSize = 150;
            textLayer_prop.setValue(textLayer_doc);
        title.name = "Title";
        title.startTime = 0.5;
        title.outPoint = musicLayer.marker.keyTime(1) - 1;

        //Add Artists
        var artists = curComp.layers.addText(firstLine[0]);
        var textLayer_prop = artists.property("Source Text");
        var textLayer_doc = textLayer_prop.value;
            textLayer_doc.font = "Poppins-Black";
            textLayer_doc.fontSize = 86;
            textLayer_prop.setValue(textLayer_doc);
        artists.name = "Artist";
        artists.startTime = 1;
        artists.outPoint = musicLayer.marker.keyTime(1) - 1;

        for(var i = 1;  i<txtArray.length; i++){ 
            //Create Text Layer
            if(txtArray[i]) {
                var textLayer = curComp.layers.addText(txtArray[i]);
                var textLayer_prop = textLayer.property("Source Text");
                var textLayer_doc = textLayer_prop.value;
                textLayer_doc.font = "Poppins-ExtraBoldItalic";
                textLayer_doc.fontSize = 56;
                textLayer_prop.setValue(textLayer_doc);
                //var times = txtArray[i+1].split(" --> ");
                //var startTime = textLayer.startTime = timeToSeconds(times[0]);
                var startTime = musicLayer.marker.keyTime(i) - 0.55;
                textLayer.startTime = startTime;
                //var endTime = textLayer.outPoint = timeToSeconds(times[1]);
                if(i!=60) var endTime = musicLayer.marker.keyTime(i+1) - 0.55;
                else var endTime = musicLayer.outPoint;
                
                textLayer.outPoint = endTime;

                textLayer.name = "Caption"+i;
                if(myText.value == true) {
                    var eff = textLayer.Effects.addProperty("Linear Wipe");
                    eff.property("Transition Completion").setValueAtTime(startTime, 100);
                    eff.property("Transition Completion").setValueAtTime((startTime + ( (endTime - startTime)/2) ), 0);
                    eff.property("Wipe Angle").setValue((0,-90));
                }
            }
        }

        

        return txtObj;
    }

    function timeToSeconds(timeString) {
        var timeParts = timeString.split(':');
        
        // Extract hours, minutes, seconds, and milliseconds
        var hours = parseInt(timeParts[0], 10);
        var minutes = parseInt(timeParts[1], 10);
        var secondsAndMillis = timeParts[2].split(',');
        var seconds = parseInt(secondsAndMillis[0], 10);
        var milliseconds = parseInt(secondsAndMillis[1], 10);

        // Convert everything to seconds
        var totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        
        return totalSeconds;
    }

    function timeToSecondsEffect(timeString) {
        var timeParts = timeString.split(':');
        
        // Extract hours, minutes, seconds, and milliseconds
        var hours = parseInt(timeParts[0], 10);
        var minutes = parseInt(timeParts[1], 10);
        var secondsAndMillis = timeParts[2].split(',');
        var seconds = parseInt(secondsAndMillis[0], 10);
        var milliseconds = parseInt(secondsAndMillis[1], 10)-500;

        // Convert everything to seconds
        var totalSeconds = hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        
        return totalSeconds;
    }

})(this);
