import { Binary, TxCallData, TxFinalizedPayload } from "polkadot-api";
import { addressOf, buildAccount, publicKeyOf } from "../../config/account";
import { Chain, magicApi } from "../../config/api";
import { makeRemark, submit } from "../../config/calls";

// This is you account if you do not have one
// use node run generate
const myAccount = addressOf(publicKeyOf());
console.log("My account:", myAccount);

const myLuckyNumber = (nextTokenIn: number = 1) => {
  if (!nextTokenIn) {
    return 0;
  }

  if (nextTokenIn < 2) {
    return 1;
  }
  // do a sum from your public key
  const lucky = publicKeyOf().reduce((v, acc) => {
    return acc + v;
  }, 0);

  // find the collection
  return (lucky % nextTokenIn) - 1;
};

console.log("My lucky number:", myLuckyNumber(10));

// We will use AssetHub Paseo, but you can pass any valid
// AssetHub here

// 1.Create an API instance for the Polkadot Assethub
const { api, disconnect } = magicApi("ahpas");
console.log("Connected to Polkadot AssetHub");

// 2. Query the amount of collections
// 3. Query the list of collections
const collections = await api.query.Nfts.Collection.getEntries();
const collectionCount = collections.length;
console.log("Total collections:", collectionCount);
console.log("collections", collections);

// 4. Query the `getNextCollectionId`

const nextCollectionId = await api.query.Nfts.NextCollectionId;
console.log("Next Collection ID:", nextCollectionId.toString());

// 5. for the lucky number query pricess for the NFTs in the collection (id is the lucky number)
const luckyCollectionId = myLuckyNumber(Number(nextCollectionId));
console.log("Lucky Collection ID:", luckyCollectionId);

// 6. calculate the price (format to human readable format) // price / 10**10

let floorPrice = Infinity;

const items = await api.query.Nfts.Item.getEntries(luckyCollectionId);

const itemsArray = Array.from(items);
itemsArray.forEach((entry) => {
  const { keyArgs, value} = entry;
  
  // Extract price if it exists
  // if (data?.price) {
  //   const price = Number(data.price) / Math.pow(10, 10);
  //   floorPrice = Math.min(floorPrice, price);
  // }
});

// 7. initialize the api for Paseo AssetHub
// const { api: paseoApi, disconnect: paseoBye } = magicApi("ahpas");

// 8. construct remark
// const remark = makeRemark({ api: paseoApi }, `_`);
// 9. sumbit and await for the TX
// const tx = await submit([]);

// 10. console log the tx
// console.log("BLOCK:", tx.block);
// console.log("EVENTS:", tx.events);
// console.log("HASH:", tx.txHash);
