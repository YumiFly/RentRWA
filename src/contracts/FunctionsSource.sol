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
        "const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcXloam1od3RqYndmb2xxem51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTQ2MTIsImV4cCI6MjA2NTAzMDYxMn0.XoqTd1m4qzWBvUGeI3UtAZ7p27cWMR1gF28QbsxfNX0';"
        "const apiResponse = await Functions.makeHttpRequest({url: `https://sjqyhjmhwtjbwfolqznu.supabase.co/rest/v1/rent_rwa_lend?select=*`,method: 'GET',headers: { 'apikey': apikey}});"
        "if (apiResponse.error) {throw Error('Request failed');}"
        "const item = apiResponse.data.find(item => item.rwa_id == rwaKey);"
        "if(item == undefined) {throw Error('Not found!');}"
        "const complexData = {price: item.price, proof: item.proof_url,};"
        "const types = ['tuple(uint256 price, string proof)'];"
        "const encoded = abiCoder.encode(types, [complexData]);return ethers.getBytes(encoded);";

    // string public getRentRWAInfo =
    //     "const { ethers } = await import('npm:ethers@6.10.0');"
    //     "const abiCoder = ethers.AbiCoder.defaultAbiCoder();"
    //     "const rwaKey = args[0];"
    //     "//if(!secrets.apikey) { throw Error('Error: Supabase API Key is not set!') };"
    //     "const apikey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqcXloam1od3RqYndmb2xxem51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0NTQ2MTIsImV4cCI6MjA2NTAzMDYxMn0.XoqTd1m4qzWBvUGeI3UtAZ7p27cWMR1gF28QbsxfNX0';"
    //     "const apiResponse = await Functions.makeHttpRequest({"
    //         "url: `https://sjqyhjmhwtjbwfolqznu.supabase.co/rest/v1/rent_rwa_lend?select=*`,"
    //         "method: 'GET',"
    //         "headers: { 'apikey': apikey}"
    //     "});"
    //     "if (apiResponse.error) {throw Error('Request failed');}"
    //     "const item = apiResponse.data.find(item => item.rwa_id == rwaKey);"
    //     "if(item == undefined) {throw Error('Not found!');}"
    //     "const deadlineTime = new Date(item.deadline).getTime();"
    //     "const complexData = {"
    //         "deadline: deadlineTime,"
    //         "price: item.price,"
    //         "proofUrl: item.proof_url,"
    //     "}"
    //     "const types = ['tuple(uint256 deadline, uint256 price, string proofUrl)'];"
    //     "const encoded = abiCoder.encode(types, [complexData]);"
    //     "return ethers.getBytes(encoded);";

    function setRentRWAInfo(string memory info) public  {
        getRentRWAInfo = info;
    }
}
