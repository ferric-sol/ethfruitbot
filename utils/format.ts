
import { formatEther } from "viem";

export default function formatEtherTg(data) { 
  const price = formatEther(data);
  return `${(+price).toFixed(4)}`;
}