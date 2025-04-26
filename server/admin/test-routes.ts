import { Request, Response } from 'express';
import axios from 'axios';
import { PaysafeClient } from '../paysafe';

// Initialize Paysafe client
const paysafeClient = new PaysafeClient();

// Health and auth test
export async function healthAuthTest(req: Request, res: Response) {
  try {
    // Get token and test features endpoint
    const token = await paysafeClient.getToken();
    
    // Make a direct request to features endpoint
    const response = await axios({
      method: 'get',
      url: `${process.env.PAYSAFE_BASE_URL || 'https://sandbox.paysafe.com/digitalwallets'}/v2/features`,
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Log success
    console.log('Health & Auth Test Success:', response.status);
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      statusCode: response.status,
      data: response.data
    });
  } catch (error: any) {
    console.error('Health & Auth Test Failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Authentication test failed',
      error: error.response?.data || error.message
    });
  }
}

// Wallet creation test
export async function createWalletTest(req: Request, res: Response) {
  try {
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
    
    // Create wallet using PaysafeClient
    const response = await paysafeClient.createWallet(walletData);
    
    // Log success
    console.log('Wallet Creation Test Success:', response);
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error: any) {
    console.error('Wallet Creation Test Failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    
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
    const { customerId, amount, currencyCode, description } = req.body;
    
    // Make deposit using PaysafeClient
    const response = await paysafeClient.depositMoney({
      customerId,
      amount,
      currencyCode,
      description
    });
    
    // Log success
    console.log('Deposit Test Success:', response);
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error: any) {
    console.error('Deposit Test Failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    
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
    const { customerId, amount, currencyCode, description } = req.body;
    
    // Make withdrawal using PaysafeClient
    const response = await paysafeClient.withdrawMoney({
      customerId,
      amount,
      currencyCode,
      description
    });
    
    // Log success
    console.log('Withdrawal Test Success:', response);
    
    // Return the API response
    return res.status(200).json({
      status: 'success',
      data: response
    });
  } catch (error: any) {
    console.error('Withdrawal Test Failed:', error.message);
    console.error('Error details:', error.response?.data || error);
    
    return res.status(500).json({
      status: 'error',
      message: 'Withdrawal test failed',
      error: error.response?.data || error.message
    });
  }
}