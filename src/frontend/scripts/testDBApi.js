import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = "https://nwkmcizenqgokebiuass.supabase.co"; // dev TODO

// fetch from supabase API and pass API Key as header
const response = await fetch(`${supabaseUrl}/rest/v1/rent_rwa_lend?select=*`, {
  headers: {
    apikey: process.env.SUPABASE_API_KEY,
  },
});
const data = await response.json();
console.log("DATA FROM DB:   ", data);
