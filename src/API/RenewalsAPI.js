import api from './apiClient';
import * as Endpoints from '../Entities/Endpoint';

export const getRenewal = async (params) => {
    const queryParams = { ...params, tab: 'Renewal' };
    console.log({queryParams})

    try {
    // This will call GET: http://10.0.2.2:5030/api/BOI/getLead
    const response = await api.get(Endpoints.GET_RENEWAL, { params: queryParams });
    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const getRenewalArchive = async (params = {}) => {
    const queryParams = { ...params, tab: 'Renewal Archive' };

    try {
    // This will call GET: http://10.0.2.2:5030/api/BOI/getLead
    const response = await api.get(Endpoints.GET_RENEWAL, { params: queryParams });
    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error.message);
    throw error?.response?.data || error;
  }
};

export const getRenewalReasons = async () => {
    try {
    const response = await api.get(Endpoints.RENEWAL_REASONS);
    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error.message);
    // throw error?.response?.data || error;
  }
};

export const createRenew = async (renewData) => {
    try {
    const response = await api.post(Endpoints.CREATE_RENEW, renewData);
    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error.message);
    // throw error?.response?.data || error;
  }
    return response.data;
};

export const createRenewalLostDropped = async (lostDroppedData) => {
    try {
    const response = await api.post(Endpoints.RENEWAL_LOST_DROPPED, lostDroppedData);
    return response.data;
  } catch (error) {
    console.log('API Error:', error?.response?.data || error.message);
    // throw error?.response?.data || error;
  }
};

// export const updateLead = async ({ leadData, prospectId }) => {
//   console.log({ APILead: leadData, prospectId })
//   try {
//     const response = await api.put(
//       Endpoints.UPDATE_LEAD,
//       leadData,
//       {
//         params: { prospectId: prospectId },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     throw error?.response?.data || error;
//   }
// };

// export const quotationRequest = async ({ prospectId }) => {
//   try {
//     const response = await api.put(
//       Endpoints.QUOTATION_REQUEST,
//       null,
//       {
//         params: { prospectid: prospectId },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.log({ error, prospectId })
//     console.error('API Error quotationRequest:', error?.response?.data || error);
//     throw error?.response?.data || error;
//   }
// };