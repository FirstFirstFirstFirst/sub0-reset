import { ApiPromise } from "./api";

export async function getNextCollectionId({
  api,
}: ApiPromise): Promise<number | undefined> {
  // Use getValue() to get the storage value from Nfts.NextCollectionId
  const nextCollectionId = await api.query.Nfts.NextCollectionId.getValue();
  return nextCollectionId;
}

export async function getCollection(
  { api }: ApiPromise,
  collectionId: number
): Promise<any> {
  // Get collection data using getValue with the collectionId parameter
  const collection = await api.query.Nfts.Collection.getValue(collectionId);

  // Return collection data
  if (collection) {
    return collection;
  }
  return undefined;
}

type CollectionEntry = {
  keyArgs: [number];
  value: {
    owner: string; // SS58String
    owner_deposit: bigint;
    items: number;
    item_metadatas: number;
    item_configs: number;
    attributes: number;
  };
};

export async function getCollectionList({ api }: ApiPromise): Promise<any> {
  // Get all collections using getEntries
  const collections: CollectionEntry[] =
    await api.query.Nfts.Collection.getEntries();

  // Map the entries to a more usable format
  return collections.map((entry) => ({
    id: entry.keyArgs[0].toString(),
    details: {
      owner: entry.value.owner,
      owner_deposit: entry.value.owner_deposit.toString(),
      items: entry.value.items,
      item_metadatas: entry.value.item_metadatas,
      item_configs: entry.value.item_configs,
      attributes: entry.value.attributes,
    },
  }));
}
