import Immutable from 'seamless-immutable';
import { createReducer, createActions } from 'reduxsauce';
import * as RequestStatus from '../Entities/RequestStatus';

export const INITIAL_STATE = Immutable({
  createQuotationRequestStatus: RequestStatus.INITIAL,
  quotations: [],
  getQuotationsRequestStatus: RequestStatus.INITIAL,
  quotationById: [],
  getQuotationByIdRequestStatus: RequestStatus.INITIAL,
  preferredQuotations: [],
  preferredQuotationRequestStatus: RequestStatus.INITIAL,
  quotationConfirm: [],
  quotationConfirmRequestStatus: RequestStatus.INITIAL,
  confirmQuotationRequestStatus: RequestStatus.INITIAL,
  viewQuotationRequestStatus: RequestStatus.INITIAL,
  viewQuotation: [],
  viewQuotationPagination: null,
  quotationDocumentDetails: [],
  getQuotationDocumentDetailsRequestStatus: RequestStatus.INITIAL,
});

const { Types, Creators } = createActions({
  createQuotation: ['quotationData'],
  setQuotationRequestStatus: ['status'],
  getQuotations: [],
  setQuotationsRequestStatus: ['status'],
  storeQuotations: ['quotations'],
  getQuotationById: ['quotationId'],
  setQuotationByIdRequestStatus: ['status'],
  storeQuotationById: ['quotation'],
  getPreferredQuotation: ['prospectId'],
  setGetPreferredQuotationRequestStatus: ['status'],
  storeGetPreferredQuotations: ['preferredQuotations'],
  getQuotationConfirm: [],
  setGetQuotationConfirmRequestStatus: ['status'],
  storeQuotationConfirm: ['data'],
  confirmQuotation: ['quotationData'],
  setConfirmQuotationRequestStatus: ['status'],
  getViewQuotation: ['params'],
  setGetViewQuotationRequestStatus: ['status'],
  storeViewQuotation: ['viewQuotation'],
  getQuotationDocumentDetails: ['quotationId'],
  setGetQuotationDocumentDetailsRequestStatus: ['status'],
  storeQuotationDocumentDetails: ['quotationDocumentDetails'],
  clearQuotationDocumentDetails: [],
});

export const QuotationTypes = Types;
export const QuotationActions = Creators;

export default Creators;

export const createQuotation = (state, { quotationData }) => {
  return state.merge({
    createQuotationRequestStatus: RequestStatus.INPROGRESS,
  });
};

export const setQuotationRequestStatus = (state, { status }) =>
  state.merge({ createQuotationRequestStatus: status });

export const getQuotations = (state = INITIAL_STATE, action = {}) => {
  return state.merge({
    getQuotationsRequestStatus: RequestStatus.INPROGRESS,
  });
};

export const setQuotationsRequestStatus = (state, { status }) =>
  state.merge({ getQuotationsRequestStatus: status });

export const storeQuotations = (state, { quotations }) => {
  return state.merge({
    quotations: quotations?.responseData ?? quotations ?? [],
    getQuotationsRequestStatus: RequestStatus.OK,
  });
};

export const getQuotationById = (
  state = INITIAL_STATE,
  action = { quotationId },
) => {
  return state.merge({
    getQuotationByIdRequestStatus: RequestStatus.INPROGRESS,
  });
};

export const setQuotationByIdRequestStatus = (state, { status }) =>
  state.merge({ getQuotationByIdRequestStatus: status });

export const storeQuotationById = (state, { quotation }) => {
  return state.merge({
    quotationById: quotation?.responseData ?? quotation ?? [],
    getQuotationByIdRequestStatus: RequestStatus.OK,
  });
};

export const getPreferredQuotation = (state, { prospectId }) =>
  state.merge({
    preferredQuotationRequestStatus: RequestStatus.INPROGRESS,
  });

export const setGetPreferredQuotationRequestStatus = (state, { status }) =>
  state.merge({ preferredQuotationRequestStatus: status });

export const storeGetPreferredQuotations = (state, { preferredQuotations }) =>
  state.merge({
    preferredQuotations: preferredQuotations || [],
    preferredQuotationRequestStatus: RequestStatus.OK,
  });

export const getQuotationConfirm = (state) =>
  state.merge({
    getQuotationConfirmRequestStatus: RequestStatus.INPROGRESS,
  });

export const setGetQuotationConfirmRequestStatus = (state, { status }) =>
  state.merge({ getQuotationConfirmRequestStatus: status });

