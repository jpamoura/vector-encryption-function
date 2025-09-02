import { pbkdf2Sync,createDecipheriv } from 'crypto';
import { constants, deriveKeyAndIV, paddingBytesToRemoveFromIV} from './helpers.js';

function unpadData(dataBuffer) {
  const padLength = dataBuffer[dataBuffer.length - 1];

  if (
    padLength > 0 &&
    padLength <= 16 &&
    padLength <= dataBuffer.length &&
    dataBuffer.slice(-padLength).every(byte => byte === padLength)
  ) {
    return dataBuffer.slice(0, -padLength); 
  }

  return dataBuffer; 
}


function decodeWithFixedIV(appname, cipherText,fixedIV) {
  const ciphertext = Buffer.from(cipherText, 'base64');
  
  const derivedIV = pbkdf2Sync(
    Buffer.from(fixedIV, constants.encoding),
    Buffer.from(appname, constants.encoding),
    constants.iterations,
    constants.ivLength,
    constants.hashAlgorithm
  );

  const derivedKey = pbkdf2Sync(
    Buffer.from(appname, constants.encoding),
    Buffer.from(appname, constants.encoding),
    constants.iterations,
    constants.keyLength,
    constants.hashAlgorithm
  );

  const decipher = createDecipheriv(constants.encryptAlgorithm, derivedKey, derivedIV);
  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted; 
}

function decryptPayload(encryptedBase64, appname, encryptedKey, encryptedIv) {
  const payload = Buffer.from(encryptedBase64, 'base64');
  
  //Decoding x and y to get timestamp and IV
  const decodedTimestampAux = decodeWithFixedIV(appname,encryptedKey, constants.fixedIVKey)
  const decodedTimestamp = decodedTimestampAux.toString(constants.encoding).replace('_1', '')
  
  const decodedIVAux = decodeWithFixedIV(appname,encryptedIv, constants.fixedIVIV)
  const decodedIV = Buffer.from(
    decodedIVAux.filter(byte => !paddingBytesToRemoveFromIV.includes(byte))
  );

  const { derivedKey, derivedIV } = deriveKeyAndIV(appname,
    decodedIV,
    decodedTimestamp); 

  const decipher = createDecipheriv(constants.encryptAlgorithm, derivedKey, derivedIV);
  
  let decryptedPadded = Buffer.concat([
    decipher.update(payload),
    decipher.final()
  ]);


  const decryptedUnpadded = unpadData(decryptedPadded)
  const responseObject = {
  decrypted : decryptedUnpadded.toString(),
  timestamp: decodedTimestamp,
  iv: decodedIV.toString()
  } 
  
  return responseObject 
}

export { decryptPayload };