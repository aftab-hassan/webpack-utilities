var fs = require("fs");
// console.log("\n *START* \n");
var contents = fs.readFileSync("C:\\GitRepos\\utilities\\test-bundles-pr.stats.json");
// var contents = fs.readFileSync("sp-workbench.stats.json");
// var contents = fs.readFileSync("sp-classic-page.stats.json");
var jsonContents = JSON.parse(contents);

// var totalChunks = getTotalChunks(jsonContents)
// var chunkToModulesDict = createChunkToModulesDict(jsonContents, totalChunks)//chunkToModulesMapping.json
// var moduleSizeDict = createModuleSizeDict(jsonContents)//moduleSize.json
// var chunkSizeDict = createChunkSizeDict(chunkToModulesDict, moduleSizeDict)//chunkSize.json
// var assetSizeDict = createAssetSizeDict(jsonContents, chunkSizeDict)//assetSize.json
// var assetSizeWithoutDuplicateModules = createAssetSizeDictWithoutDuplicates(jsonContents, chunkToModulesDict, moduleSizeDict)//assetSizeWithoutDuplicateModules.json
// var assetSizesReported = getAssetSizesFromStatsFile(jsonContents)//assetSizesReported.json
// var moduleNames = getModuleNames(jsonContents)//moduleNames.json
var totalAssets = getTotalAssets(jsonContents)
var totalChunks = getTotalChunks(jsonContents)
var totalModules = getTotalModules(jsonContents);
var assetIdToNamesAndSizesMapping = getAssetIdToNamesAndSizesMapping(jsonContents)
// console.log(assetIdToNamesAndSizesMapping)

var moduleIdToNamesAndSizesMapping = getModuleIdToNamesAndSizesMapping(jsonContents)
console.log(moduleIdToNamesAndSizesMapping)

// var chunksToAssetsMapping = getChunksToAssetsMapping(jsonContents)

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

function getChunksToAssetsMapping(jsonContents, totalAssets){
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
        var chunksForThisAsset = assets[i];
        for(var j = 0;j<chunksForThisAsset.length; j++){
            totalChunks = (chunksForThisAsset[j]>totalChunks)?chunksForThisAsset[j]:totalChunks
        }
    }
    return totalChunks;
}

function getTotalModules(jsonContents){
    return jsonContents.modules.length;
}

console.log("total assets == " + totalAssets)
console.log("total chunks == " + totalChunks)
console.log("total modules == " + totalModules)

function getTotalChunks(jsonContents){
    var assets = jsonContents.assets;

    var largestChunkId = -1;
    for(i=0;i<assets.length;i++){
        var asset = assets[i];
        var chunks = asset.chunks;

        for(j=0;j<chunks.length;j++){
            if(chunks[j] > largestChunkId){
                largestChunkId = chunks[j];
            }
        }
    }

    return largestChunkId+1;
}

function getModuleNames(jsonContents){
    var names = [];
    var modules = jsonContents.modules;
    for(i=0;i<modules.length;i++){
        names.push(modules[i].name);
    }
    return names;
}

function createAssetSizeDictWithoutDuplicates(jsonContents, chunkToModulesDict, moduleSizeDict){
    var assets = jsonContents.assets;
    var assetsSize = [];

    for(i = 0;i<assets.length;i++){
        var asset = assets[i];
        var size = 0;

        var modulesUsedByAsset = [];

        var chunksUsedByAsset = asset.chunks;
        for(j=0;j<chunksUsedByAsset.length;j++){
            var chunkId = chunksUsedByAsset[j];

            for(k=0;k<chunkToModulesDict[chunkId].length;k++){
                if(modulesUsedByAsset.indexOf(chunkToModulesDict[chunkId][k]) < 0){
                    modulesUsedByAsset.push(chunkToModulesDict[chunkId][k]);
                    size += moduleSizeDict[chunkToModulesDict[chunkId][k]];
                }   
            }
        }
    
        assetsSize[i] = size;
    }

    return assetsSize;
}

function createAssetSizeDict(jsonContents, chunkSizeDict){
    var assets = jsonContents.assets;

    var dict = [];
    var assetSizes = new Array(assets.length);
    for(i=0;i<assets.length;i++){
        var asset = assets[i];

        var chunksUsedByAsset = asset.chunks;
        var size = 0;
        for(j=0;j<chunksUsedByAsset.length;j++){
            size += chunkSizeDict[chunksUsedByAsset[j]];
        }

        assetSizes[i] = size;
        dict.push({
            'observed': asset.size,
            'computed': size
        })
    }

    return dict;
}

function createChunkSizeDict(chunkToModulesDict, moduleSizeDict){
    var chunkSizeDict = [];
    var size = 0;
    for(i=0;i<chunkToModulesDict.length;i++){
        var modulesUsedByChunk = chunkToModulesDict[i];
        
        for(j=0;j<modulesUsedByChunk.length;j++){
            size += moduleSizeDict[modulesUsedByChunk[j]] 
        }

        chunkSizeDict[i] = size;
    }

    return chunkSizeDict;
}

function createModuleSizeDict(jsonContents){
    var modules = jsonContents.modules;
    var moduleSizes = new Array(modules.length);

    for(i=0;i<modules.length;i++){
        var module = modules[i];
        moduleSizes[i] = module.size;
    }

    return moduleSizes;
}

function createChunkToModulesDict(jsonContents, totalChunks){
    var modules = jsonContents.modules;
    var chunks = new Array(totalChunks);//TODO : Make dynamic
    for (var i=0;i < chunks.length; i++) {
        chunks[i] = new Array();
    }

    for(i=0;i<modules.length;i++){
        var module = modules[i];
        var chunksUsedByModule = module.chunks;
        // console.log(chunksUsedByModule)
               
        for(j=0;j<chunksUsedByModule.length;j++){
            // console.log(chunksUsedByModule[j])

            if(chunks[chunksUsedByModule[j]].indexOf(i) < 0){
                chunks[chunksUsedByModule[j]].push(i);
            }            
        }

        // console.log("\n");
    }

    return chunks;
}

function getAssetSizesFromStatsFile(jsonContents){
    var assetsSize = [];
    var assets = jsonContents.assets;

    for(i=0;i<assets.length;i++){
        assetsSize[i] = assets[i].size;
    }

    return assetsSize;
}

// fs.writeFile('output/chunkToModulesMapping.json', JSON.stringify(chunkToModulesDict), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('chunk to modules mapping written to file: chunkToModulesMapping.json');
// });

// fs.writeFile('output/moduleSize.json', JSON.stringify(moduleSizeDict), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('moduleSize written to file: moduleSize.json');
// });

// fs.writeFile('output/chunkSize.json', JSON.stringify(chunkSizeDict), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('chunkSizeDict written to file: chunkSize.json');
// });

// fs.writeFile('output/assetSize.json', JSON.stringify(assetSizeDict), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('assetSizeDict written to file: assetSize.json');
// });

// fs.writeFile('output/assetSizeWithoutDuplicateModules.json', JSON.stringify(assetSizeWithoutDuplicateModules), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('asset size without duplicate modules mapping written to file: assetSizeWithoutDuplicateModules.json');
// });

// fs.writeFile('output/assetSizesReported.json', JSON.stringify(assetSizesReported), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('asset size reoprted written to file: assetSizesReported.json');
// });

// fs.writeFile('output/moduleNames.json', JSON.stringify(moduleNames), function (err) {
//     if (err) 
//         return console.log(err);
//     console.log('module names written to file: moduleNames.json');
// });