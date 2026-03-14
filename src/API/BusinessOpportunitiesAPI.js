import api from './apiClient';
import * as Endpoints from '../Entities/Endpoint';

export const getProducts = async () => {
  try {
    // This will call: http://10.0.2.2:5030/api/BOI/Product
    const response = await api.get(Endpoints.GET_PRODUCT);
    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const getCaterogies = async () => {
  try {
    // This will call: http://10.0.2.2:5030/api/BOI/Category
    const response = await api.get(Endpoints.GET_CATEGORY);
    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const getInsuranceCompanies = async (categoryId) => {
  try {
    // This will call: http://10.0.2.2:5030/api/BOI/InsuranceCompany
    const response = await api.get(Endpoints.GET_PREFERRED_INSURERS, { params: { categoryId } });
    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};
export const getLeads = async (params) => {
  try {
    // This will call GET: http://10.0.2.2:5030/api/BOI/getLead
    const response = await api.get(Endpoints.GET_LEAD, { params });
    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const createLead = async ({ leadData }) => {
  try {
    const response = await api.post(Endpoints.CREATE_LEAD, leadData);

    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};

export const updateLead = async ({ leadData, prospectId }) => {
  try {
    const response = await api.put(
      Endpoints.UPDATE_LEAD,
      leadData,
      {
        params: { id: prospectId },
      }
    );

    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};

export const quotationRequest = async ({ prospectId }) => {
  try {
    const response = await api.post(Endpoints.QUOTATION_REQUEST, null, {
      params: { prospectid: prospectId },
    });
    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};
