import axios from 'axios';

const ss58registry = async (chainName: string): Promise<number | null> => {
  const ss58Registry = (await axios.get('https://raw.githubusercontent.com/paritytech/ss58-registry/main/ss58-registry.json')).data.registry;

  const result: any = ss58Registry.find((chain: any) => chain.network === chainName);

  if (!result) {
    return null
  }

  return result.prefix;
}

export default ss58registry;