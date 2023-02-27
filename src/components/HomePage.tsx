import { NftSwapV4 } from "@traderxyz/nft-swap-sdk";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useNetwork, useProvider, useSigner } from "wagmi";

export default function HomePage() {
  const [listings, setListings] = useState<NFT[]>([]);
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
        // Search the orderbook for all offers to sell this NFT
        // const orders = await nftSwap.getOrders({
        //     nftToken: "0x6c5f845d51ddd7b0b984ffe4e192b08139239df0",
        //     nftTokenId: "0",
        //     chainId: "137",
        // }).then((data) => console.log(data))

        // Or search by unique nonce
        const orders = await nftSwap
          .getOrders({
            nonce: [
              "100131415900000000000000000000000000000276185235917101268862840355497358305889",
              // "100131415900000000000000000000000000000054887828326430594724601084998014893334",
              // "100131415900000000000000000000000000000225316437359722698324679934540173202820",
              // "100131415900000000000000000000000000000084224611060913882720332927576414336393",
            ],
          })
          // .then((data) => console.log(data?.orders))
          .then((data) => setListings(data?.orders))
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
        {listings?.map(
          (listing) =>
            true && (
              <Link
                href={`/buy/${listing?.nftToken}/${listing?.nftTokenId}?nonce=${listing?.order.nonce}`}
                key={listing?.token_id}
              >
                <div className="m-2 border border-purple-900 rounded-2xl cursor-pointer overflow-hidden hover:scale-105 ease-in-out duration-200 w-80 h-100 max-w-[300px]">
                  <div className="relative">
                    {/* <img
                      src={listing?.cached_file_url || listing?.file_url}
                      alt="NFT_IMAGE"
                    /> */}
                  </div>
                  <h3 className="p-2 ellipsis">
                    {listing?.name || listing?.nftTokenId}
                  </h3>
                </div>
              </Link>
            )
        )}
      </div>
    </div>
  );
}
