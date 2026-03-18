import { all, put, call } from 'redux-saga/effects';

import * as QuotationAPI from '../API/QuotationAPI';
import QuotationActions from '../Redux/QuotationRedux';
import * as RequestStatus from '../Entities/RequestStatus';

export function* createQuotation({ quotationData }) {
  console.log({ quotationData });
  try {
    const response = yield call(QuotationAPI.createQuotation, {
      quotationData,
    });

    if (response?.err) {
      yield put(
        QuotationActions.setQuotationRequestStatus(RequestStatus.ERROR),
      );
      return;
    }
    yield all([
      put(QuotationActions.setQuotationRequestStatus(RequestStatus.OK)),
    ]);
  } catch (e) {
    yield put(QuotationActions.setQuotationRequestStatus(RequestStatus.ERROR));
  }
}

export function* getQuotations() {
  try {
    const response = yield call(QuotationAPI.getQuotation);
    if (response?.err) {
      yield put(
        QuotationActions.setQuotationsRequestStatus(RequestStatus.ERROR),
      );
      return;
    }
    const quotations = response.data ?? response ?? [];
    yield all([
      put(QuotationActions.setQuotationsRequestStatus(RequestStatus.OK)),
      put(QuotationActions.storeQuotations(quotations)),
    ]);
  } catch (err) {
    yield put(QuotationActions.setQuotationsRequestStatus(RequestStatus.ERROR));
  }
}

export function* getQuotationById({ quotationId }) {
  try {
    const response = yield call(QuotationAPI.getQuotationById, { quotationId });

    if (response?.err) {
      yield put(
        QuotationActions.setQuotationByIdRequestStatus(RequestStatus.ERROR),
      );
      return;
    }
    const quotation = response.data ?? response ?? [];
    yield all([
      put(QuotationActions.setQuotationByIdRequestStatus(RequestStatus.OK)),
      put(QuotationActions.storeQuotationById(quotation)),
    ]);
  } catch (e) {
    yield put(
      QuotationActions.setQuotationByIdRequestStatus(RequestStatus.ERROR),
    );
  }
}
export function* getPreferredQuotation({ prospectId }) {
  // try {
  //   const response = yield call(QuotationAPI.getPreferredQuotation, { prospectId });
  //   console.log({ PREFERREDSaga_Response: response })
  //   if (response?.err) {
  //     yield put(QuotationActions.setGetPreferredQuotationRequestStatus(RequestStatus.ERROR));
  //     return;
  //   }
  //   const preferredQuotation = response.data ?? response ?? [];
  //   yield put(QuotationActions.storeGetPreferredQuotations(preferredQuotation));
  //   yield put(QuotationActions.setGetPreferredQuotationRequestStatus(RequestStatus.OK));
  // } catch (e) {
  //   yield put(QuotationActions.setGetPreferredQuotationRequestStatus(RequestStatus.ERROR));
  // }
  const response = yield call(QuotationAPI.getPreferredQuotation, { prospectId });

  if (response.err) {
    yield put(QuotationActions.setGetPreferredQuotationRequestStatus(RequestStatus.ERROR));
  } else {
    let preferredQuotation = response.data ?? response ?? [];

    yield all([
      yield put(QuotationActions.storeGetPreferredQuotations(preferredQuotation)),
      yield put(QuotationActions.setGetPreferredQuotationRequestStatus(RequestStatus.OK))
    ])
  }
}

export function* getQuotationConfirm() {
  try {
    const response = yield call(QuotationAPI.getQuotationManagement, { type: 2 });
    if (response?.err) {
      yield put(QuotationActions.setGetQuotationConfirmRequestStatus(RequestStatus.ERROR));
      return;
    }
    const quotationConfirm = response.data ?? response ?? [];
    yield put(QuotationActions.storeQuotationConfirm(quotationConfirm));
    yield put(QuotationActions.setGetQuotationConfirmRequestStatus(RequestStatus.OK));
  } catch (e) {
    yield put(QuotationActions.setGetQuotationConfirmRequestStatus(RequestStatus.ERROR));
  }
}

export function* confirmQuotation({ quotationData }) {
  try {
    const response = yield call(QuotationAPI.confirmQuotation, { quotationData });
    if (response?.err) {
      yield put(QuotationActions.setConfirmQuotationRequestStatus(RequestStatus.ERROR));
      return;
    }
    yield all([
      put(QuotationActions.setConfirmQuotationRequestStatus(RequestStatus.OK)),
      put(QuotationActions.getQuotationConfirm()),
    ]);
  } catch (e) {
    yield put(QuotationActions.setConfirmQuotationRequestStatus(RequestStatus.ERROR));
  }
}