export const storeQuotationConfirm = (state, { data }) =>
  state.merge({
    quotationConfirm: data || [],
    getQuotationConfirmRequestStatus: RequestStatus.OK,
  });

export const confirmQuotation = (state, { quotationData }) =>
  state.merge({
    confirmQuotationRequestStatus: RequestStatus.INPROGRESS,
  });

export const setConfirmQuotationRequestStatus = (state, { status }) =>
  state.merge({ confirmQuotationRequestStatus: status });

export const getViewQuotation = (state) =>
    state.merge( {
        viewQuotationRequestStatus: RequestStatus.INPROGRESS,
    });

export const setGetViewQuotationRequestStatus = (state, { status }) =>
    state.merge( { viewQuotationRequestStatus: status });

export const storeViewQuotation = (state, { viewQuotation }) => {
    const { records, pagination } = viewQuotation || {};
    const pageNumber = pagination?.pageNumber ?? 1;

    return state.merge({
        viewQuotation: pageNumber === 1
            ? (records || [])
            : [...(state.viewQuotation || []), ...(records || [])],
        viewQuotationPagination: pagination || null,
        viewQuotationRequestStatus: RequestStatus.OK,
    });
};
export const getQuotationDocumentDetails = (state, { quotationId }) =>
    state.merge( {
        getQuotationDocumentDetailsRequestStatus: RequestStatus.INPROGRESS,
    });

export const setGetQuotationDocumentDetailsRequestStatus = (state, { status }) =>
    state.merge( { getQuotationDocumentDetailsRequestStatus: status });

export const storeQuotationDocumentDetails = (state, { quotationDocumentDetails }) => {
    return state.merge({
        quotationDocumentDetails: quotationDocumentDetails || [],
        getQuotationDocumentDetailsRequestStatus: RequestStatus.OK,
    });
};

export const clearQuotationDocumentDetails = (state) => {
    return state.merge({
        quotationDocumentDetails: [],
        getQuotationDocumentDetailsRequestStatus: RequestStatus.INITIAL,
    });
};

export const reducer = createReducer(INITIAL_STATE, {
  [Types.CREATE_QUOTATION]: createQuotation,
  [Types.SET_QUOTATION_REQUEST_STATUS]: setQuotationRequestStatus,
  [Types.GET_QUOTATIONS]: getQuotations,
  [Types.SET_QUOTATIONS_REQUEST_STATUS]: setQuotationsRequestStatus,
  [Types.STORE_QUOTATIONS]: storeQuotations,
  [Types.GET_QUOTATION_BY_ID]: getQuotationById,
  [Types.SET_QUOTATION_BY_ID_REQUEST_STATUS]: setQuotationByIdRequestStatus,
  [Types.STORE_QUOTATION_BY_ID]: storeQuotationById,
  [Types.GET_PREFERRED_QUOTATION]: getPreferredQuotation,
  [Types.SET_GET_PREFERRED_QUOTATION_REQUEST_STATUS]: setGetPreferredQuotationRequestStatus,
  [Types.STORE_GET_PREFERRED_QUOTATIONS]: storeGetPreferredQuotations,
  [Types.GET_QUOTATION_CONFIRM]: getQuotationConfirm,
  [Types.SET_GET_QUOTATION_CONFIRM_REQUEST_STATUS]: setGetQuotationConfirmRequestStatus,
  [Types.STORE_QUOTATION_CONFIRM]: storeQuotationConfirm,
  [Types.CONFIRM_QUOTATION]: confirmQuotation,
  [Types.SET_CONFIRM_QUOTATION_REQUEST_STATUS]: setConfirmQuotationRequestStatus,
  [Types.GET_VIEW_QUOTATION]: getViewQuotation,
  [Types.SET_GET_VIEW_QUOTATION_REQUEST_STATUS]: setGetViewQuotationRequestStatus,
  [Types.STORE_VIEW_QUOTATION]: storeViewQuotation,
  [Types.GET_QUOTATION_DOCUMENT_DETAILS]: getQuotationDocumentDetails,
  [Types.SET_GET_QUOTATION_DOCUMENT_DETAILS_REQUEST_STATUS]: setGetQuotationDocumentDetailsRequestStatus,
  [Types.STORE_QUOTATION_DOCUMENT_DETAILS]: storeQuotationDocumentDetails,
  [Types.CLEAR_QUOTATION_DOCUMENT_DETAILS]: clearQuotationDocumentDetails,
});
