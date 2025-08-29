import axios from "axios";
import { PaymentError } from "../errors/index.js";
import { asyncHandler } from "../middleware/async.js";

// Constants
const OAUTH_URL = "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials";
const STK_PUSH_URL = "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest";

/**
 * Normalizes phone number to MPESA format (2547XXXXXXXX)
 */
const normalizePhone = (phone) => {
  if (!phone) throw new PaymentError("Phone number is required");
  
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, "");
  
  // Convert to 254 format
  if (normalized.startsWith("0") && normalized.length === 10) {
    normalized = `254${normalized.substring(1)}`;
  } else if (normalized.startsWith("7") && normalized.length === 9) {
    normalized = `254${normalized}`;
  }
  
  // Final validation
  if (!/^254[17]\d{8}$/.test(normalized)) {
    throw new PaymentError("Invalid MPESA phone number format");
  }
  
  return normalized;
};

/**
 * Generates MPESA API token
 */
const generateToken = async () => {
  try {
    const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
    
    const response = await axios.get(OAUTH_URL, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 5000
    });

    if (!response.data.access_token) {
      throw new PaymentError("Invalid token response");
    }

    return response.data.access_token;
  } catch (error) {
    console.error("MPESA Token Error:", error.response?.data || error.message);
    throw new PaymentError("Failed to generate MPESA token");
  }
};

/**
 * Initiate STK Push payment request
 */
export const stkPush = asyncHandler(async ({ phone, amount, accountRef, callbackUrl }) => {
  // Validate inputs
  if (!phone || !amount || !accountRef || !callbackUrl) {
    throw new PaymentError("Missing required parameters");
  }

  const normalizedPhone = normalizePhone(phone);
  const token = await generateToken();
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
  const password = Buffer.from(
    `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
  ).toString("base64");

  try {
    const response = await axios.post(
      STK_PUSH_URL,
      {
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: normalizedPhone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: accountRef,
        TransactionDesc: `Order ${accountRef}`
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    if (!response.data.MerchantRequestID || !response.data.CheckoutRequestID) {
      throw new PaymentError("Invalid MPESA response");
    }

    return {
      success: true,
      merchantRequestId: response.data.MerchantRequestID,
      checkoutRequestId: response.data.CheckoutRequestID,
      responseDescription: response.data.ResponseDescription
    };
  } catch (error) {
    console.error("MPESA STK Push Error:", error.response?.data || error.message);
    throw new PaymentError(
      error.response?.data?.errorMessage || 
      "MPESA payment request failed"
    );
  }
});