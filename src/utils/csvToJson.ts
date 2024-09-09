import csv from 'csvtojson';

const csvToJson=async function(filePath:string){
    const jsonArray=await csv().fromFile(filePath);
    return jsonArray;
}

export {
    csvToJson,
}