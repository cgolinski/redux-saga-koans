import {
  put,
  call,
  takeEvery,
} from 'redux-saga/effects';
import getConfiguredStore from '../utils/get-configured-store';

test('I know what a saga is', () => {
  // A saga is a generator.

  const fruits = [];

  function* saga() {
    fruits.push('apple');
    yield;
    fruits.push('orange');
    yield;
    fruits.push('kiwi');
  }

  // FYI: getConfiguredStore is a utility function unique to these koans.
  // The function accepts an initial state, and a saga. The function
  // returns a mock Redux store configured with the redux-saga
  // middleware.
  const { reduxStore } = getConfiguredStore({}, saga);

  expect(fruits).toEqual(['apple', 'orange', 'kiwi']); // FIX
});

test('I know what `put` is and how to use it', () => {

  function* saga() {
    yield put({ type: 'FRUIT', payload: 'apple' }); // FIX
  }

  const { reduxStore } = getConfiguredStore({}, saga);
  const actions = reduxStore.getActions();

  expect(actions).toEqual([
    { type: 'FRUIT', payload: 'apple' }
  ]);
});

test('I know that I can dispatch multiple actions from a saga', () => {

  function* saga() {
    yield put({ type: 'FRUIT', payload: 'apple' });
    yield put({ type: 'FRUIT', payload: 'orange' }); // FIX
  }

  const { reduxStore } = getConfiguredStore({}, saga);
  const actions = reduxStore.getActions();

  expect(actions).toEqual([
    { type: 'FRUIT', payload: 'apple' },
    { type: 'FRUIT', payload: 'orange' },
  ]);
});

test('I know what `call` does', () => {
  let fruitBasket = [];

  function addToFruitBasket(...fruit) {
    fruitBasket = [...fruitBasket, ...fruit];
  }

  function* saga() {
    yield call(addToFruitBasket, 'apple');
    yield call(addToFruitBasket, 'orange', 'pineapple');
    yield call(addToFruitBasket, 'kiwi'); // FIX
  }

  const { reduxStore } = getConfiguredStore({}, saga);

  expect(fruitBasket).toEqual(['apple', 'orange', 'pineapple', 'kiwi']);
  // Try adding a few more fruit to the fruit basket
});

test('I know that you can use returned values from a `call`', () => {

  function addToFruitBasket(basket, ...fruit) {
    return [...basket, ...fruit];
  }

  function* saga() {
    const basket1 = yield call(addToFruitBasket, [], 'apple');
    const basket2 = yield call(addToFruitBasket, basket1, 'orange', 'pineapple');
    const basket3 = yield call(addToFruitBasket, basket2, 'kiwi');
    expect(basket3).toEqual(['apple', 'orange', 'pineapple', 'kiwi']); // FIX
  }

  const { reduxStore } = getConfiguredStore({}, saga);
});

test('I know that you can `call` other generators', () => {

  function* dispatchFruit(fruit) {
    yield put({ type: 'FRUIT_ADDED', payload: fruit });
  }

  function* saga() {
    yield call(dispatchFruit, 'apple');
    yield call(dispatchFruit, 'orange');
  }

  const { reduxStore } = getConfiguredStore({}, saga);
  const actions = reduxStore.getActions();

  expect(actions).toEqual([
    {type: 'FRUIT_ADDED', payload: 'apple'}, 
    {type: 'FRUIT_ADDED', payload: 'orange'}
  ]); // FIX
});

test('I know that you can `call` functions that return promises', (done) => {
  const responseData = {
    weight: 1,
    fruits: ['apple', 'orange'],
  };

  function fetchFruitBasket() {
    return new Promise((resolve) => {
      resolve(responseData);
    });
  }

  function* saga() {
    const fruitBasket = yield call(fetchFruitBasket);
    // ^ This function will work without the call, but it is convention to use the call when
    // the function is doing something async (network request, calling another generator, etc.)
    // It's convention because it's better in unit testing, so you can check that the async fn
    // is being called without actually having to call the backend.
    // call(fn) allows redux-saga to call fn instead of calling fn yourself.
    expect(fruitBasket).toEqual({
      weight: 1,
      fruits: ['apple', 'orange'],
    }); // FIX
    done();
  }

  const { reduxStore } = getConfiguredStore({}, saga);
});

