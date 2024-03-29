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
      if (separatorIndex === -1) {
        break;
      }
      const colonIndex = key.indexOf(':');
      if (colonIndex === -1) {
        result = false;
        break;
      }

      const cipher = Buffer.from(key.substring(colonIndex + 1, separatorIndex - 1), "base64");
      if (cipher.length !== 16) {
        result = false;
        break;
      }

      key = key.substring(separatorIndex + 1);
    }

    return result;
  }

  public static newCipher(identityKey: string, chainId: number, relay: string): string {
    const regexPattern = new RegExp(`\\b${relay}${chainId}:`, "g");
    if (regexPattern.test(identityKey)) {
      throw new Error("There already exists a cipher that is attached to the provided chainId");
    }

    const cipher = this.generateCipher();

    identityKey += `${relay}${chainId}:${cipher};`;
    return identityKey;
  }

  public static updateCipher(identityKey: string, chainId: number, relay: string): string {
    const startIndex = identityKey.indexOf(`${relay}${chainId}:`);
    const chainIdAndNetwork = `${relay}${chainId}`;

    if (startIndex >= 0) {
      const newCipher = this.generateCipher();
      const endIndex = identityKey.indexOf(";", startIndex);

      return identityKey.substring(0, startIndex + chainIdAndNetwork.toString().length + 1) + newCipher + identityKey.substring(endIndex);
    } else {
      return this.newCipher(identityKey, chainId, relay);
    }
  }

  public static encryptAddress(identityKey: string, chainId: number, address: string, relay: string): string {
    const cipher = this.getChainCipher(identityKey, chainId, relay);
    const cipherBase64 = Buffer.from(cipher, "base64");

    const aesCtr = new aesjs.ModeOfOperation.ctr(cipherBase64);
    const encryptedAddress = aesCtr.encrypt(Buffer.from(address, "utf-8"));

    return Buffer.from(encryptedAddress).toString("base64");
  }

  public static decryptAddress(identityKey: string, chainId: number, address: string, relay: string): string {
    const cipher = this.getChainCipher(identityKey, chainId, relay);
    const cipherBase64 = Buffer.from(cipher, "base64");

    const aesCtr = new aesjs.ModeOfOperation.ctr(cipherBase64);
    const decryptedAddress = aesCtr.decrypt(Buffer.from(address, "base64"));

    return Buffer.from(decryptedAddress.buffer).toString();
  }

  public static getChainCipher(identityKey: string, chainId: number, relay: string): string {
    const startIndex = identityKey.indexOf(`${relay}${chainId}:`);
    const chainIdAndNetwork = `${relay}${chainId}`;

    if (startIndex >= 0) {
      const endIndex = identityKey.indexOf(";", startIndex);
      return identityKey.substring(startIndex + chainIdAndNetwork.toString().length + 1, endIndex);
    } else {
      throw new Error("Cannot find chainId");
    }
  }

  public static getSharedKey(identityKey: string, selectedChains: { chainId: number, relay: string }[]): string {
    let key = JSON.parse(JSON.stringify(identityKey));
    let sharedKey = "";
    selectedChains.forEach((chain) => {
      if (!IdentityKey.containsChainId(key, chain.chainId, chain.relay)) {
        key = IdentityKey.newCipher(key, chain.chainId, chain.relay);
        throw new Error(`Cipher for chain #${chain.relay}${chain.chainId} not found`);
      }
      sharedKey += `${chain.relay}${chain.chainId}:${IdentityKey.getChainCipher(
        key,
        chain.chainId,
        chain.relay
      )};`;
    });

    return sharedKey;
  }

  public static containsChainId(identityKey: string, chainId: number, relay: string): boolean {
    const startIndex = identityKey.indexOf(`${relay}${chainId}:`);

    return startIndex >= 0 ? true : false;
  }

  private static generateCipher = () => {
    const cipher = crypto.randomBytes(16); // Generate a 128 bit key.
    const base64Cipher = cipher.toString('base64');
    return base64Cipher;
  };
}

export default IdentityKey;
