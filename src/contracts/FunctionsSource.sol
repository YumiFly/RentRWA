// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
abstract contract FunctionsSource {
    string public getRentRWAInfo =
        "const { ethers } = await import('npm:ethers@6.10.0');"
        "const abiCoder = ethers.AbiCoder.defaultAbiCoder();"
        "const rwaKey = args[0];"
        'if(!secrets.apikey) { throw Error("Error: Supabase API Key is not set!") };'
        "const apikey = secrets.apikey;"
        "const apiResponse = await Functions.makeHttpRequest({"
        'url: "https://sjqyhjmhwtjbwfolqznu.supabase.co/rest/v1/rent_rwa_lend?select=*",'
        'method: "GET",'
        'headers: { "apikey": secrets.apikey}'
        "});"
        "if (apiResponse.error) {"
        "console.error(apiResponse.error);"
        'throw Error("Request failed: " + apiResponse.message);'
        "};"
        "const item = apiResponse.data.find(item => item.rwa_id == rwaKey);"
        'if(item == undefined) {return Functions.encodeString("not found")};'
        "const deadlineTime = new Date(item.deadline).getTime();"
        "const encoded = abiCoder.encode([`uint256`, `uint256`,`string`], [deadlineTime, item.price, item.proof_url]);"
        "return ethers.getBytes(encoded);";
}
