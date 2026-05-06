import api from './apiClient';
import * as Endpoints from '../Entities/Endpoint';

export const createQuotation = async ({ quotationData }) => {
  try {
    const response = await api.post(Endpoints.CREATE_QUOTATION, quotationData);

    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};

export const getQuotation = async () => {
  try {
    const response = await api.get(Endpoints.GET_QUOTATION);

    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};

export const getQuotationById = async ({ quotationId }) => {
  try {
    const response = await api.get(Endpoints.GET_QUOTATION_BY_ID, {
      params: { quotationid: quotationId },
    });

    return response.data;
  } catch (error) {
    // console.error('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const getQuotationManagement = async ({ type }) => {
  // const response = await apiClient.get(`${Endpoints.GET_QUOTATION_MANAGEMENT}?type=${type}`);
  // return response.data;
  try {
    const response = await api.get(Endpoints.GET_QUOTATION_MANAGEMENT, {
      params: { type: type },
    });

    return response.data;
  } catch (error) {
    console.error('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};

export const getPreferredQuotation = async ({ prospectId }) => {
  // const response = await apiClient.get(
  //     `${Endpoints.GET_PREFERRED_QUOTATION}?`prospectId`=${prospectId}`
  // );
  // return response.data;
  console.log({ APIGETPRE: prospectId })
  try {
    const response = await api.get(Endpoints.GET_PREFERRED_QUOTATION, {
      params: { prospectId: prospectId },
    });

    return response.data;
  }
  catch (error) {
    // console.log('API Error:', error?.response?.data || error.message);
    // throw error?.response?.data || error;
  }
};

export const confirmQuotation = async ({ quotationData }) => {
  try {
    const response = await api.post(Endpoints.CONFIRM_QUOTATION, quotationData);
    console.log({responseAPI: response})

    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error);
    throw error?.response?.data || error;
  }
};
export const getViewQuotation = async (params) => {
  console.log({params})
  try {
    // This will call GET: http://10.0.2.2:5030/api/BOI/getLead
    const response = await api.get(Endpoints.VIEW_QUOTATION, { params });
    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const getQuotationDocumentDetails = async ({ quotationId }) => {
    const response = await api.get(`${Endpoints.QUOTATION_DOCUMENT_DETAILS}?quotationid=${quotationId}`);
    return response.data;
}