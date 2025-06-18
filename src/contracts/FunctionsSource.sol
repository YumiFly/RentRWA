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
        "const encoded = abiCoder.encode([`uint256`, `uint256`], [deadlineTime, item.price]);"
        "return ethers.getBytes(encoded);";

    string public getPrices =
        "const { ethers } = await import('npm:ethers@6.10.0');"
        "const abiCoder = ethers.AbiCoder.defaultAbiCoder();"
        "const tokenId = args[0];"
        "const apiResponse = await Functions.makeHttpRequest({"
        "    url: `https://api.bridgedataoutput.com/api/v2/OData/test/Property('P_5dba1fb94aa4055b9f29696f')?access_token=6baca547742c6f96a6ff71b138424f21`,"
        "});"
        "const listPrice = Number(apiResponse.data.ListPrice);"
        "const originalListPrice = Number(apiResponse.data.OriginalListPrice);"
        "const taxAssessedValue = Number(apiResponse.data.TaxAssessedValue);"
        "const encoded = abiCoder.encode([`uint256`, `uint256`, `uint256`, `uint256`], [tokenId, listPrice, originalListPrice, taxAssessedValue]);"
        "return ethers.getBytes(encoded);";
}
