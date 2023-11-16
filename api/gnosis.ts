import { http }  from "viem";


export default function gnosisLink() {
  return http(process.env.GNOSIS_URL, {
        fetchOptions: { 
          headers: {
            'Authorization': `Bearer ${process.env.GNOSIS_API_KEY}`
          }
        }
      })
}