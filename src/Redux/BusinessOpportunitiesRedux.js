import Immutable from 'seamless-immutable'
import { createReducer, createActions } from 'reduxsauce'
import * as RequestStatus from '../Entities/RequestStatus'

export const INITIAL_STATE = Immutable({
  getProductsRequestStatus: RequestStatus.INITIAL,
  products: [],
  getCategoriesRequestStatus: RequestStatus.INITIAL,
  categories: [],
  getLeadsRequestStatus: RequestStatus.INITIAL,
  leads: [],
  getInsuranceCompaniesRequestStatus: RequestStatus.INITIAL,
  insuranceCompanies: [],
  createLeadRequestStatus: RequestStatus.INITIAL,
  updateLeadRequestStatus: RequestStatus.INITIAL,
  quotationRequestStatus: RequestStatus.INITIAL,
  getAllCustomersRequestStatus: RequestStatus.INITIAL,
  allCustomers: [],
})

const { Types, Creators } = createActions({
  getProducts: [],
  setProductsRequestStatus: ['status'],
  storeProducts: ['products'],
  getCategories: [],
  setCategoriesRequestStatus: ['status'],
  storeCategories: ['categories'],
  getLeads: ['params'],
  setLeadsRequestStatus: ['status'],
  storeLeads: ['leads'],
  getInsuranceCompanies: ['categoryId'],
  setInsuranceCompaniesRequestStatus: ['status'],
  storeInsuranceCompanies: ['insuranceCompanies'],
  createLead: ['leadData'],
  setCreateLeadRequestStatus: ['status'],
  updateLead: ['leadData', 'prospectId'],
  setUpdateLeadRequestStatus: ['status'],
  quotationRequest: ['prospectId'],
  setQuotationRequestStatus: ['status'],
  getAllCustomers: [],
  setAllCustomersRequestStatus: ['status'],
  storeAllCustomers: ['allCustomers'],
})

export const BusinessOpportunitiesTypes = Types
export const BusinessOpportunitiesActions = Creators

export default Creators

export const getProducts = (state = INITIAL_STATE, action = {}) => {
  return state.merge({
    getProductsRequestStatus: RequestStatus.INPROGRESS,
  })
}

export const setProductsRequestStatus = (state, { status }) =>
  state.merge({ getProductsRequestStatus: status })

export const storeProducts = (state, { products }) => {
  return state.merge({
    products: products?.responseData ?? products ?? [], // defensive: allow both raw or { responseData }
    getProductsRequestStatus: RequestStatus.SUCCESS,
  })
}

export const getCategories = (state = INITIAL_STATE, action = {}) => {
  return state.merge({
    getCategoriesRequestStatus: RequestStatus.INPROGRESS,
  })
}

export const setCategoriesRequestStatus = (state, { status }) =>
  state.merge({ getCategoriesRequestStatus: status })

export const storeCategories = (state, { categories }) => {
  return state.merge({
    categories: categories?.responseData ?? categories ?? [],
    getCategoriesRequestStatus: RequestStatus.SUCCESS,
  })
}

export const getLeads = (state = INITIAL_STATE, action = {}) => {
  return state.merge({
    getLeadsRequestStatus: RequestStatus.INPROGRESS,
  })
}

export const setLeadsRequestStatus = (state, { status }) =>
  state.merge({ getLeadsRequestStatus: status })

export const storeLeads = (state, { leads }) => {
  return state.merge({
    leads: leads?.responseData ?? leads ?? [], // defensive: allow both raw or { responseData }
    getLeadsRequestStatus: RequestStatus.SUCCESS,
  })
}

export const getInsuranceCompanies = (state = INITIAL_STATE, { categoryId }) => {
  return state.merge({
    getInsuranceCompaniesRequestStatus: RequestStatus.INPROGRESS,
    categoryId,
  })
}

export const setInsuranceCompaniesRequestStatus = (state, { status }) =>
  state.merge({ getInsuranceCompaniesRequestStatus: status })

export const storeInsuranceCompanies = (state, { insuranceCompanies }) => {
  return state.merge({
    insuranceCompanies: insuranceCompanies?.responseData ?? insuranceCompanies ?? [],
    getInsuranceCompaniesRequestStatus: RequestStatus.SUCCESS,
  })
}

export const createLead = (state, { leadData }) => {
  return state.merge({ createLeadRequestStatus: RequestStatus.INPROGRESS })
}

export const setCreateLeadRequestStatus = (state, { status }) =>
  state.merge({ createLeadRequestStatus: status })

export const updateLead = (state, { leadData, prospectId }) => {
  return state.merge({ updateLeadRequestStatus: RequestStatus.INPROGRESS })
}

export const setUpdateLeadRequestStatus = (state, { status }) =>
  state.merge({ updateLeadRequestStatus: status })

export const quotationRequest = (state, { prospectId }) => {
  return state.merge({ quotationRequestStatus: RequestStatus.INPROGRESS })
}

export const setQuotationRequestStatus = (state, { status }) =>
  state.merge({ quotationRequestStatus: status })

export const getAllCustomers = (state = INITIAL_STATE, action = {}) => {
  return state.merge({
    getAllCustomersRequestStatus: RequestStatus.INPROGRESS,
  })
}

export const setAllCustomersRequestStatus = (state, { status }) =>
  state.merge({ getAllCustomersRequestStatus: status })

export const storeAllCustomers = (state, { allCustomers }) => {
  return state.merge({
    allCustomers: allCustomers?.responseData ?? allCustomers ?? [],
    getAllCustomersRequestStatus: RequestStatus.SUCCESS,
  })
}

export const reducer = createReducer(INITIAL_STATE, {
  [Types.GET_PRODUCTS]: getProducts,
  [Types.STORE_PRODUCTS]: storeProducts,
  [Types.SET_PRODUCTS_REQUEST_STATUS]: setProductsRequestStatus,
  [Types.GET_CATEGORIES]: getCategories,
  [Types.STORE_CATEGORIES]: storeCategories,
  [Types.SET_CATEGORIES_REQUEST_STATUS]: setCategoriesRequestStatus,
  [Types.GET_LEADS]: getLeads,
  [Types.SET_LEADS_REQUEST_STATUS]: setLeadsRequestStatus,
  [Types.STORE_LEADS]: storeLeads,
  [Types.GET_INSURANCE_COMPANIES]: getInsuranceCompanies,
  [Types.SET_INSURANCE_COMPANIES_REQUEST_STATUS]: setInsuranceCompaniesRequestStatus,
  [Types.STORE_INSURANCE_COMPANIES]: storeInsuranceCompanies,
  [Types.CREATE_LEAD]: createLead,
  [Types.SET_CREATE_LEAD_REQUEST_STATUS]: setCreateLeadRequestStatus,
  [Types.UPDATE_LEAD]: updateLead,
  [Types.SET_UPDATE_LEAD_REQUEST_STATUS]: setUpdateLeadRequestStatus,
  [Types.QUOTATION_REQUEST]: quotationRequest,
  [Types.SET_QUOTATION_REQUEST_STATUS]: setQuotationRequestStatus,
  [Types.GET_ALL_CUSTOMERS]: getAllCustomers,
  [Types.SET_ALL_CUSTOMERS_REQUEST_STATUS]: setAllCustomersRequestStatus,
  [Types.STORE_ALL_CUSTOMERS]: storeAllCustomers,
})  
