var fs = require("fs");

// uts for individual helper functions
// var baselineJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-baseline.stats.json"));
// var prJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-pr.stats.json"));
// var baselineAssetsInfo = getAssetIdToNamesAndSizesMapping(baselineJsonContents)
// var prModulesInfo = getModuleIdToNamesAndSizesMapping(prJsonContents);
// var chunkToModulesMapping = createChunkToModulesDict(prJsonContents, getTotalChunks(prJsonContents))
// verifyChunkToModulesMapping(prJsonContents, chunkToModulesMapping);

// execution
var baselineJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-baseline.stats.json"));
var prJsonContents = JSON.parse(fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-pr.stats.json"));
var assetViewData = createAssetView(baselineJsonContents, prJsonContents)
fs.writeFile('output/assetViewData.json', JSON.stringify(assetViewData), function (err) {
    if (err) 
        return console.log(err);
    console.log('assetViewData written to file: assetViewData.json');
});

// helper functions
function verifyChunkToModulesMapping(jsonContents, chunkToModulesMapping){
    var modulesToChunkMappingFromComputation = new Array(getTotalModules(jsonContents));
    for (var i=0;i < getTotalModules(jsonContents); i++) {
        modulesToChunkMappingFromComputation[i] = new Array();
    }

    for(var i=0;i<chunkToModulesMapping.length;i++){
        var modulesUsedByThisChunk = chunkToModulesMapping[i];
        for(var j =0;j<modulesUsedByThisChunk.length;j++){
            modulesToChunkMappingFromComputation[modulesUsedByThisChunk[j]].push(i);
        }
    }

    var modulesFromChunksFile = jsonContents.modules;
    var success = 0;
    for(var i = 0;i<modulesFromChunksFile.length;i++){
        var chunksFromStatsFile = modulesFromChunksFile[i].chunks;

        console.log(JSON.stringify(chunksFromStatsFile))
        console.log(JSON.stringify(modulesToChunkMappingFromComputation[i]))
        if(JSON.stringify(chunksFromStatsFile) === JSON.stringify(modulesToChunkMappingFromComputation[i])){
            success++;
        }
        console.log("")
    }
    if(success !== getTotalModules(jsonContents)){
        console.log("test fail");
    }else{
        console.log("test pass!");
    }
}

function createAssetView(baselineJsonContents, prJsonContents){
    var baselineAssetsInfo = getAssetIdToNamesAndSizesMapping(baselineJsonContents)
    var prAssetsInfo = getAssetIdToNamesAndSizesMapping(prJsonContents)
    var prModulesInfo = getModuleIdToNamesAndSizesMapping(prJsonContents);
    var baselineModulesInfo = getModuleIdToNamesAndSizesMapping(baselineJsonContents)
    var chunkToModulesMapping = createChunkToModulesDict(prJsonContents, getTotalChunks(prJsonContents))

    var assetViewData = [];
    var assets = prJsonContents.assets;
    for(var i = 0;i<assets.length;i++){
        var asset = assets[i].name;
        var sizeDifference = getSize(asset, prAssetsInfo) - getSize(asset, baselineAssetsInfo)
        var modulesImpacted = getModulesImpacted(assets[i], chunkToModulesMapping, prModulesInfo, baselineModulesInfo)

        assetViewData.push({asset:asset, sizeDifference:sizeDifference, modules: modulesImpacted})
    }

    return assetViewData;
}

function getModulesImpacted(asset, chunkToModulesMapping, prModulesInfo, baselineModulesInfo){
    var chunks = asset.chunks;
    var modulesImpacted = []
    for(var i = 0; i <chunks.length; i++){
        var modulesToPush = chunkToModulesMapping[chunks[i]]

        for(var j = 0;j<modulesToPush.length;j++){
            if(modulesImpacted.indexOf(modulesToPush[j]) < 0){
                modulesImpacted.push(modulesToPush[j])
            }
        }
    }
    
    var modulesImpactedWithNames = [];
    for(var i = 0;i<modulesImpacted.length;i++){
        modulesImpactedWithNames.push({module: prModulesInfo[modulesImpacted[i]].name, sizeDifference : (getSizeModules(prModulesInfo[modulesImpacted[i]].name, prModulesInfo) - getSizeModules(baselineModulesInfo[modulesImpacted[i]].name, baselineModulesInfo)) });
    }

    return modulesImpactedWithNames;
}

function getAssetIdToNamesAndSizesMapping(jsonContents){
    var names = []
    var assets = jsonContents.assets;
    for(var i=0; i <assets.length; i++){
        names.push({id:i, name:assets[i].name, size:assets[i].size})
    }
    return names;
}

function getModuleIdToNamesAndSizesMapping(jsonContents){
    var names = []
    var modules = jsonContents.modules;
    for(var i=0; i <modules.length; i++){
        names.push({id:i, name:modules[i].name, size:modules[i].size})
    }
    return names;
}

function getSize(asset, sizeInfo){
    for(var i = 0;i<sizeInfo.length;i++){
        if(sizeInfo[i].name === asset){
            return sizeInfo[i].size;
        }
    }
    return 0;
}

function getSizeModules(module, sizeInfo){
    for(var i = 0;i<sizeInfo.length;i++){
        if(sizeInfo[i].name === module){
            return sizeInfo[i].size;
        }
    }
    return 0;
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

function createChunkToModulesDict(jsonContents, totalChunks){
    var modules = jsonContents.modules;
    var chunks = new Array(totalChunks);
    for (var i=0;i < chunks.length; i++) {
        chunks[i] = new Array();
    }

    for(i=0;i<modules.length;i++){
        var module = modules[i];
        var chunksUsedByModule = module.chunks;
             
        for(j=0;j<chunksUsedByModule.length;j++){
            if(chunks[chunksUsedByModule[j]].indexOf(i) < 0){
                chunks[chunksUsedByModule[j]].push(i);
            }            
        }
    }

    return chunks;
}
