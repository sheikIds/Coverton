import { all, put, call } from 'redux-saga/effects';

import * as RenewalsAPI from '../API/RenewalsAPI';
import RenewalsActions from '../Redux/RenewalsRedux';
import * as RequestStatus from '../Entities/RequestStatus';

export function* getRenewal({ params }) {
  try {
    const response = yield call(RenewalsAPI.getRenewal, params)
    if (response?.err) {
      yield put(RenewalsActions.setGetRenewalRequestStatus(RequestStatus.ERROR))
      return
    }
    const renewalData = response.data ?? response ?? []
    yield all([
      put(RenewalsActions.setGetRenewalRequestStatus(RequestStatus.OK)),
      put(RenewalsActions.storeRenewalData(renewalData))
    ])
  } catch (e) {
    yield put(RenewalsActions.setGetRenewalRequestStatus(RequestStatus.ERROR))
  }
}

export function* getRenewalArchive({ params }) {
  try {
    const response = yield call(RenewalsAPI.getRenewalArchive, params)
    if (response?.err) {
      yield put(RenewalsActions.setGetRenewalArchiveRequestStatus(RequestStatus.ERROR))
      return
    }
    const renewalArchiveData = response.data ?? response ?? []
    yield all([
      put(RenewalsActions.setGetRenewalArchiveRequestStatus(RequestStatus.OK)),
      put(RenewalsActions.storeRenewalArchiveData(renewalArchiveData))
    ])
  } catch (e) {
    yield put(RenewalsActions.setGetRenewalArchiveRequestStatus(RequestStatus.ERROR))
  }
}

export function* getRenewalReasons() {
  try {
    const response = yield call(RenewalsAPI.getRenewalReasons)
    if (response?.err) {
      yield put(RenewalsActions.setRenewalReasonsRequestStatus(RequestStatus.ERROR))
      return
    }
    const renewalReasonsData = response.data ?? response ?? []
    yield all([
      put(RenewalsActions.setRenewalReasonsRequestStatus(RequestStatus.OK)),
      put(RenewalsActions.storeRenewalReasonsData(renewalReasonsData))
    ])
  } catch (e) {
    yield put(RenewalsActions.setRenewalReasonsRequestStatus(RequestStatus.ERROR))
  }
}

export function* createRenew({ renewData }) {
  try {
    const response = yield call(RenewalsAPI.createRenew, renewData)
    if (response?.err) {
      yield put(RenewalsActions.setCreateRenewRequestStatus(RequestStatus.ERROR))
      return
    }
    const createRenewData = response.data ?? response ?? []
    yield all([
      put(RenewalsActions.setCreateRenewRequestStatus(RequestStatus.OK)),
      put(RenewalsActions.storeCreateRenewData(createRenewData))
    ])
  } catch (e) {
    yield put(RenewalsActions.setCreateRenewRequestStatus(RequestStatus.ERROR))
  }
}

export function* createRenewalLostDropped({ lostDroppedData }) {
  try {
    const response = yield call(RenewalsAPI.createRenewalLostDropped, lostDroppedData)
    if (response?.err) {
      yield put(RenewalsActions.setCreateRenewalLostDroppedRequestStatus(RequestStatus.ERROR))
      return
    }
    const createRenewalLostDroppedData = response.data ?? response ?? []
    yield all([
      put(RenewalsActions.setCreateRenewalLostDroppedRequestStatus(RequestStatus.OK)),
      put(RenewalsActions.storeCreateRenewalLostDroppedData(createRenewalLostDroppedData))
    ])
  } catch (e) {
    yield put(RenewalsActions.setCreateRenewalLostDroppedRequestStatus(RequestStatus.ERROR))
  }
}
