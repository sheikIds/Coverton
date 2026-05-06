import Immutable from 'seamless-immutable';
import { createReducer, createActions } from 'reduxsauce';
import * as RequestStatus from '../Entities/RequestStatus';

export const INITIAL_STATE = Immutable({
    getRenewalRequestStatus: RequestStatus.INITIAL,
    renewalRecords: [],
    renewalSummary: {
        hotAmount: 0,
        warmAmount: 0,
        coldAmount: 0,
        wonAmount: 0,
        differenceAmount: 0,
        totalAmount: 0,
    },
    getRenewalArchiveRequestStatus: RequestStatus.INITIAL,
    renewalArchiveRecords: [],
    renewalArchiveSummary: {
        hotAmount: 0,
        warmAmount: 0,
        coldAmount: 0,
        wonAmount: 0,
        differenceAmount: 0,
        totalAmount: 0,
    },
    renewalReasons: [],
    renewalReasonsRequestStatus: RequestStatus.INITIAL,
    createRenewRequestStatus: RequestStatus.INITIAL,
    renewalLostDroppedRequestStatus: RequestStatus.INITIAL,
})

const { Types, Creators } = createActions({
    // Renewal Pagination (saga trigger)
    getRenewal: ['params'],
    setGetRenewalRequestStatus: ['status'],
    storeRenewalData: ['data'],

    // Renewal Archive Pagination (saga trigger)
    getRenewalArchive: ['params'],
    setGetRenewalArchiveRequestStatus: ['status'],
    storeRenewalArchiveData: ['data'],

     // Renewal Reasons (saga trigger)
    getRenewalReasons: [],
    setRenewalReasonsRequestStatus: ['status'],
    storeRenewalReasonsData: ['renewalReasons'],

    // Create Renew (saga trigger)
    createRenew: ['renewData'],
    setCreateRenewRequestStatus: ['status'],
    storeCreateRenewData: ['data'],

    // Renewal Lost Dropped (saga trigger)
    createRenewalLostDropped: ['lostDroppedData'],
    setCreateRenewalLostDroppedRequestStatus: ['status'],
    storeCreateRenewalLostDroppedData: ['data'],
})

export const RenewalsTypes = Types
export const RenewalsActions = Creators

export default Creators

// BOI Pagination
export const getRenewal = (state) =>
    state.merge({
        getRenewalRequestStatus: RequestStatus.INPROGRESS,
        error: null,
    });

export const setGetRenewalRequestStatus = (state, { status }) =>
    state.merge({ getRenewalRequestStatus: status });

export const storeRenewalData = (state, { data }) => {
    // const immutableState = ensureImmutable(state);
    const { renewalrecords, summary } = data || {};

    return  state.merge({
        renewalRecords: renewalrecords || [],
        renewalSummary: summary || INITIAL_STATE.renewalSummary,
        getRenewalRequestStatus: RequestStatus.OK,
    });
};

// Renewal Archive Pagination
export const getRenewalArchive = (state) =>
    state.merge( {
        getRenewalArchiveRequestStatus: RequestStatus.INPROGRESS,
        error: null,
    });

export const setGetRenewalArchiveRequestStatus = (state, { status }) =>
    state.merge( { getRenewalArchiveRequestStatus: status });

export const storeRenewalArchiveData = (state, { data }) => {
    // const immutableState = ensureImmutable(state);
    const { renewalrecords, summary } = data || {};

    return state.merge({
        renewalArchiveRecords: renewalrecords || [],
        renewalArchiveSummary: summary || INITIAL_STATE.renewalArchiveSummary,
        getRenewalArchiveRequestStatus: RequestStatus.OK,
    });
};

// Renewal Reasons
export const getRenewalReasons = (state) =>
    state.merge( {
        renewalReasonsRequestStatus: RequestStatus.INPROGRESS,
        error: null,
    });

export const setRenewalReasonsRequestStatus = (state, { status }) =>
    state.merge({ renewalReasonsRequestStatus: status });

export const storeRenewalReasonsData = (state, { renewalReasons }) =>
    state.merge({
        renewalReasons: renewalReasons || [],
        renewalReasonsRequestStatus: RequestStatus.OK,
    });

// Create Renew
export const createRenew = (state, { renewData }) =>
    state.merge({
        createRenewRequestStatus: RequestStatus.INPROGRESS,
        error: null,
    });

export const setCreateRenewRequestStatus = (state, { status }) =>
    state.merge({ createRenewRequestStatus: status });

export const storeCreateRenewData = (state, { data }) =>
    state.merge({ createRenewRequestStatus: RequestStatus.OK });

// Renewal Lost Dropped
export const createRenewalLostDropped = (state, { lostDroppedData }) =>
    state.merge({
        renewalLostDroppedRequestStatus: RequestStatus.INPROGRESS,
        error: null,
    });

export const setCreateRenewalLostDroppedRequestStatus = (state, { status }) =>
    state.merge({ renewalLostDroppedRequestStatus: status });

export const storeCreateRenewalLostDroppedData = (state, { data }) =>
    state.merge({ renewalLostDroppedRequestStatus: RequestStatus.OK });


export const reducer = createReducer(INITIAL_STATE, {
    [Types.GET_RENEWAL]: getRenewal,
    [Types.SET_GET_RENEWAL_REQUEST_STATUS]: setGetRenewalRequestStatus,
    [Types.STORE_RENEWAL_DATA]: storeRenewalData,
    [Types.GET_RENEWAL_ARCHIVE]: getRenewalArchive,
    [Types.SET_GET_RENEWAL_ARCHIVE_REQUEST_STATUS]: setGetRenewalArchiveRequestStatus,
    [Types.STORE_RENEWAL_ARCHIVE_DATA]: storeRenewalArchiveData,
    [Types.GET_RENEWAL_REASONS]: getRenewalReasons,
    [Types.SET_RENEWAL_REASONS_REQUEST_STATUS]: setRenewalReasonsRequestStatus,
    [Types.STORE_RENEWAL_REASONS_DATA]: storeRenewalReasonsData,
    [Types.CREATE_RENEW]: createRenew,
    [Types.SET_CREATE_RENEW_REQUEST_STATUS]: setCreateRenewRequestStatus,
    [Types.STORE_CREATE_RENEW_DATA]: storeCreateRenewData,
    [Types.CREATE_RENEWAL_LOST_DROPPED]: createRenewalLostDropped,
    [Types.SET_CREATE_RENEWAL_LOST_DROPPED_REQUEST_STATUS]: setCreateRenewalLostDroppedRequestStatus,
    [Types.STORE_CREATE_RENEWAL_LOST_DROPPED_DATA]: storeCreateRenewalLostDroppedData,
})
