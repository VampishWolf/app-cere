import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

export default function Profile() {
  const { address, isConnected } = useAccount();
  const { chain } = useNetwork();
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [errorProof, setErrorProof] = useState<Error | null>(null);
  const [loadingNfts, setLoadingNfts] = useState<boolean>(false);

  interface NFT {
    contract_address: string;
    token_id: string;
    name: string;
    description: string | null;
    file_url: string;
    animation_url: string | null;
    cached_file_url: string;
    cached_animation_url: string | null;
    creator_address: string;
    metadata: {
      attributes: Array<{
        trait_type: string;
        value: string | number | boolean;
        display_type?: string;
      }>;
      external_url: string;
      image: string;
      name: string;
      description: string;
    };
    metadata_url: string;
  }

  useEffect(() => {
    async function fetchNfts() {
      setLoadingNfts(true);
      try {
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "c8e0e790-87a7-410c-b684-62ad610b00b2",
          },
        };

        await fetch(
          "https://api.nftport.xyz/v0/accounts/" +
            address +
            "?chain=" +
            chain?.name.toLowerCase() +
            "&page_size=50",
          options
        )
          .then((res) => res.json())
          // .then(res => console.log(res.nfts))
          .then((data) => setNfts(data.nfts));
      } catch (error) {
        console.log(error);
        // setErrorProof(error)
      } finally {
        setLoadingNfts(false);
      }
    }
    fetchNfts();
  }, [chain, address]);

  return (
    <div className="m-12">
      <div>
        <h2 className="font-bold text-2xl">Owned NFTs</h2>
        <div className="container flex items-center my-6 flex-wrap ">
          {nfts?.map(
            (nft) =>
              nft?.file_url && (
                <Link
                  href={`/list/${nft?.contract_address}/${nft?.token_id}`}
                  key={nft?.token_id}
                >
                  <div className="m-2 border border-purple-900 rounded-2xl cursor-pointer overflow-hidden hover:scale-105 ease-in-out duration-200 w-80 h-100 max-w-[300px]">
                    <div className="relative">
                      <img
                        src={nft?.cached_file_url || nft?.file_url}
                        alt="NFT_IMAGE"
                      />
                    </div>
                    <h3 className="p-2 ellipsis">
                      {nft?.name || nft?.token_id}
                    </h3>
                  </div>
                </Link>
              )
          )}
        </div>
      </div>
    </div>
  );
}
