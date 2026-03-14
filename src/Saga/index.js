import { all, takeLatest } from 'redux-saga/effects';

import { BusinessOpportunitiesTypes as BOTypes } from '../Redux/BusinessOpportunitiesRedux';
import { CustomerTypes } from '../Redux/CustomerRedux';
import { QuotationTypes } from '../Redux/QuotationRedux';
import { PolicyTypes } from '../Redux/PolicyRedux';
import { AuthTypes } from '../Redux/AuthRedux';

import {
  getProducts,
  getCategories,
  getLeads,
  createLead,
  updateLead,
  getInsuranceCompanies,
  quotationRequest,
} from './BusinessOpportunitiesSaga';
import {
  getCustomersName,
  getCustomerFields,
  getCustomers,
  getCustomerById,
  getCustomerFirstLevel,
  getCustomerSecondLevel,
  getInsuredCustomer,
  createCustomer,
  createIGT,
  createHealthIGT,
} from './CustomerSaga';
import {
  createQuotation,
  getQuotations,
  getQuotationById,
  getPreferredQuotation,
  getQuotationConfirm,
  confirmQuotation,
} from './QuotationSaga';
import {
  getPolicy
} from './PolicySaga'
import {
  signIn,
  signOut,
  restoreAuth,
} from './AuthSaga';

export default function* root() {
  yield all([
    takeLatest(BOTypes.GET_PRODUCTS, getProducts),
    takeLatest(BOTypes.GET_CATEGORIES, getCategories),
    takeLatest(BOTypes.GET_LEADS, getLeads),
    takeLatest(BOTypes.CREATE_LEAD, createLead),
    takeLatest(BOTypes.UPDATE_LEAD, updateLead),
    takeLatest(BOTypes.GET_INSURANCE_COMPANIES, getInsuranceCompanies),
    takeLatest(BOTypes.QUOTATION_REQUEST, quotationRequest),

    takeLatest(CustomerTypes.GET_CUSTOMERS_NAME, getCustomersName),
    takeLatest(CustomerTypes.GET_CUSTOMER_FIELDS, getCustomerFields),
    takeLatest(CustomerTypes.GET_CUSTOMERS, getCustomers),
    takeLatest(CustomerTypes.GET_CUSTOMER_BY_ID, getCustomerById),
    takeLatest(CustomerTypes.GET_CUSTOMER_FIRST_LEVEL, getCustomerFirstLevel),
    takeLatest(CustomerTypes.GET_CUSTOMER_SECOND_LEVEL, getCustomerSecondLevel),
    takeLatest(CustomerTypes.GET_INSURED_CUSTOMER, getInsuredCustomer),
    takeLatest(CustomerTypes.CREATE_CUSTOMER, createCustomer),
    takeLatest(CustomerTypes.CREATE_IGT, createIGT),
    takeLatest(CustomerTypes.CREATE_HEALTH_IGT, createHealthIGT),

    takeLatest(QuotationTypes.CREATE_QUOTATION, createQuotation),
    takeLatest(QuotationTypes.GET_QUOTATIONS, getQuotations),
    takeLatest(QuotationTypes.GET_QUOTATION_BY_ID, getQuotationById),
    takeLatest(QuotationTypes.GET_PREFERRED_QUOTATION, getPreferredQuotation),
    takeLatest(QuotationTypes.GET_QUOTATION_CONFIRM, getQuotationConfirm),
    takeLatest(QuotationTypes.CONFIRM_QUOTATION, confirmQuotation),

    takeLatest(PolicyTypes.GET_POLICY, getPolicy),

    yield takeLatest(AuthTypes.SIGN_IN, signIn),
    yield takeLatest(AuthTypes.SIGN_OUT, signOut),
    yield takeLatest(AuthTypes.RESTORE_AUTH, restoreAuth),

  ]);
}
