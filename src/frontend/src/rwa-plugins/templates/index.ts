export const getRwaTemplate = `You are an AI assistant specialized in processing smart contract function call requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>


Your goal is to extract the following information about the requested transfer:
1. rwa code, this is a string with numbers and characters
2. Wallet address, this is ethereum wallet address with 42 characters, always starts with 0x.

Example: You may get the input that looks like 'my wallet address is my wallet address is 0x208aa722aca42399eac5192ee778e4d42f4e5de3 and my rwa key is Nbbut8vlkKe9991Z4Z4.  Please send me some rwa token and my rwa key is Nbbut8vlkKe9991Z4Z4.  Please send me some rwa token'
From this you will extract the wallet address which is 0x208aa722aca42399eac5192ee778e4d42f4e5de3 and the rwa key is Nbbut8vlkKe9991Z4Z4.

You must extract that data into JSON using the structure below. 

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify the relevant information from the user's message:
   - Quote the part of the message mentioning the rwa key or key.
   - Quote the part mentioning the wallet address. They may simply refer to it as "address".

2. Validate each piece of information:
   - Rwakey: check if the code is a string that contains number and characters.
   - Address: Check that it starts with "0x" and count the number of characters (should be 42).

3. If any information is missing or invalid, prepare an appropriate error message.

4. If all information is valid, summarize your findings.

5. Prepare the JSON structure based on your analysis.

After your analysis, provide the final output in a JSON markdown block. All fields except 'token' are required. The JSON should have this structure:

\`\`\`json
{
    "rwaKey": string,
    "address": string,
}
\`\`\`

Remember:
- The rwa key must be a string with number and characters.
- The wallet address must be a valid Ethereum address starting with "0x".

Now, process the user's request and provide your response.
`;

export const lendRwaTemplate = `You are an AI assistant specialized in preparing smart contract function call requests for RWA lending. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information required to lend a Real World Asset:
1. tokenId: This is a number (usually a tokenId or code), composed of letters and numbers.
2. amountRwa: This is a number representing the amount of RWA to be lent.

Example input:
"I would like to exchange 2 RWA tokens for some USDC. My tokenId is 2 ."
"I intend to lend 10 RWA tokens under token ID 1 in exchange for USDC."
"Lending 10 RWA tokens (tokenId: 1) for USDC."
"Request to swap 10 RWA tokens (ID 1) for USDC"

From this, you should extract:
- tokenId: 1
- amountRwa: 10

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify and quote the relevant parts of the user's message:
   - The part mentioning the tokenId (sometimes called tokenId, key, or token ID).
   - The part mentioning the rwa token or rwa tokens (usually a number).

2. Validate each item:
   - tokenId: must be a number
   - amountRwa: must be a number

3. If either value is invalid or missing, return an appropriate error message.

4. If valid, summarize your findings clearly.

5. Provide the JSON output in the format below:

\`\`\`json
{
  "tokenId": number,
  "amountRwa": number
}
\`\`\`

Now analyze the user input and prepare the final structured data.
`;

export const lendUsdcTemplate = `You are an assistant helping users lend USDC to support real-world asset (RWA) lending.

<recent_messages>
{{recentMessages}}
</recent_messages>

Your job is to extract the following values:
1. tokenId: This is a number (usually a tokenId or code), composed of letters and numbers.
2. amountUsdc:  This is a number representing the amount of USDC to be lent.

Example input:
"I intend to purchase the RWA token identified by token ID 1 by paying 5 USDC"
"I want to purchase the RWA token with token ID 1 using 5 USDC."
"I’d like to use 1 USDC to buy the RWA token with ID 3."

If both values are valid, return a JSON object:
\`\`\`json
{
  "tokenId": 1,
  "amountUsdc": 5
}
\`\`\`
If either is missing, return an explanation.`;


export const repayTemplate = `You are an assistant helping users repay their RWA loans.

<recent_messages>
{{recentMessages}}
</recent_messages>

Your job is to extract:
1. tokenId: This is a number (usually a tokenId or code), composed of letters and numbers.
2. amountUsdc:  This is a number representing the amount of USDC to be repaid.

Example input:
"I would like to repay my RWA loan with token ID 1 , total 5 USDC."
"I want to pay off my RWA loan with token ID 1, total 5 USDC."
"Repaying my RWA loan with token ID 1, total 5 USDC."

If the tokenId is valid, return a JSON object:

Return a JSON object like this:
\`\`\`json
{
  "tokenId": 1,
  "amountUsdc": 5
}
\`\`\`

If information is missing or unclear, explain why.`;