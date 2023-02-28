import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNetwork, useProvider, useSigner } from "wagmi";

export default function HomePage() {
  interface Listing {
    _id: string;
    nonce: string;
    fileUrl: string;
    contractAddress: string;
    price: string;
    tokenId: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }

  const [savedListings, setSavedtListings] = useState<Listing[]>([]);
  const [errorProof, setErrorProof] = useState<Error | null>(null);
  const [loadingListings, setLoadingListings] = useState<boolean>(false);

  const { chain } = useNetwork();
  const provider = useProvider();
  const { data: signer, isError, isLoading } = useSigner();
  const nftSwap = new NftSwapV4(provider, signer, chain?.id);

  useEffect(() => {
    async function fetchNfts() {
      setLoadingListings(true);
      try {
        const res = await fetch("/api/listings");
        const data = await res.json();

        // Saves only unique tokenIds with lowest price
        const uniqueTokens = {};
        data.forEach((obj:Listing) => {
          if (
            !uniqueTokens[obj.tokenId] ||
            uniqueTokens[obj.tokenId].price > obj.price
          ) {
            uniqueTokens[obj.tokenId] = obj;
          }
        });

        const result = Object.values(uniqueTokens);

        setSavedtListings(result);
      } catch (error) {
        console.log(error);
        // setErrorProof(error)
      } finally {
        setLoadingListings(false);
      }
    }
    fetchNfts();
  }, [chain]);

  return (
    <div className="m-12">
      <h2 className="font-bold text-2xl">Listed NFTs</h2>
      <div className="container flex items-center my-6 flex-wrap ">
        {savedListings.length > 0 &&
          savedListings?.map(
            (listing) =>
              true && (
                <Link
                  href={`/buy/${listing?.contractAddress}/${listing?.tokenId}?nonce=${listing?.nonce}&listingId=${listing._id}`}
                  key={listing?.tokenId}
                >
                  <div className="m-2 border border-purple-900 rounded-2xl cursor-pointer overflow-hidden hover:scale-105 ease-in-out duration-200 w-80 h-100 max-w-[300px]">
                    <div className="relative">
                      <img src={listing?.fileUrl} alt="NFT_IMAGE" />
                    </div>
                    <div className="flex justify-between items-center font-bold">
                      <p className="p-2 ellipsis">{listing?.tokenId}</p>
                      <p className="p-2 ellipsis">{listing?.price + " ETH"}</p>
                    </div>
                  </div>
                </Link>
              )
          )}
      </div>
    </div>
  );
}
