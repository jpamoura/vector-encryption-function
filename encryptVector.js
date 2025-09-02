import { createCipheriv } from 'crypto';
import { constants, deriveKeyAndIV } from './helpers.js';

function padData(dataBuffer) {
  const padLength = constants.ivLength - (dataBuffer.length % constants.ivLength);
  const padding = Buffer.alloc(padLength, padLength);
  return Buffer.concat([dataBuffer, padding]);
}

function encodeItem(iv, data, appname, usePadding,timestamp=undefined){
  const { derivedKey, derivedIV } = deriveKeyAndIV(appname, iv, timestamp);
  
  const cipher = createCipheriv(constants.encryptAlgorithm, derivedKey, derivedIV);
  
  const bufferData = Buffer.from(data, constants.encoding)
  let finalData = bufferData 
  
  if (usePadding === true) {
    finalData = padData(bufferData);
  }
  
  const encrypted = Buffer.concat([
    cipher.update(finalData),
    cipher.final()
  ]);

  return encrypted.toString(constants.encodeEncrypted)
}

function encryptPayload(data, appname, timestamp, iv, usePadding) {
  const timestampWithVersion = `${timestamp}_${constants.versionNumber}`
  
  const responseObject = {
    x: encodeItem("fl1", iv,appname, usePadding), 
    y: encodeItem("po9", timestampWithVersion, appname, usePadding),
    z: encodeItem(iv,data,appname,usePadding,timestamp) 
  }

  return responseObject;
}

export { encryptPayload };