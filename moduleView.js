var fs = require("fs");

// uts for each before executing the entire thing
// var baselineJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-baseline.stats.json"));
// var prJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-pr.stats.json"));
// var prTotalChunks = getTotalChunks(baselineJsonContents)
// var prTotalAssets = getTotalAssets(baselineJsonContents)
// var baselineModulesInfo = getModuleIdToNamesAndSizesMapping(baselineJsonContents)
// var prModulesInfo = getModuleIdToNamesAndSizesMapping(prJsonContents)
// var chunksToAssetsMapping = getChunksToAssetsMapping(prJsonContents, prTotalChunks);
// var success = 0;
// for(var a = 0;a<prTotalAssets; a++)
// {
//     var output = [];
//     for(var i = 0;i<chunksToAssetsMapping.length;i++){
//         var assets = chunksToAssetsMapping[i];

//         for(var j =0;j<assets.length;j++){
//             if(assets[j] == a){
//                 output.push(i);
//             }
//         }
//     }
//     if(JSON.stringify(output.sort()) === JSON.stringify(prJsonContents.assets[a].chunks.sort())){
//         success++;
//     }
// }
// if(success === prTotalAssets){
//     console.log("all tests pass!")
// }else{
//     console.log("tests fail!")
// }
// var prAssetsInfo = getAssetIdToNamesAndSizesMapping(prJsonContents)
// for(var i= 0;i<getTotalModules(prJsonContents);i++){
//     var assetsImpacted = getAssetsImpacted(prJsonContents.modules[i], chunksToAssetsMapping, prAssetsInfo)
//     console.log(assetsImpacted.length)
// }
// console.log(getTotalModules(prJsonContents))

// console.log(getSize('D:/a/1/s/packages/office-ui-fabric-react/lib-commonjs/Utilities.js', prModulesInfo))

// execution
var baselineJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-baseline.stats.json"));
var prJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-pr.stats.json"));
var moduleViewData = createModuleView(baselineJsonContents, prJsonContents)
// console.log(moduleViewData)
fs.writeFile('output/moduleViewData.json', JSON.stringify(moduleViewData), function (err) {
    if (err) 
        return console.log(err);
    console.log('moduleViewData written to file: moduleViewData.json');
});

// helper functions
function createModuleView(baselineJsonContents, prJsonContents){
    var modules = prJsonContents.modules;
    var moduleViewData = [];

    // to get size difference
    var baselineModulesInfo = getModuleIdToNamesAndSizesMapping(baselineJsonContents)
    var prModulesInfo = getModuleIdToNamesAndSizesMapping(prJsonContents)

    // to get the assets impacted
    var prTotalChunks = getTotalChunks(prJsonContents)
    var chunksToAssetsMapping = getChunksToAssetsMapping(prJsonContents, prTotalChunks);
    var prAssetsInfo = getAssetIdToNamesAndSizesMapping(prJsonContents)

    for(var i = 0;i<modules.length;i++){
        var module = modules[i].name;
        var sizeDifference = getSize(module, prModulesInfo) - getSize(module, baselineModulesInfo)
        if(sizeDifference !== 0){
            console.log("module:" + module + ", sizeDifference: " + sizeDifference)
        }
        var assetsImpacted = getAssetsImpacted(modules[i], chunksToAssetsMapping, prAssetsInfo)

        moduleViewData.push({module:module, sizeDifference:sizeDifference, assetsImpactedCount: assetsImpacted.length, assetsImpactedNames:assetsImpacted})
    }

    return moduleViewData;
}

function getAssetsImpacted(module, chunksToAssetsMapping, prAssetsInfo){
    var chunks = module.chunks;
    var assetsImpacted = []
    for(var i = 0; i <chunks.length; i++){
        var assetsToPush = chunksToAssetsMapping[chunks[i]]

        for(var j = 0;j<assetsToPush.length;j++){
            if(assetsImpacted.indexOf(assetsToPush[j]) < 0){
                assetsImpacted.push(assetsToPush[j])
            }
        }
    }
    
    var assetsImpactedWithNames = [];
    for(var i = 0;i<assetsImpacted.length;i++){
        assetsImpactedWithNames.push(prAssetsInfo[assetsImpacted[i]].name)
    }

    return assetsImpactedWithNames;
}

function getSize(module, sizeInfo){
    for(var i = 0;i<sizeInfo.length;i++){
        if(sizeInfo[i].name === module){
            return sizeInfo[i].size;
        }
    }
    return 0;
}

function getModuleIdToNamesAndSizesMapping(jsonContents){
    var names = []
    var modules = jsonContents.modules;
    for(var i=0; i <modules.length; i++){
        names.push({id:i, name:modules[i].name, size:modules[i].size})
    }
    return names;
}

function getAssetIdToNamesAndSizesMapping(jsonContents){
    var names = []
    var assets = jsonContents.assets;
    for(var i=0; i <assets.length; i++){
        names.push({id:i, name:assets[i].name, size:assets[i].size})
    }
    return names;
}

function getChunksToAssetsMapping(jsonContents, totalChunks){
    var chunks = new Array(totalChunks);
    for (var i=0;i < chunks.length; i++) {
        chunks[i] = new Array();
    }

    var assets = jsonContents.assets;
    for(var i = 0;i<assets.length;i++){
        var asset = assets[i]
        var chunksForThisAsset = asset.chunks;
            
        for(var j =0;j<chunksForThisAsset.length;j++){
            var chunkId = chunksForThisAsset[j]
            
            chunks[chunkId].push(i)
        }
    }

    return chunks;
}

function getTotalAssets(jsonContents){
    return jsonContents.assets.length;
}

function getTotalChunks(jsonContents){
    var assets = jsonContents.assets;
    var totalChunks = 0;
    for(var i=0;i <assets.length; i++){
        var chunksForThisAsset = assets[i].chunks;
        for(var j = 0;j<chunksForThisAsset.length; j++){
            totalChunks = (chunksForThisAsset[j]>totalChunks)?chunksForThisAsset[j]:totalChunks
        }
    }
    return (totalChunks > 0) ? (totalChunks + 1) : 0;
}

function getTotalModules(jsonContents){
    return jsonContents.modules.length;
}
