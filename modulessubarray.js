const fs = require('fs');

fs.readFile('C:\\Users\\afhassan\\Downloads\\distdropmodulessubarray\\distdrop\\office-ui-fabric-react-FloatingPicker.stats.json', function read(err, data) {
    if (err) {
        throw err;
    }
    
    var data = JSON.parse(data);
    var modules = data.modules;

    for(var i = 0;i<modules.length;i++){
        if(modules[i].modules) {
            console.log("i == " + i);
            console.log(modules[i].name);
            console.log("reported:" + modules[i].size);

            var computedSum = 0;
            for(var j =0;j<modules[i].modules.length;j++){
                computedSum += modules[i].modules[j].size;
            }
            console.log("observed:" + computedSum)
            console.log("");
        }
    }
});
