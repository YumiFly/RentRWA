// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import {RealRentToken} from "./RealRentToken.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";
import {FunctionsSource} from "./FunctionsSource.sol";

/**
 * THIS IS AN EXAMPLE CONTRACT THAT USES HARDCODED VALUES FOR CLARITY.
 * THIS IS AN EXAMPLE CONTRACT THAT USES UN-AUDITED CODE.
 * DO NOT USE THIS CODE IN PRODUCTION.
 */
contract RentIssuer is FunctionsClient, FunctionsSource, OwnerIsCreator {
    using FunctionsRequest for FunctionsRequest.Request;

    error LatestIssueInProgress();
    error UnexpectedRequestID(bytes32);

    struct FractionalizedNft {
        address to;
        string rwaKey;
        uint256 amount;
        uint256 deadline;
        string proof;
        uint256 tokenId;
    }

    RealRentToken public immutable i_realRentToken;

    bytes public s_lastResponse;
    bytes public s_lastError;

    bytes32 public s_lastRequestId;
    uint256 public s_nextTokenId;
    uint64 public subscriptionId = 15530;
    uint32 public gasLimit = 300000;
    bytes32 public donID = 0x66756e2d6176616c616e6368652d66756a692d31000000000000000000000000;

    address public constant functionsRouterAddress = 0xA9d587a00A31A52Ed70D6026794a8FC5E2F5dCb0;

    mapping(bytes32 requestId => FractionalizedNft) public s_issuesInProgress;

    event Issued(address to, bytes32 requestId);

    //constructor(address realRentToken, address functionsRouterAddress, uint64 _subscriptionId, uint32 _gasLimit, bytes32 _donID) FunctionsClient(functionsRouterAddress) {
    constructor(address realRentToken) FunctionsClient(functionsRouterAddress) {
        // subscriptionId = _subscriptionId;
        // gasLimit = _gasLimit;
        // donID = _donID;
        i_realRentToken = RealRentToken(realRentToken);
    }

    function issue(address to, string[] calldata args)
        external
        returns (bytes32 requestId)
    {
        if (s_lastRequestId != bytes32(0)) {
            revert LatestIssueInProgress();
        }

        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(this.getRentRWAInfo());
        if (args.length <= 0) revert("no arguments provided");

        req.setArgs(args);
        
        requestId = _sendRequest(req.encodeCBOR(), subscriptionId, gasLimit, donID);

        s_issuesInProgress[requestId] = FractionalizedNft(to, args[0], 0, 0, "", 0);
        
        s_lastRequestId = requestId;
    }

    function cancelPendingRequest() external onlyOwner {
        s_lastRequestId = bytes32(0);
    }

    function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) internal override {
        if (err.length != 0) {
            revert(string(err));
        }
        if (s_lastRequestId != requestId) {
            revert UnexpectedRequestID(requestId);
        }
        s_lastResponse = response;
        s_lastError = err;

        (uint256 answer, uint256 price, string memory proof) = abi.decode(response, (uint256, uint256, string));
        
        s_issuesInProgress[requestId].amount = price;
        s_issuesInProgress[requestId].proof = proof;
        //s_issuesInProgress[requestId].deadline = ddline;
        emit Issued(s_issuesInProgress[requestId].to , requestId);
        s_lastRequestId = bytes32(0);
    }

    function RentTokenMint(bytes32 requestId) external returns (uint256) {
        uint256 tokenId = s_nextTokenId++;
        FractionalizedNft memory fractionalizedNft = s_issuesInProgress[requestId];
        i_realRentToken.mint(fractionalizedNft.to, tokenId, fractionalizedNft.amount, "", fractionalizedNft.proof);
        s_issuesInProgress[requestId].tokenId = tokenId;
        return tokenId;
    }
}
