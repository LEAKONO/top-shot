import axios from "axios";

const OAUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

export const getToken = async () => {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const res = await axios.get(OAUTH_URL, { headers: { Authorization: `Basic ${auth}` } });
  return res.data.access_token;
};

// phone should be in format 2547XXXXXXXX or 07XXXXXXXX
const normalizePhone = (phone) => {
  if (!phone) return phone;
  let p = phone.replace(/\s|\+|-/g, "");
  if (p.startsWith("07")) p = "254" + p.slice(1);
  if (p.startsWith("7")) p = "254" + p;
  return p;
};

export const stkPush = async ({ phone, amount, accountRef, callbackUrl }) => {
  const token = await getToken();
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 14);
  const password = Buffer.from(process.env.MPESA_SHORTCODE + process.env.MPESA_PASSKEY + timestamp).toString("base64");

  const normalized = normalizePhone(phone);

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Number(amount),
    PartyA: normalized,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: normalized,
    CallBackURL: callbackUrl,
    AccountReference: accountRef,
    TransactionDesc: `Topshot Order ${accountRef}`
  };

  const res = await axios.post(STK_PUSH_URL, payload, { headers: { Authorization: `Bearer ${token}` } });
  return res.data; // contains MerchantRequestID, CheckoutRequestID, ResponseCode, ResponseDescription
};
