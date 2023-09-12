import aesjs from "aes-js";
import crypto from "crypto";

class IdentityKey {
  public static sanityCheck(identityKey: string): boolean {
    let key = identityKey;

    const separatorIndex = key.indexOf(';')
    if (separatorIndex === -1) {
      return false;
    }

    if (key.startsWith("identityNo:")) {
      if (key.length === separatorIndex + 1) {
        return true;
      }
      key = key.substring(separatorIndex + 1);
    }

    let result = true;

    while (result) {
      const separatorIndex = key.indexOf(';')
      console.log(key);
      if (separatorIndex === -1) {
        break;
      }
      const colonIndex = key.indexOf(':');
      if (colonIndex === -1) {
        result = false;
        break;
      }

      const cipher = Buffer.from(key.substring(colonIndex + 1, separatorIndex - 1), "base64");
      console.log(cipher);
      if (cipher.length !== 16) {
        result = false;
        break;
      }

      key = key.substring(separatorIndex + 1);
    }

    return result;
  }

  public static newCipher(identityKey: string, chainId: number): string {
    const regexPattern = new RegExp(`\\b${chainId}:`, "g");
    if (regexPattern.test(identityKey)) {
      throw new Error("There already exists a cipher that is attached to the provided chainId");
    }

    const cipher = this.generateCipher();

    identityKey += `${chainId}:${cipher};`;
    return identityKey;
  }

  public static updateCipher(identityKey: string, chainId: number): string {
    const startIndex = identityKey.indexOf(`${chainId}:`);

    if (startIndex >= 0) {
      const newCipher = this.generateCipher();

      const endIndex = identityKey.indexOf(";", startIndex);
      identityKey =
        identityKey.substring(0, startIndex + chainId.toString().length + 1) + newCipher + identityKey.substring(endIndex);
    } else {
      throw new Error("Cannot find chainId");
    }

    return identityKey;
  }

  public static encryptAddress(identityKey: string, chainId: number, address: string): string {
    const cipher = this.getChainCipher(identityKey, chainId);
    const cipherBase64 = Buffer.from(cipher, "base64");

    const aesCtr = new aesjs.ModeOfOperation.ctr(cipherBase64);
    const encryptedAddress = aesCtr.encrypt(Buffer.from(address, "utf-8"));

    return Buffer.from(encryptedAddress).toString("base64");
  }

  public static decryptAddress(identityKey: string, chainId: number, address: string): string {
    const cipher = this.getChainCipher(identityKey, chainId);
    const cipherBase64 = Buffer.from(cipher, "base64");

    const aesCtr = new aesjs.ModeOfOperation.ctr(cipherBase64);
    const decryptedAddress = aesCtr.decrypt(Buffer.from(address, "base64"));

    return Buffer.from(decryptedAddress.buffer).toString();
  }

  public static getChainCipher(identityKey: string, chainId: number): string {
    const startIndex = identityKey.indexOf(`${chainId}:`);

    if (startIndex >= 0) {
      const endIndex = identityKey.indexOf(";", startIndex);
      return identityKey.substring(startIndex + chainId.toString().length + 1, endIndex);
    } else {
      throw new Error("Cannot find chainId");
    }
  }

  public static getSharedKey(identityKey: string, selectedChains: number[]): string {
    let key = JSON.parse(JSON.stringify(identityKey));
    let sharedKey = "";
    selectedChains.forEach((chainId) => {
      if (!IdentityKey.containsChainId(key, chainId)) {
        key = IdentityKey.newCipher(key, chainId);
        throw new Error(`Cipher for chain #${chainId} not found`);
      }
      sharedKey += `${chainId}:${IdentityKey.getChainCipher(
        key,
        chainId
      )};`;
    });

    return sharedKey;
  }

  public static containsChainId(identityKey: string, chainId: number): boolean {
    const startIndex = identityKey.indexOf(`${chainId}:`);

    return startIndex >= 0 ? true : false;
  }

  private static generateCipher = () => {
    const cipher = crypto.randomBytes(16); // Generate a 128 bit key.
    const base64Cipher = cipher.toString('base64');
    return base64Cipher;
  };
}

export default IdentityKey;
