import aesjs from "aes-js";
import crypto from "crypto";

class IdentityKey {
  public static newCipher(identityKey: string, networkId: number): string {
    const regexPattern = new RegExp(`\\b${networkId}:`, "g");
    if (regexPattern.test(identityKey)) {
      throw new Error("There already exists a cipher that is attached to the provided networkId");
    }

    const cipher = this.generateCipher();

    identityKey += `${networkId}:${cipher};`;
    return identityKey;
  }

  public static updateCipher(identityKey: string, networkId: number): string {
    const startIndex = identityKey.indexOf(`${networkId}:`);

    if (startIndex >= 0) {
      const newCipher = this.generateCipher();

      const endIndex = identityKey.indexOf(";", startIndex);
      identityKey =
        identityKey.substring(0, startIndex + networkId.toString().length + 1) + newCipher + identityKey.substring(endIndex);
    } else {
      throw new Error("Cannot find networkId");
    }

    return identityKey;
  }

  public static encryptAddress(identityKey: string, networkId: number, address: string): string {
    const cipherBase64 = this.getNetworkCipher(identityKey, networkId);
    const cipher = Buffer.from(cipherBase64, "base64");

    const aesCtr = new aesjs.ModeOfOperation.ctr(cipher);
    const encryptedAddress = aesCtr.encrypt(Buffer.from(address, "utf-8"));

    return Buffer.from(encryptedAddress).toString("base64");
  }

  public static decryptAddress(identityKey: string, networkId: number, address: string): string {
    const cipherBase64 = this.getNetworkCipher(identityKey, networkId);
    const cipher = Buffer.from(cipherBase64, "base64");

    const aesCtr = new aesjs.ModeOfOperation.ctr(cipher);
    const decryptedAddress = aesCtr.decrypt(Buffer.from(address, "base64"));

    return Buffer.from(decryptedAddress.buffer).toString();
  }

  public static getNetworkCipher(identityKey: string, networkId: number): string {
    const startIndex = identityKey.indexOf(`${networkId}:`);

    if (startIndex >= 0) {
      const endIndex = identityKey.indexOf(";", startIndex);
      return identityKey.substring(startIndex + networkId.toString().length + 1, endIndex - 1);
    } else {
      throw new Error("Cannot find networkId");
    }
  }

  public static containsNetworkId(identityKey: string, networkId: number): boolean {
    const startIndex = identityKey.indexOf(`${networkId}:`);

    return startIndex >= 0 ? true : false;
  }

  private static generateCipher = () => {
    const cipher = crypto.randomBytes(16); // Generate a 128 bit key.
    const base64Cipher = cipher.toString('base64');
    return base64Cipher;
  };
}

export default IdentityKey;
