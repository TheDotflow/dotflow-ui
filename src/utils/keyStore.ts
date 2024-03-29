import IdentityKey from "./identityKey";

const LS_KEY_STORE = 'dotflow-key-store';

interface IKeyStore {
  [key: number]: string;
}

class KeyStore {
  private static readKeyStore(): IKeyStore {
    const keys = localStorage.getItem(LS_KEY_STORE);
    if (!keys) {
      // local storage item for the key store doesn't exist.
      return {};
    }
    try {
      const keyObj = JSON.parse(keys) as IKeyStore;
      return keyObj;
    } catch (e) {
      // Failed to parse the local storage item
      return {};
    }
  }

  public static updateKeyStore(ks: IKeyStore) {
    for (const key in ks) {
      if (!IdentityKey.sanityCheck(JSON.parse(JSON.stringify(ks[key])))) {
        throw new Error("The identity key is invalid");
      }
    }

    localStorage.setItem(LS_KEY_STORE, JSON.stringify(ks));
  }

  public static readIdentityKey(identityNo: number): string | null {
    const keyObj = this.readKeyStore();
    return keyObj[identityNo] || null;
  }

  public static updateIdentityKey(identityNo: number, key: string) {
    const keyObj: IKeyStore = this.readKeyStore();
    Object.assign(keyObj, { [identityNo]: key });
    this.updateKeyStore(keyObj);
  }

  public static removeIdentityKey(identityNo: number) {
    const keyObj: IKeyStore = this.readKeyStore();
    delete keyObj[identityNo];
    this.updateKeyStore(keyObj);
  }
}

export default KeyStore;