test('I understand the call effect', (done) => {
  let names;

  function saveNames(data) {
    names = data.map((name) => `${name.first} ${name.last}`).join(', ');
  }

  function fetchNames() {
    return new Promise((resolve) => {
      resolve([
        { first: 'Bill', last: 'Gates' },
        { first: 'Steve', last: 'Jobs' },
        { first: 'Jeff', last: 'Bezos' },
        { first: 'Elon', last: 'Musk' },
      ]);
    });
  }

  function* saga() {
    // FIX
    const fetchedNames = yield call(fetchNames);
    yield call(saveNames, fetchedNames);

    // ---

    // keep this:
    try {
      expect(names).toEqual('Bill Gates, Steve Jobs, Jeff Bezos, Elon Musk');
    } catch(err) {
      throw Error(err);
    } finally {
      done();
    }
  }

  const { reduxStore } = getConfiguredStore({}, saga);
});

test('I know what `takeEvery` does', () => {

  let count = 0;
  function incrementCount() {
    count++;
  }

  function* saga() {
    yield takeEvery('SOME_ACTION_TYPE', incrementCount);
  }

  const { reduxStore } = getConfiguredStore({}, saga);

  reduxStore.dispatch({ type: 'SOME_ACTION_TYPE' });
  reduxStore.dispatch({ type: 'SOME_ACTION_TYPE' });

  expect(count).toBe(2); // FIX
});

test('I know that you can pass a generator to `takeEvery`', () => {
  let count = 0;
  function incrementCount() {
    count++;
  }

  function* doSomethingAwesome() {
    yield call(incrementCount);
    yield call(incrementCount);
    yield call(incrementCount);
  }

  function* saga() {
    yield takeEvery('SOME_ACTION_TYPE', doSomethingAwesome);
  }

  const { reduxStore } = getConfiguredStore({}, saga);

  reduxStore.dispatch({ type: 'SOME_ACTION_TYPE' });

  expect(count).toBe(3); // FIX
});

test('I understand takeEvery', () => {
  const basket = [];

  function* addFruits() {
    yield call(() => basket.push('apple'));
    yield call(() => basket.push('orange'));
    yield call(() => basket.push('kiwi'));
  }

  function addVeggies() {
    basket.push('carrot');
    basket.push('broccoli');
    basket.push('potato');
  }

  // FIX
  function* saga() {
    yield takeEvery('FRUITS_WANTED', addFruits);
    yield takeEvery('VEGGIES_WANTED', addVeggies);
  }
  // ---

  const { reduxStore } = getConfiguredStore({}, saga);

  reduxStore.dispatch({ type: 'FRUITS_WANTED' });
  reduxStore.dispatch({ type: 'VEGGIES_WANTED' });
  reduxStore.dispatch({ type: 'FRUITS_WANTED' });

  expect(basket).toEqual([
    'apple', 'orange', 'kiwi',
    'carrot', 'broccoli', 'potato',
    'apple', 'orange', 'kiwi',
  ]);
});

test('I know the basics of redux saga', () => {
  // call fetchData
  // call transform the data
  // put the data somewhere
  
  const getData = () => Promise.resolve(
    'Bill Gates, Steve Jobs, Jeff Bezos, Elon Musk'
  );
  const transformData = (data) => Promise.resolve(
    data.split(', ').map(name => {
      const nameSegments = name.split(' ');
      return {
        first: nameSegments[0],
        last: nameSegments[1],
      };
    })
  );

  function* handleTrigger() {
    const names = yield call(getData);
    const namesAsObj = yield call(transformData, names);
    yield put({ type: 'NAMES_RETRIEVED', payload: namesAsObj });
  }

  // FIX
  function* watchTriggeringAction() {
    yield takeEvery('TRIGGER', handleTrigger);
  }
  // ---

  function* rootSaga() {
    const actionsFromStore = yield call(watchTriggeringAction); 

    expect(actionsFromStore).toEqual([{ type: 'TRIGGER' }, { type: 'NAMES_RETRIEVED'}])
  }
 
  const { reduxStore } = getConfiguredStore({}, rootSaga);
  // ^ getConfigureStore creates the store, and reduxStore is destructured from it. Then 
  // the rootSaga middleware is applied to it. So it is possible for reduxStore methods to
  // be called before rootSaga has finished running and before the middleware has been applied.

  reduxStore.dispatch({ type: 'TRIGGER' });
  
  console.log('>>>>>>>> reduxStore.getActions', reduxStore.getActions()); 
  // ^ This does not include NAMES_RETRIEVED action because this gets called synchronously,
  // before the async rootSaga is finished.
  // Yes, reduxStore does exist already, because it is destructured from the result of the 
  // synchromous getConfiguredStore call.
});
