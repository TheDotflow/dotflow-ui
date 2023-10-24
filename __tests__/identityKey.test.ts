import IdentityKey from "../src/utils/identityKey";

describe("IdentityKey", () => {
  test("Creating a new cipher works", () => {
    // Identity key would be stored in `window.localStorage`, but in the tests it
    // will simply be stored locally.
    let identityKey = "";

    const polkadotChainId = 0;
    identityKey = IdentityKey.newCipher(identityKey, polkadotChainId, "polkadot");

    containsChainAndCipher(identityKey, polkadotChainId);

    const moonbeamChainId = 1;
    // Generate a new cipher for the Moonbeam chain.
    identityKey = IdentityKey.newCipher(identityKey, moonbeamChainId, "polkadot");

    // The identity Key should still have the Polkadot cipher.
    containsChainAndCipher(identityKey, polkadotChainId);

    containsChainAndCipher(identityKey, moonbeamChainId);

    // Ciphers are randomly generated so the two ciphers cannot be the same.
    const polkadotCipher = IdentityKey.getChainCipher(identityKey, polkadotChainId, "polkadot");
    const moonbeamCipher = IdentityKey.getChainCipher(identityKey, moonbeamChainId, "polkadot");

    expect(polkadotCipher).not.toBe(moonbeamCipher);

    // Cannot create a new Cipher for the same chain twice.
    expect(() => IdentityKey.newCipher(identityKey, moonbeamChainId, "polkadot"))
      .toThrow("There already exists a cipher that is attached to the provided chainId");
  });

  test("Updating cipher works", () => {
    let identityKey = "";

    const polkadotChainId = 0;
    const moonbeamChainId = 1;

    identityKey = IdentityKey.newCipher(identityKey, polkadotChainId, "polkadot");
    identityKey = IdentityKey.newCipher(identityKey, moonbeamChainId, "polkadot");

    containsChainAndCipher(identityKey, polkadotChainId);
    containsChainAndCipher(identityKey, moonbeamChainId);

    const polkadotCipher = IdentityKey.getChainCipher(identityKey, polkadotChainId, "polkadot");
    const moonbeamCipher = IdentityKey.getChainCipher(identityKey, moonbeamChainId, "polkadot");

    identityKey = IdentityKey.updateCipher(identityKey, moonbeamChainId, "polkadot");
    const newMoonbeamCipher = IdentityKey.getChainCipher(identityKey, moonbeamChainId, "polkadot");

    // The moonbeam chain cipher should be updated.
    expect(moonbeamCipher).not.toBe(newMoonbeamCipher);

    // The polkadot cipher shouldn't be affected. 
    expect(IdentityKey.getChainCipher(identityKey, polkadotChainId, "polkadot")).toBe(polkadotCipher);
  });

  test("Encryption and decryption works", () => {
    let identityKey = "";

    const polkadotChainId = 0;
    identityKey = IdentityKey.newCipher(identityKey, polkadotChainId, "polkadot");

    containsChainAndCipher(identityKey, polkadotChainId);

    const polkadotAddress = "126X27SbhrV19mBFawys3ovkyBS87SGfYwtwa8J2FjHrtbmA";
    const encryptedAddress = IdentityKey.encryptAddress(identityKey, polkadotChainId, polkadotAddress, "polkadot");
    const decryptedAddress = IdentityKey.decryptAddress(identityKey, polkadotChainId, encryptedAddress, "polkadot");

    expect(polkadotAddress).toBe(decryptedAddress);
  });
});

const containsChainAndCipher = (identityKey: string, chainId: number) => {
  const containsChain = new RegExp(`\\bpolkadot${chainId}:`, "g");
  expect(containsChain.test(identityKey)).toBe(true);

  const chainCipher = IdentityKey.getChainCipher(identityKey, chainId, "polkadot");
  expect(cipherSize(chainCipher)).toBe(16);
}

const cipherSize = (cipher: string) => Buffer.from(cipher, "base64").length;
