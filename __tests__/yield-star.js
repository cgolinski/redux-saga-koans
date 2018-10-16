import {
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import getConfiguredStore from '../utils/get-configured-store';


test('...', () => {
  const fruits = [];

  function* sagaA(arrayOfFruits) {
    for (let i = 0; i < arrayOfFruits.length; i++) {
      yield fruits.push(arrayOfFruits[i]);
    }
  }

  function* sagaB() {
    yield fruits.push('banana');
    // yield call(sagaA, ['apple', 'kiwi', 'pineapple']);
    yield* sagaA(['apple', 'kiwi', 'pineapple']);
    // yield sagaA(['apple', 'kiwi', 'pineapple']);
    yield fruits.push('mango');
  }

  // ^ These yields and yield*s do the same thing, because redux-saga is "unfurling" the saga
  // redux-saga is treating yield the same as yield*
  // however, yield* gives performance benfits, so use it anyway.
  // In regular generators outside of redux-saga, in plain-old-JS you need to call .next() 
  // to continue to the next yield.
  
  // yield* when calling another generator
  //   exception: use yield call(otherGenerator) if you need to mock the result of the inner generator
  // yield call(fn) when calling any other async function
  // yield fn, when fn is synchronous
  //   ^ but if fn is synchronous, don't need to yield it.

  const { reduxStore } = getConfiguredStore({}, sagaB);

  expect(fruits).toEqual([
    'banana',
    'apple',
    'kiwi',
    'pineapple',
    'mango',
  ]);
});
