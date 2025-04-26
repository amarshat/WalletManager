import { Request, Response } from 'express';
import axios from 'axios';
import { PaysafeClient } from '../paysafe';

// Utility function to format request as curl
function formatAsCurl(method: string, url: string, headers: Record<string, string>, data?: any): string {
  let curl = `curl --location '${url}' \\\n`;
  
  // Add headers
  Object.entries(headers).forEach(([key, value]) => {
    curl += `  --header '${key}: ${value}' \\\n`;
  });
  
  // Add data if present
  if (data) {
    curl += `  --data '${JSON.stringify(data)}' \\\n`;
  }
  
  return curl.slice(0, -3); // Remove the last backslash and newline
}

// Initialize Paysafe client
const paysafeClient = new PaysafeClient();

// Health and auth test
export async function healthAuthTest(req: Request, res: Response) {
  try {
    console.log('\n------ STARTING HEALTH & AUTH TEST ------');
    
    // Get token
    console.log('Requesting access token...');
    const token = await paysafeClient.getToken();
    console.log('Access token received successfully');
    
    // Log masked token (for security reasons)
    const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 10);
    console.log(`Token: ${maskedToken}`);
    
    const apiUrl = `${process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets'}/v2/features`;
    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Log the request details
    console.log('\nAPI Request Details:');
    console.log(`Method: GET`);
    console.log(`URL: ${apiUrl}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    // Generate and log curl equivalent
    const curlCommand = formatAsCurl('GET', apiUrl, headers);
    console.log('\nCurl equivalent:');
    console.log(curlCommand);
    
    // Make a direct request to features endpoint
    console.log('\nSending request...');
    const response = await axios({
      method: 'get',
      url: apiUrl,
      headers
    });
    
    // Log success and response data
    console.log(`\nResponse Status: ${response.status}`);
    console.log('Response Headers:', JSON.stringify(response.headers, null, 2));
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    console.log('Health & Auth Test Success!');
    console.log('------ HEALTH & AUTH TEST COMPLETED ------\n');
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      statusCode: response.status,
      data: response.data,
      request: {
        url: apiUrl,
        method: 'GET',
        headers,
        curl: curlCommand
      }
    });
  } catch (error: any) {
    console.error('\nHealth & Auth Test Failed:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', error);
    }
    
    console.error('------ HEALTH & AUTH TEST FAILED ------\n');
    
    // Try to get token for request details (may not be available on error)
    let tokenInfo = "N/A";
    try {
      const token = await paysafeClient.getToken();
      tokenInfo = token.substring(0, 10) + '...' + token.substring(token.length - 10);
    } catch (err: any) {
      console.error("Cannot get token for error logging:", err.message);
    }

    return res.status(500).json({
      status: 'error',
      message: 'Authentication test failed',
      error: error.response?.data || error.message,
      request: {
        url: `${process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets'}/v2/features`,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokenInfo}`
        }
      }
    });
  }
}

