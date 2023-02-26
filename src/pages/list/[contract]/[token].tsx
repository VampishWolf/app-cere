import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAccount, useNetwork } from "wagmi";

interface TokenProps {
  contractAddress: string;
  tokenId: string;
}

export default function Token() {
  interface Metadata {
    name: string;
    description: string;
    image: string;
  }

  interface FileInformation {
    height: number;
    width: number;
    file_size: number;
  }

  interface NFT {
    chain: string;
    contract_address: string;
    token_id: string;
    metadata_url: string;
    metadata: Metadata;
    file_information: FileInformation;
    file_url: string;
    animation_url: string | null;
    cached_file_url: string;
    cached_animation_url: string | null;
    creator_address: string;
    mint_date: string | null;
    updated_date: string;
  }

  const router = useRouter();
  const { query, asPath } = router;

  const tokens = asPath.split("/");

  const contractAddress = tokens[tokens.length - 2];
  const tokenId = tokens[tokens.length - 1];

  const { chain } = useNetwork();
  const [nft, setNft] = useState<NFT[]>([]);
  const [errorProof, setErrorProof] = useState<Error | null>(null);
  const [loadingNft, setLoadingNft] = useState<boolean>(false);

  useEffect(() => {
    const fetchNft = async () => {
      setLoadingNft(true);
      try {
        const options = {
          method: "GET",
          headers: {
            accept: "application/json",
            Authorization: "c8e0e790-87a7-410c-b684-62ad610b00b2",
          },
        };

        await fetch(
          `https://api.nftport.xyz/v0/nfts/${contractAddress}/${tokenId}?chain=${chain?.name.toLowerCase()}&refresh_metadata=false`,
          options
        )
          .then((res) => res.json())
          // .then((res) => console.log(res.nft));
          .then((data) => setNft(data.nft));
      } catch (error) {
        console.log(error);
        // setErrorProof(error)
      } finally {
        setLoadingNft(false);
      }
    };
    fetchNft();
  }, [tokenId, contractAddress]);

  return (
    <div className="m-8">
      <h1 className="font-bold text-2xl my-4">List NFT</h1>
      {nft?.file_url && (
        <div className="flex justify-between w-80 max-w-[300px]">
          <section>
            <img src={nft?.cached_file_url || nft?.file_url} alt="NFT_IMAGE" />
            <p className="text-lg font-bold">{nft?.token_id}</p>
          </section>
          <section></section>
        </div>
      )}
    </div>
  );
}
