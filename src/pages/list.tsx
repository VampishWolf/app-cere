import { Input, Button  } from "@nextui-org/react";
import Link from "next/link";


export default function List() {
  
  return (
    <div className="text-center m-12">

        <h2 className="text-2xl font-bold">List your NFT</h2>
        <div className="my-8 flex flex-col gap-8 w-1/4 m-auto">
            <Input labelPlaceholder="Contract Address" />
            <Input labelPlaceholder="Token Id" />
            <Button>List</Button>
        </div>
    </div>
  );
}