// Wallet creation test
export async function createWalletTest(req: Request, res: Response) {
  try {
    console.log('\n------ STARTING WALLET CREATION TEST ------');
    console.log('Request payload:', JSON.stringify(req.body, null, 2));
    
    const { firstName, lastName, email, dateOfBirth, nationalId, customerId } = req.body;
    
    // Prepare wallet data
    const walletData = {
      customer: {
        firstName,
        lastName,
        email,
        dateOfBirth: dateOfBirth || null,
        nationalId: nationalId || null,
        id: customerId || null
      }
    };
    
    console.log('Requesting access token...');
    const token = await paysafeClient.getToken();
    console.log('Access token received successfully');
    
    // Log masked token
    const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 10);
    console.log(`Token: ${maskedToken}`);
    
    const apiUrl = `${process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets'}/v2/wallets`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Log the request details
    console.log('\nAPI Request Details:');
    console.log(`Method: POST`);
    console.log(`URL: ${apiUrl}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Request Body:', JSON.stringify(walletData, null, 2));
    
    // Generate and log curl equivalent
    const curlCommand = formatAsCurl('POST', apiUrl, headers, walletData);
    console.log('\nCurl equivalent:');
    console.log(curlCommand);
    
    console.log('\nSending request...');
    
    // Create wallet using PaysafeClient
    const response = await paysafeClient.createWallet(walletData);
    
    // Log success and response data
    console.log('\nResponse received:');
    console.log(JSON.stringify(response, null, 2));
    console.log('Wallet Creation Test Success!');
    console.log('------ WALLET CREATION TEST COMPLETED ------\n');
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      data: response,
      request: {
        url: apiUrl,
        method: 'POST',
        headers,
        body: walletData,
        curl: curlCommand
      }
    });
  } catch (error: any) {
    console.error('\nWallet Creation Test Failed:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', error);
    }
    
    console.error('------ WALLET CREATION TEST FAILED ------\n');
    
    return res.status(500).json({
      status: 'error',
      message: 'Wallet creation test failed',
      error: error.response?.data || error.message
    });
  }
}

// Deposit test
export async function depositTest(req: Request, res: Response) {
  try {
    console.log('\n------ STARTING DEPOSIT TEST ------');
    console.log('Request payload:', JSON.stringify(req.body, null, 2));
    
    const { customerId, amount, currencyCode, description } = req.body;
    
    const depositData = {
      customerId,
      amount,
      currencyCode,
      description: description || 'Test Deposit'
    };
    
    console.log('Requesting access token...');
    const token = await paysafeClient.getToken();
    console.log('Access token received successfully');
    
    // Log masked token
    const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 10);
    console.log(`Token: ${maskedToken}`);
    
    const apiUrl = `${process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets'}/v2/transactions/deposits`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Log the request details
    console.log('\nAPI Request Details:');
    console.log(`Method: POST`);
    console.log(`URL: ${apiUrl}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Request Body:', JSON.stringify(depositData, null, 2));
    
    // Generate and log curl equivalent
    const curlCommand = formatAsCurl('POST', apiUrl, headers, depositData);
    console.log('\nCurl equivalent:');
    console.log(curlCommand);
    
    console.log('\nSending request...');
    
    // Make deposit using PaysafeClient
    const response = await paysafeClient.depositMoney(depositData);
    
    // Log success and response data
    console.log('\nResponse received:');
    console.log(JSON.stringify(response, null, 2));
    console.log('Deposit Test Success!');
    console.log('------ DEPOSIT TEST COMPLETED ------\n');
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      data: response,
      request: {
        url: apiUrl,
        method: 'POST',
        headers,
        body: depositData,
        curl: curlCommand
      }
    });
  } catch (error: any) {
    console.error('\nDeposit Test Failed:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', error);
    }
    
    console.error('------ DEPOSIT TEST FAILED ------\n');
    
    return res.status(500).json({
      status: 'error',
      message: 'Deposit test failed',
      error: error.response?.data || error.message
    });
  }
}

// Withdrawal test
export async function withdrawalTest(req: Request, res: Response) {
  try {
    console.log('\n------ STARTING WITHDRAWAL TEST ------');
    console.log('Request payload:', JSON.stringify(req.body, null, 2));
    
    const { customerId, amount, currencyCode, description } = req.body;
    
    const withdrawalData = {
      customerId,
      amount,
      currencyCode,
      description: description || 'Test Withdrawal'
    };
    
    console.log('Requesting access token...');
    const token = await paysafeClient.getToken();
    console.log('Access token received successfully');
    
    // Log masked token
    const maskedToken = token.substring(0, 10) + '...' + token.substring(token.length - 10);
    console.log(`Token: ${maskedToken}`);
    
    const apiUrl = `${process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets'}/v2/transactions/withdrawals`;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // Log the request details
    console.log('\nAPI Request Details:');
    console.log(`Method: POST`);
    console.log(`URL: ${apiUrl}`);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Request Body:', JSON.stringify(withdrawalData, null, 2));
    
    // Generate and log curl equivalent
    const curlCommand = formatAsCurl('POST', apiUrl, headers, withdrawalData);
    console.log('\nCurl equivalent:');
    console.log(curlCommand);
    
    console.log('\nSending request...');
    
    // Make withdrawal using PaysafeClient
    const response = await paysafeClient.withdrawMoney(withdrawalData);
    
    // Log success and response data
    console.log('\nResponse received:');
    console.log(JSON.stringify(response, null, 2));
    console.log('Withdrawal Test Success!');
    console.log('------ WITHDRAWAL TEST COMPLETED ------\n');
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      data: response,
      request: {
        url: apiUrl,
        method: 'POST',
        headers,
        body: withdrawalData,
        curl: curlCommand
      }
    });
  } catch (error: any) {
    console.error('\nWithdrawal Test Failed:', error.message);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('No response received. Request details:', error.request);
    } else {
      console.error('Error details:', error);
    }
    
    console.error('------ WITHDRAWAL TEST FAILED ------\n');
    
    return res.status(500).json({
      status: 'error',
      message: 'Withdrawal test failed',
      error: error.response?.data || error.message
    });
  }
}